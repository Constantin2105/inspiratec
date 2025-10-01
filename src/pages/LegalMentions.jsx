import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const LegalMentions = () => {
  return (
    <>
      <Helmet>
        <title>Mentions Légales - InspiraTec</title>
        <meta name="description" content="Consultez les mentions légales de la plateforme InspiraTec." />
      </Helmet>
      <div className="bg-muted/50">
        <div className="container-custom py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-background p-8 md:p-12 rounded-lg shadow-sm"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Mentions Légales</h1>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead">Conformément aux dispositions des Articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l’économie numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs et visiteurs du site InspiraTec les présentes mentions légales.</p>
              
              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">1. Éditeur du site</h2>
              <p>Le site InspiraTec est la propriété de :</p>
              <p>
                <strong>InspiraTec SAS</strong><br />
                Société par actions simplifiée au capital de 1 000 euros<br />
                Siège social : 123 Rue de la Tech, 75000 Paris, France<br />
                Immatriculée au RCS de Paris sous le numéro 123 456 789<br />
                Numéro de TVA intracommunautaire : FR00123456789<br />
                Adresse de courrier électronique : <a href="mailto:contact@inspiratec.fr" className="text-primary">contact@inspiratec.fr</a><br />
                Directeur de la publication : Jean Dupont
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">2. Hébergeur du site</h2>
              <p>Le site InspiraTec est hébergé par :</p>
              <p>
                <strong>Hostinger International Ltd.</strong><br />
                Adresse : 61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
                Contact : <a href="https://www.hostinger.fr/contact" target="_blank" rel="noopener noreferrer" className="text-primary">https://www.hostinger.fr/contact</a>
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">3. Accès au site</h2>
              <p>Le site est accessible par tout endroit, 7j/7, 24h/24 sauf cas de force majeure, interruption programmée ou non et pouvant découler d’une nécessité de maintenance. En cas de modification, interruption ou suspension des services, le site InspiraTec ne saurait être tenu responsable.</p>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">4. Propriété intellectuelle</h2>
              <p>Toute utilisation, reproduction, diffusion, commercialisation, modification de toute ou partie du site InspiraTec, sans autorisation de l’Éditeur est prohibée et pourra entraîner des actions et poursuites judiciaires telles que notamment prévues par le Code de la propriété intellectuelle et le Code civil.</p>
              <p>Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son…) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LegalMentions;