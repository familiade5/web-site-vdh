import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  useDbProperties,
  useCreateProperty,
} from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Home,
  MapPin,
  Bed,
  Car,
  Ruler,
  ExternalLink,
} from 'lucide-react';
import { NORTHEAST_STATES, PROPERTY_TYPES, PRICE_RANGES } from '@/types/property';
import { ManualPropertyForm } from './ManualPropertyForm';
import { supabase } from '@/integrations/supabase/client';

const formatPrice = (price: number | null) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price);
};

const getPropertyTypeLabel = (type: string | null) => {
  const found = PROPERTY_TYPES.find(t => t.value === type);
  return found ? found.label : type || 'Imóvel';
};

const getStateLabel = (state: string | null) => {
  const found = NORTHEAST_STATES.find(s => s.value === state);
  return found ? found.label : state || 'N/A';
};

// Imóveis de exemplo para popular inicialmente
const EXAMPLE_PROPERTIES = [
  // 4 Disponíveis
  {
    title: 'Casa 3 Quartos com Piscina em Fortaleza',
    type: 'casa',
    status: 'available',
    price: 285000,
    original_price: 380000,
    discount: 25,
    address_street: 'Rua das Palmeiras, 450',
    address_neighborhood: 'Aldeota',
    address_city: 'Fortaleza',
    address_state: 'CE',
    address_zipcode: '60150-000',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    parking_spaces: 2,
    description: 'Excelente casa com piscina, área gourmet e acabamento de primeira. Localização privilegiada próxima a escolas e comércio.',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    accepts_fgts: true,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Apartamento 2 Quartos Vista Mar',
    type: 'apartamento',
    status: 'available',
    price: 195000,
    original_price: 260000,
    discount: 25,
    address_street: 'Av. Beira Mar, 2500',
    address_neighborhood: 'Meireles',
    address_city: 'Fortaleza',
    address_state: 'CE',
    address_zipcode: '60165-121',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    parking_spaces: 1,
    description: 'Apartamento com vista panorâmica para o mar. Prédio com área de lazer completa: piscina, academia e salão de festas.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    accepts_fgts: true,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Casa Duplex 4 Suítes em Recife',
    type: 'casa',
    status: 'available',
    price: 420000,
    original_price: 550000,
    discount: 24,
    address_street: 'Rua do Sol, 100',
    address_neighborhood: 'Boa Viagem',
    address_city: 'Recife',
    address_state: 'PE',
    address_zipcode: '51020-000',
    bedrooms: 4,
    bathrooms: 4,
    area: 280,
    parking_spaces: 3,
    description: 'Casa duplex de alto padrão com 4 suítes, piscina aquecida e churrasqueira. Condomínio fechado com segurança 24h.',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    ],
    accepts_fgts: false,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Terreno 500m² Pronto para Construir',
    type: 'terreno',
    status: 'available',
    price: 89000,
    original_price: 120000,
    discount: 26,
    address_street: null,
    address_neighborhood: 'Piatã',
    address_city: 'Salvador',
    address_state: 'BA',
    address_zipcode: '41650-000',
    bedrooms: null,
    bathrooms: null,
    area: 500,
    parking_spaces: null,
    description: 'Terreno plano, excelente para construção. Documentação 100% regularizada. Água e energia já disponíveis.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ],
    accepts_fgts: false,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  // 4 Vendidos
  {
    title: 'Apartamento Centro - VENDIDO',
    type: 'apartamento',
    status: 'sold',
    price: 175000,
    original_price: 230000,
    discount: 24,
    address_street: 'Rua das Flores, 200',
    address_neighborhood: 'Centro',
    address_city: 'Fortaleza',
    address_state: 'CE',
    address_zipcode: '60060-000',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    parking_spaces: 1,
    description: 'Apartamento vendido através da nossa plataforma. Cliente satisfeito!',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    accepts_fgts: true,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Casa Praia do Futuro - VENDIDO',
    type: 'casa',
    status: 'sold',
    price: 320000,
    original_price: 400000,
    discount: 20,
    address_street: 'Av. Zezé Diogo, 1500',
    address_neighborhood: 'Praia do Futuro',
    address_city: 'Fortaleza',
    address_state: 'CE',
    address_zipcode: '60182-000',
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    parking_spaces: 2,
    description: 'Casa a 100m do mar, vendida rapidamente. Oportunidade aproveitada!',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    ],
    accepts_fgts: true,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Cobertura Duplex Meireles - VENDIDO',
    type: 'apartamento',
    status: 'sold',
    price: 480000,
    original_price: 600000,
    discount: 20,
    address_street: 'Av. Abolição, 3000',
    address_neighborhood: 'Meireles',
    address_city: 'Fortaleza',
    address_state: 'CE',
    address_zipcode: '60165-080',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    parking_spaces: 3,
    description: 'Cobertura duplex com terraço e vista privilegiada. Vendida em tempo recorde!',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    accepts_fgts: false,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
  {
    title: 'Casa Condomínio Fechado - VENDIDO',
    type: 'casa',
    status: 'sold',
    price: 350000,
    original_price: 450000,
    discount: 22,
    address_street: 'Rua das Acácias, 50',
    address_neighborhood: 'Eusébio',
    address_city: 'Eusébio',
    address_state: 'CE',
    address_zipcode: '61760-000',
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    parking_spaces: 2,
    description: 'Casa em condomínio com infraestrutura completa. Cliente muito satisfeito!',
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
    ],
    accepts_fgts: true,
    accepts_financing: true,
    auction_date: null,
    modality: null,
    caixa_link: null,
  },
];

export function StagingReviewTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: properties, isLoading, refetch } = useDbProperties();

  // Inserir imóveis de exemplo se o banco estiver vazio
  useEffect(() => {
    const seedIfEmpty = async () => {
      if (properties && properties.length === 0 && !isSeeding) {
        setIsSeeding(true);
        try {
          const { error } = await supabase
            .from('properties')
            .insert(EXAMPLE_PROPERTIES);
          
          if (error) {
            console.error('Erro ao inserir exemplos:', error);
          } else {
            refetch();
          }
        } catch (err) {
          console.error('Erro:', err);
        } finally {
          setIsSeeding(false);
        }
      }
    };

    seedIfEmpty();
  }, [properties, isSeeding, refetch]);

  // Filtrar propriedades
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property) => {
      // Busca por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          property.title?.toLowerCase().includes(query) ||
          property.address_city?.toLowerCase().includes(query) ||
          property.address_neighborhood?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (stateFilter !== 'all' && property.address_state !== stateFilter) {
        return false;
      }

      // Filtro por tipo
      if (typeFilter !== 'all' && property.type !== typeFilter) {
        return false;
      }

      // Filtro por faixa de preço
      if (priceFilter !== 'all' && property.price) {
        const [min, max] = priceFilter.split('-').map(v => v === '+' ? Infinity : parseInt(v));
        if (priceFilter.includes('+')) {
          if (property.price < parseInt(priceFilter.replace('+', ''))) return false;
        } else {
          if (property.price < min || property.price > max) return false;
        }
      }

      return true;
    });
  }, [properties, searchQuery, stateFilter, typeFilter, priceFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStateFilter('all');
    setTypeFilter('all');
    setPriceFilter('all');
  };

  const hasActiveFilters = searchQuery || stateFilter !== 'all' || typeFilter !== 'all' || priceFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Manual Property Form */}
      <ManualPropertyForm />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{properties?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total de Imóveis</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {properties?.filter(p => p.status === 'available').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {properties?.filter(p => p.status === 'sold').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Vendidos</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{filteredProperties.length}</div>
              <p className="text-xs text-muted-foreground">Filtrados</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca por texto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cidade, bairro, título..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro de Estado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {NORTHEAST_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Tipo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tipo de Imóvel</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Preço */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Faixa de Preço</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer valor" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros ativos como badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Busca: "{searchQuery}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {stateFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getStateLabel(stateFilter)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setStateFilter('all')}
                    />
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getPropertyTypeLabel(typeFilter)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setTypeFilter('all')}
                    />
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {PRICE_RANGES.find(r => r.value === priceFilter)?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setPriceFilter('all')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Imóveis Cadastrados
          </CardTitle>
          <CardDescription>
            {filteredProperties.length} imóveis encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isSeeding ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {isSeeding ? 'Adicionando imóveis de exemplo...' : 'Carregando imóveis...'}
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhum imóvel encontrado</p>
              <p className="text-sm text-muted-foreground">Cadastre um novo imóvel usando o formulário acima</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.slice(0, 12).map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow ${
                    property.status === 'sold' ? 'grayscale opacity-80' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-video relative bg-muted">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge 
                      className="absolute top-2 left-2"
                      variant={property.status === 'available' ? 'default' : 'destructive'}
                    >
                      {property.status === 'available' ? 'Disponível' : 'VENDIDO'}
                    </Badge>
                    {property.discount && property.discount > 0 && property.status === 'available' && (
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                        -{property.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.address_city}, {property.address_state}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.parking_spaces && (
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {property.parking_spaces}
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {property.area}m²
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`font-bold ${property.status === 'sold' ? 'text-muted-foreground' : 'text-primary'}`}>
                        {formatPrice(property.price)}
                      </div>
                      {property.caixa_link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={property.caixa_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredProperties.length > 12 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando 12 de {filteredProperties.length} imóveis. Vá para a aba "Imóveis" para ver todos.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}