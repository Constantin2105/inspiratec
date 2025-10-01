import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import Pagination from '@/components/common/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import RejectAoDialog from '@/components/admin/workflow/RejectAoDialog';
import { useAdmin } from '@/hooks/useAdmin';

const ITEMS_PER_PAGE = 10;

const statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'published', label: 'Publiées' },
    { value: 'pending_review', label: 'En attente' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'rejected', label: 'Rejetées' },
    { value: 'expired', label: 'Expirées' },
    { value: 'filled', label: 'Pourvues' },
];

const getStatusBadgeVariant = (status) => {
  const variants = { published: 'success', pending_review: 'warning', draft: 'outline', rejected: 'destructive', expired: 'secondary', filled: 'default' };
  return variants[status] || 'default';
};

const getStatusLabel = (status) => {
  const labels = { 'published': 'Publiée', 'pending_review': 'En attente', 'draft': 'Brouillon', 'rejected': 'Rejetée', 'expired': 'Expirée', 'filled': 'Pourvue' };
  return labels[status] || status;
};

const AdminAOs = ({ onSelect, isTabbedView = false, selectedId }) => {
  const { handleAoAction } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [aos, setAos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  const fetchAos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('aos_with_details').select('*', { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,company_name.ilike.%${debouncedSearchTerm}%`);
      }
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      
      setAos(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les appels d'offres." });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, toast, currentPage]);
  
  useEffect(() => {
    fetchAos();
  }, [fetchAos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleUpdateStatus = async (aoId, newStatus, reason) => { 
    await handleAoAction('updateStatus', { id: aoId, status: newStatus, rejection_reason: reason }); 
    fetchAos(); 
  };

  const handleRejectSubmit = (ao, reason) => {
    handleUpdateStatus(ao.id, 'rejected', reason);
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;
    if (error) return <p className="text-destructive text-center py-10">Erreur: {error.message}</p>;
    if (aos.length === 0) return <p className="text-muted-foreground text-center py-10">Aucun appel d'offres trouvé.</p>;

    return (
      <Table>
        <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead className="hidden md:table-cell">Entreprise</TableHead><TableHead>Statut</TableHead><TableHead className="hidden sm:table-cell">Deadline</TableHead></TableRow></TableHeader>
        <TableBody>
          {aos.map((ao) => (
            <TableRow key={ao.id} className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedId === ao.id ? 'bg-muted' : ''}`} onClick={() => onSelect(ao)}>
              <TableCell className="font-medium">{ao.title}</TableCell>
              <TableCell className="hidden md:table-cell">{ao.company_name}</TableCell>
              <TableCell><Badge variant={getStatusBadgeVariant(ao.status)}>{getStatusLabel(ao.status)}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell">{ao.candidature_deadline ? format(new Date(ao.candidature_deadline), 'd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
    <Card>
      {!isTabbedView && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><CardTitle>Appels d'Offres</CardTitle><CardDescription>{totalCount} mission(s) trouvée(s).</CardDescription></div>
            <Button onClick={() => navigate('/admin/aos/new')}><PlusCircle className="mr-2 h-4 w-4" />Créer une mission</Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={isTabbedView ? 'pt-6' : ''}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex border-b overflow-x-auto">
                {statusOptions.map((option) => (
                <Button
                    key={option.value}
                    variant="ghost"
                    onClick={() => setStatusFilter(option.value)}
                    className={`rounded-none border-b-2 whitespace-nowrap ${statusFilter === option.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                    {option.label}
                </Button>
                ))}
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par titre ou entreprise..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full" />
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
    <RejectAoDialog 
        ao={rejectionTarget}
        isOpen={!!rejectionTarget}
        onClose={() => setRejectionTarget(null)}
        onSubmit={handleRejectSubmit}
    />
    </>
  );
};

export default AdminAOs;