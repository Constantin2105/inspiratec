import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Spinner from '@/components/common/Spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';

const userSchema = z.object({
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z.string(),
  role: z.enum(['expert', 'company']),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  name: z.string().optional(),
  representative_first_name: z.string().optional(),
  representative_last_name: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.role === 'expert') return !!data.first_name && !!data.last_name;
    return true;
}, {
    message: "Le prénom et le nom sont requis pour un expert.",
    path: ["first_name"],
}).refine(data => {
    if (data.role === 'company') return !!data.name && !!data.representative_first_name && !!data.representative_last_name;
    return true;
}, {
    message: "Le nom de l'entreprise et du représentant sont requis.",
    path: ["name"],
});

const UserForm = ({ onFinished, handleUserAction }) => {
  const formStorageKey = 'form-admin-new-user';
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'expert' }
  });
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, watch } = form;
  
  useFormPersistence(form, formStorageKey, { exclude: ['password', 'confirmPassword']});
  
  const selectedRole = watch('role');

  const onSubmit = async (formData) => {
    let profileData = {};
    if (formData.role === 'expert') {
        profileData = {
          first_name: formData.first_name,
          last_name: formData.last_name
        };
    } else {
        profileData = {
          name: formData.name,
          representative_first_name: formData.representative_first_name,
          representative_last_name: formData.representative_last_name,
        };
    }

    const { confirmPassword, ...payload } = formData;

    const result = await handleUserAction('create', {
      email: payload.email,
      password: payload.password,
      role: payload.role,
      profileData,
    });

    if (result && result.success) {
      clearFormPersistence(formStorageKey);
      onFinished();
    }
  };
  
  const handleCancel = () => {
    clearFormPersistence(formStorageKey);
    onFinished();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="role">Type de compte</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="r-expert" />
                <Label htmlFor="r-expert">Expert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="r-company" />
                <Label htmlFor="r-company">Entreprise</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput id="password" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>
         <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>
      
      {selectedRole === 'expert' && (
        <>
          <div>
            <Label htmlFor="first_name">Prénom</Label>
            <Input id="first_name" {...register("first_name")} />
             {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="last_name">Nom</Label>
            <Input id="last_name" {...register("last_name")} />
          </div>
        </>
      )}

      {selectedRole === 'company' && (
        <>
          <div>
            <Label htmlFor="name">Nom de l'entreprise</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="representative_first_name">Prénom du représentant</Label>
            <Input id="representative_first_name" {...register("representative_first_name")} />
          </div>
           <div>
            <Label htmlFor="representative_last_name">Nom du représentant</Label>
            <Input id="representative_last_name" {...register("representative_last_name")} />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Annuler</Button>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            Créer l'utilisateur
        </Button>
      </div>
    </form>
  );
};

export default UserForm;