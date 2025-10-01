import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Spinner from '@/components/common/Spinner';
import AvatarViewer from '@/components/common/AvatarViewer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PasswordInput } from '@/components/ui/password-input';

const profileSchema = z.object({
  first_name: z.string().min(2, "Le prénom est requis."),
  last_name: z.string().min(2, "Le nom de famille est requis."),
  email: z.string().email("L'email est invalide."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const ExpertProfileSettings = () => {
    const { profile, loading, user, refreshProfile } = useAuth();
    const { toast } = useToast();
    
    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { first_name: '', last_name: '', email: '' }
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });

    React.useEffect(() => {
        if (profile) {
            profileForm.reset({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
            });
        }
    }, [profile, profileForm.reset]);

    const getInitials = () => {
        if (!profile) return 'EX';
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const onProfileSubmit = async (data) => {
        try {
            const displayName = `${data.first_name} ${data.last_name}`.trim();
            const { error: userError } = await supabase.from('users').update({ display_name: displayName, updated_at: new Date().toISOString() }).eq('id', user.id);
            if (userError) throw userError;

            const { error: expertError } = await supabase.from('experts').update({ 
                first_name: data.first_name,
                last_name: data.last_name,
                updated_at: new Date().toISOString() 
            }).eq('user_id', user.id);
            if (expertError) throw expertError;

            toast({ title: 'Succès', description: 'Profil mis à jour avec succès.' });
            await refreshProfile();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de mettre à jour le profil.' });
        }
    };
    
    const onPasswordSubmit = async (data) => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword,
        });

        if (signInError) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Le mot de passe actuel est incorrect." });
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });

        if (updateError) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le mot de passe.' });
        } else {
            toast({ title: 'Succès', description: 'Mot de passe mis à jour avec succès.' });
            passwordForm.reset();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Personnelles</CardTitle>
                            <CardDescription>Mettez à jour votre nom et votre email.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center gap-6">
                                <AvatarViewer src={profile?.avatar_url} alt={profile?.display_name} fallback={getInitials()} triggerClassName="h-20 w-20" />
                                <p className="text-sm text-muted-foreground">La photo de profil est gérée par l'administrateur.</p>
                            </div>
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="first_name">Prénom</Label>
                                    <Controller name="first_name" control={profileForm.control} render={({ field }) => <Input id="first_name" {...field} />} />
                                    {profileForm.formState.errors.first_name && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.first_name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Nom de famille</Label>
                                    <Controller name="last_name" control={profileForm.control} render={({ field }) => <Input id="last_name" {...field} />} />
                                    {profileForm.formState.errors.last_name && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.last_name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">Adresse Email</Label>
                                    <Controller name="email" control={profileForm.control} render={({ field }) => <Input id="email" type="email" {...field} disabled />} />
                                    {profileForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.email.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={profileForm.formState.isSubmitting}>{profileForm.formState.isSubmitting ? <Spinner size="sm" /> : 'Enregistrer'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </motion.div>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <Card>
                            <CardHeader><CardTitle>Changer de mot de passe</CardTitle><CardDescription>Choisissez un mot de passe fort.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                 <div>
                                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                    <Controller name="currentPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="currentPassword" {...field} />} />
                                    {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <Controller name="newPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="newPassword" {...field} />} />
                                    {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirmer</Label>
                                    <Controller name="confirmPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="confirmPassword" {...field} />} />
                                    {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? <Spinner size="sm" /> : 'Mettre à jour'}</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card><CardHeader><CardTitle>Apparence</CardTitle><CardDescription>Personnalisez l'apparence de l'interface.</CardDescription></CardHeader>
                        <CardContent><div className="flex items-center justify-between"><Label htmlFor="theme-toggle">Thème (Clair/Sombre)</Label><ThemeToggle id="theme-toggle" /></div></CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ExpertProfileSettings;