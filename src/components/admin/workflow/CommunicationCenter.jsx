import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CommunicationCenter = () => {
    const { toast } = useToast();
    const showPlaceholderToast = () => {
        toast({
            title: "🚧 Fonctionnalité en cours de développement",
            description: "Cette section n'est pas encore implémentée. Revenez bientôt !",
        });
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Historique des communications</CardTitle>
            <CardDescription>Vue d'ensemble des derniers échanges.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-16">
            <p>L'historique des communications s'affichera ici.</p>
            <Button className="mt-4" onClick={showPlaceholderToast}>Charger l'historique</Button>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Modèles de messages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" onClick={showPlaceholderToast}>Email de validation</Button>
            <Button variant="outline" onClick={showPlaceholderToast}>Email de rejet</Button>
            <Button variant="outline" onClick={showPlaceholderToast}>Demande d'informations</Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Planification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Textarea placeholder="Prise de notes pour le prochain appel..." />
            <Button className="mt-2 w-full" onClick={showPlaceholderToast}><Phone className="mr-2 h-4 w-4"/> Planifier un appel</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunicationCenter;