import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import DocumentsTable from '@/components/documents/DocumentsTable';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

const ITEMS_PER_PAGE = 5;

const DocumentsTab = () => {
  const [receivedDocs, setReceivedDocs] = useState({ data: [], total: 0 });
  const [sentDocs, setSentDocs] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('received');
  const [pagination, setPagination] = useState({ received: 1, sent: 1 });

  const fetchDocuments = useCallback(async (tab, page) => {
    if (!user) return;
    setLoading(true);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query;
    if (tab === 'received') {
      query = supabase
        .from('shared_documents_with_details')
        .select('*', { count: 'exact' })
        .eq('recipient_user_id', user.id);
    } else { // sent
      query = supabase
        .from('shared_documents_with_details')
        .select('*', { count: 'exact' })
        .eq('uploader_user_id', user.id);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ title: "Erreur", description: `Impossible de charger les documents : ${error.message}`, variant: "destructive" });
    } else {
      if (tab === 'received') {
        setReceivedDocs({ data: data || [], total: count || 0 });
      } else {
        setSentDocs({ data: data || [], total: count || 0 });
      }
    }
    setLoading(false);
  }, [user, toast]);
  
  useEffect(() => {
    if (user) {
      fetchDocuments('received', 1);
      fetchDocuments('sent', 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePageChange = (tab, page) => {
    setPagination(prev => ({ ...prev, [tab]: page }));
    fetchDocuments(tab, page);
  };

  const handleDelete = async (docId) => {
    const { error } = await supabase.rpc('delete_shared_document', { p_document_id: docId });
    if (error) {
      toast({ title: 'Erreur de suppression', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Document supprimé avec succès.', variant: 'success' });
      fetchDocuments(activeTab, pagination[activeTab]);
    }
  };

  const handleShareWithAdmin = async () => {
    if (!selectedFile) {
      toast({ title: "Fichier manquant", description: "Veuillez sélectionner un fichier.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage.from('shared-documents').upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      const { error: rpcError } = await supabase.rpc('share_document_with_admins', {
        p_file_path: filePath,
        p_file_name: selectedFile.name,
      });
      if (rpcError) throw rpcError;

      toast({ title: 'Succès', description: 'Document partagé avec l\'administration.', variant: 'success' });
      setSelectedFile(null);
      
      if (activeTab !== 'sent') {
        setActiveTab('sent');
      }
      setPagination(prev => ({ ...prev, sent: 1 }));
      fetchDocuments('sent', 1);
    } catch (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const totalPagesReceived = Math.ceil(receivedDocs.total / ITEMS_PER_PAGE);
  const totalPagesSent = Math.ceil(sentDocs.total / ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mes Documents</h1>
        <p className="text-muted-foreground">Consultez et partagez des documents avec l'équipe Inspiratec.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partager un document avec l'administration</CardTitle>
          <CardDescription>Téléversez un document qui sera transmis à toute l'équipe d'administration.</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploader onFileSelect={setSelectedFile} onFileClear={() => setSelectedFile(null)} isUploading={isUploading} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleShareWithAdmin} disabled={isUploading || !selectedFile}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Partager le document
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="received">Documents Reçus ({receivedDocs.total})</TabsTrigger>
          <TabsTrigger value="sent">Documents Envoyés ({sentDocs.total})</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          {loading && activeTab === 'received' ? <Spinner /> :
            <DocumentsTable 
              documents={receivedDocs.data} 
              emptyState="Vous n'avez reçu aucun document."
              showUploader={true}
              showRecipient={false}
              onDelete={handleDelete}
              currentUser={user}
              currentUserRole={profile?.role}
              currentPage={pagination.received}
              totalPages={totalPagesReceived}
              onPageChange={(page) => handlePageChange('received', page)}
            />
          }
        </TabsContent>
        <TabsContent value="sent">
          {loading && activeTab === 'sent' ? <Spinner /> :
            <DocumentsTable 
              documents={sentDocs.data} 
              emptyState="Vous n'avez envoyé aucun document."
              showUploader={false}
              showRecipient={true}
              onDelete={handleDelete}
              currentUser={user}
              currentUserRole={profile?.role}
              currentPage={pagination.sent}
              totalPages={totalPagesSent}
              onPageChange={(page) => handlePageChange('sent', page)}
            />
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsTab;