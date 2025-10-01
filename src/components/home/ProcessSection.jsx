import React from "react";
import { motion } from "framer-motion";
import { FileText, Search, Users, Rocket } from "lucide-react";

const ProcessStep = ({ number, title, description, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, delay }}
    className="relative flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm hover:shadow-lg transition-shadow border"
  >
    <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold shadow-md border-4 border-background">
      {number}
    </div>
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="font-sans font-semibold mb-2 text-lg text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm flex-grow">{description}</p>
  </motion.div>
);

const ProcessSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-futura text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comment ça fonctionne ?
          </h2>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProcessStep 
            number="1" 
            title="Brief détaillé" 
            description="Exposez votre projet et définissez précisément vos besoins techniques, temporels et budgétaires via notre formulaire intelligent." 
            icon={FileText} 
            delay={0} 
          />
          <ProcessStep 
            number="2" 
            title="Sélection sur mesure" 
            description="Notre équipe d'experts analyse votre demande et identifie les meilleurs profils tech correspondant à vos critères spécifiques." 
            icon={Search} 
            delay={0.1} 
          />
          <ProcessStep 
            number="3" 
            title="Rencontre" 
            description="Organisez des entretiens avec les candidats pré-sélectionnés et choisissez l'expert qui s'intégrera parfaitement à votre équipe." 
            icon={Users} 
            delay={0.2} 
          />
          <ProcessStep 
            number="4" 
            title="Démarrage" 
            description="Lancez votre collaboration sereinement grâce à notre accompagnement et nos outils de suivi de projet intégrés." 
            icon={Rocket} 
            delay={0.3} 
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;