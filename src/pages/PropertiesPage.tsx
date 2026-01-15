import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { useDbProperties, DbProperty } from '@/hooks/useProperties';
import { Property } from '@/types/property';
import { motion } from 'framer-motion';
import { Building2, SortAsc, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'price-asc' | 'price-desc' | 'discount' | 'recent';

// Converter DbProperty para Property (formato do frontend)
function dbPropertyToProperty(dbProp: DbProperty): Property {
  return {
    id: dbProp.id,
    title: dbProp.title,
    type: dbProp.type as Property['type'],
    status: dbProp.status as Property['status'],
    price: dbProp.price,
    originalPrice: dbProp.original_price || undefined,
    discount: dbProp.discount || undefined,
    address: {
      street: dbProp.address_street || undefined,
      neighborhood: dbProp.address_neighborhood,
      city: dbProp.address_city,
      state: dbProp.address_state,
      zipCode: dbProp.address_zipcode || undefined,
    },
    features: {
      bedrooms: dbProp.bedrooms || undefined,
      bathrooms: dbProp.bathrooms || undefined,
      area: dbProp.area,
      parkingSpaces: dbProp.parking_spaces || undefined,
    },
    images: dbProp.images || [],
    description: dbProp.description || undefined,
    acceptsFGTS: dbProp.accepts_fgts || false,
    acceptsFinancing: dbProp.accepts_financing || false,
    auctionDate: dbProp.auction_date || undefined,
    modality: dbProp.modality || undefined,
    caixaLink: dbProp.caixa_link || undefined,
    createdAt: dbProp.created_at,
    soldAt: dbProp.sold_at || undefined,
  };
}

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    state: 'all',
    type: 'all',
    priceRange: 'all',
    showSold: true,
  });

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Buscar imóveis do banco de dados
  const { data: dbProperties, isLoading, error } = useDbProperties();
  
  // Converter para o formato do frontend
  const properties = useMemo(() => {
    if (!dbProperties) return [];
    return dbProperties.map(dbPropertyToProperty);
  }, [dbProperties]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.address.city.toLowerCase().includes(searchLower) ||
          p.address.neighborhood.toLowerCase().includes(searchLower) ||
          p.address.state.toLowerCase().includes(searchLower)
      );
    }

    // Filter by state
    if (filters.state !== 'all') {
      result = result.filter((p) => p.address.state === filters.state);
    }

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter((p) => p.type === filters.type);
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map((v) => {
        if (v.includes('+')) return Infinity;
        return parseInt(v, 10);
      });
      result = result.filter((p) => p.price >= min && p.price <= (max || Infinity));
    }

    // Filter sold
    if (!filters.showSold) {
      result = result.filter((p) => p.status !== 'sold');
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Always put sold at the end
    result.sort((a, b) => {
      if (a.status === 'sold' && b.status !== 'sold') return 1;
      if (a.status !== 'sold' && b.status === 'sold') return -1;
      return 0;
    });

    return result;
  }, [properties, filters, sortBy]);

  const availableCount = filteredProperties.filter((p) => p.status === 'available').length;
  const soldCount = filteredProperties.filter((p) => p.status === 'sold').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <div className="hero-gradient py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-primary-foreground mb-2">
                Imóveis Disponíveis
              </h1>
              <p className="text-primary-foreground/80">
                Explore todas as oportunidades da Caixa no Nordeste
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container py-8">
          {/* Filters */}
          <PropertyFilters filters={filters} onFiltersChange={setFilters} />

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {availableCount} imóvel{availableCount !== 1 ? 'is' : ''} disponível{availableCount !== 1 ? 'is' : ''}
                </p>
                {filters.showSold && soldCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    + {soldCount} vendido{soldCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="discount">Maior Desconto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando imóveis...</span>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Building2 className="h-16 w-16 text-destructive/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                Erro ao carregar imóveis
              </h3>
              <p className="text-muted-foreground">
                Verifique a conexão com o banco de dados.
              </p>
            </motion.div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-muted-foreground">
                {properties.length === 0 
                  ? 'Importe imóveis no painel administrativo para exibi-los aqui.'
                  : 'Tente ajustar os filtros para encontrar mais opções.'
                }
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertiesPage;
