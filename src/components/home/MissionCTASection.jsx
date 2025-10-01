import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Users, Clock, CheckCircle } from "lucide-react";
import QuickMissionForm from "./QuickMissionForm";
import { useToast } from "@/components/ui/use-toast";

const MissionCTASection = () => {
  const [showMissionForm, setShowMissionForm] = useState(false);
  const { toast } = useToast();

  const handleMissionSuccess = (result) => {
    setShowMissionForm(false);
    toast({
      title: "Compte créé avec succès !",
      description: "Vérifiez votre email pour activer votre compte et accéder à votre espace entreprise.",
      duration: 5000
    });
  };

  const benefits = [
    {
      icon: Users,
      title: "Experts qualifiés",
      description: "Accès à une communauté d'experts tech vérifiés"
    },
    {
      icon: Clock,
      title: "Réponse rapide",
      description: "Recevez des propositions sous 24h"
    },
    {
      icon: CheckCircle,
      title: "Processus simplifié",
      description: "De la demande au recrutement en quelques clics"
    }
  ];

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="mx-auto mb-6 p-4 bg-green-100 dark:bg-green-900 rounded-full w-fit">
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Vous avez une mission ? Nous avons l'expert !
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Décrivez votre besoin en quelques minutes et accédez immédiatement aux meilleurs talents tech du marché.
            </p>
            
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white text-base px-8 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowMissionForm(true)}
            >
              On a une mission !
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Avantages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mt-16"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 p-3 bg-white dark:bg-gray-800 rounded-full w-fit shadow-lg">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal du formulaire de mission */}
      {showMissionForm && (
        <QuickMissionForm
          onClose={() => setShowMissionForm(false)}
          onSuccess={handleMissionSuccess}
        />
      )}
    </>
  );
};

export default MissionCTASection;