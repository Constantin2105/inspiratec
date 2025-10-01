import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpert } from '@/hooks/useExpert';
import Spinner from '@/components/common/Spinner';
import AOsTab from '@/components/expert/AOsTab';
import ApplicationsTab from '@/components/expert/ApplicationsTab';
import ExpertInterviews from './ExpertInterviews';
import ExpertMatching from './ExpertMatching';

const ExpertMissions = () => {
    const { profile, aos, candidatures, loading, error, refreshData } = useExpert();

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <p className="text-destructive">Erreur de chargement des missions.</p>;
    }

    return (
        <>
            <Helmet>
                <title>Missions - Espace Expert</title>
            </Helmet>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Missions</h1>
                <Tabs defaultValue="opportunities" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
                        <TabsTrigger value="applications">Mes Candidatures</TabsTrigger>
                        <TabsTrigger value="matching">Matching IA</TabsTrigger>
                        <TabsTrigger value="interviews">Entretiens</TabsTrigger>
                    </TabsList>
                    <TabsContent value="opportunities" className="mt-4">
                        <AOsTab aos={aos} loading={loading} profile={profile} onApplySuccess={refreshData} />
                    </TabsContent>
                    <TabsContent value="applications" className="mt-4">
                        <ApplicationsTab candidatures={candidatures} loading={loading} />
                    </TabsContent>
                    <TabsContent value="matching" className="mt-4">
                        <ExpertMatching />
                    </TabsContent>
                    <TabsContent value="interviews" className="mt-4">
                        <ExpertInterviews />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
};

export default ExpertMissions;