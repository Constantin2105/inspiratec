import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MailCheck, Home, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const AuthLayout = ({ children }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </div>
);

const EmailVerificationSent = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleResendEmail = async () => {
    const email = location.state?.email;
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retrouver votre email pour renvoyer le lien.",
      });
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors du renvoi",
        description: error.message,
      });
    } else {
      toast({
        title: "Email renvoyé !",
        description: "Un nouveau lien de vérification a été envoyé à votre adresse.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Vérifiez votre email - InspiraTec</title>
      </Helmet>
      <AuthLayout>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full rounded-xl border bg-card p-8 text-center shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <MailCheck className="mx-auto h-16 w-16 text-primary" />
          </motion.div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-card-foreground">Vérifiez votre boîte de réception !</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nous vous avons envoyé un email de vérification. Veuillez cliquer sur le lien pour activer votre compte.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            (Pensez à vérifier votre dossier de courriers indésirables)
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
             <Button onClick={handleResendEmail} variant="secondary" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Renvoyer l'email
              </Button>
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </motion.div>
      </AuthLayout>
    </>
  );
};

export default EmailVerificationSent;