const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PropertyData {
  title: string;
  type: string;
  price: string;
  original_price: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  parking_spaces: string;
  description: string;
  images: string[];
  accepts_fgts: boolean;
  accepts_financing: boolean;
  source_url: string;
}

// Parse price from Brazilian format
function parsePrice(text: string): string {
  const match = text.match(/R\$\s*([\d.,]+)/);
  if (match) {
    return match[1].replace(/\./g, '').replace(',', '');
  }
  const numberMatch = text.match(/([\d.,]+)/);
  if (numberMatch) {
    return numberMatch[1].replace(/\./g, '').replace(',', '');
  }
  return '';
}

// Extract property data from markdown content
function extractPropertyData(markdown: string, url: string): PropertyData {
  const data: PropertyData = {
    title: '',
    type: 'casa',
    price: '',
    original_price: '',
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_state: 'CE',
    bedrooms: '',
    bathrooms: '',
    area: '',
    parking_spaces: '',
    description: '',
    images: [],
    accepts_fgts: false,
    accepts_financing: true,
    source_url: url,
  };

  const lines = markdown.split('\n');
  const text = markdown.toLowerCase();

  // Extract title from first heading or strong text
  const titleMatch = markdown.match(/^#\s*(.+)$/m) || markdown.match(/\*\*(.+?)\*\*/);
  if (titleMatch) {
    data.title = titleMatch[1].trim().substring(0, 200);
  }

  // Extract type
  if (text.includes('apartamento')) {
    data.type = 'apartamento';
  } else if (text.includes('terreno') || text.includes('lote')) {
    data.type = 'terreno';
  } else if (text.includes('comercial') || text.includes('sala') || text.includes('loja')) {
    data.type = 'comercial';
  } else {
    data.type = 'casa';
  }

  // Extract price
  const pricePatterns = [
    /valor\s*:?\s*R\$\s*([\d.,]+)/i,
    /preço\s*:?\s*R\$\s*([\d.,]+)/i,
    /R\$\s*([\d.,]+)/,
    /(\d{2,3}(?:\.\d{3})*(?:,\d{2})?)/,
  ];
  
  for (const pattern of pricePatterns) {
    const match = markdown.match(pattern);
    if (match) {
      const priceValue = match[1].replace(/\./g, '').replace(',', '');
      if (parseInt(priceValue) > 10000) { // Reasonable property price
        data.price = priceValue;
        break;
      }
    }
  }

  // Extract bedrooms
  const bedroomsPatterns = [
    /(\d+)\s*(?:quartos?|dormit[oó]rios?|suítes?)/i,
    /quartos?\s*:?\s*(\d+)/i,
  ];
  for (const pattern of bedroomsPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.bedrooms = match[1];
      break;
    }
  }

  // Extract bathrooms
  const bathroomsPatterns = [
    /(\d+)\s*(?:banheiros?|wc)/i,
    /banheiros?\s*:?\s*(\d+)/i,
  ];
  for (const pattern of bathroomsPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.bathrooms = match[1];
      break;
    }
  }

  // Extract area
  const areaPatterns = [
    /(\d+(?:,\d+)?)\s*m[²2]/i,
    /área\s*:?\s*(\d+(?:,\d+)?)/i,
    /(\d+)\s*metros?\s*quadrados?/i,
  ];
  for (const pattern of areaPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.area = match[1].replace(',', '');
      break;
    }
  }

  // Extract parking spaces
  const parkingPatterns = [
    /(\d+)\s*(?:vagas?|garagem|estacionamento)/i,
    /vagas?\s*:?\s*(\d+)/i,
  ];
  for (const pattern of parkingPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.parking_spaces = match[1];
      break;
    }
  }

  // Extract city and state
  const cityStatePatterns = [
    /([A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)\s*[-–]\s*(CE|PE|BA|RN|PB|AL|SE|PI|MA)/i,
    /(fortaleza|recife|salvador|natal|joão pessoa|maceió|aracaju|teresina|são luís)/i,
  ];
  for (const pattern of cityStatePatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.address_city = match[1].trim();
      if (match[2]) {
        data.address_state = match[2].toUpperCase();
      }
      break;
    }
  }

  // Extract neighborhood
  const neighborhoodPatterns = [
    /bairro\s*:?\s*([A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)/i,
    /localização\s*:?\s*([A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)/i,
  ];
  for (const pattern of neighborhoodPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      data.address_neighborhood = match[1].trim().substring(0, 100);
      break;
    }
  }

  // FGTS and financing
  if (text.includes('fgts')) {
    data.accepts_fgts = true;
  }
  if (text.includes('financia') || text.includes('financiamento')) {
    data.accepts_financing = true;
  }

  // Extract description - get first substantial paragraph
  const paragraphs = markdown
    .split(/\n\n+/)
    .filter(p => p.length > 50 && !p.startsWith('#') && !p.startsWith('!'));
  if (paragraphs.length > 0) {
    data.description = paragraphs[0].replace(/\[.*?\]\(.*?\)/g, '').trim().substring(0, 500);
  }

  // Extract images
  const imageMatches = markdown.matchAll(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
  for (const match of imageMatches) {
    if (data.images.length < 10) {
      data.images.push(match[1]);
    }
  }

  // If no title, create one from available data
  if (!data.title && data.type && data.address_city) {
    const typeLabels: Record<string, string> = {
      casa: 'Casa',
      apartamento: 'Apartamento',
      terreno: 'Terreno',
      comercial: 'Imóvel Comercial',
    };
    data.title = `${typeLabels[data.type] || 'Imóvel'} em ${data.address_city}`;
    if (data.bedrooms) {
      data.title = `${typeLabels[data.type] || 'Imóvel'} ${data.bedrooms} Quartos em ${data.address_city}`;
    }
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Conector Firecrawl não configurado. Configure nas configurações do projeto.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping property URL:', formattedUrl);

    // Call Firecrawl to scrape the page
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'screenshot'],
        onlyMainContent: true,
        waitFor: 2000, // Wait for dynamic content
      }),
    });

    const scrapeResult = await response.json();

    if (!response.ok || !scrapeResult.success) {
      console.error('Firecrawl API error:', scrapeResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: scrapeResult.error || 'Não foi possível acessar a página. Verifique se a URL está correta.' 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeResult.data?.markdown || '';
    console.log('Scraped content length:', markdown.length);

    if (markdown.length < 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'A página não contém conteúdo suficiente para extrair informações do imóvel.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract property data from the markdown
    const propertyData = extractPropertyData(markdown, formattedUrl);

    console.log('Extracted property data:', JSON.stringify(propertyData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        data: propertyData,
        screenshot: scrapeResult.data?.screenshot || null,
        rawContent: markdown.substring(0, 2000), // Send first 2000 chars for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error importing property:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao importar imóvel';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
