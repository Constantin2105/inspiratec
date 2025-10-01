import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import UnifiedLoginForm from '@/components/forms/UnifiedLoginForm';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/common/Spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ExpertLogin = () => {
  const { profile, loading, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      const path = getRedirectPath(profile.role);
      if (path === '/expert/dashboard') {
        navigate(path, { replace: true });
      }
    }
  }, [profile, loading, navigate, getRedirectPath]);

  if (loading && !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Connexion Expert - InspiraTec</title>
        <meta name="description" content="Connectez-vous à votre espace expert pour trouver des missions." />
      </Helmet>
      <div className="relative container-custom py-16 flex justify-center items-center min-h-screen">
        <div className="absolute top-8 left-8">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Revenir sur le site
              </Link>
            </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <UnifiedLoginForm
              title="Espace Expert"
              description="Connectez-vous pour accéder à votre tableau de bord."
              resetPasswordLink="/request-password-reset"
              expectedRole="expert"
            />
          </Card>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Button asChild variant="link" className="p-0 h-auto">
              <Link to="/signup/expert" className="font-semibold text-primary">
                Inscrivez-vous
              </Link>
            </Button>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default ExpertLogin;