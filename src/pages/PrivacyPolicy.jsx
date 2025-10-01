import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - InspiraTec</title>
        <meta name="description" content="Consultez la politique de confidentialité de la plateforme InspiraTec." />
      </Helmet>
      <div className="bg-muted/50">
        <div className="container-custom py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-background p-8 md:p-12 rounded-lg shadow-sm"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Politique de Confidentialité</h1>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead">InspiraTec s'engage à ce que la collecte et le traitement de vos données, effectués à partir du site inspiratec.fr, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.</p>
              
              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">1. Collecte des données personnelles</h2>
              <p>Les données à caractère personnel qui sont collectées sur ce site sont les suivantes :</p>
              <ul>
                <li><strong>Création de compte :</strong> lors de la création de votre compte, vos nom, prénom, adresse électronique, et données relatives à votre profil professionnel (compétences, expérience, etc.).</li>
                <li><strong>Connexion :</strong> lors de la connexion de l'utilisateur au site, celui-ci enregistre, notamment, ses données de connexion, d'utilisation, de localisation et de paiement.</li>
                <li><strong>Communication :</strong> lorsque vous communiquez avec nous via les formulaires de contact ou par email, nous collectons les informations que vous nous fournissez.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">2. Utilisation des données</h2>
              <p>Les données personnelles collectées auprès des utilisateurs ont pour objectif la mise à disposition des services du site, leur amélioration et le maintien d'un environnement sécurisé. Plus précisément, les utilisations sont les suivantes :</p>
              <ul>
                <li>Accès et utilisation du site par l'utilisateur ;</li>
                <li>Gestion du fonctionnement et optimisation du site ;</li>
                <li>Mise en relation des utilisateurs (entreprises et experts) ;</li>
                <li>Vérification, identification et authentification des données transmises par l'utilisateur ;</li>
                <li>Prévention et détection des fraudes, malwares et gestion des incidents de sécurité.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">3. Partage des données personnelles avec des tiers</h2>
              <p>Les données personnelles peuvent être partagées avec des sociétés tierces, dans les cas suivants :</p>
              <ul>
                <li>Quand l'utilisateur utilise les services de paiement, pour la mise en œuvre de ces services, le site est en relation avec des sociétés bancaires et financières tierces avec lesquelles il a passé des contrats.</li>
                <li>Si la loi l'exige, le site peut effectuer la transmission de données pour donner suite aux réclamations présentées contre le site et se conformer aux procédures administratives et judiciaires.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">4. Vos droits</h2>
              <p>En application de la réglementation applicable aux données à caractère personnel, les utilisateurs disposent des droits suivants : droit d'accès, de rectification, de suppression, de limitation du traitement, d'opposition au traitement et de portabilité de leurs données. Vous pouvez exercer ce droit en nous contactant à l'adresse suivante : <a href="mailto:dpo@inspiratec.fr" className="text-primary">dpo@inspiratec.fr</a>.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;