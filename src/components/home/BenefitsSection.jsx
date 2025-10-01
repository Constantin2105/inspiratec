import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, ArrowRight, CheckCircle } from "lucide-react";

const BenefitCard = ({ icon: Icon, title, benefits, ctaText, ctaAction, iconBgClass, buttonClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay }}
    className="h-full"
  >
    <Card className="h-full flex flex-col bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border">
      <CardHeader>
        <div className="flex flex-col items-center text-center">
            <div className={`p-4 ${iconBgClass} rounded-full w-fit mb-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-6 pt-0">
        <ul className="space-y-3 mb-8 flex-grow text-center">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start text-left gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full mt-auto ${buttonClass}`}
          size="lg"
          onClick={ctaAction}
        >
          {ctaText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const BenefitsSection = ({ handleRedirect }) => {

  const expertBenefits = [
    "Accès à des missions exclusives et bien rémunérées",
    "Clients pré-qualifiés et projets sérieux",
    "Accompagnement personnalisé dans vos démarches",
    "Communauté d'experts pour échanger et progresser",
    "Outils de gestion de projet intégrés"
  ];

  const companyBenefits = [
    "Accès à +5000 experts tech vérifiés",
    "Matching précis selon vos besoins spécifiques",
    "Réponses qualifiées sous 24h maximum",
    "Support dédié tout au long du processus",
    "Flexibilité totale : mission courte ou longue"
  ];

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Une solution adaptée à chaque profil
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Que vous soyez un expert en quête de nouvelles opportunités ou une entreprise à la recherche de talents, nous avons la solution qu'il vous faut.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <BenefitCard
            icon={User}
            title="Pour les Experts"
            benefits={expertBenefits}
            ctaText="Devenir un Expert"
            ctaAction={() => handleRedirect('/signup/expert')}
            iconBgClass="bg-primary"
            buttonClass=""
            delay={0}
          />
          <BenefitCard
            icon={Building}
            title="Pour les entreprises"
            benefits={companyBenefits}
            ctaText="Trouver un expert"
            ctaAction={() => handleRedirect('/signup/company')}
            iconBgClass="bg-green-600"
            buttonClass="btn-green"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;