import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const useAdminBlogActions = (refreshData, adminProfile, setLoadingAction) => {
  const { toast } = useToast();

  const handleArticleAction = useCallback(async (action, payload) => {
    setLoadingAction(true);
    try {
      if (action === 'create' || action === 'update') {
        const { cover_image, ...articleData } = payload;
        let finalImageUrl = payload.image_url || null;
        
        const articleIdForPaths = payload.id || uuidv4();

        if (cover_image && cover_image.length > 0) {
          const file = cover_image[0];
          const filePath = `blog-images/${articleIdForPaths}/${uuidv4()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('blog-images').upload(filePath, file);
          if (uploadError) throw new Error(`Erreur d'upload de l'image de couverture: ${uploadError.message}`);
          const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
        
        const dbPayload = {
          ...articleData,
          image_url: finalImageUrl,
          illustration_images_urls: [],
        };

        delete dbPayload.illustration_images;
        delete dbPayload.existingIllustrations;

        if (action === 'create') {
          const { data: adminRecord, error: adminError } = await supabase
            .from('admins')
            .select('id')
            .eq('user_id', adminProfile.id)
            .single();

          if (adminError || !adminRecord) {
            throw new Error("Profil administrateur introuvable pour lier l'article.");
          }

          dbPayload.id = articleIdForPaths;
          dbPayload.slug = slugify(dbPayload.title);
          const { data: existing } = await supabase.from('blogs').select('slug').eq('slug', dbPayload.slug);
          if (existing && existing.length > 0) {
            dbPayload.slug = `${dbPayload.slug}-${uuidv4().slice(0, 4)}`;
          }
          dbPayload.admin_id = adminRecord.id;
          
          const now = new Date().toISOString();
          dbPayload.created_at = now;
          dbPayload.updated_at = now;
          dbPayload.published_at = dbPayload.status === 'published' ? now : '1970-01-01T00:00:00Z';

          
          const { error } = await supabase.from('blogs').insert(dbPayload);
          if (error) throw error;
          toast({ title: 'Succès', description: 'Article créé avec succès.' });
        } else {
          
          const isPublishingFirstTime = payload.status === 'published' && payload.published_at && new Date(payload.published_at).getUTCFullYear() === 1970;

          const updatePayload = {
            ...dbPayload,
          };

          if (isPublishingFirstTime) {
            updatePayload.published_at = new Date().toISOString();
          }

          const { error } = await supabase.from('blogs').update(updatePayload).eq('id', payload.id);
          if (error) throw error;
          toast({ title: 'Succès', description: 'Article mis à jour avec succès.' });
        }
      } else if (action === 'delete') {
        const { data: article, error: fetchError } = await supabase.from('blogs').select('image_url').eq('id', payload.id).single();
        if (fetchError) console.warn("Impossible de récupérer les détails de l'article pour la suppression des images.", fetchError.message);

        if (article && article.image_url) {
            try {
                const filePath = new URL(article.image_url).pathname.split('/blog-images/')[1];
                if(filePath) await supabase.storage.from('blog-images').remove([filePath]);
            } catch(e) { console.warn("Could not parse or delete image_url", article.image_url); }
        }

        const { error } = await supabase.from('blogs').delete().eq('id', payload.id);
        if (error) throw error;
        toast({ title: 'Succès', description: 'Article supprimé avec succès.' });
      } else if (action === 'updateStatus') {
        const {data: currentArticle} = await supabase.from('blogs').select('published_at').eq('id', payload.id).single();
        const isPublishingFirstTime = payload.status === 'published' && currentArticle && new Date(currentArticle.published_at).getUTCFullYear() === 1970;

        const updateData = { 
          status: payload.status,
          ...(isPublishingFirstTime && { published_at: new Date().toISOString() })
        };
        const { error } = await supabase.from('blogs').update(updateData).eq('id', payload.id);
        if (error) throw error;
        toast({ title: 'Succès', description: 'Statut de l\'article mis à jour.' });
      }
      refreshData();
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'action sur l'article:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  }, [toast, refreshData, adminProfile, setLoadingAction]);

  return { handleArticleAction };
};