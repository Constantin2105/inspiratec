import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Send } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const shareSchema = z.object({
  recipientType: z.enum(['expert', 'company']),
  recipient: z.object({
    value: z.string().uuid(),
    label: z.string(),
  }, {
    required_error: "Veuillez sélectionner un destinataire.",
    invalid_type_error: "Veuillez sélectionner un destinataire valide.",
  }),
  fileName: z.string().min(3, "Le nom du fichier doit contenir au moins 3 caractères."),
});

const ShareDocumentPage = () => {
  const [experts, setExperts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(shareSchema),
    defaultValues: { recipientType: 'expert', recipient: null, fileName: '' },
  });

  const recipientType = form.watch('recipientType');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users_with_details').select('id, display_name, role');
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger la liste des utilisateurs", variant: 'destructive' });
      } else {
        setExperts(data.filter(u => u.role === 'expert').map(u => ({ value: u.id, label: u.display_name })));
        setCompanies(data.filter(u => u.role === 'company').map(u => ({ value: u.id, label: u.display_name })));
      }
    };
    fetchUsers();
  }, [toast]);
  
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if(!form.getValues('fileName') && file) {
        form.setValue('fileName', file.name, { shouldValidate: true });
    }
  };

  const handleFileClear = () => {
    setSelectedFile(null);
  };

  const handleFormSubmit = async (data) => {
    if (!selectedFile) {
      toast({ title: 'Fichier manquant', description: 'Veuillez téléverser un fichier avant de partager.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
            .from('shared-documents')
            .upload(filePath, selectedFile);
        
        if (uploadError) throw uploadError;

      const { error: rpcError } = await supabase.rpc('share_document_with_notification', {
        p_recipient_user_id: data.recipient.value,
        p_file_path: filePath,
        p_file_name: data.fileName,
      });

      if (rpcError) throw rpcError;

      toast({ title: 'Succès', description: 'Document partagé avec succès.', variant: 'success' });
      navigate('/admin/documents');

    } catch (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Partager un Document - Admin</title>
      </Helmet>
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/admin/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
        </Button>
        <main className="grid flex-1 items-start gap-4 md:grid-cols-3 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Partager un Document</CardTitle>
                    <CardDescription>Remplissez les informations ci-dessous pour partager un document avec un utilisateur.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                      <form id="share-document-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="recipientType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Type de destinataire</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('recipient', null, { shouldValidate: false });
                                  }}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                  disabled={isSubmitting}
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="expert" /></FormControl>
                                    <FormLabel className="font-normal">Expert</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="company" /></FormControl>
                                    <FormLabel className="font-normal">Entreprise</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="recipient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destinataire</FormLabel>
                                <Select
                                  onValueChange={(selectedValue) => {
                                    const userList = recipientType === 'expert' ? experts : companies;
                                    const selectedUser = userList.find(u => u.value === selectedValue);
                                    field.onChange(selectedUser);
                                  }}
                                  value={field.value?.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Sélectionner un(e) ${recipientType === 'expert' ? 'expert' : 'entreprise'}...`} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(recipientType === 'expert' ? experts : companies).map(user => (
                                      <SelectItem key={user.value} value={user.value}>
                                        {user.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                            control={form.control}
                            name="fileName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nom du fichier</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Contrat de mission..." {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                      </form>
                    </Form>
                </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Fichier à envoyer</CardTitle>
                </CardHeader>
                <CardContent>
                    <DocumentUploader 
                        onFileSelect={handleFileSelect} 
                        onFileClear={handleFileClear} 
                        isUploading={isSubmitting} 
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" form="share-document-form" disabled={isSubmitting || !selectedFile} className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Partage en cours...' : 'Partager le document'}
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default ShareDocumentPage;