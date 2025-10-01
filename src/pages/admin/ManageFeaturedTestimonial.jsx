import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import Spinner from '@/components/common/Spinner';

const featuredTestimonialSchema = z.object({
  content: z.string().min(1, "Le contenu est requis."),
  author_name: z.string().min(1, "Le nom de l'auteur est requis."),
  author_title: z.string().optional(),
  avatar_url: z.string().url("URL invalide").optional().or(z.literal('')),
});

const ManageFeaturedTestimonial = () => {
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(featuredTestimonialSchema),
    defaultValues: {
      content: '',
      author_name: '',
      author_title: '',
      avatar_url: '',
    }
  });

  const fetchTestimonial = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('featured_testimonials')
      .select('*')
      .limit(1);
      
    const activeTestimonial = data?.[0];

    if (error && error.code !== 'PGRST116') { // PGRST116 is "exact number of rows not found", which is ok
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger le témoignage.' });
    } else if (activeTestimonial) {
      setTestimonial(activeTestimonial);
      reset(activeTestimonial);
    }
    setLoading(false);
  }, [toast, reset]);

  useEffect(() => {
    fetchTestimonial();
  }, [fetchTestimonial]);

  const onSubmit = async (formData) => {
    const payload = { ...formData, updated_at: new Date() };
    let error;

    if (testimonial) {
      ({ error } = await supabase.from('featured_testimonials').update(payload).eq('id', testimonial.id));
    } else {
      ({ error } = await supabase.from('featured_testimonials').insert({ ...payload, is_active: true }).select().single());
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le témoignage.' });
    } else {
      toast({ title: 'Témoignage sauvegardé.' });
      fetchTestimonial();
    }
  };

  return (
    <>
      <Helmet><title>Témoignage Principal - Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Témoignage Principal</h1>
          <p className="text-muted-foreground">Gérez le témoignage mis en avant sur la page "Pourquoi Inspiratec ?".</p>
        </div>
        
        {loading ? <div className="flex justify-center"><Spinner size="lg" /></div> : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu du témoignage</Label>
                  <Textarea id="content" {...register("content")} rows={5} />
                  {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="author_name">Nom de l'auteur</Label>
                    <Input id="author_name" {...register("author_name")} />
                    {errors.author_name && <p className="text-sm text-destructive mt-1">{errors.author_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author_title">Titre/Poste de l'auteur</Label>
                    <Input id="author_title" {...register("author_title")} />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="avatar_url">URL de l'avatar</Label>
                    <Input id="avatar_url" {...register("avatar_url")} />
                    {errors.avatar_url && <p className="text-sm text-destructive mt-1">{errors.avatar_url.message}</p>}
                  </div>
              </CardContent>
              <div className="flex justify-end p-6">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </>
  );
};

export default ManageFeaturedTestimonial;