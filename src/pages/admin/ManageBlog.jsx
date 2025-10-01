import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ManageBlog = () => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "La gestion complète du blog arrive très prochainement.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Gérer le Blog - Admin InspiraTec</title>
      </Helmet>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion du Blog</h1>
          <Button onClick={handleNotImplemented}>Créer un article</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p>La liste des articles et les options de gestion (création, édition, suppression) seront bientôt disponibles ici.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ManageBlog;