import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, PlusCircle, Trash2, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import Pagination from '@/components/common/Pagination';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

const ITEMS_PER_PAGE = 10;

const getStatusBadgeVariant = (status) => {
  const variants = { published: 'success', draft: 'outline', pending_review: 'warning', archived: 'secondary' };
  return variants[status] || 'default';
};

const getStatusLabel = (status) => {
  const labels = { published: 'Publié', draft: 'Brouillon', pending_review: 'En attente', archived: 'Archivé' };
  return labels[status] || status;
};

const statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'published', label: 'Publiés' },
    { value: 'draft', label: 'Brouillons' },
];

const AdminBlogPage = ({ isTabbedView = false }) => {
  const { handleArticleAction } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('blogs_with_details').select('*', { count: 'exact' });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,author_name.ilike.%${debouncedSearchTerm}%`);
      }
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      
      setArticles(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les articles." });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, toast, currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchTerm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (article) => navigate(`/admin/blog/edit/${article.slug}`);
  const handleDelete = async (article) => { 
    await handleArticleAction('delete', { id: article.id }); 
    fetchArticles();
  };
  const handleUpdateStatus = async (article, newStatus) => { 
    await handleArticleAction('updateStatus', { id: article.id, status: newStatus }); 
    fetchArticles();
  };
  const handleView = (article) => navigate(`/admin/blog/view/${article.slug}`);

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;
    if (error) return <p className="text-destructive text-center py-10">Erreur: {error.message}</p>;
    if (articles.length === 0) return <p className="text-muted-foreground text-center py-10">Aucun article trouvé.</p>;
    return (
      <Table>
        <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead className="hidden md:table-cell">Auteur</TableHead><TableHead>Statut</TableHead><TableHead className="hidden sm:table-cell">Créé le</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className="cursor-pointer" onClick={() => handleView(article)}>
              <TableCell className="font-medium hover:text-primary transition-colors">{article.title}</TableCell>
              <TableCell className="hidden md:table-cell">{article.author_name}</TableCell>
              <TableCell><Badge variant={getStatusBadgeVariant(article.status)}>{getStatusLabel(article.status)}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell">{format(new Date(article.created_at), 'd MMM yyyy', { locale: fr })}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(article)}><Edit className="mr-2 h-4 w-4"/>Modifier</DropdownMenuItem>
                      {article.status === 'published' ? <DropdownMenuItem onClick={() => handleUpdateStatus(article, 'draft')}><EyeOff className="mr-2 h-4 w-4"/>Dépublier</DropdownMenuItem> : <DropdownMenuItem onClick={() => handleUpdateStatus(article, 'published')}><Eye className="mr-2 h-4 w-4"/>Publier</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4"/>Supprimer</DropdownMenuItem></AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Vraiment supprimer cet article ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera également toutes les images associées.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(article)}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><CardTitle>Liste des Articles</CardTitle><CardDescription>{totalCount} article(s) trouvé(s).</CardDescription></div>
            <Button onClick={() => navigate('/admin/blog/new')}><PlusCircle className="mr-2 h-4 w-4" />Nouveau</Button>
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
        {renderContent()}
      </CardContent>
       {totalPages > 1 && (
        <CardFooter>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </CardFooter>
      )}
    </Card>
  );
};

export default AdminBlogPage;