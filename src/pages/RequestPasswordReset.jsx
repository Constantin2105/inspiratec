import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email("L'adresse email est invalide."),
});

const RequestPasswordReset = () => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } else {
      toast({
        title: 'Email envoyé !',
        description: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Réinitialiser le mot de passe - InspiraTec</title>
      </Helmet>
      <div className="relative container-custom py-16 flex flex-col justify-center items-center min-h-screen">
        <div className="absolute top-8 left-8">
            <Button asChild variant="ghost">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
                <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" {...register('email')} />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Spinner size="sm" /> : 'Envoyer le lien'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default RequestPasswordReset;