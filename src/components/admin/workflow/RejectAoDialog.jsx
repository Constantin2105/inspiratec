import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const rejectionSchema = z.object({
  reason: z.string().min(10, { message: "Le motif doit contenir au moins 10 caractères." }),
});

const RejectAoDialog = ({ isOpen, onClose, onConfirm, title }) => {
  const form = useForm({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleFormSubmit = (data) => {
    onConfirm(data.reason);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter l'appel d'offres</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de rejeter l'offre "{title}". Veuillez fournir un motif clair pour l'entreprise.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif du rejet</FormLabel>
                  <FormControl>
                    <Textarea
                      id="reason"
                      placeholder="Ex: La description de la mission est trop vague, le budget semble irréaliste..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
              <Button type="submit" variant="destructive">Confirmer le rejet</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectAoDialog;