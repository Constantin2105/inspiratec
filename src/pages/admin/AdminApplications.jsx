import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { MoreVertical, Trash2, ChevronRight, Search, Check, XCircle as XIcon, CalendarCheck, UserCheck } from 'lucide-react';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
    import Spinner from '@/components/common/Spinner';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { Input } from '@/components/ui/input';
    import { useAdmin } from '@/hooks/useAdmin';
    import Pagination from '@/components/common/Pagination';
    import { useToast } from '@/components/ui/use-toast';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { useDebounce } from '@/hooks/useDebounce';

    const ITEMS_PER_PAGE = 10;

    const statusOptions = [
        { value: 'all', label: 'Toutes' },
        { value: 'pending', label: 'En attente' },
        { value: 'dossier_transmis', label: 'Dossier transmis' },
        { value: 'interview_scheduled', label: 'Entretien' },
        { value: 'recruited', label: 'Recrutée' },
        { value: 'rejected', label: 'Rejetée' },
    ];

    const getStatusBadgeVariant = (status) => {
      const variants = { 
        dossier_transmis: 'success', 
        pending: 'warning', 
        rejected: 'destructive', 
        interview_scheduled: 'info', 
        recruited: 'default' 
      };
      return variants[status] || 'default';
    };

    const getStatusLabel = (status) => {
      const labels = { 
        dossier_transmis: 'Dossier transmis', 
        pending: 'En attente', 
        rejected: 'Rejetée', 
        interview_scheduled: 'Entretien', 
        recruited: 'Recrutée' 
      };
      return labels[status] || status;
    };

    const getInitials = (name) => {
      if (!name) return '?';
      const parts = name.split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return name.charAt(0).toUpperCase();
    };

    const AdminApplications = ({ onSelect, isTabbedView = false, selectedId }) => {
      const { candidatures: allCandidatures, loading: adminLoading, error: adminError, refreshData } = useAdmin();
      const { toast } = useToast();

      const [candidatures, setCandidatures] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const debouncedSearchTerm = useDebounce(searchTerm, 500);
      const [statusFilter, setStatusFilter] = useState('all');
      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const [totalCount, setTotalCount] = useState(0);

      const filterAndPaginate = useCallback(() => {
        if (!allCandidatures) return;
        setLoading(true);
        
        let filtered = allCandidatures;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        if (debouncedSearchTerm) {
            filtered = filtered.filter(app => 
                app.expert_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                app.ao_title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                app.company_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }
        
        setTotalCount(filtered.length);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        
        const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        setCandidatures(paginated);
        setLoading(false);

      }, [allCandidatures, statusFilter, debouncedSearchTerm, currentPage]);

      useEffect(() => {
        setLoading(adminLoading);
        setError(adminError);
        filterAndPaginate();
      }, [adminLoading, adminError, filterAndPaginate]);
      
      useEffect(() => {
        setCurrentPage(1);
      }, [debouncedSearchTerm, statusFilter]);

      const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

      const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;
        if (error) return <p className="text-destructive text-center py-10">Erreur: {error.message}</p>;
        if (candidatures.length === 0) return <p className="text-muted-foreground text-center py-10">Aucune candidature trouvée.</p>;
        
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Expert</TableHead><TableHead className="hidden lg:table-cell">Mission</TableHead><TableHead>Statut</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {candidatures.map((app) => (
                <TableRow key={app.id} className={`cursor-pointer ${selectedId === app.id ? 'bg-muted/50' : ''}`} onClick={() => onSelect(app)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={app.expert_avatar_url} alt={app.expert_name} />
                        <AvatarFallback>{getInitials(app.expert_name)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{app.expert_name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div>{app.ao_title}</div>
                    <div className="text-sm text-muted-foreground">{app.company_name}</div>
                  </TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(app.status)}>{getStatusLabel(app.status)}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell">{format(new Date(app.applied_at), 'd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-end">
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      };
      
      return (
        <Card>
          {!isTabbedView && (
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><CardTitle>Candidatures</CardTitle><CardDescription>{totalCount} candidature(s) trouvée(s).</CardDescription></div>
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
                    <Input placeholder="Rechercher par expert ou mission..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full" />
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

    export default AdminApplications;