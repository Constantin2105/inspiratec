import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, LogOut, Home } from 'lucide-react';

const Unauthorized = () => {
  const { signOut } = useAuth();

  return (
    <>
      <Helmet>
        <title>Accès non autorisé - InspiraTec</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="max-w-md mx-auto"
        >
          <ShieldAlert className="mx-auto h-20 w-20 text-destructive" />
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground">Accès non autorisé</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Votre compte n'a pas le rôle nécessaire pour accéder à cette ressource ou votre rôle est indéfini.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Page d'accueil
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Unauthorized;