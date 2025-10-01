import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import Spinner from '@/components/common/Spinner';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';

const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.");

const baseObjectSchema = z.object({
  email: z.string().email({ message: "L'adresse email est invalide." }),
  password: passwordSchema,
  confirm_password: passwordSchema,
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions pour continuer." }),
  }),
});

const passwordRefinement = {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirm_password"],
};

const expertSchema = baseObjectSchema.extend({
  first_name: z.string().min(1, { message: "Le prénom est requis." }),
  last_name: z.string().min(1, { message: "Le nom est requis." }),
}).refine(data => data.password === data.confirm_password, passwordRefinement);

const companySchema = baseObjectSchema.extend({
  name: z.string().min(1, { message: "Le nom de l'entreprise est requis." }),
  representative_first_name: z.string().min(1, { message: "Le prénom du représentant est requis." }),
  representative_last_name: z.string().min(1, { message: "Le nom du représentant est requis." }),
}).refine(data => data.password === data.confirm_password, passwordRefinement);

const UnifiedSignupForm = ({ userType, title, description }) => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  
  const formStorageKey = useMemo(() => `form-signup-${userType}`, [userType]);

  const getSchema = () => {
    switch(userType) {
      case 'expert': return expertSchema;
      case 'company': return companySchema;
      default: return z.object({});
    }
  }

  const form = useForm({
    resolver: zodResolver(getSchema()),
    mode: 'onChange' 
  });
  
  const { control, register, handleSubmit, formState: { errors, isValid } } = form;
  
  useFormPersistence(form, formStorageKey, { exclude: ['password', 'confirm_password', 'terms_accepted'] });

  const onSubmit = async (data) => {
    setLoading(true);
    const { confirm_password, terms_accepted, ...formData } = data;
    const { success } = await signUp(formData, userType);
    if(success) {
      clearFormPersistence(formStorageKey);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {userType === 'expert' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input id="first_name" {...register('first_name')} autoComplete="given-name" />
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input id="last_name" {...register('last_name')} autoComplete="family-name" />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                </div>
              </div>
            </>
          )}
          {userType === 'company' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input id="name" {...register('name')} autoComplete="organization" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="representative_first_name">Votre prénom</Label>
                  <Input id="representative_first_name" {...register('representative_first_name')} autoComplete="given-name" />
                  {errors.representative_first_name && <p className="text-red-500 text-sm mt-1">{errors.representative_first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representative_last_name">Votre nom</Label>
                  <Input id="representative_last_name" {...register('representative_last_name')} autoComplete="family-name" />
                  {errors.representative_last_name && <p className="text-red-500 text-sm mt-1">{errors.representative_last_name.message}</p>}
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} autoComplete="email" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput id="password" {...register('password')} autoComplete="new-password" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <PasswordInput id="confirm_password" {...register('confirm_password')} autoComplete="new-password" />
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
          </div>
          <div className="flex items-start space-x-3">
            <Controller
              name="terms_accepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              )}
            />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
              J'accepte les{" "}
              <Link to="/legal-mentions" className="underline hover:text-primary">
                Mentions Légales
              </Link>{" "}
              et la{" "}
              <Link to="/privacy-policy" className="underline hover:text-primary">
                Politique de Confidentialité
              </Link>
              .
            </Label>
          </div>
           {errors.terms_accepted && <p className="text-red-500 text-sm">{errors.terms_accepted.message}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || !isValid}>
            {loading ? <Spinner size="sm" /> : "Créer mon compte"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UnifiedSignupForm;