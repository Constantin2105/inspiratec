import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Non Trouvée | InspiraTec</title>
        <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h1 className="text-8xl md:text-9xl font-extrabold text-primary">404</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">Page non trouvée</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <Button asChild size="lg">
            <Link to="/">Retourner à l'accueil</Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;