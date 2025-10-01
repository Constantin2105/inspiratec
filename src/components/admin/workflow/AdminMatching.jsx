import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const AdminMatching = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching IA</CardTitle>
        <CardDescription>Outils de matching intelligent entre AOs et experts.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center py-16">
        <Zap className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-bold">À développer</h3>
        <p className="text-muted-foreground mt-2">
          Ce module est en cours de développement et sera bientôt disponible.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminMatching;