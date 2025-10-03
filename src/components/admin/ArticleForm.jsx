import React, { useEffect, useState, lazy, Suspense, useMemo, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase/client';
import Spinner from '@/components/common/Spinner';
import { UploadCloud, X, Save } from 'lucide-react';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
import { stripHtml } from '@/lib/utils/editor.js';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const TiptapEditor = lazy(() => import('@/components/editor/TiptapEditor'));

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const fileSchema = z.any()
  .optional()
  .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Taille max : 5MB.`)
  .refine(
    (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    "Formats acceptés: .jpg, .jpeg, .png, .webp"
  );

const articleSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  content: z.string().refine(html => {
    const text = stripHtml(html).trim();
    return text.length >= 10;
  }, { message: "Le contenu doit contenir au moins 10 caractères." }),
  summary: z.string().max(300, "Le résumé ne doit pas dépasser 300 caractères.").optional(),
  author_name: z.string().min(1, "Le nom de l'auteur est requis."),
  cover_image: fileSchema,
  video_url: z.string().url("L'URL de la vidéo doit être valide.").optional().or(z.literal('')),
  tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(Boolean)).optional(),
  status: z.enum(['draft', 'published']),
});

const CoverImageUploader = ({ control, watch, setValue, errors, currentImageUrl }) => {
  const [preview, setPreview] = useState(currentImageUrl);
  const coverImageFile = watch('cover_image');

  useEffect(() => {
    if (coverImageFile && coverImageFile.length > 0) {
      const file = coverImageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (currentImageUrl) {
      setPreview(currentImageUrl);
    } else {
      setPreview(null);
    }
  }, [coverImageFile, currentImageUrl]);

  const handleRemoveImage = () => {
    setValue('cover_image', null, { shouldValidate: true });
    setPreview(null);
  };
  
  return (
    <div>
      <Label>Image de couverture</Label>
      <div className="mt-2">
        <div className="w-full aspect-video max-w-sm border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground relative overflow-hidden">
          {preview ? (
            <>
              <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <label htmlFor="cover_image_input" className="cursor-pointer flex flex-col items-center justify-center text-center p-4">
              <UploadCloud className="h-8 w-8 mb-2" />
              <span>Cliquer pour choisir ou glisser-déposer</span>
              <span className="text-xs">PNG, JPG, WEBP (max 5MB)</span>
            </label>
          )}
          <Controller
            name="cover_image"
            control={control}
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <Input id="cover_image_input" type="file" className="sr-only" accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={(e) => onChange(e.target.files)} onBlur={onBlur} name={name} ref={ref} />
            )}
          />
        </div>
        {errors.cover_image && <p className="text-sm text-destructive mt-1">{errors.cover_image.message}</p>}
      </div>
    </div>
  );
};

const ArticleForm = ({ articleSlug, onFinished }) => {
  const { handleArticleAction, loadingAction, profile: adminProfile } = useAdmin();
  const { toast } = useToast();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(!!articleSlug);
  const [autoDraftId, setAutoDraftId] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
  
  const formPersistenceKey = useMemo(() => `form-blog-article-${articleSlug || 'new'}`, [articleSlug]);

  const form = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '', content: '', summary: '', author_name: '', cover_image: undefined,
      video_url: '', tags: '', status: 'draft',
    },
  });

  const { register, handleSubmit, formState: { errors, isDirty }, control, reset, watch, setValue } = form;

  useFormPersistence(form, formPersistenceKey);

  // Fonction pour sauvegarder automatiquement le brouillon
  const saveAutoDraft = useCallback(async (silent = false) => {
    const values = form.getValues();
    
    // Vérifier si on a au moins un titre ou du contenu
    const hasContent = values.title?.trim() || (values.content && stripHtml(values.content).trim().length > 0);
    if (!hasContent || !isDirty) return;

    // Vérifier qu'on a un adminProfile
    if (!adminProfile?.id) {
      console.error('adminProfile manquant');
      return;
    }

    setIsSavingDraft(true);
    try {
      // Récupérer l'ID admin depuis la table admins
      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', adminProfile.id)
        .single();

      if (adminError || !adminRecord) {
        console.error('Profil administrateur introuvable:', adminError);
        if (!silent) {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Profil administrateur introuvable.',
          });
        }
        return;
      }

      const draftData = {
        title: values.title || 'Brouillon sans titre',
        content: values.content || '',
        summary: values.summary || '',
        author_name: values.author_name || '',
        video_url: values.video_url || '',
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'draft',
        admin_id: adminRecord.id,
      };

      let result;
      if (autoDraftId || article?.id) {
        // Mise à jour du brouillon existant
        const idToUpdate = autoDraftId || article.id;
        result = await supabase
          .from('blogs')
          .update(draftData)
          .eq('id', idToUpdate)
          .select()
          .single();
      } else {
        // Création d'un nouveau brouillon
        result = await supabase
          .from('blogs')
          .insert(draftData)
          .select()
          .single();
        
        if (result.data) {
          setAutoDraftId(result.data.id);
        }
      }

      if (result.error) throw result.error;

      if (!silent) {
        toast({
          title: 'Brouillon sauvegardé',
          description: 'Votre travail a été sauvegardé automatiquement.',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de sauvegarder le brouillon.',
        });
      }
    } finally {
      setIsSavingDraft(false);
    }
  }, [form, isDirty, autoDraftId, article?.id, adminProfile?.id, toast]);

  useEffect(() => {
    if (articleSlug) {
      const fetchArticle = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blogs_with_details').select('*').eq('slug', articleSlug).single();
        if (data) {
          setArticle(data);
          setAutoDraftId(data.id); // Définir l'ID pour la sauvegarde auto
          
          const savedData = sessionStorage.getItem(formPersistenceKey);
          if (!savedData) {
            reset({
              title: data.title, content: data.content, summary: data.summary || '', author_name: data.author_name || '',
              video_url: data.video_url || '', tags: data.tags?.join(', ') || '', status: data.status,
            });
          }
        }
        setLoading(false);
      };
      fetchArticle();
    } else {
      // Pour une nouvelle création, charger le dernier brouillon auto-sauvegardé s'il existe
      const loadLastAutoDraft = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('status', 'draft')
            .is('slug', null) // Seulement les brouillons non publiés
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (data && !error) {
            const now = new Date();
            const draftUpdated = new Date(data.updated_at);
            const hoursDiff = (now - draftUpdated) / (1000 * 60 * 60);
            
            // Charger seulement si le brouillon a moins de 24h et pas de données en session
            if (hoursDiff < 24 && !sessionStorage.getItem(formPersistenceKey)) {
              setAutoDraftId(data.id);
              setArticle(data);
              reset({
                title: data.title || '',
                content: data.content || '',
                summary: data.summary || '',
                author_name: data.author_name || '',
                video_url: data.video_url || '',
                tags: data.tags?.join(', ') || '',
                status: data.status,
              });
              toast({
                title: 'Brouillon récupéré',
                description: 'Votre dernier brouillon a été chargé. Vous pouvez continuer votre travail.',
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du brouillon:', error);
        }
        setLoading(false);
      };
      loadLastAutoDraft();
    }
  }, [articleSlug, reset, formPersistenceKey, toast]);

  // Auto-sauvegarde périodique (toutes les 30 secondes après un changement)
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveAutoDraft(true); // silent = true pour ne pas afficher de toast
      }, 30000); // 30 secondes
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, saveAutoDraft]);

  // Sauvegarde lors de la fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        saveAutoDraft(true);
        // Certains navigateurs affichent une alerte de confirmation
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirty) {
        saveAutoDraft(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDirty, saveAutoDraft]);
  
  const onSubmit = async (formData) => {
    try {
      const action = (article?.id || autoDraftId) ? 'update' : 'create';
      const currentId = article?.id || autoDraftId;
      
      // Gérer l'upload de l'image de couverture
      let imageUrl = article?.image_url;
      if (formData.cover_image && formData.cover_image.length > 0) {
        const file = formData.cover_image[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: `Erreur lors de l'upload de l'image: ${uploadError.message}`,
          });
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Générer le slug si on publie l'article et qu'il n'a pas déjà un slug
      let slug = article?.slug;
      if (formData.status === 'published' && !slug) {
        slug = slugify(formData.title);
        
        // Vérifier si le slug existe déjà
        const { data: existing } = await supabase
          .from('blogs')
          .select('slug')
          .eq('slug', slug)
          .maybeSingle();
        
        if (existing) {
          // Ajouter un suffixe unique si le slug existe déjà
          slug = `${slug}-${uuidv4().slice(0, 6)}`;
        }
      }

      // Définir published_at lors de la première publication
      let publishedAt = article?.published_at;
      const isPublishingFirstTime = formData.status === 'published' && 
        (!publishedAt || new Date(publishedAt).getUTCFullYear() === 1970);
      
      if (isPublishingFirstTime) {
        publishedAt = new Date().toISOString();
      }

      // Préparer le payload sans le fichier cover_image
      const { cover_image, ...dataWithoutFile } = formData;
      const payload = { 
        ...dataWithoutFile,
        image_url: imageUrl,
        ...(slug && { slug }),
        ...(publishedAt && { published_at: publishedAt }),
        ...(currentId && { id: currentId })
      };

      const result = await handleArticleAction(action, currentId, payload);
      if (result.success) {
          clearFormPersistence(formPersistenceKey);
          setAutoDraftId(null);
          onFinished();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission du formulaire.',
      });
    }
  };
  
  const handleCancel = async () => {
    // Sauvegarder le brouillon avant de quitter si modifications non sauvegardées
    if (isDirty) {
      await saveAutoDraft(true);
    }
    clearFormPersistence(formPersistenceKey);
    onFinished();
  };

  const handleManualSave = async () => {
    await saveAutoDraft(false); // Afficher le toast de confirmation
  };

  if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="title">Titre *</Label><Input id="title" {...register("title")} />{errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}</div>
                <div><Label htmlFor="author_name">Nom de l'auteur *</Label><Input id="author_name" {...register("author_name")} />{errors.author_name && <p className="text-sm text-destructive mt-1">{errors.author_name.message}</p>}</div>
            </div>
            <div>
              <Label htmlFor="content">Contenu *</Label>
              <Suspense fallback={<div className="w-full h-[400px] bg-muted rounded-md animate-pulse" />}>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={loadingAction}
                      placeholder="Commencez à rédiger votre article ici..."
                      articleSlug={articleSlug}
                    />
                  )}
                />
              </Suspense>
              <p className="text-xs text-muted-foreground mt-1">Glissez-déposez vos images directement dans l'éditeur pour les insérer.</p>
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div><Label htmlFor="summary">Résumé</Label><Input id="summary" {...register("summary")} />{errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>}</div>
        </div>

        <div className="space-y-6">
            <CoverImageUploader control={control} watch={watch} setValue={setValue} errors={errors} currentImageUrl={article?.image_url}/>
            <div><Label htmlFor="status">Statut</Label><Controller name="status" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Sélectionnez un statut" /></SelectTrigger><SelectContent><SelectItem value="draft">Brouillon</SelectItem><SelectItem value="published">Publié</SelectItem></SelectContent></Select>)} /></div>
            <div><Label htmlFor="video_url">URL de la vidéo (optionnel)</Label><Input id="video_url" {...register("video_url")} />{errors.video_url && <p className="text-sm text-destructive mt-1">{errors.video_url.message}</p>}</div>
            <div><Label htmlFor="tags">Tags (séparés par des virgules)</Label><Input id="tags" {...register("tags")} /></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSavingDraft && (
            <>
              <Spinner size="sm" />
              <span>Sauvegarde en cours...</span>
            </>
          )}
          {autoDraftId && !isSavingDraft && (
            <span className="text-green-600">✓ Brouillon sauvegardé</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loadingAction}>
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleManualSave} 
            disabled={loadingAction || isSavingDraft || !isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder brouillon
          </Button>
          <Button type="submit" disabled={loadingAction || isSavingDraft}>
            {loadingAction && <Spinner size="sm" className="mr-2" />}
            {article ? 'Mettre à jour l\'article' : 'Créer l\'article'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ArticleForm;