import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import { Star, Edit, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const testimonialSchema = z.object({
  content: z.string().min(20, 'Le témoignage doit contenir au moins 20 caractères.').max(500, 'Le témoignage ne peut pas dépasser 500 caractères.'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

const TestimonialForm = ({ testimonial, onFinished, onCancel }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
          content: testimonial?.content || '',
          rating: testimonial?.rating || 5,
        },
    });

    const onSubmit = async (values) => {
        if (!user) return;

        const testimonialData = {
          author_user_id: user.id,
          author_type: 'expert',
          content: values.content,
          rating: values.rating,
          status: 'pending',
          updated_at: new Date().toISOString(),
        };

        let error;
        if (testimonial) {
          const { error: updateError } = await supabase.from('testimonials').update(testimonialData).eq('id', testimonial.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase.from('testimonials').insert({ ...testimonialData, created_at: new Date().toISOString() });
          error = insertError;
        }

        if (error) {
          toast({ title: 'Erreur', description: `Une erreur est survenue : ${error.message}`, variant: 'destructive' });
        } else {
          toast({ title: 'Succès', description: 'Votre témoignage a été soumis avec succès et est en attente de modération.' });
          onFinished();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="content">Votre message</label>
                <Controller name="content" control={control} render={({ field }) => <Textarea {...field} id="content" rows={5} placeholder="Décrivez votre expérience..." />} />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="rating">Votre note (optionnel)</label>
                <Controller name="rating" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <SelectTrigger><SelectValue placeholder="Donnez une note de 1 à 5" /></SelectTrigger>
                        <SelectContent>
                            {[5, 4, 3, 2, 1].map(r => (
                                <SelectItem key={r} value={String(r)}>
                                    <div className="flex items-center">{r} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" /></div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost" onClick={onCancel}>Annuler</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner size="sm" className="mr-2" />}
                    {testimonial ? 'Mettre à jour' : 'Soumettre'}
                </Button>
            </DialogFooter>
        </form>
    );
};

const TestimonialCard = ({ onUpdate }) => {
    const { user } = useAuth();
    const [testimonial, setTestimonial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchTestimonial = async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase.from('testimonials').select('*').eq('author_user_id', user.id).maybeSingle();
        setTestimonial(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTestimonial();
    }, [user]);

    const handleFinished = () => {
        setIsDialogOpen(false);
        fetchTestimonial();
        if(onUpdate) onUpdate();
    };

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        const text = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    if (loading) {
        return (
            <Card className="flex items-center justify-center h-48">
                <Spinner />
            </Card>
        );
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card>
                <CardHeader>
                    <CardTitle>Mon Témoignage</CardTitle>
                    <CardDescription>Partagez votre expérience.</CardDescription>
                </CardHeader>
                <CardContent>
                    {testimonial ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-muted-foreground italic line-clamp-3">"{testimonial.content}"</p>
                                {statusBadge(testimonial.status)}
                            </div>
                            {testimonial.rating && (
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Vous n'avez pas encore soumis de témoignage.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            {testimonial ? <><Edit className="mr-2 h-4 w-4" /> Modifier</> : <><PlusCircle className="mr-2 h-4 w-4" /> Soumettre un témoignage</>}
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{testimonial ? 'Modifier mon Témoignage' : 'Soumettre un Témoignage'}</DialogTitle>
                    <DialogDescription>Votre avis nous est précieux !</DialogDescription>
                </DialogHeader>
                <TestimonialForm testimonial={testimonial} onFinished={handleFinished} onCancel={() => setIsDialogOpen(false)} />
            </DialogContent>
        </Dialog>
    );
};

export default TestimonialCard;