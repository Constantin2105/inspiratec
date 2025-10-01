import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Spinner from '@/components/common/Spinner';
import { Save, KeyRound, Building, User, Phone, Globe, UserCheck, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PasswordInput } from '@/components/ui/password-input';
import AvatarViewer from '@/components/common/AvatarViewer';
import { motion } from 'framer-motion';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';

const profileSchema = z.object({
    name: z.string().min(2, "Le nom de l'entreprise est requis."),
    representative_first_name: z.string().min(2, "Le prénom du représentant est requis."),
    representative_last_name: z.string().min(2, "Le nom du représentant est requis."),
    representative_position: z.string().optional(),
    phone_number: z.string().regex(/^[0-9]*$/, "Ce champ ne doit contenir que des chiffres").optional(),
    website: z.string().url("Veuillez entrer une URL valide.").or(z.literal("")).optional(),
    siren: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().regex(/^[0-9]*$/, "Ce champ ne doit contenir que des chiffres").optional(),
    country: z.string().optional(),
    description: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
})
.refine(data => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
})
.refine(data => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'actuel.",
    path: ["newPassword"],
});


const CompanyProfileSettings = () => {
    const { user, profile, refreshProfile } = useAuth();
    const { toast } = useToast();

    const formStorageKey = useMemo(() => `form-company-profile-${user?.id}`, [user]);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '', representative_first_name: '', representative_last_name: '', representative_position: '',
            phone_number: '', website: '', siren: '', address: '', city: '', postal_code: '',
            country: '', description: ''
        }
    });

    useFormPersistence(profileForm, formStorageKey);

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    useEffect(() => {
        if (profile && !profileForm.formState.isDirty) {
            profileForm.reset({
                name: profile.company_name || '',
                representative_first_name: profile.representative_first_name || '',
                representative_last_name: profile.representative_last_name || '',
                representative_position: profile.representative_position || '',
                phone_number: profile.company_phone || '',
                website: profile.website || '',
                siren: profile.siren || '',
                address: profile.address || '',
                city: profile.city || '',
                postal_code: profile.postal_code || '',
                country: profile.country || 'France',
                description: profile.company_description || '',
            });
        }
    }, [profile, profileForm.reset, profileForm.formState.isDirty]);

    const onProfileSubmit = async (data) => {
        const { error: companyError } = await supabase.from('companies').update({ 
            name: data.name,
            representative_first_name: data.representative_first_name,
            representative_last_name: data.representative_last_name,
            representative_position: data.representative_position,
            phone_number: data.phone_number,
            website: data.website,
            siren: data.siren,
            address: data.address,
            city: data.city,
            postal_code: data.postal_code,
            country: data.country,
            description: data.description,
            updated_at: new Date().toISOString() 
        }).eq('user_id', user.id);

        if (companyError) {
            toast({ variant: "destructive", title: "Erreur", description: `La mise à jour du profil a échoué: ${companyError.message}` });
            return;
        }
        const { error: userError } = await supabase.from('users').update({ display_name: data.name, updated_at: new Date().toISOString() }).eq('id', user.id);
        if (userError) {
            toast({ variant: "destructive", title: "Erreur", description: `La mise à jour du nom a échoué: ${userError.message}` });
        } else {
            toast({ title: "Succès", description: "Votre profil a été mis à jour." });
            clearFormPersistence(formStorageKey);
            await refreshProfile();
        }
    };

    const onPasswordSubmit = async (data) => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword,
        });

        if (signInError) {
            toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe actuel est incorrect." });
            return;
        }
        
        const { error } = await supabase.auth.updateUser({ password: data.newPassword });
        if (error) {
            toast({ variant: "destructive", title: "Erreur de mise à jour", description: "Une erreur est survenue. Veuillez réessayer." });
        } else {
            toast({ title: "Succès", description: "Votre mot de passe a été modifié." });
            passwordForm.reset();
        }
    };

    if (!profile) return <Spinner />;

    const getInitials = (name) => {
        if (!name) return 'E';
        const nameParts = name.split(' ');
        if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
            return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = profile.display_name || profile.company_name || '';

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil de l'entreprise</CardTitle>
                            <CardDescription>Gérez les informations publiques de votre entreprise.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                               <AvatarViewer
                                    src={profile.avatar_url}
                                    alt={displayName}
                                    fallback={getInitials(displayName)}
                                    triggerClassName="h-20 w-20"
                                />
                                <p className="text-sm text-muted-foreground">Le logo de l'entreprise est géré par l'administrateur.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <Label htmlFor="name"><Building className="inline-block mr-2 h-4 w-4" />Nom de l'entreprise</Label>
                                    <Controller name="name" control={profileForm.control} render={({ field }) => <Input id="name" {...field} />} />
                                    {profileForm.formState.errors.name && <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>}
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="siren">SIREN</Label>
                                    <Controller name="siren" control={profileForm.control} render={({ field }) => <Input id="siren" {...field} />} />
                                    {profileForm.formState.errors.siren && <p className="text-sm text-destructive">{profileForm.formState.errors.siren.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="website"><Globe className="inline-block mr-2 h-4 w-4" />Site Web</Label>
                                    <Controller name="website" control={profileForm.control} render={({ field }) => <Input id="website" type="url" {...field} />} />
                                    {profileForm.formState.errors.website && <p className="text-sm text-destructive">{profileForm.formState.errors.website.message}</p>}
                                </div>
                                 <div className="md:col-span-2 space-y-1">
                                    <Label htmlFor="description">Description</Label>
                                    <Controller name="description" control={profileForm.control} render={({ field }) => <Textarea id="description" {...field} rows={4} />} />
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium">Décideur</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="representative_first_name"><User className="inline-block mr-2 h-4 w-4" />Prénom</Label>
                                        <Controller name="representative_first_name" control={profileForm.control} render={({ field }) => <Input id="representative_first_name" {...field} />} />
                                        {profileForm.formState.errors.representative_first_name && <p className="text-sm text-destructive">{profileForm.formState.errors.representative_first_name.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="representative_last_name">Nom</Label>
                                        <Controller name="representative_last_name" control={profileForm.control} render={({ field }) => <Input id="representative_last_name" {...field} />} />
                                        {profileForm.formState.errors.representative_last_name && <p className="text-sm text-destructive">{profileForm.formState.errors.representative_last_name.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="representative_position"><UserCheck className="inline-block mr-2 h-4 w-4" />Poste</Label>
                                        <Controller name="representative_position" control={profileForm.control} render={({ field }) => <Input id="representative_position" {...field} />} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone_number"><Phone className="inline-block mr-2 h-4 w-4" />Téléphone</Label>
                                        <Controller name="phone_number" control={profileForm.control} render={({ field }) => <Input id="phone_number" type="tel" {...field} />} />
                                        {profileForm.formState.errors.phone_number && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.phone_number.message}</p>}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Adresse</h3>
                                <div className="space-y-1">
                                    <Label htmlFor="address"><MapPin className="inline-block mr-2 h-4 w-4" />Adresse</Label>
                                    <Controller name="address" control={profileForm.control} render={({ field }) => <Input id="address" {...field} />} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="city">Ville</Label>
                                        <Controller name="city" control={profileForm.control} render={({ field }) => <Input id="city" {...field} />} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="postal_code">Code Postal</Label>
                                        <Controller name="postal_code" control={profileForm.control} render={({ field }) => <Input id="postal_code" {...field} />} />
                                        {profileForm.formState.errors.postal_code && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.postal_code.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="country">Pays</Label>
                                        <Controller name="country" control={profileForm.control} render={({ field }) => <Input id="country" {...field} />} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={profileForm.formState.isSubmitting}>{profileForm.formState.isSubmitting ? <Spinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}Enregistrer les modifications</Button>
                        </CardFooter>
                    </Card>
                </form>
            </motion.div>
            
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sécurité</CardTitle>
                                <CardDescription>Modifiez votre mot de passe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={user.email} disabled />
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                   <Label htmlFor="currentPassword"><KeyRound className="inline-block mr-2 h-4 w-4" />Mot de passe actuel</Label>
                                   <Controller name="currentPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="currentPassword" {...field} />} />
                                   {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                                </div>
                                <div className="space-y-2">
                                   <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                   <Controller name="newPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="newPassword" {...field} />} />
                                   {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                                </div>
                                <div className="space-y-2">
                                   <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                   <Controller name="confirmPassword" control={passwordForm.control} render={({ field }) => <PasswordInput id="confirmPassword" {...field} />} />
                                   {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? <Spinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}Changer le mot de passe</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Apparence</CardTitle>
                            <CardDescription>Personnalisez l'apparence de l'interface.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <p className="text-sm font-medium">Thème (Clair/Sombre)</p>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default CompanyProfileSettings;