import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { useAuth } from '@/contexts/AuthContext';

const shareSchema = z.object({
  recipient: z.object({
    value: z.string().uuid("Veuillez sélectionner un destinataire valide."),
    label: z.string(),
  }),
});

const ShareDocumentDialog = ({ isOpen, onOpenChange, onDocumentShared }) => {
  const [users, setUsers] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(shareSchema),
    defaultValues: { recipient: null },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users_with_details').select('id, display_name, role');
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger la liste des utilisateurs", variant: 'destructive' });
      } else {
        const formattedUsers = data
          .filter(u => u.role !== 'super-admin')
          .map(u => ({
            value: u.id,
            label: `${u.display_name} (${u.role === 'company' ? 'Entreprise' : 'Expert'})`,
          }));
        setUsers(formattedUsers);
      }
    };
    if (isOpen) {
        fetchUsers();
        form.reset();
        setFileInfo(null);
    }
  }, [isOpen, toast, form]);

  const handleUploadSuccess = (info) => {
    setFileInfo(info);
  };
  
  const handleFormSubmit = async (data) => {
    if (!fileInfo) {
      toast({ title: 'Fichier manquant', description: 'Veuillez téléverser un fichier avant de partager.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('share_document_with_notification', {
        p_recipient_user_id: data.recipient.value,
        p_file_path: fileInfo.filePath,
        p_file_name: fileInfo.fileName,
      });

      if (error) throw error;

      toast({ title: 'Succès', description: 'Document partagé avec succès.', variant: 'success' });
      onDocumentShared();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager un document</DialogTitle>
          <DialogDescription>
            Sélectionnez un destinataire et téléversez un document à partager.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinataire</FormLabel>
                  <Combobox
                    options={users}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Rechercher un utilisateur..."
                    emptyMessage="Aucun utilisateur trouvé."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Fichier</FormLabel>
              <DocumentUploader onUploadSuccess={handleUploadSuccess} uploaderId={user?.id} onUploadStateChange={setIsUploading} />
            </FormItem>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button type="submit" disabled={isUploading || isSubmitting || !fileInfo}>
                    {isSubmitting ? 'Envoi...' : 'Partager le document'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDocumentDialog;