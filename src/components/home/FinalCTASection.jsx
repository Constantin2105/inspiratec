import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Building, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const CTACard = ({ icon: Icon, title, path, variant = 'primary', delay = 0 }) => {
  const navigate = useNavigate();
  const buttonClass = variant === 'green' ? 'btn-green' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
    >
      <Card 
        className="text-center p-6 h-full flex flex-col justify-center items-center bg-card shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 cursor-pointer"
        onClick={() => navigate(path)}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
      </Card>
    </motion.div>
  );
};

const FinalCTASection = ({ handleRedirect }) => {
  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Prêt à nous rejoindre ?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Rejoignez des milliers d'entreprises et d'experts qui font confiance à InspiraTec pour transformer leurs défis technologiques en succès concrets.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <CTACard icon={User} title="Devenir un Expert" path="/signup/expert" variant="primary" delay={0} />
          <CTACard icon={Building} title="Trouver un Expert" path="/signup/company" variant="green" delay={0.15} />
          <CTACard icon={FileText} title="Déposer une Mission" path="/post-mission" variant="outline" delay={0.3} />
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;