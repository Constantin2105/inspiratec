import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <>
      <Helmet>
        <title>Pourquoi InspiraTec - InspiraTec</title>
        <meta name="description" content="Découvrez la mission et la vision d'InspiraTec." />
      </Helmet>
      <div className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold">Pourquoi InspiraTec ?</h1>
          <p className="mt-4 text-lg text-muted-foreground">Notre mission est de connecter les talents et les entreprises pour créer l'avenir.</p>
        </motion.div>
      </div>
    </>
  );
};

export default About;