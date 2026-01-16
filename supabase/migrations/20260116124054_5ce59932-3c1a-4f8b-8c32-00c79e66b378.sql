-- Tabela de imóveis
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'casa',
  status TEXT NOT NULL DEFAULT 'available',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount NUMERIC,
  address_street TEXT,
  address_neighborhood TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zipcode TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC NOT NULL,
  parking_spaces INTEGER,
  images TEXT[],
  description TEXT,
  accepts_fgts BOOLEAN DEFAULT false,
  accepts_financing BOOLEAN DEFAULT true,
  auction_date TIMESTAMPTZ,
  modality TEXT,
  caixa_link TEXT,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de staging (imóveis importados aguardando aprovação)
CREATE TABLE public.staging_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  title TEXT,
  type TEXT DEFAULT 'casa',
  price NUMERIC,
  original_price NUMERIC,
  discount NUMERIC,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC,
  parking_spaces INTEGER,
  images TEXT[],
  description TEXT,
  accepts_fgts BOOLEAN DEFAULT false,
  accepts_financing BOOLEAN DEFAULT true,
  auction_date TIMESTAMPTZ,
  modality TEXT,
  caixa_link TEXT,
  status TEXT DEFAULT 'pending',
  scraped_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configuração de scraping
CREATE TABLE public.scraping_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  states TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de logs de scraping
CREATE TABLE public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.scraping_config(id),
  status TEXT NOT NULL,
  properties_found INTEGER DEFAULT 0,
  properties_new INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Habilitar RLS (permitir acesso público para este app sem autenticação)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sem autenticação necessária para este app de demonstração)
CREATE POLICY "Allow public read on properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow public insert on properties" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on properties" ON public.properties FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on properties" ON public.properties FOR DELETE USING (true);

CREATE POLICY "Allow public read on staging_properties" ON public.staging_properties FOR SELECT USING (true);
CREATE POLICY "Allow public insert on staging_properties" ON public.staging_properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on staging_properties" ON public.staging_properties FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on staging_properties" ON public.staging_properties FOR DELETE USING (true);

CREATE POLICY "Allow public read on scraping_config" ON public.scraping_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scraping_config" ON public.scraping_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on scraping_config" ON public.scraping_config FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on scraping_config" ON public.scraping_config FOR DELETE USING (true);

CREATE POLICY "Allow public read on scraping_logs" ON public.scraping_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scraping_logs" ON public.scraping_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on scraping_logs" ON public.scraping_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on scraping_logs" ON public.scraping_logs FOR DELETE USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();