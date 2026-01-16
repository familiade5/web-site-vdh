import { supabase } from '@/integrations/supabase/client';
import type { ImportedPropertyData } from './property-import';

interface ImportScreenshotResponse {
  success: boolean;
  error?: string;
  data?: ImportedPropertyData;
  screenshot?: string | null;
}

export async function importPropertyFromScreenshot(imageDataUrl: string, sourceUrl?: string): Promise<ImportScreenshotResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('import-property-screenshot', {
      body: { imageDataUrl, source_url: sourceUrl || '' },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Erro ao conectar com o servidor',
      };
    }

    return data as ImportScreenshotResponse;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}
