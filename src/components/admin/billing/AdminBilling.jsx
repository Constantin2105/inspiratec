import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const AdminBilling = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRA & Facturation</CardTitle>
        <CardDescription>Gestion des comptes rendus d'activité et de la facturation.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center py-16">
        <CreditCard className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-bold">À développer</h3>
        <p className="text-muted-foreground mt-2">
          Ce module est en cours de développement et sera bientôt disponible.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminBilling;