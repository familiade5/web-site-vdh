import { ArrowRight, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useDbProperties, DbProperty } from '@/hooks/useProperties';
import { Property } from '@/types/property';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

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

export function FeaturedProperties() {
  const { data: dbProperties, isLoading } = useDbProperties();
  
  // Converter e ordenar por desconto
  const featuredProperties = useMemo(() => {
    if (!dbProperties) return [];
    return dbProperties
      .map(dbPropertyToProperty)
      .filter((p) => p.status === 'available')
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 6);
  }, [dbProperties]);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Destaques
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2">
              Melhores Oportunidades
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Imóveis com os maiores descontos disponíveis agora. Não perca essas oportunidades únicas.
            </p>
          </div>
          <Link to="/imoveis">
            <Button variant="outline" className="gap-2">
              Ver Todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum imóvel disponível ainda. Importe imóveis no painel administrativo.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
