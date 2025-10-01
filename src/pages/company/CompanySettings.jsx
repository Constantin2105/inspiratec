import React from 'react';
import { Helmet } from 'react-helmet-async';
import CompanyProfileSettings from '@/components/company/settings/CompanyProfileSettings';

const CompanySettings = () => {
  return (
    <>
      <Helmet>
        <title>Paramètres - Espace Entreprise</title>
        <meta name="description" content="Gérez les paramètres de votre compte entreprise." />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Paramètres du compte</h1>
            <p className="text-muted-foreground">Mettez à jour les informations de votre profil et gérez vos préférences.</p>
          </div>
          <CompanyProfileSettings />
        </div>
      </div>
    </>
  );
};

export default CompanySettings;