import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/common/Spinner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Megaphone, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const announcementSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Le titre est requis."),
  content: z.string().min(1, "Le contenu est requis."),
  link_url: z.string().url("URL invalide.").optional().or(z.literal('')),
  link_text: z.string().optional(),
  is_active: z.boolean().default(false),
  icon: z.string().optional(),
  theme: z.string().optional(),
});

const icons = {
  Megaphone: <Megaphone className="mr-2 h-4 w-4" />,
  Info: <Info className="mr-2 h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="mr-2 h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="mr-2 h-4 w-4" />,
};

const themes = [
  { value: 'default', label: 'Défaut (Primaire)' },
  { value: 'success', label: 'Succès (Vert)' },
  { value: 'warning', label: 'Avertissement (Jaune)' },
  { value: 'destructive', label: 'Erreur (Rouge)' },
];

const AdminAnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const isEditing = !!id;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, control } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      link_url: '',
      link_text: '',
      is_active: false,
      icon: 'Megaphone',
      theme: 'default',
    }
  });

  useEffect(() => {
    if (isEditing) {
      const fetchAnnouncement = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single();
        if (error) {
          toast({ title: 'Erreur', description: "Impossible de charger l'annonce.", variant: 'destructive' });
          navigate('/admin/content');
        } else {
          reset({
            ...data,
            link_url: data.link_url || '',
            link_text: data.link_text || '',
            icon: data.icon || 'Megaphone',
            theme: data.theme || 'default',
          });
        }
        setLoading(false);
      };
      fetchAnnouncement();
    }
  }, [id, isEditing, reset, toast, navigate]);

  const onSubmit = async (formData) => {
    const { id: formId, ...dataToUpsert } = formData;
    
    const payload = {
        ...dataToUpsert,
        link_url: dataToUpsert.link_url || null,
        link_text: dataToUpsert.link_text || null,
        icon: dataToUpsert.icon || null,
        theme: dataToUpsert.theme || null,
    };

    const query = isEditing ? supabase.from('announcements').update(payload).eq('id', formId) : supabase.from('announcements').insert(payload);
    
    const { error } = await query;
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: `Annonce ${isEditing ? 'mise à jour' : 'créée'}.` });
      navigate('/admin/content', { state: { tab: 'announcements' } });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <>
      <Helmet><title>{isEditing ? 'Modifier' : 'Créer'} une Annonce - Admin</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/admin/content', { state: { tab: 'announcements' } })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
            </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Modifier' : 'Créer'} une annonce</CardTitle>
              <CardDescription>Remplissez les détails de l'annonce ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" {...register('id')} />
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="content">Contenu</Label>
                <Input id="content" {...register('content')} />
                {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
              </div>
              <div>
                <Label htmlFor="link_url">URL du lien (optionnel)</Label>
                <Input id="link_url" {...register('link_url')} />
                {errors.link_url && <p className="text-sm text-destructive mt-1">{errors.link_url.message}</p>}
              </div>
              <div>
                <Label htmlFor="link_text">Texte du lien (optionnel)</Label>
                <Input id="link_text" {...register('link_text')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icône</Label>
                   <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une icône" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(icons).map(([name, component]) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center">{component} {name}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="theme">Thème</Label>
                   <Controller
                    name="theme"
                    control={control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un thème" />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map(theme => (
                            <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                 <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                <Label htmlFor="is_active">Rendre l'annonce active</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Sauvegarder'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};

export default AdminAnnouncementForm;