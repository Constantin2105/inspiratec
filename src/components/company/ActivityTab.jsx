import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileClock } from 'lucide-react';

const ActivityTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon Activité (CRA & Facturation)</CardTitle>
        <CardDescription>
          Suivez les comptes rendus d'activité de vos experts et gérez la facturation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
            <FileClock className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Bientôt disponible !</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Nous préparons une interface complète pour vous permettre de valider les fiches de temps (CRA) de vos experts et de suivre vos factures en toute simplicité.
            </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;