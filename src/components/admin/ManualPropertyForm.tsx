import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Car, 
  Ruler, 
  Image,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCreateProperty } from '@/hooks/useProperties';
import { NORTHEAST_STATES, PROPERTY_TYPES } from '@/types/property';

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
  images: string;
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
  images: '',
  accepts_fgts: false,
  accepts_financing: true,
  caixa_link: '',
};

export function ManualPropertyForm() {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const createMutation = useCreateProperty();

  const handleChange = (field: keyof PropertyFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse images from comma/newline separated string
    const imagesList = formData.images
      .split(/[,\n]/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const propertyData = {
      title: formData.title,
      type: formData.type,
      status: 'available' as const,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount: formData.original_price && formData.price 
        ? Math.round(((parseFloat(formData.original_price) - parseFloat(formData.price)) / parseFloat(formData.original_price)) * 100)
        : null,
      address_street: formData.address_street || null,
      address_neighborhood: formData.address_neighborhood,
      address_city: formData.address_city,
      address_state: formData.address_state,
      address_zipcode: formData.address_zipcode || null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      area: parseFloat(formData.area) || 0,
      auction_date: null,
      modality: null,
      parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
      description: formData.description || null,
      images: imagesList,
      accepts_fgts: formData.accepts_fgts,
      accepts_financing: formData.accepts_financing,
      caixa_link: formData.caixa_link || null,
    };

    createMutation.mutate(propertyData, {
      onSuccess: () => {
        setFormData(initialFormData);
        setShowForm(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Cadastrar Imóvel Manualmente
            </CardTitle>
            <CardDescription>
              Adicione um novo imóvel diretamente ao sistema
            </CardDescription>
          </div>
          <Button
            variant={showForm ? 'secondary' : 'default'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Novo Imóvel'}
          </Button>
        </div>
      </CardHeader>

      {showForm && (
        <CardContent>
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título do Imóvel *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Casa 3 quartos em Fortaleza"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Imóvel *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                    <SelectTrigger>
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
                  <div className="relative">
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
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="address_street">Rua/Logradouro</Label>
                  <Input
                    id="address_street"
                    placeholder="Rua das Flores, 123"
                    value={formData.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address_neighborhood">Bairro *</Label>
                  <Input
                    id="address_neighborhood"
                    placeholder="Centro"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                    required
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
                  />
                </div>
                <div>
                  <Label htmlFor="address_state">Estado *</Label>
                  <Select value={formData.address_state} onValueChange={(v) => handleChange('address_state', v)}>
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="address_zipcode">CEP</Label>
                  <Input
                    id="address_zipcode"
                    placeholder="60000-000"
                    value={formData.address_zipcode}
                    onChange={(e) => handleChange('address_zipcode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço de Venda (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="250000"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Preço Original (R$)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    placeholder="300000"
                    value={formData.original_price}
                    onChange={(e) => handleChange('original_price', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Bed className="h-4 w-4" />
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
                  />
                </div>
              </div>
            </div>

            {/* Opções de Pagamento */}
            <div className="space-y-4">
              <h3 className="font-medium">Opções de Pagamento</h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accepts_fgts"
                    checked={formData.accepts_fgts}
                    onCheckedChange={(checked) => handleChange('accepts_fgts', checked as boolean)}
                  />
                  <Label htmlFor="accepts_fgts">Aceita FGTS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accepts_financing"
                    checked={formData.accepts_financing}
                    onCheckedChange={(checked) => handleChange('accepts_financing', checked as boolean)}
                  />
                  <Label htmlFor="accepts_financing">Aceita Financiamento</Label>
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagens
              </h3>
              <div>
                <Label htmlFor="images">URLs das Imagens (uma por linha ou separadas por vírgula)</Label>
                <Textarea
                  id="images"
                  placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
                  value={formData.images}
                  onChange={(e) => handleChange('images', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-4">
              <h3 className="font-medium">Descrição</h3>
              <Textarea
                placeholder="Descreva o imóvel em detalhes..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Link Externo */}
            <div className="space-y-4">
              <Label htmlFor="caixa_link">Link Externo (opcional)</Label>
              <Input
                id="caixa_link"
                placeholder="https://..."
                value={formData.caixa_link}
                onChange={(e) => handleChange('caixa_link', e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="hero-gradient"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Cadastrar Imóvel
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </CardContent>
      )}
    </Card>
  );
}