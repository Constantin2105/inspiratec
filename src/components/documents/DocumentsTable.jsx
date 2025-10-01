import React, { useState } from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Download, Paperclip, Eye, Loader2, Trash2 } from 'lucide-react';
    import { format, formatDistanceToNow } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabase/client';
    import DocumentViewer from '@/components/common/DocumentViewer';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { Card, CardContent, CardFooter } from '@/components/ui/card';
    import Pagination from '@/components/common/Pagination';

    const DocumentsTable = ({ documents, emptyState, showUploader, showRecipient, onDelete, currentUser, currentUserRole, currentPage, totalPages, onPageChange }) => {
      const { toast } = useToast();
      const [viewingDocument, setViewingDocument] = useState(null); // { url, name }
      const [downloadingDocId, setDownloadingDocId] = useState(null);
      const [deletingDocId, setDeletingDocId] = useState(null);

      const getPublicUrl = (filePath, bucket = 'shared-documents') => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      };

      const handleDownload = async (doc) => {
        setDownloadingDocId(doc.id);
        try {
          const { data, error } = await supabase.storage
            .from('shared-documents')
            .download(doc.file_path);
          
          if (error) throw error;
          
          const blob = new Blob([data]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = doc.file_name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();

          toast({
            title: "Téléchargement réussi",
            description: `${doc.file_name} a été téléchargé.`,
            variant: "success"
          });
        } catch (error) {
          toast({
            title: "Erreur de téléchargement",
            description: error.message,
            variant: "destructive",
          });
        } finally {
            setDownloadingDocId(null);
        }
      };
      
      const handleView = (doc) => {
        const url = getPublicUrl(doc.file_path);
        setViewingDocument({ url, name: doc.file_name });
      };

      const confirmDelete = async (docId) => {
        setDeletingDocId(docId);
        await onDelete(docId);
        setDeletingDocId(null);
      }

      return (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du fichier</TableHead>
                      {showUploader && <TableHead>Envoyé par</TableHead>}
                      {showRecipient && <TableHead>Destinataire</TableHead>}
                      <TableHead>Date d'envoi</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents && documents.length > 0 ? (
                      documents.map((doc) => {
                        const isViewable = /\.(pdf|jpg|jpeg|png|gif|webp)$/i.test(doc.file_name);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                {doc.file_name}
                            </TableCell>
                            {showUploader && <TableCell>{doc.uploader_name || 'Administrateur'}</TableCell>}
                            {showRecipient && <TableCell>{doc.recipient_name || 'Administrateur'}</TableCell>}
                            <TableCell title={format(new Date(doc.created_at), 'PPPPp', { locale: fr })}>
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: fr })}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {isViewable && (
                                <Button variant="outline" size="icon" onClick={() => handleView(doc)}><Eye className="h-4 w-4" /></Button>
                              )}
                              <Button variant="outline" size="icon" onClick={() => handleDownload(doc)} disabled={downloadingDocId === doc.id}>
                                {downloadingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              </Button>
                              {(doc.uploader_user_id === currentUser.id || currentUserRole === 'super-admin') && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" disabled={deletingDocId === doc.id}>
                                          {deletingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce document ?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              Cette action est irréversible. Le document "{doc.file_name}" sera définitivement supprimé des serveurs.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => confirmDelete(doc.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={showUploader && showRecipient ? 5 : (showUploader || showRecipient ? 4 : 3)} className="h-24 text-center">
                          {emptyState}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {totalPages > 1 && (
              <CardFooter>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className="mx-auto" />
              </CardFooter>
            )}
          </Card>
          {viewingDocument && (
              <DocumentViewer 
                documentUrl={viewingDocument.url}
                documentName={viewingDocument.name}
                onOpenChange={(isOpen) => !isOpen && setViewingDocument(null)}
              />
          )}
        </>
      );
    };

    export default DocumentsTable;