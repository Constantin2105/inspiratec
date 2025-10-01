import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ExpertSupport = () => {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Construction className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="mt-4">Page en construction</CardTitle>
        <CardDescription>
          Notre page de support est en cours de développement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Elle sera bientôt disponible pour répondre à toutes vos questions. Merci pour votre patience !
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpertSupport;