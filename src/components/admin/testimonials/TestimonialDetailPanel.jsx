import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { X, Star, Edit, Trash2 } from 'lucide-react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import ExpandableText from '@/components/common/ExpandableText';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

    const StarRating = ({ rating }) => {
        if (!rating) return null;
        return (
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
        );
    };

    const TestimonialDetailPanel = ({ testimonial, onClose, onEdit, onDelete }) => {
        if (!testimonial) return null;

        const getInitials = (name) => {
            if (!name) return '?';
            const parts = name.split(' ');
            if (parts.length > 1 && parts[0] && parts[parts.length - 1]) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            return name.charAt(0).toUpperCase();
        };

        const authorTitle = testimonial.author_type === 'expert'
            ? testimonial.expert_title
            : testimonial.author_type === 'company'
            ? testimonial.representative_position
            : testimonial.author_title || 'Admin';

        return (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l z-50 shadow-2xl flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold truncate">Détails du témoignage</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-6">
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={testimonial.avatar_url} alt={testimonial.display_name} />
                                    <AvatarFallback>{getInitials(testimonial.display_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{testimonial.display_name || 'Anonyme'}</CardTitle>
                                    <CardDescription className="capitalize">{authorTitle}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Contenu du témoignage</CardTitle>
                                <CardDescription>Soumis le {format(new Date(testimonial.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <StarRating rating={testimonial.rating} />
                                </div>
                                <ExpandableText text={testimonial.content} maxLines={10} />
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
                <div className="p-4 border-t flex-shrink-0 bg-background/95">
                    <div className="flex justify-end gap-2">
                         <Button variant="outline" onClick={() => onEdit(testimonial)}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Voulez-vous vraiment supprimer ce témoignage ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(testimonial)} className="bg-destructive hover:bg-destructive/90">
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </motion.div>
        );
    };

    export default TestimonialDetailPanel;