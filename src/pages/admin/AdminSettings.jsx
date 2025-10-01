import React from 'react';
import { Helmet } from 'react-helmet-async';
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
import { v4 as uuidv4 } from 'uuid';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSystemConfig from '@/components/admin/settings/AdminSystemConfig';
import { User, Settings } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

const profileSchema = z.object({
  display_name: z.string().min(2, "Le nom d'affichage est requis."),
  email: z.string().email("L'email est invalide."),
  avatar: z.any()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "L'ancien mot de passe est requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const AdminProfileSettings = () => {
    const { profile, loading, user, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = React.useState(false);

    const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfileForm } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { display_name: '', email: '', avatar: null }
    });

    React.useEffect(() => {
        if (profile) {
        resetProfileForm({
            display_name: profile.display_name || '',
            email: profile.email || '',
            avatar: null,
        });
        }
    }, [profile, resetProfileForm]);

    const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });

    const getInitials = () => {
        if (!profile || !profile.display_name) return 'A';
        const names = profile.display_name.split(' ');
        if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return names[0][0].toUpperCase();
    };

    const onProfileSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            let avatarUrl = profile.avatar_url;

            if (data.avatar && data.avatar[0]) {
                const file = data.avatar[0];
                const filePath = `admins/${user.id}/${uuidv4()}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('system-assets')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('system-assets').getPublicUrl(uploadData.path);
                avatarUrl = urlData.publicUrl;
            }

            const { error: userError } = await supabase.from('users').update({ 
                display_name: data.display_name,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString() 
            }).eq('id', user.id);
            if (userError) throw userError;

            toast({ title: 'Succès', description: 'Profil mis à jour avec succès.' });
            await refreshProfile();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de mettre à jour le profil.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const onPasswordSubmit = async (data) => {
        setIsPasswordSubmitting(true);
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword,
        });

        if (signInError) {
            toast({ variant: 'destructive', title: 'Erreur', description: "L'ancien mot de passe est incorrect." });
            setIsPasswordSubmitting(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
        if (updateError) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le mot de passe.' });
        } else {
            toast({ title: 'Succès', description: 'Mot de passe mis à jour avec succès.' });
            resetPasswordForm();
        }
        setIsPasswordSubmitting(false);
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Personnelles</CardTitle>
                            <CardDescription>Mettez à jour votre photo, votre nom et votre email.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center gap-6">
                                <AvatarViewer src={profile?.avatar_url} alt={profile?.display_name} fallback={getInitials()} triggerClassName="h-20 w-20" />
                                <div className="grid gap-2">
                                    <Label htmlFor="avatar">Changer la photo de profil</Label>
                                    <Controller name="avatar" control={profileControl} render={({ field: { onChange } }) => ( <Input id="avatar" type="file" className="max-w-xs" accept="image/*" onChange={(e) => onChange(e.target.files)} /> )}/>
                                    {profileErrors.avatar && <p className="text-sm text-destructive mt-1">{profileErrors.avatar.message}</p>}
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="display_name">Nom d'affichage</Label>
                                    <Controller name="display_name" control={profileControl} render={({ field }) => <Input id="display_name" {...field} />} />
                                    {profileErrors.display_name && <p className="text-sm text-destructive mt-1">{profileErrors.display_name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">Adresse Email</Label>
                                    <Controller name="email" control={profileControl} render={({ field }) => <Input id="email" type="email" {...field} disabled />} />
                                    {profileErrors.email && <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Spinner size="sm" /> : 'Enregistrer'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </motion.div>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                        <Card>
                            <CardHeader><CardTitle>Changer de mot de passe</CardTitle><CardDescription>Choisissez un mot de passe fort.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="currentPassword">Ancien mot de passe</Label>
                                    <Controller name="currentPassword" control={passwordControl} render={({ field }) => <PasswordInput id="currentPassword" {...field} />} />
                                    {passwordErrors.currentPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <Controller name="newPassword" control={passwordControl} render={({ field }) => <PasswordInput id="newPassword" {...field} />} />
                                    {passwordErrors.newPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                    <Controller name="confirmPassword" control={passwordControl} render={({ field }) => <PasswordInput id="confirmPassword" {...field} />} />
                                    {passwordErrors.confirmPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={isPasswordSubmitting}>{isPasswordSubmitting ? <Spinner size="sm" /> : 'Mettre à jour'}</Button>
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

const AdminSettings = () => {
  return (
    <>
      <Helmet><title>Paramètres - Admin</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et la configuration du système.</p>
        </motion.div>
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profil Admin</TabsTrigger>
                <TabsTrigger value="system"><Settings className="mr-2 h-4 w-4" />Configuration Système</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6"><AdminProfileSettings /></TabsContent>
            <TabsContent value="system" className="mt-6"><AdminSystemConfig /></TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminSettings;