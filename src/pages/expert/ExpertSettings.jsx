import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useExpert } from '@/hooks/useExpert';
import Spinner from '@/components/common/Spinner';
import ExpertProfileSettings from '@/components/expert/settings/ExpertProfileSettings';

const ExpertSettings = () => {
    const { loading, error } = useExpert();

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-destructive text-center">Erreur de chargement des paramètres.</p>;
    }

    return (
        <>
            <Helmet>
                <title>Paramètres - Espace Expert</title>
                <meta name="description" content="Gérez votre profil, vos informations et l'apparence de votre espace." />
            </Helmet>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold">Paramètres</h1>
                        <p className="text-muted-foreground">Gérez votre profil, vos informations et l'apparence de votre espace.</p>
                    </motion.div>
                    <ExpertProfileSettings />
                </div>
            </div>
        </>
    );
};

export default ExpertSettings;