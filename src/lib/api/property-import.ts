import { supabase } from '@/integrations/supabase/client';

export interface ImportedPropertyData {
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

interface ImportResponse {
  success: boolean;
  error?: string;
  data?: ImportedPropertyData;
  rawContent?: string;
}

export async function importPropertyFromUrl(url: string): Promise<ImportResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('import-property', {
      body: { url },
    });

    if (error) {
      console.error('Error calling import function:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao conectar com o servidor' 
      };
    }

    return data as ImportResponse;
  } catch (error) {
    console.error('Error importing property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
