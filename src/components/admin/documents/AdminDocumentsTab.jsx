import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import DocumentsTable from '@/components/documents/DocumentsTable';
import { Button } from '@/components/ui/button';
import { Send, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/common/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DocumentFilter from './DocumentFilter';

const ITEMS_PER_PAGE = 10;

const AdminDocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    uploaderId: '',
    recipientId: '',
    startDate: null,
    endDate: null,
  });
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const fetchUsersForFilter = useCallback(async () => {
    const { data, error } = await supabase
      .from('users_with_details')
      .select('id, display_name, email')
      .order('display_name');

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger la liste des utilisateurs pour le filtre.", variant: "destructive" });
    } else {
      setUsers(data);
    }
  }, [toast]);

  const fetchDocuments = useCallback(async (tab, page, currentFilters) => {
    if (!user) return;
    setLoading(true);
    
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('shared_documents_with_details')
      .select('*', { count: 'exact' });

    if (tab === 'received') {
      query = query.eq('recipient_user_id', user.id);
    } else if (tab === 'sent') {
      query = query.eq('uploader_user_id', user.id);
    }

    if (currentFilters.searchTerm) {
      query = query.ilike('file_name', `%${currentFilters.searchTerm}%`);
    }
    if (currentFilters.uploaderId) {
      query = query.eq('uploader_user_id', currentFilters.uploaderId);
    }
    if (currentFilters.recipientId) {
      query = query.eq('recipient_user_id', currentFilters.recipientId);
    }
    if (currentFilters.startDate) {
      query = query.gte('created_at', currentFilters.startDate.toISOString());
    }
    if (currentFilters.endDate) {
      const nextDay = new Date(currentFilters.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('created_at', nextDay.toISOString());
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setDocuments([]);
    } else {
      setDocuments(data);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    fetchUsersForFilter();
  }, [fetchUsersForFilter]);

  useEffect(() => {
    fetchDocuments(activeTab, currentPage, filters);
  }, [fetchDocuments, activeTab, currentPage, filters]);

  const handleApplyFilters = (newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
    setIsFilterPopoverOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (docId) => {
    const { error } = await supabase.rpc('delete_shared_document', { p_document_id: docId });
    if(error) {
        toast({ title: 'Erreur de suppression', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Succès', description: 'Document supprimé avec succès.', variant: 'success' });
        fetchDocuments(activeTab, currentPage, filters);
    }
  };

  const getTabContent = () => {
    if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;
    
    const showUploader = activeTab !== 'sent';
    const showRecipient = activeTab !== 'received';
    const emptyState = activeTab === 'all' ? "Aucun document sur la plateforme." : (activeTab === 'received' ? "Vous n'avez reçu aucun document." : "Vous n'avez envoyé aucun document.");

    return (
      <DocumentsTable 
        documents={documents} 
        emptyState={emptyState}
        showUploader={showUploader}
        showRecipient={showRecipient}
        onDelete={handleDelete}
        currentUser={user}
        currentUserRole={profile?.role}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <DocumentFilter 
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
              users={users}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={() => navigate('/admin/documents/share')}>
          <Send className="mr-2 h-4 w-4" />
          Partager un document
        </Button>
      </div>
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">Tous les documents</TabsTrigger>
          <TabsTrigger value="received">Reçus</TabsTrigger>
          <TabsTrigger value="sent">Envoyés</TabsTrigger>
        </TabsList>
        <TabsContent value="all" forceMount>
          {activeTab === 'all' && getTabContent()}
        </TabsContent>
        <TabsContent value="received" forceMount>
          {activeTab === 'received' && getTabContent()}
        </TabsContent>
        <TabsContent value="sent" forceMount>
          {activeTab === 'sent' && getTabContent()}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AdminDocumentsTab;