import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import { Star, Edit, Trash2 } from 'lucide-react';

const testimonialSchema = z.object({
  content: z.string().min(20, 'Le témoignage doit contenir au moins 20 caractères.').max(500, 'Le témoignage ne peut pas dépasser 500 caractères.'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

const TestimonialTab = ({ onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      content: '',
      rating: 5,
    },
  });

  const fetchTestimonial = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('author_user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching testimonial:", error);
    } else if (data) {
      setTestimonial(data);
      reset({ content: data.content, rating: data.rating });
    } else {
      setTestimonial(null);
      setIsEditing(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonial();
  }, [user, reset]);

  const onSubmit = async (values) => {
    if (!user) return;

    const testimonialData = {
      author_user_id: user.id,
      author_type: 'company',
      content: values.content,
      rating: values.rating,
      status: 'pending',
      updated_at: new Date().toISOString(),
    };

    let error;
    if (testimonial) {
      const { error: updateError } = await supabase
        .from('testimonials')
        .update(testimonialData)
        .eq('id', testimonial.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert({ ...testimonialData, created_at: new Date().toISOString() });
      error = insertError;
    }

    if (error) {
      toast({ title: 'Erreur', description: `Une erreur est survenue : ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Votre témoignage a été soumis avec succès et est en attente de modération.' });
      await fetchTestimonial();
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonial) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', testimonial.id);
    if (error) {
      toast({ title: 'Erreur', description: `Impossible de supprimer : ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Votre témoignage a été supprimé.' });
      setTestimonial(null);
      reset({ content: '', rating: 5 });
      setIsEditing(true);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const text = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
  };

  if (loading) return <div className="flex justify-center items-center py-8"><Spinner /></div>;

  if (testimonial && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon Témoignage</CardTitle>
          <CardDescription>Voici le témoignage que vous avez soumis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              {statusBadge(testimonial.status)}
            </div>
            {testimonial.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            )}
             <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Modifier</Button>
                <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
              </div>
              {testimonial.status === 'rejected' && (
                <p className="text-sm text-destructive mt-2">Votre témoignage a été rejeté. Vous pouvez le modifier et le soumettre à nouveau.</p>
              )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{testimonial ? 'Modifier mon Témoignage' : 'Soumettre un Témoignage'}</CardTitle>
        <CardDescription>Partagez votre expérience avec InspiraTec. Votre avis nous est précieux !</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="content">Votre message</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <Textarea {...field} id="content" rows={5} placeholder="Décrivez votre expérience..." />}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="rating">Votre note (optionnel)</label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Donnez une note de 1 à 5" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(r => (
                      <SelectItem key={r} value={String(r)}>
                        <div className="flex items-center">
                          {r} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="flex gap-4">
             <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" className="mr-2" />}
              {testimonial ? 'Mettre à jour' : 'Soumettre mon témoignage'}
            </Button>
            {isEditing && <Button variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestimonialTab;