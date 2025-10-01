import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
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
import { UploadCloud, X } from 'lucide-react';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
import { stripHtml } from '@/lib/utils/editor.js';

const TiptapEditor = lazy(() => import('@/components/editor/TiptapEditor'));

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
  const { handleArticleAction, loadingAction } = useAdmin();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(!!articleSlug);
  
  const formPersistenceKey = useMemo(() => `form-blog-article-${articleSlug || 'new'}`, [articleSlug]);

  const form = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '', content: '', summary: '', author_name: '', cover_image: undefined,
      video_url: '', tags: '', status: 'draft',
    },
  });

  const { register, handleSubmit, formState: { errors }, control, reset, watch, setValue } = form;

  useFormPersistence(form, formPersistenceKey);

  useEffect(() => {
    if (articleSlug) {
      const fetchArticle = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blogs_with_details').select('*').eq('slug', articleSlug).single();
        if (data) {
          setArticle(data);
          
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
    }
  }, [articleSlug, reset, formPersistenceKey]);
  
  const onSubmit = async (formData) => {
    const action = article ? 'update' : 'create';
    const payload = { 
      ...formData, 
      ...(article && { id: article.id, image_url: article.image_url, published_at: article.published_at })
    };
    const result = await handleArticleAction(action, payload);
    if (result.success) {
        clearFormPersistence(formPersistenceKey);
        onFinished();
    }
  };
  
  const handleCancel = () => {
    clearFormPersistence(formPersistenceKey);
    onFinished();
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
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={loadingAction}>Annuler</Button>
        <Button type="submit" disabled={loadingAction}>
            {loadingAction && <Spinner size="sm" className="mr-2" />}
            {article ? 'Mettre à jour l\'article' : 'Créer l\'article'}
        </Button>
      </div>
    </form>
  );
};

export default ArticleForm;