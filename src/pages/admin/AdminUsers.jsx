import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building, PlusCircle, Shield, ChevronRight, Search } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/common/Pagination';
import { useAdmin } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import AvatarViewer from '@/components/common/AvatarViewer';
import UserDetailPanel from '@/components/admin/users/UserDetailPanel';
import { getInitials } from '@/lib/utils/text';

const ITEMS_PER_PAGE = 10;

const roleMapping = {
  expert: { label: 'Expert', icon: User, variant: 'default' },
  company: { label: 'Entreprise', icon: Building, variant: 'success' },
  'super-admin': { label: 'Admin', icon: Shield, variant: 'destructive' },
};

const roleOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'expert', label: 'Experts' },
  { value: 'company', label: 'Entreprises' },
  { value: 'super-admin', label: 'Admins' },
];

const AdminUsersPage = () => {
  const { handleUserAction } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('users_with_details').select('*', { count: 'exact' });

      if (roleFilter !== 'all') query = query.eq('role', roleFilter);
      if (debouncedSearchTerm) query = query.or(`display_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,company_name.ilike.%${debouncedSearchTerm}%`);
      
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      
      setUsers(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les utilisateurs." });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, roleFilter, toast, currentPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, debouncedSearchTerm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  const handleEdit = (user) => navigate(`/admin/users/edit/${user.id}`);
  
  const handleDelete = async (userId) => {
    const result = await handleUserAction('delete', { id: userId });
    if(result.success) {
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;
    if (error) return <p className="text-destructive text-center py-10">Erreur: {error.message}</p>;
    if (users.length === 0) return <p className="text-muted-foreground text-center py-10">Aucun utilisateur trouvé.</p>;
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead className="hidden sm:table-cell">Inscrit le</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const roleInfo = roleMapping[user.role] || { label: user.role, icon: User, variant: 'outline' };
            const Icon = roleInfo.icon;
            const displayName = user.role === 'company' ? user.company_name : user.display_name;
            return (
              <TableRow key={user.id} onClick={() => handleSelectUser(user)} className={`cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <AvatarViewer
                      src={user.avatar_url}
                      alt={displayName}
                      fallback={getInitials(displayName)}
                      triggerClassName="h-9 w-9"
                    />
                    <div className="font-medium">{displayName || 'N/A'}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell><Badge variant={roleInfo.variant}><Icon className="mr-1 h-3 w-3" />{roleInfo.label}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell">{user.created_at ? format(new Date(user.created_at), 'd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Helmet><title>Gestion des Utilisateurs - Admin</title></Helmet>
      <div className={cn("relative transition-all duration-300", selectedUser ? "pr-0 md:pr-[448px]" : "")}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1><p className="text-muted-foreground">Créez, modifiez et gérez les experts et entreprises.</p></div>
            <Button onClick={() => navigate('/admin/users/new')}><PlusCircle className="mr-2 h-4 w-4" />Ajouter un utilisateur</Button>
          </div>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                    <CardTitle>Liste des utilisateurs</CardTitle>
                    <CardDescription>{totalCount} utilisateur(s) trouvé(s).</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex border-b mb-4 overflow-x-auto">
                {roleOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    onClick={() => setRoleFilter(option.value)}
                    className={`rounded-none border-b-2 px-4 whitespace-nowrap ${roleFilter === option.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {renderContent()}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} className="mx-auto"/>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>
       <AnimatePresence>
        {selectedUser && <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} onEdit={handleEdit} onDelete={handleDelete} />}
      </AnimatePresence>
    </>
  );
};

export default AdminUsersPage;