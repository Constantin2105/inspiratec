import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useExpert } from '@/hooks/useExpert';
import ProfileTab from '@/components/expert/ProfileTab';
import TestimonialTab from '@/components/expert/TestimonialTab';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';

const ExpertProfile = () => {
    const { profile, blogPosts, loading, error, refreshData, refreshProfile } = useExpert();

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <p className="text-destructive">Erreur de chargement du profil.</p>;
    }

    return (
        <>
            <Helmet>
                <title>Mon Profil - Espace Expert</title>
                <meta name="description" content="Gérez vos informations de profil, vos documents et votre témoignage en tant qu'expert." />
            </Helmet>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold">Profil</h1>
                        <p className="text-muted-foreground">Gérez vos informations personnelles, votre témoignage.</p>
                    </motion.div>
                    <ProfileTab profile={profile} loading={loading} onUpdate={() => { refreshData(); refreshProfile(); }} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <TestimonialTab onUpdate={refreshData} />
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ExpertProfile;