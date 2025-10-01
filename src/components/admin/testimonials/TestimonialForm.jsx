import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/common/Spinner';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';

const testimonialSchema = z.object({
  content: z.string().min(20, { message: 'Le témoignage doit contenir au moins 20 caractères.' }),
  rating: z.coerce.number().int().min(1).max(5),
  author_user_id: z.string().uuid().optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']),
  is_featured: z.boolean(),
  is_homepage_featured: z.boolean(),
  author_name: z.string().optional(),
  author_title: z.string().optional(),
  external_author_type: z.enum(['expert', 'company']).optional(),
});

const TestimonialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!id;

  const formStorageKey = useMemo(() => `form-admin-testimonial-${id || 'new'}`, [id]);

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isExternalAuthor, setIsExternalAuthor] = useState(false);

  const form = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      content: '',
      rating: 5,
      author_user_id: null,
      status: 'approved',
      is_featured: false,
      is_homepage_featured: false,
      author_name: '',
      author_title: '',
      external_author_type: 'expert',
    },
  });
  
  const { control, handleSubmit, register, reset, watch, formState: { errors, isSubmitting } } = form;

  useFormPersistence(form, formStorageKey);

  const watchedAuthorId = watch('author_user_id');
  const watchedExternalType = watch('external_author_type');
  const selectedUser = users.find(u => u.id === watchedAuthorId);

  const isCompany = isExternalAuthor ? watchedExternalType === 'company' : selectedUser?.role === 'company';

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, display_name, role').order('display_name');
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger les utilisateurs.", variant: 'destructive' });
      } else {
        setUsers(data);
      }
    };
    fetchUsers();
  }, [toast]);

  useEffect(() => {
    if (isEditing) {
      const fetchTestimonial = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();
        if (error) {
          toast({ title: 'Erreur', description: 'Témoignage non trouvé.', variant: 'destructive' });
          navigate('/admin/content', { state: { tab: 'testimonials' } });
        } else {
          const savedData = sessionStorage.getItem(formStorageKey);
          if (!savedData) {
            reset({
              content: data.content,
              rating: data.rating,
              author_user_id: data.author_user_id,
              status: data.status,
              is_featured: data.is_featured,
              is_homepage_featured: data.is_homepage_featured || false,
              author_name: data.author_name || '',
              author_title: data.author_title || '',
              external_author_type: data.author_type === 'expert' || data.author_type === 'company' ? data.author_type : 'expert',
            });
            if (!data.author_user_id) {
              setIsExternalAuthor(true);
            }
          }
        }
        setLoading(false);
      };
      fetchTestimonial();
    }
  }, [id, isEditing, navigate, reset, toast, formStorageKey]);
  
  const onSubmit = async (values) => {
    try {
      const { data: adminData } = await supabase.from('admins').select('id').eq('user_id', user.id).single();
      if (!adminData) throw new Error('Profil admin non trouvé.');

      let authorType;
      if (isExternalAuthor) {
          authorType = values.external_author_type;
      } else {
          authorType = selectedUser?.role || 'admin';
      }

      let payload = {
        content: values.content,
        rating: values.rating,
        status: values.status,
        author_type: authorType,
        is_featured: authorType === 'company' ? values.is_featured : false,
        is_homepage_featured: values.is_homepage_featured,
        updated_at: new Date().toISOString(),
      };

      if (isExternalAuthor) {
        const avatarUrl = values.external_author_type === 'expert' 
            ? 'https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/f46e4862e784dd3b316354eb938645a8.jpg'
            : 'https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/48e2ca79dc3d8b990ed2ad14c818b96b.jpg';
        
        payload = {
          ...payload,
          author_user_id: null,
          author_name: values.author_name,
          author_title: values.author_title,
          author_avatar_url: avatarUrl,
        };
      } else {
        payload = {
          ...payload,
          author_user_id: values.author_user_id,
          author_name: null,
          author_title: null,
          author_avatar_url: null,
        };
      }

      let error;
      if (isEditing) {
        ({ error } = await supabase.from('testimonials').update(payload).eq('id', id));
      } else {
        ({ error } = await supabase.from('testimonials').insert({ ...payload, created_at: new Date().toISOString() }));
      }

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: 'Succès !',
        description: `Témoignage ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
      });
      clearFormPersistence(formStorageKey);
      navigate('/admin/content', { state: { tab: 'testimonials' } });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    clearFormPersistence(formStorageKey);
    navigate('/admin/content', { state: { tab: 'testimonials' } });
  }
  
  if (loading) return <Spinner size="lg" />;

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Modifier' : 'Ajouter'} un Témoignage - Admin</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste des témoignages
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Modifier le témoignage' : 'Ajouter un nouveau témoignage'}</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center space-x-2">
                <Switch id="external-author" checked={isExternalAuthor} onCheckedChange={setIsExternalAuthor} />
                <Label htmlFor="external-author">Auteur externe (non-utilisateur)</Label>
              </div>

              {isExternalAuthor ? (
                <div className="space-y-6 p-4 border rounded-lg">
                  <div>
                    <Label>Type d'auteur externe</Label>
                    <Controller
                      name="external_author_type"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="author_name">Nom de l'auteur externe</Label>
                      <Input id="author_name" {...register("author_name")} placeholder="Ex: Jean Dupont" />
                    </div>
                    <div>
                      <Label htmlFor="author_title">Titre de l'auteur externe</Label>
                      <Input id="author_title" {...register("author_title")} placeholder="Ex: CEO de TechCorp" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="author_user_id">Auteur (Utilisateur de la plateforme)</Label>
                  <Controller name="author_user_id" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un utilisateur..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Anonyme (Admin)</SelectItem>
                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.display_name} ({u.role})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                   {errors.author_user_id && <p className="text-sm text-destructive mt-1">{errors.author_user_id.message}</p>}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <Label htmlFor="status">Statut</Label>
                  <Controller name="status" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="approved">Approuvé</SelectItem>
                              <SelectItem value="rejected">Rejeté</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="rating">Note</Label>
                  <Controller name="rating" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={String(field.value)}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} étoiles</SelectItem>)}</SelectContent>
                      </Select>
                  )} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <TooltipProvider>
                    <div className="flex items-center space-x-2 pt-2">
                        <Controller
                            name="is_featured"
                            control={control}
                            render={({ field }) => (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_featured"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={!isCompany}
                                            />
                                            <Label htmlFor="is_featured" className={!isCompany ? 'text-muted-foreground' : ''}>
                                                Témoignage principal
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    {!isCompany && <TooltipContent><p>Uniquement pour les témoignages d'entreprises.</p></TooltipContent>}
                                </Tooltip>
                            )}
                        />
                         <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller
                      name="is_homepage_featured"
                      control={control}
                      render={({ field }) => (
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_homepage_featured"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="is_homepage_featured">
                                        Afficher sur l'accueil
                                    </Label>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent><p>Mettre ce témoignage en avant sur la page d'accueil.</p></TooltipContent>
                        </Tooltip>
                      )}
                    />
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipProvider>
              </div>
              
              <div>
                <Label htmlFor="content">Contenu du témoignage</Label>
                <Textarea id="content" {...register("content")} rows={8} />
                {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner size="sm" className="mr-2" />}
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Enregistrer les modifications' : 'Créer le témoignage'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TestimonialForm;