import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const FindMission = () => {
  return (
    <>
      <Helmet>
        <title>Trouver une Mission - InspiraTec</title>
        <meta name="description" content="Parcourez les missions passionnantes et trouvez votre prochain défi en tant qu'expert tech." />
      </Helmet>
      <div className="container-custom py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Trouvez Votre Prochaine Mission</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explorez les opportunités et postulez aux projets qui correspondent à votre expertise.
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
            <p className="text-muted-foreground">La liste des missions et les filtres de recherche seront bientôt disponibles ici.</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default FindMission;