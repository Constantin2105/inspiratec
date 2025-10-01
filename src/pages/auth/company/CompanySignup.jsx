import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CompanySignup = () => {
  return (
    <>
      <Helmet>
        <title>Inscription Entreprise - InspiraTec</title>
        <meta name="description" content="Rejoignez InspiraTec en tant qu'entreprise et trouvez les meilleurs talents." />
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
          className="w-full max-w-lg"
        >
          <UnifiedSignupForm
            userType="company"
            title="Créer un compte Entreprise"
            description="Postez vos missions et trouvez les meilleurs talents pour vos projets."
          />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Button asChild variant="link" className="p-0 h-auto">
              <Link to="/login/company" className="font-semibold text-primary">
                Connectez-vous
              </Link>
            </Button>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default CompanySignup;