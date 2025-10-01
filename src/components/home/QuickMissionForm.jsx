import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/Spinner';
import { Building, User, Briefcase, Lock, Eye, EyeOff, CheckCircle, X } from 'lucide-react';

const formSchema = z.object({
  companyName: z.string().min(2, { message: "Le nom de l'entreprise est requis." }),
  firstName: z.string().min(2, { message: "Le prénom est requis." }),
  lastName: z.string().min(2, { message: "Le nom est requis." }),
  email: z.string().email({ message: "L'adresse email est invalide." }),
  password: z.string().min(8, { message: "Le mot de passe doit faire au moins 8 caractères." }),
  confirmPassword: z.string(),
  missionTitle: z.string().min(5, { message: "Le titre de la mission est requis (5 caractères min)." }),
  missionDescription: z.string().min(20, { message: "Veuillez décrire la mission (20 caractères min)." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const QuickMissionForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      missionTitle: '',
      missionDescription: ''
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: 'company',
            company_name: values.companyName,
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("La création de l'utilisateur a échoué.");

      const { error: missionError } = await supabase
        .from('aos')
        .insert({
          title: values.missionTitle,
          description: values.missionDescription,
          entreprise_id: signUpData.user.id,
          status: 'active',
          moderation_status: 'pending',
        });

      if (missionError) throw missionError;

      if (onSuccess) onSuccess({ user: signUpData.user });
      
      if (signUpData.user && !signUpData.session) {
        navigate('/email-verification-sent');
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Une erreur est survenue',
        description: error.message || "Impossible de traiter votre demande. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="shadow-2xl">
          <CardHeader className="relative">
            <Button variant="ghost" size="sm" className="absolute right-4 top-4 rounded-full" onClick={onClose}><X className="h-4 w-4" /></Button>
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit"><Briefcase className="h-6 w-6 text-green-600" /></div>
              <CardTitle className="text-2xl font-bold text-green-600">On a une mission !</CardTitle>
              <p className="text-muted-foreground mt-2">Décrivez votre besoin et créez votre compte entreprise en quelques clics</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><Building className="h-5 w-5 mr-2 text-green-600" />Informations entreprise</h3>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input id="companyName" {...register('companyName')} />
                  {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom du contact *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom du contact *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><Lock className="h-5 w-5 mr-2 text-green-600" />Sécurisation du compte</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="password">Mot de passe *</Label>
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="8+ caractères" {...register('password')} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer mot de passe *</Label>
                      <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} />
                      {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><Briefcase className="h-5 w-5 mr-2 text-green-600" />Votre mission</h3>
                <div className="space-y-2">
                  <Label htmlFor="missionTitle">Titre de la mission *</Label>
                  <Input id="missionTitle" {...register('missionTitle')} />
                  {errors.missionTitle && <p className="text-xs text-destructive mt-1">{errors.missionTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionDescription">Décrivez votre besoin *</Label>
                  <Textarea id="missionDescription" rows={4} {...register('missionDescription')} />
                  {errors.missionDescription && <p className="text-xs text-destructive mt-1">{errors.missionDescription.message}</p>}
                  <p className="text-xs text-muted-foreground">Plus votre description est détaillée, mieux nous pourrons vous proposer des experts adaptés.</p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Email de vérification</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">Dès validation, vous recevrez un email pour activer votre compte et accéder à votre espace.</p>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Créer mon compte et soumettre ma mission"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default QuickMissionForm;