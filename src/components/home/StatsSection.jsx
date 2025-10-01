import React from "react";
import { motion } from "framer-motion";
import { Users, Target, CheckCircle, Star } from "lucide-react";

const StatCard = ({ number, label, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-center p-6 bg-card rounded-xl shadow-lg border-border"
  >
    <Icon className="h-8 w-8 text-primary dark:text-primary-night mx-auto mb-3" />
    <div className="text-3xl font-bold text-primary dark:text-primary-night mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const StatsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nos chiffres parlent d'eux-mêmes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une communauté grandissante d'experts et d'entreprises qui nous font confiance
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number="500+" label="Experts qualifiés" icon={Users} />
          <StatCard number="200+" label="Entreprises partenaires" icon={Target} />
          <StatCard number="1000+" label="Missions réalisées" icon={CheckCircle} />
          <StatCard number="98%" label="Taux de satisfaction" icon={Star} />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;