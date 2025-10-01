import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const editApplicationSchema = z.object({
  tjm_propose: z.coerce.number().int().positive({ message: "Le TJM doit être un nombre positif." }),
  motivation: z.string().min(10, { message: "La motivation doit contenir au moins 10 caractères." }),
});

const AdminEditApplicationDialog = ({ isOpen, onClose, application, onConfirm, loading }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dossierUrl, setDossierUrl] = useState(application?.dossier_candidature_url || '');

  const form = useForm({
    resolver: zodResolver(editApplicationSchema),
    defaultValues: {
      tjm_propose: application?.tjm_propose || 0,
      motivation: application?.motivation || '',
    },
  });

  useEffect(() => {
    if (application) {
      form.reset({
        tjm_propose: application.tjm_propose || 0,
        motivation: application.motivation || '',
      });
      setDossierUrl(application.dossier_candidature_url || '');
    }
  }, [application, form]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `public/application-dossiers/${application.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('application-dossiers')
      .upload(filePath, file);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur de téléversement', description: error.message });
    } else {
      const { data } = supabase.storage.from('application-dossiers').getPublicUrl(filePath);
      setDossierUrl(data.publicUrl);
      toast({ title: 'Succès', description: 'Dossier de candidature téléversé.' });
    }
    setIsUploading(false);
  };

  const handleFormSubmit = (data) => {
    onConfirm({ ...data, dossier_candidature_url: dossierUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la Candidature</DialogTitle>
          <DialogDescription>
            Ajustez les détails de la candidature de {application?.expert_name} avant de la transmettre.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tjm_propose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TJM Proposé (€)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivation</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Dossier de candidature (PDF)</FormLabel>
              <div className="flex items-center gap-2">
                <Input id="dossier-upload" type="file" accept=".pdf" onChange={handleFileChange} className="flex-1" disabled={isUploading} />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              {dossierUrl && (
                <p className="text-sm text-muted-foreground mt-2">
                  Fichier actuel: <a href={dossierUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Voir le dossier</a>
                </p>
              )}
            </FormItem>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
              <Button type="submit" disabled={loading || isUploading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditApplicationDialog;