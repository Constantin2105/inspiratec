import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ToBeDeveloped = ({ title, description }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64">
            <Construction className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">En cours de développement</p>
            <p className="text-sm text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
        </CardContent>
    </Card>
);

const ExpertActivity = () => {
    return (
        <>
            <Helmet>
                <title>Activité - Espace Expert</title>
            </Helmet>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Activité</h1>
                <div className="grid gap-6 md:grid-cols-2">
                    <ToBeDeveloped title="CRA (Compte Rendu d'Activité)" description="Saisissez vos heures, descriptions et dépenses." />
                    <ToBeDeveloped title="Facturation" description="Exportez vos factures et suivez leurs statuts." />
                </div>
            </div>
        </>
    );
};

export default ExpertActivity;