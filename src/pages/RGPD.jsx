import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const RGPD = () => {
  return (
    <>
      <Helmet>
        <title>Conformité RGPD - InspiraTec</title>
        <meta name="description" content="Informations sur la conformité au RGPD de la plateforme InspiraTec." />
      </Helmet>
      <div className="bg-muted/50">
        <div className="container-custom py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-background p-8 md:p-12 rounded-lg shadow-sm"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Conformité RGPD</h1>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead">Le Règlement Général sur la Protection des Données (RGPD) est une priorité pour InspiraTec. Nous nous engageons à protéger les données personnelles de nos utilisateurs et à garantir la transparence sur leur traitement.</p>
              
              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Nos engagements</h2>
              <p>Nous nous engageons à respecter les principes fondamentaux du RGPD :</p>
              <ul>
                <li><strong>Transparence :</strong> Nous vous informons clairement sur l'utilisation de vos données personnelles à travers notre politique de confidentialité.</li>
                <li><strong>Finalité :</strong> Nous collectons vos données uniquement pour des objectifs précis, explicites et légitimes (mise en relation, facturation, sécurité).</li>
                <li><strong>Minimisation des données :</strong> Nous ne collectons que les données strictement nécessaires à la réalisation de nos services.</li>
                <li><strong>Exactitude :</strong> Nous prenons des mesures raisonnables pour que vos données soient exactes et tenues à jour.</li>
                <li><strong>Sécurité et Confidentialité :</strong> Nous mettons en œuvre des mesures techniques et organisationnelles pour garantir un niveau de sécurité adapté au risque.</li>
                <li><strong>Droits des personnes :</strong> Nous vous facilitons l'exercice de vos droits (accès, rectification, suppression, opposition, portabilité).</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Délégué à la Protection des Données (DPO)</h2>
              <p>Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l'adresse suivante :</p>
              <p>Email : <a href="mailto:dpo@inspiratec.fr" className="text-primary">dpo@inspiratec.fr</a></p>
              <p>Nous nous engageons à vous répondre dans les meilleurs délais et au plus tard dans un délai d'un mois.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RGPD;