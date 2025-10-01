import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import UnifiedLoginForm from '@/components/forms/UnifiedLoginForm';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/common/Spinner';

const AdminLogin = () => {
  const { user, loading, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    if (!loading && user?.role === 'super-admin') {
      const path = getRedirectPath('super-admin');
      navigate(path, { replace: true });
    }
  }, [user, loading, navigate, getRedirectPath]);

  if (loading || (!loading && user?.role === 'super-admin')) {
    return (
      <div className="dark flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Connexion Administrateur - InspiraTec</title>
        <meta name="description" content="Accès réservé à l'administration d'InspiraTec." />
      </Helmet>
      <div className="dark container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center items-center min-h-screen bg-background text-foreground">
        <div className="relative w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <img alt="InspiraTec Logo" className="h-12 w-auto mx-auto" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
                    </Link>
                </div>
                <UnifiedLoginForm
                    title="Espace Administration"
                    description="Veuillez vous connecter pour continuer."
                    resetPasswordLink="/request-password-reset"
                    expectedRole="super-admin"
                />
                <div className="mt-8 text-center">
                    <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retourner à l'accueil
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;