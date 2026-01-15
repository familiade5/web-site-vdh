import { PropertyCard } from '@/components/property/PropertyCard';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { getSoldProperties } from '@/data/exampleProperties';

export function SoldProperties() {
  // Usar dados de exemplo locais (4 vendidos)
  const soldProperties = getSoldProperties();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {soldProperties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
