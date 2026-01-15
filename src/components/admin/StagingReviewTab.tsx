import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { NORTHEAST_STATES, PROPERTY_TYPES, PRICE_RANGES, Property } from '@/types/property';
import { ManualPropertyForm } from './ManualPropertyForm';
import { EXAMPLE_PROPERTIES } from '@/data/exampleProperties';

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

  // Usar dados de exemplo locais
  const properties = EXAMPLE_PROPERTIES;

  // Filtrar propriedades
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Busca por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          property.title?.toLowerCase().includes(query) ||
          property.address.city?.toLowerCase().includes(query) ||
          property.address.neighborhood?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (stateFilter !== 'all' && property.address.state !== stateFilter) {
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

  const availableCount = properties.filter(p => p.status === 'available').length;
  const soldCount = properties.filter(p => p.status === 'sold').length;

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
              <div className="text-2xl font-bold">{properties.length}</div>
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
              <div className="text-2xl font-bold text-green-600">
                {availableCount}
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
              <div className="text-2xl font-bold text-red-600">
                {soldCount}
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
          </CardContent>
        )}
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imóveis Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum imóvel encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              filteredProperties.map((property, index) => (
                <PropertyListItem key={property.id} property={property} index={index} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PropertyListItem({ property, index }: { property: Property; index: number }) {
  const isSold = property.status === 'sold';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-4 p-4 rounded-lg border ${
        isSold 
          ? 'bg-muted/50 border-muted' 
          : 'bg-background border-border hover:border-primary/30'
      } transition-colors`}
    >
      {/* Image */}
      <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={property.images[0] || '/placeholder.svg'}
          alt={property.title}
          className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
        />
        {isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="font-bold">VENDIDO</Badge>
          </div>
        )}
        {property.discount && !isSold && (
          <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs">
            -{property.discount}%
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-semibold truncate ${isSold ? 'text-muted-foreground' : ''}`}>
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {property.address.neighborhood}, {property.address.city} - {property.address.state}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`font-bold ${isSold ? 'text-muted-foreground' : 'text-primary'}`}>
              {formatPrice(property.price)}
            </div>
            {property.originalPrice && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(property.originalPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Home className="h-3 w-3" />
            {getPropertyTypeLabel(property.type)}
          </Badge>
          {property.features.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.features.bedrooms} quartos
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {property.features.area}m²
          </span>
          {property.features.parkingSpaces && (
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              {property.features.parkingSpaces} vagas
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            Ver detalhes
          </Button>
          {!isSold && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <XCircle className="h-3 w-3 mr-1" />
              Marcar como vendido
            </Button>
          )}
          {property.caixaLink && (
            <Button variant="ghost" size="sm" asChild>
              <a href={property.caixaLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Link original
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
