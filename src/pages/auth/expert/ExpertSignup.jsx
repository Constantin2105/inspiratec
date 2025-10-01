import React from 'react';
import { Helmet } from 'react-helmet-async';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ExpertSignup = () => {
  return (
    <>
      <Helmet>
        <title>Inscription Expert - InspiraTec</title>
        <meta name="description" content="Créez votre compte expert pour accéder à des missions exclusives." />
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
          <UnifiedSignupForm
            userType="expert"
            title="Devenez un Expert InspiraTec"
            description="Rejoignez notre communauté de talents et trouvez votre prochaine mission."
          />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Button asChild variant="link" className="p-0 h-auto">
              <Link to="/login/expert" className="font-semibold text-primary">
                Connectez-vous
              </Link>
            </Button>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default ExpertSignup;