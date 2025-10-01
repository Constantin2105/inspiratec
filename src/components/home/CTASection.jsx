import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = ({ handleAuthRedirect }) => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Prêt à trouver votre prochain expert ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Rejoignez les entreprises qui font confiance à InspiraTec pour leurs recrutements tech
          </p>
          <Button 
            size="lg" 
            className="rounded-full button-primary text-base px-8 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={() => handleAuthRedirect("/company-auth")}
          >
            Déposer un besoin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;