import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/common/Spinner';
import { PasswordInput } from '@/components/ui/password-input';

const editUserSchema = z.object({
  password: z.string().min(8, { message: "Le mot de passe doit faire au moins 8 caractères." }).optional().or(z.literal('')),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().regex(/^[0-9]*$/, "Ce champ ne doit contenir que des chiffres").optional(),
  name: z.string().optional(),
  representative_first_name: z.string().optional(),
  representative_last_name: z.string().optional(),
}).refine(data => {
    // This logic needs to be based on the user's role, passed in props
    return true; 
});


const UserEditForm = ({ user, onFinished, handleUserAction }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: user.company_name || '',
        representative_first_name: user.representative_first_name || '',
        representative_last_name: user.representative_last_name || '',
        phone_number: user.role === 'expert' ? user.expert_phone : user.company_phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (formData) => {
    let profileData = { role: user.role };
    let displayName;

    if (user.role === 'expert') {
      displayName = `${formData.first_name || ''} ${formData.last_name || ''}`.trim();
      profileData = {
        ...profileData,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        display_name: displayName,
      };
    } else {
      const repName = `${formData.representative_first_name || ''} ${formData.representative_last_name || ''}`.trim();
      displayName = repName ? `${repName} - ${formData.name || ''}` : (formData.name || '');
      
      profileData = {
        ...profileData,
        name: formData.name,
        representative_first_name: formData.representative_first_name,
        representative_last_name: formData.representative_last_name,
        phone_number: formData.phone_number,
        display_name: displayName.trim(),
      };
    }
    
    const result = await handleUserAction('update', {
      userId: user.id,
      password: formData.password || null,
      profileData,
    });
    
    if (result.success) {
      onFinished();
    }
  };

  if (!user) return <Spinner />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
            <Label>Email (non modifiable)</Label>
            <Input value={user.email} disabled />
        </div>
        <div>
            <Label>Rôle (non modifiable)</Label>
            <Input value={user.role} disabled />
        </div>

        {user.role === 'expert' && (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input id="first_name" {...register("first_name")} />
                        {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="last_name">Nom</Label>
                        <Input id="last_name" {...register("last_name")} />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="phone_number">Téléphone</Label>
                    <Input id="phone_number" {...register("phone_number")} />
                    {errors.phone_number && <p className="text-sm text-destructive mt-1">{errors.phone_number.message}</p>}
                </div>
            </>
        )}

        {user.role === 'company' && (
            <>
                <div>
                    <Label htmlFor="name">Nom de l'entreprise</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="representative_first_name">Prénom du représentant</Label>
                        <Input id="representative_first_name" {...register("representative_first_name")} />
                    </div>
                    <div>
                        <Label htmlFor="representative_last_name">Nom du représentant</Label>
                        <Input id="representative_last_name" {...register("representative_last_name")} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="phone_number">Téléphone</Label>
                    <Input id="phone_number" {...register("phone_number")} />
                    {errors.phone_number && <p className="text-sm text-destructive mt-1">{errors.phone_number.message}</p>}
                </div>
            </>
        )}
        
        <div>
            <Label htmlFor="password">Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onFinished} disabled={isSubmitting}>Annuler</Button>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
};

export default UserEditForm;