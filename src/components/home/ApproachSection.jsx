import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Award } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const ApproachCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay }}
    className="flex"
  >
    <SpotlightCard spotlightColor="rgba(255, 193, 7, 0.15)" className="w-full bg-card p-0 rounded-2xl border">
      <div className="p-6">
        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4 p-0">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </div>
    </SpotlightCard>
  </motion.div>
);

const ApproachSection = () => {
  const approaches = [
    {
      icon: Target,
      title: "Matching ultra-personnalisé",
      description: "Notre algorithme intelligent analyse vos besoins spécifiques et vous connecte avec les experts qui correspondent exactement à vos critères techniques, sectoriels et budgétaires.",
    },
    {
      icon: Zap,
      title: "Réactivité dans nos propositions",
      description: "Recevez des profils d'experts qualifiés en moins de 24h. Notre équipe pré-sélectionne les candidats pour vous faire gagner un temps précieux.",
    },
    {
      icon: Award,
      title: "Accompagnement premium",
      description: "Bénéficiez d'un suivi personnalisé tout au long de votre collaboration. Notre équipe vous accompagne de la définition du besoin jusqu'à la réalisation de votre projet.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-futura text-3xl md:text-4xl font-bold text-foreground">
            Notre Approche Unique
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {approaches.map((item, index) => (
            <ApproachCard key={index} {...item} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;