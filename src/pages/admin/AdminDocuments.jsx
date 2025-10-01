import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminDocumentsTab from '@/components/admin/documents/AdminDocumentsTab';

const AdminDocuments = () => {
  return (
    <>
      <Helmet>
        <title>Gestion des Documents - Admin</title>
        <meta name="description" content="Gérez les documents partagés sur la plateforme." />
      </Helmet>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Documents</h1>
          <p className="text-muted-foreground">
            Consultez, téléchargez et partagez des documents avec les experts et les entreprises.
          </p>
        </div>
        <AdminDocumentsTab />
      </div>
    </>
  );
};

export default AdminDocuments;