import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, MoreHorizontal, Star, Edit, Trash2, CheckCircle, XCircle, Clock, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Rejetés' },
];

const statusVariant = {
  pending: 'secondary',
  approved: 'success',
  rejected: 'destructive',
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
};

const StarRating = ({ rating }) => {
    if (rating === null || rating === undefined) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">{rating}</span>
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
      </div>
    );
};

const TestimonialList = ({ onSelect, refreshKey, onAction }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('testimonials_with_author').select('*');

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (debouncedSearchTerm) {
      query = query.or(`content.ilike.%${debouncedSearchTerm}%,display_name.ilike.%${debouncedSearchTerm}%`);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les témoignages.", variant: "destructive" });
    } else {
      setTestimonials(data);
    }
    setLoading(false);
  }, [debouncedSearchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials, refreshKey]);

  const handleUpdate = async (id, payload) => {
    const { error } = await supabase.from('testimonials').update(payload).eq('id', id);
    if (error) {
      toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Témoignage mis à jour." });
      fetchTestimonials();
    }
  };

  const handleFeatureUpdate = async (testimonial, featureType) => {
    const isCurrentlyFeatured = testimonial[featureType];
    const newFeaturedState = !isCurrentlyFeatured;

    // Start a transaction
    const { error: transactionError } = await supabase.rpc('update_testimonial_feature', {
        p_testimonial_id: testimonial.id,
        p_feature_type: featureType,
        p_author_type: testimonial.author_type,
        p_new_state: newFeaturedState
    });

    if (transactionError) {
        toast({ title: "Erreur", description: `La mise à jour de la mise en avant a échoué: ${transactionError.message}`, variant: "destructive" });
    } else {
        toast({ title: "Succès", description: "Mise en avant mise à jour." });
        fetchTestimonials();
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onAction('delete', itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Témoignages</CardTitle>
              <CardDescription>Gérez les témoignages de la plateforme.</CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Button onClick={() => navigate('/admin/testimonials/new')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex border-b">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-none border-b-2 ${statusFilter === option.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-10"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auteur</TableHead>
                    <TableHead className="w-[40%]">Contenu</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Mise en avant</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.length > 0 ? (
                    testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id} onClick={() => onSelect(testimonial)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={testimonial.avatar_url} alt={testimonial.display_name} />
                              <AvatarFallback>{getInitials(testimonial.display_name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{testimonial.display_name || 'Anonyme'}</span>
                          </div>
                        </TableCell>
                        <TableCell><p className="line-clamp-2 max-w-sm">{testimonial.content}</p></TableCell>
                        <TableCell><StarRating rating={testimonial.rating} /></TableCell>
                        <TableCell><Badge variant={statusVariant[testimonial.status]}>{testimonial.status}</Badge></TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {testimonial.is_featured && <Badge variant="outline" className="border-purple-500 text-purple-500">Principal</Badge>}
                                {testimonial.is_homepage_featured && <Badge variant="outline" className="border-blue-500 text-blue-500">Accueil</Badge>}
                            </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => navigate(`/admin/testimonials/edit/${testimonial.id}`)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                              
                              <DropdownMenuSeparator />

                              <DropdownMenuItem 
                                disabled={testimonial.author_type !== 'company'}
                                onClick={() => handleFeatureUpdate(testimonial, 'is_featured')}>
                                <Star className="mr-2 h-4 w-4"/> {testimonial.is_featured ? 'Retirer du principal' : 'Mettre en principal'}
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                onClick={() => handleFeatureUpdate(testimonial, 'is_homepage_featured')}>
                                <HomeIcon className="mr-2 h-4 w-4"/> {testimonial.is_homepage_featured ? "Retirer de l'accueil" : "Afficher sur l'accueil"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setItemToDelete(testimonial)}><Trash2 className="mr-2 h-4 w-4 text-red-500" />Supprimer</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {testimonial.status !== 'approved' && <DropdownMenuItem onClick={() => handleUpdate(testimonial.id, { status: 'approved' })}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/>Approuver</DropdownMenuItem>}
                              {testimonial.status !== 'rejected' && <DropdownMenuItem onClick={() => handleUpdate(testimonial.id, { status: 'rejected' })}><XCircle className="mr-2 h-4 w-4 text-red-500"/>Rejeter</DropdownMenuItem>}
                              {testimonial.status !== 'pending' && <DropdownMenuItem onClick={() => handleUpdate(testimonial.id, { status: 'pending' })}><Clock className="mr-2 h-4 w-4 text-yellow-500"/>Mettre en attente</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Aucun témoignage trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le témoignage sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestimonialList;