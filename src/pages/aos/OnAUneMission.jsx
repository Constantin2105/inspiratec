import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const OnAUneMission = () => {
  return (
    <>
      <Helmet>
        <title>Déposer une Mission - InspiraTec</title>
        <meta name="description" content="Vous avez un projet ? Déposez votre mission et trouvez l'expert tech idéal pour la réaliser." />
      </Helmet>
      <div className="container-custom py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Déposez Votre Mission</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Décrivez votre projet, et nous vous mettrons en relation avec les meilleurs talents pour le concrétiser.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <div className="bg-card border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Fonctionnalité en cours de développement</h2>
            <p className="text-muted-foreground">Le formulaire de dépôt de mission sera bientôt disponible ici.</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OnAUneMission;