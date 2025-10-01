import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: "L'adresse email est invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const UnifiedLoginForm = ({ title, description, resetPasswordLink, expectedRole }) => {
  const { signIn, authLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    await signIn(data.email, data.password, expectedRole);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" {...register('email')} autoComplete="email" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput id="password" {...register('password')} autoComplete="current-password" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch pt-2">
          {resetPasswordLink && (
            <div className="mb-4 text-right text-sm">
              <Link to={resetPasswordLink} className="underline text-muted-foreground hover:text-primary">
                Mot de passe oublié ?
              </Link>
            </div>
          )}
          <Button type="submit" disabled={authLoading} className="w-full">
            {authLoading ? <Spinner size="sm" /> : 'Se connecter'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UnifiedLoginForm;