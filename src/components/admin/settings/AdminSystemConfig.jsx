import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Spinner from '@/components/common/Spinner';
import { UploadCloud, Users, Building, Shield } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AdminSystemConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAvatars, setCurrentAvatars] = useState({
    expert: null,
    company: null,
    admin: null,
  });

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      expert_avatar: null,
      company_avatar: null,
      admin_avatar: null,
    },
  });

  const expertAvatarFile = watch('expert_avatar');
  const companyAvatarFile = watch('company_avatar');
  const adminAvatarFile = watch('admin_avatar');

  const [previewAvatars, setPreviewAvatars] = useState({
    expert: null,
    company: null,
    admin: null,
  });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('system_settings').select('key, value');
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les paramètres système.' });
    } else {
      const settings = data.reduce((acc, { key, value }) => {
        if (key === 'default_expert_avatar_url') acc.expert = value;
        if (key === 'default_company_avatar_url') acc.company = value;
        if (key === 'default_admin_avatar_url') acc.admin = value;
        return acc;
      }, {});
      setCurrentAvatars(settings);
      setPreviewAvatars(settings);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, [toast]);

  useEffect(() => {
    if (expertAvatarFile && expertAvatarFile[0]) {
      setPreviewAvatars(prev => ({ ...prev, expert: URL.createObjectURL(expertAvatarFile[0]) }));
    }
  }, [expertAvatarFile]);

  useEffect(() => {
    if (companyAvatarFile && companyAvatarFile[0]) {
      setPreviewAvatars(prev => ({ ...prev, company: URL.createObjectURL(companyAvatarFile[0]) }));
    }
  }, [companyAvatarFile]);

  useEffect(() => {
    if (adminAvatarFile && adminAvatarFile[0]) {
      setPreviewAvatars(prev => ({ ...prev, admin: URL.createObjectURL(adminAvatarFile[0]) }));
    }
  }, [adminAvatarFile]);

  const uploadAndSave = async (file, key) => {
    if (!file || !file[0]) return null;

    const filePath = `defaults/${key}-${uuidv4()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('system-assets')
      .upload(filePath, file[0], { upsert: true });

    if (uploadError) throw new Error(`Erreur d'upload pour ${key}: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('system-assets').getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('system_settings')
      .update({ value: publicUrl, updated_at: new Date().toISOString() })
      .eq('key', `${key}_avatar_url`);

    if (dbError) throw new Error(`Erreur de sauvegarde pour ${key}: ${dbError.message}`);
    
    return publicUrl;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const hasExpertUpload = data.expert_avatar && data.expert_avatar[0];
      const hasCompanyUpload = data.company_avatar && data.company_avatar[0];
      const hasAdminUpload = data.admin_avatar && data.admin_avatar[0];

      if (hasExpertUpload) await uploadAndSave(data.expert_avatar, 'default_expert');
      if (hasCompanyUpload) await uploadAndSave(data.company_avatar, 'default_company');
      if (hasAdminUpload) await uploadAndSave(data.admin_avatar, 'default_admin');

      if (hasExpertUpload || hasCompanyUpload || hasAdminUpload) {
        const { error: rpcError } = await supabase.rpc('apply_default_avatars');
        if (rpcError) {
          throw new Error(`Erreur lors de l'application des avatars aux utilisateurs existants: ${rpcError.message}`);
        }
        toast({ title: 'Succès', description: 'Les avatars par défaut ont été mis à jour et appliqués à tous les utilisateurs.' });
        await fetchSettings();
      } else {
        toast({ title: 'Aucune modification', description: 'Aucun nouvel avatar à téléverser.' });
      }
      
      reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center p-16"><Spinner /></CardContent></Card>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Avatars par Défaut</CardTitle>
          <CardDescription>Gérez les photos de profil par défaut pour chaque type d'utilisateur. Ces images seront appliquées à tous les comptes (nouveaux et existants) n'ayant pas de photo personnalisée.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6 p-4 border rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewAvatars.expert} />
              <AvatarFallback><Users className="h-10 w-10" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="expert_avatar" className="text-lg font-medium flex items-center gap-2"><Users className="h-5 w-5" />Expert</Label>
              <p className="text-sm text-muted-foreground mb-2">Avatar pour les experts.</p>
              <Controller name="expert_avatar" control={control} render={({ field }) => (
                <Input id="expert_avatar" type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              )} />
            </div>
          </div>
          <div className="flex items-center gap-6 p-4 border rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewAvatars.company} />
              <AvatarFallback><Building className="h-10 w-10" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="company_avatar" className="text-lg font-medium flex items-center gap-2"><Building className="h-5 w-5" />Entreprise</Label>
              <p className="text-sm text-muted-foreground mb-2">Avatar pour les entreprises.</p>
              <Controller name="company_avatar" control={control} render={({ field }) => (
                <Input id="company_avatar" type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              )} />
            </div>
          </div>
          <div className="flex items-center gap-6 p-4 border rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewAvatars.admin} />
              <AvatarFallback><Shield className="h-10 w-10" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="admin_avatar" className="text-lg font-medium flex items-center gap-2"><Shield className="h-5 w-5" />Administrateur</Label>
              <p className="text-sm text-muted-foreground mb-2">Avatar pour les administrateurs.</p>
              <Controller name="admin_avatar" control={control} render={({ field }) => (
                <Input id="admin_avatar" type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              )} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : <><UploadCloud className="mr-2 h-4 w-4" /> Enregistrer et Appliquer</>}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default AdminSystemConfig;