import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  useDbProperties,
  useSeedExampleProperties,
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
  Sparkles,
  Loader2,
} from 'lucide-react';
import { NORTHEAST_STATES, PROPERTY_TYPES, PRICE_RANGES } from '@/types/property';
import { ManualPropertyForm } from './ManualPropertyForm';

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

export function StagingReviewTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  const { data: properties, isLoading, refetch } = useDbProperties();
  const seedExampleMutation = useSeedExampleProperties();

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
      {/* Seed Example Properties Button */}
      {(!properties || properties.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold">Comece com exemplos</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione imóveis de exemplo para testar o sistema
                </p>
              </div>
              <Button
                onClick={() => seedExampleMutation.mutate()}
                disabled={seedExampleMutation.isPending}
                className="hero-gradient"
              >
                {seedExampleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Adicionar Imóveis de Exemplo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="text-2xl font-bold text-amber-600">
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
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Carregando imóveis...</p>
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
                  className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
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
                      variant={property.status === 'available' ? 'default' : 'secondary'}
                    >
                      {property.status === 'available' ? 'Disponível' : 'Vendido'}
                    </Badge>
                    {property.discount && property.discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
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
                      <div className="font-bold text-primary">
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