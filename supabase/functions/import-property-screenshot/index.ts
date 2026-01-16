const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type PropertyData = {
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
};

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function normalizePropertyData(data: Partial<PropertyData>, sourceUrl: string): PropertyData {
  return {
    title: (data.title || '').toString().slice(0, 200),
    type: (data.type || 'casa').toString(),
    price: (data.price || '').toString(),
    original_price: (data.original_price || '').toString(),
    address_street: (data.address_street || '').toString(),
    address_neighborhood: (data.address_neighborhood || '').toString(),
    address_city: (data.address_city || '').toString(),
    address_state: (data.address_state || 'CE').toString(),
    bedrooms: (data.bedrooms || '').toString(),
    bathrooms: (data.bathrooms || '').toString(),
    area: (data.area || '').toString(),
    parking_spaces: (data.parking_spaces || '').toString(),
    description: (data.description || '').toString().slice(0, 2000),
    images: Array.isArray(data.images) ? data.images.filter(Boolean).slice(0, 10) : [],
    accepts_fgts: Boolean(data.accepts_fgts),
    accepts_financing: data.accepts_financing === false ? false : true,
    source_url: (data.source_url || sourceUrl || '').toString(),
  };
}

async function callLovableAI(payload: unknown) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) {
    throw new Error('LOVABLE_API_KEY não configurada');
  }

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const json = safeJsonParse<any>(raw);

  if (!res.ok) {
    const msg = json?.error?.message || json?.message || raw || 'Falha ao chamar IA';
    const err = new Error(msg);
    (err as any).status = res.status;
    throw err;
  }

  return json;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { imageDataUrl, source_url } = await req.json();

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Screenshot é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prompt focado em extrair campos do formulário a partir do screenshot do anúncio.
    const system =
      'Você é um extrator de dados de anúncios imobiliários no Brasil. ' +
      'Sua tarefa é ler o screenshot de um anúncio e devolver APENAS um JSON válido com os campos solicitados. ' +
      'Se algum campo não aparecer no screenshot, use string vazia "" para textos/números e false para booleanos e [] para arrays. ' +
      'price e original_price devem ser numéricos em string, sem símbolos e sem separadores (ex: 68585). ' +
      'type deve ser um destes: casa, apartamento, terreno, comercial. ' +
      'address_state deve ser sigla (ex: CE, PB, RN...).';

    const schemaExample: PropertyData = {
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
      source_url: source_url || '',
    };

    const ai = await callLovableAI({
      model: 'google/gemini-3-flash-preview',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Extraia os dados do anúncio neste screenshot e retorne somente JSON. ' +
                'Use este formato exato (mesmas chaves):\n' +
                JSON.stringify(schemaExample),
            },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });

    const content = ai?.choices?.[0]?.message?.content;
    const parsed = typeof content === 'string' ? safeJsonParse<Partial<PropertyData>>(content) : null;

    if (!parsed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Não foi possível interpretar o retorno da IA.',
          rawContent: content || null,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalized = normalizePropertyData(parsed, source_url || '');

    return new Response(
      JSON.stringify({
        success: true,
        data: normalized,
        screenshot: imageDataUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const status = (error as any)?.status;
    const msg = error instanceof Error ? error.message : 'Falha ao importar por screenshot';

    return new Response(
      JSON.stringify({
        success: false,
        error: msg,
        ...(status ? { status } : {}),
      }),
      { status: typeof status === 'number' ? status : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
