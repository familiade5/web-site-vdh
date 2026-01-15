import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Ruler, 
  Camera,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { NORTHEAST_STATES, PROPERTY_TYPES } from '@/types/property';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

type TabType = 'manual' | 'import';

interface PropertyFormData {
  title: string;
  type: string;
  price: string;
  original_price: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  parking_spaces: string;
  description: string;
  images: string[];
  accepts_fgts: boolean;
  accepts_financing: boolean;
  caixa_link: string;
}

const initialFormData: PropertyFormData = {
  title: '',
  type: 'casa',
  price: '',
  original_price: '',
  address_street: '',
  address_neighborhood: '',
  address_city: '',
  address_state: 'CE',
  address_zipcode: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  parking_spaces: '',
  description: '',
  images: [],
  accepts_fgts: false,
  accepts_financing: true,
  caixa_link: '',
};

export function ManualPropertyForm() {
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Import by link state
  const [importUrl, setImportUrl] = useState('');
  const [importedData, setImportedData] = useState<PropertyFormData | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleChange = (field: keyof PropertyFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular salvamento (em produção, salvaria no Supabase)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Imóvel cadastrado com sucesso!', {
      description: 'O imóvel foi adicionado e está aguardando aprovação.',
    });
    
    setFormData(initialFormData);
    setShowForm(false);
    setIsSubmitting(false);
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    setIsImporting(true);

    // Simular extração de dados da URL (em produção, usaria um scraper)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dados simulados extraídos da URL
    const extractedData: PropertyFormData = {
      title: 'Casa Importada - ' + new URL(importUrl).hostname,
      type: 'casa',
      price: '250000',
      original_price: '320000',
      address_street: 'Endereço extraído do anúncio',
      address_neighborhood: 'Bairro Exemplo',
      address_city: 'Fortaleza',
      address_state: 'CE',
      address_zipcode: '',
      bedrooms: '3',
      bathrooms: '2',
      area: '150',
      parking_spaces: '2',
      description: 'Descrição extraída automaticamente do anúncio. Você pode editar antes de aprovar.',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      ],
      accepts_fgts: true,
      accepts_financing: true,
      caixa_link: importUrl,
    };

    setImportedData(extractedData);
    setFormData(extractedData);
    setIsImporting(false);
    toast.success('Dados extraídos!', {
      description: 'Revise as informações antes de aprovar.',
    });
  };

  const handleApproveImport = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Imóvel importado com sucesso!');
    
    setFormData(initialFormData);
    setImportedData(null);
    setImportUrl('');
    setShowForm(false);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg hero-gradient flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              Cadastrar Novo Imóvel
            </CardTitle>
            <CardDescription className="mt-1">
              Adicione imóveis manualmente ou importe de links externos
            </CardDescription>
          </div>
          <Button
            variant={showForm ? 'secondary' : 'default'}
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setFormData(initialFormData);
                setImportedData(null);
                setImportUrl('');
              }
            }}
            className={!showForm ? 'hero-gradient' : ''}
          >
            {showForm ? 'Fechar' : 'Novo Imóvel'}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual');
                    setImportedData(null);
                    setFormData(initialFormData);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'manual'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Cadastro Manual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('import');
                    setFormData(initialFormData);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'import'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  Importar por Link
                </button>
              </div>

              {/* Import by Link Tab */}
              {activeTab === 'import' && !importedData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Importação Automática</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Cole o link de um anúncio de imóvel e extrairemos automaticamente todas as informações. 
                          Você poderá revisar e editar antes de aprovar.
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="https://www.exemplo.com/imovel/123"
                              value={importUrl}
                              onChange={(e) => setImportUrl(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Button
                            onClick={handleImportUrl}
                            disabled={isImporting || !importUrl.trim()}
                            className="hero-gradient min-w-[140px]"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Extraindo...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Importar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground text-sm py-8">
                    <p>Sites suportados: ZAP Imóveis, OLX, Viva Real, Caixa e outros</p>
                  </div>
                </motion.div>
              )}

              {/* Form (Manual or Imported) */}
              {(activeTab === 'manual' || importedData) && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={importedData ? (e) => { e.preventDefault(); handleApproveImport(); } : handleSubmit}
                  className="space-y-8"
                >
                  {importedData && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                        ⚠️ Dados importados automaticamente. Revise as informações antes de aprovar.
                      </p>
                    </div>
                  )}

                  {/* Fotos - Primeiro e em destaque */}
                  <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Fotos do Imóvel
                    </h3>
                    <ImageUpload
                      images={formData.images}
                      onChange={(images) => handleChange('images', images)}
                      maxImages={10}
                    />
                  </div>

                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Título do Imóvel *</Label>
                        <Input
                          id="title"
                          placeholder="Ex: Casa 3 quartos com piscina em Fortaleza"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Tipo de Imóvel *</Label>
                        <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.filter(t => t.value !== 'all').map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="area">Área (m²) *</Label>
                        <div className="relative mt-1">
                          <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="area"
                            type="number"
                            placeholder="150"
                            value={formData.area}
                            onChange={(e) => handleChange('area', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Localização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="md:col-span-2 lg:col-span-3">
                        <Label htmlFor="address_street">Endereço Completo</Label>
                        <Input
                          id="address_street"
                          placeholder="Rua das Palmeiras, 450"
                          value={formData.address_street}
                          onChange={(e) => handleChange('address_street', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_neighborhood">Bairro *</Label>
                        <Input
                          id="address_neighborhood"
                          placeholder="Aldeota"
                          value={formData.address_neighborhood}
                          onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_city">Cidade *</Label>
                        <Input
                          id="address_city"
                          placeholder="Fortaleza"
                          value={formData.address_city}
                          onChange={(e) => handleChange('address_city', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_state">Estado *</Label>
                        <Select value={formData.address_state} onValueChange={(v) => handleChange('address_state', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NORTHEAST_STATES.filter(s => s.value !== 'all').map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Valores
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Preço de Venda (R$) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="285000"
                          value={formData.price}
                          onChange={(e) => handleChange('price', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="original_price">Preço Original (R$)</Label>
                        <Input
                          id="original_price"
                          type="number"
                          placeholder="380000"
                          value={formData.original_price}
                          onChange={(e) => handleChange('original_price', e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Deixe em branco se não houver desconto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      Características
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Quartos</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          placeholder="3"
                          value={formData.bedrooms}
                          onChange={(e) => handleChange('bedrooms', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Banheiros</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          placeholder="2"
                          value={formData.bathrooms}
                          onChange={(e) => handleChange('bathrooms', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parking_spaces">Vagas</Label>
                        <Input
                          id="parking_spaces"
                          type="number"
                          placeholder="2"
                          value={formData.parking_spaces}
                          onChange={(e) => handleChange('parking_spaces', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opções de Pagamento */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Opções de Pagamento</h3>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accepts_fgts"
                          checked={formData.accepts_fgts}
                          onCheckedChange={(checked) => handleChange('accepts_fgts', checked as boolean)}
                        />
                        <Label htmlFor="accepts_fgts" className="cursor-pointer">Aceita FGTS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accepts_financing"
                          checked={formData.accepts_financing}
                          onCheckedChange={(checked) => handleChange('accepts_financing', checked as boolean)}
                        />
                        <Label htmlFor="accepts_financing" className="cursor-pointer">Aceita Financiamento</Label>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Descrição</h3>
                    <Textarea
                      placeholder="Descreva o imóvel em detalhes: pontos fortes, acabamentos, localização privilegiada..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Link Externo */}
                  <div className="space-y-2">
                    <Label htmlFor="caixa_link">Link Externo (opcional)</Label>
                    <Input
                      id="caixa_link"
                      placeholder="https://..."
                      value={formData.caixa_link}
                      onChange={(e) => handleChange('caixa_link', e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setImportedData(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="hero-gradient min-w-[180px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {importedData ? 'Aprovar Importação' : 'Cadastrar Imóvel'}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
