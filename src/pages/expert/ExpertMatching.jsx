import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ExpertMatching = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Matching IA</CardTitle>
                <CardDescription>Découvrez les missions qui correspondent le mieux à votre profil grâce à notre IA.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64">
                <Construction className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">En cours de développement</p>
                <p className="text-sm text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
            </CardContent>
        </Card>
    );
};

export default ExpertMatching;