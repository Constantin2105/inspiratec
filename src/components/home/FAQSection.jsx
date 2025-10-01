import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const FAQSection = () => {
  const faqs = [{
    question: "Comment Inspiratec assure-t-il un matching précis et rapide ?",
    answer: "Notre algorithme propriétaire et l'expertise de notre équipe RH nous permettent d'analyse vos besoins spécifiques (technologies, secteur, budget, délais) et de vous proposer une sélection d'experts pré-qualifiés en moins de 24h. Chaque profil est soigneusement vérifié pour garantir une adéquation parfaite."
  }, {
    question: "Quelle est la structure tarifaire pour les entreprises utilisant Inspiratec ?",
    answer: "Notre modèle tarifaire est flexible et transparent, adapté à la durée et la complexité de votre mission. Nous travaillons sur une base de commission ou de forfait, après validation de l'expert. Pour une étude personnalisée et un devis précis, contactez nos conseillers projets."
  }, {
    question: "Comment sont sélectionnés et validés les experts du réseau Inspiratec ?",
    answer: "Nos experts passent par un processus de sélection rigoureux : vérification des compétences techniques via tests ou entretiens approfondis, validation des expériences professionnelles, et évaluation des soft skills. Seuls les meilleurs talents intègrent notre communauté pour garantir l'excellence de nos services."
  }];
  return <section className="py-20 md:py-28 bg-primary/10">
      <div className="container-custom">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">FAQs Inspiratec</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos interrogations.
          </p>
        </motion.div>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
                {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg px-6 border shadow-sm">
                        <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>)}
            </Accordion>
        </motion.div>
      </div>
    </section>;
};
export default FAQSection;