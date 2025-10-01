import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Zap, Users, Target } from 'lucide-react';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const benefits = [
    { icon: Zap, title: "Recrutement Rapide", description: "Recevez des profils qualifiés en moins de 48h." },
    { icon: Target, title: "Experts sur Mesure", description: "Nous sélectionnons les talents qui correspondent parfaitement à votre besoin." },
    { icon: Users, title: "Communauté d'Excellence", description: "Accédez à un réseau de plus de 5000 experts tech vérifiés." },
];

const OnAUneMission = () => {
    const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Déposer une mission - InspiraTec</title>
        <meta name="description" content="Décrivez votre projet et trouvez les meilleurs experts tech pour le réaliser. Rapide, simple et efficace." />
      </Helmet>
      
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <div className="bg-gradient-to-b from-primary/10 to-background">
            <div className="container-custom py-16 md:py-24 text-center">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4"
            >
                Donnez Vie à Votre Projet
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
                Publiez votre mission et laissez-nous vous connecter avec les meilleurs talents tech pour la réaliser.
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
            >
                <DialogTrigger asChild>
                    <Button size="lg" className="text-lg">
                        Publier une mission <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </DialogTrigger>
            </motion.div>
            </div>
        </div>

        <div className="container-custom py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir Inspiratec ?</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-center p-6 bg-card rounded-lg border"
                    >
                        <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                            <benefit.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
        <DialogContent className="sm:max-w-[425px]">
            <UnifiedSignupForm 
                userType="company"
                title="Rejoignez Inspiratec"
                description="Créez votre compte entreprise pour publier votre mission et trouver les meilleurs experts."
            />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnAUneMission;