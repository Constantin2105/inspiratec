import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Feature = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-start gap-3"
  >
    <CheckCircle className="h-6 w-6 text-primary dark:text-primary-night mt-1 flex-shrink-0" />
    <span className="text-lg text-muted-foreground">{text}</span>
  </motion.div>
);

const WhyUsSection = () => {
  const features = [
    "Plus de 5000 experts dans tous les domaines tech",
    "Matching précis grâce à notre IA propriétaire",
    "Support dédié par des spécialistes du recrutement tech",
    "Flexibilité totale : mission courte, longue ou recrutement permanent",
    "Processus sécurisé avec garantie de satisfaction"
  ];

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-futura text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Prêt à rencontrer votre prochain expert tech ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Rejoignez les centaines d'entreprises qui font confiance à notre plateforme pour leurs recrutements technologiques.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/talents">
                <Button size="lg" className="button-primary px-8 py-6 text-base">
                  Explorer les profils
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <div className="space-y-10">
            <h3 className="font-futura text-2xl font-bold text-center lg:text-left">
              Pourquoi choisir notre plateforme ?
            </h3>
            <div className="space-y-5">
              {features.map((feature, index) => (
                <Feature key={index} text={feature} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;