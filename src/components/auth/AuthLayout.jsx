import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AuthHeader = ({ showLogin, showSignup }) => (
  <header className="absolute top-0 left-0 right-0 z-20 bg-primary">
    <div className="container-custom flex items-center justify-between h-20">
      <Link to="/">
        <img alt="InspiraTec Logo" className="h-8 md:h-10 w-auto" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/91f06f9606355183d80222ab2b5178cf.png" />
      </Link>
      <div className="flex items-center gap-4">
        {showLogin && (
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link to="/login">Se connecter</Link>
          </Button>
        )}
        {showSignup && (
          <Button asChild variant="secondary">
            <Link to="/login">S'inscrire</Link>
          </Button>
        )}
      </div>
    </div>
  </header>
);

const AuthLayout = ({ children, showLogin = true, showSignup = true }) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40 pt-20">
      <AuthHeader showLogin={showLogin} showSignup={showSignup} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex-grow flex items-center justify-center p-4"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;