
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const UpdatePassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, loading: authLoading, profile, getRedirectPath } = useAuth();
  const [loading, setLoading] = useState(true);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const handlePasswordUpdate = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.',
      });
    } else {
      toast({
        title: 'Succès !',
        description: 'Votre mot de passe a été mis à jour avec succès.',
      });
      setPasswordUpdated(true);
      // L'utilisateur est maintenant connecté, on attend que le profil soit chargé pour rediriger
    }
  }, [toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setLoading(false);
      }
    });
    
    // Vérifier si on est déjà dans une session de récupération
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession || !authLoading) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [authLoading]);

  // Redirection automatique après mise à jour du mot de passe
  useEffect(() => {
    if (passwordUpdated && profile && !authLoading) {
      const redirectPath = getRedirectPath(profile.role);
      
      // Ajouter un petit délai pour permettre au toast de s'afficher
      setTimeout(() => {
        toast({
          title: 'Redirection...',
          description: 'Vous allez être redirigé vers votre tableau de bord.',
        });
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      }, 500);
    }
  }, [passwordUpdated, profile, authLoading, getRedirectPath, navigate, toast]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    await handlePasswordUpdate(password);
  };
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>
  }

  return (
    <>
      <Helmet>
        <title>Nouveau mot de passe - InspiraTec</title>
      </Helmet>
      <div className="container-custom py-16 flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Définir un nouveau mot de passe</CardTitle>
                <CardDescription>Choisissez un mot de passe fort pour sécuriser votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <PasswordInput id="password" {...register('password')} />
                  {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Spinner size="sm" /> : 'Enregistrer le nouveau mot de passe'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default UpdatePassword;