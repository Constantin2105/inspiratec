import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useExpert } from '@/hooks/useExpert';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/common/Spinner';
import OverviewTab from '@/components/expert/OverviewTab';

const ExpertDashboard = () => {
    const { profile } = useAuth();
    const { aos, candidatures, notifications, blogPosts, loading, error, refreshData } = useExpert();

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <p className="text-destructive">Erreur de chargement du tableau de bord.</p>;
    }

    return (
        <>
            <Helmet>
                <title>Tableau de bord - {profile?.display_name}</title>
            </Helmet>
            <OverviewTab 
                candidatures={candidatures} 
                aos={aos} 
                profile={profile} 
                notifications={notifications}
                blogPosts={blogPosts}
                loading={loading} 
                onUpdate={refreshData}
            />
        </>
    );
};

export default ExpertDashboard;