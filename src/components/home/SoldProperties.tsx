import { PropertyCard } from '@/components/property/PropertyCard';
import { useDbProperties, DbProperty } from '@/hooks/useProperties';
import { Property } from '@/types/property';
import { motion } from 'framer-motion';
import { TrendingUp, Loader2 } from 'lucide-react';
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

export function SoldProperties() {
  const { data: dbProperties, isLoading } = useDbProperties();
  
  const soldProperties = useMemo(() => {
    if (!dbProperties) return [];
    return dbProperties
      .map(dbPropertyToProperty)
      .filter((p) => p.status === 'sold')
      .slice(0, 3);
  }, [dbProperties]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (soldProperties.length === 0) return null;

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
            <span className="inline-flex items-center gap-2 text-sm font-medium text-success uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              Prova Social
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2">
              Vendidos Recentemente
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Veja alguns imóveis que já foram vendidos através da nossa plataforma. 
              O próximo pode ser seu!
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {soldProperties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
