import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, LogIn, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AuthLayout = ({ children }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </div>
);

const AccountVerified = () => {
  return (
    <>
      <Helmet>
        <title>Compte vérifié - InspiraTec</title>
        <meta name="description" content="Votre compte InspiraTec a été vérifié avec succès. Connectez-vous pour accéder à votre tableau de bord." />
      </Helmet>
      <AuthLayout>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full rounded-xl border bg-card p-8 text-center shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </motion.div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-card-foreground">Votre compte est activé !</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Félicitations ! Vous pouvez maintenant vous connecter pour accéder à votre espace personnalisé.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <Button asChild size="lg">
                <Link to="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Se connecter
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Retour à l'accueil
                </Link>
            </Button>
          </div>
        </motion.div>
      </AuthLayout>
    </>
  );
};

export default AccountVerified;