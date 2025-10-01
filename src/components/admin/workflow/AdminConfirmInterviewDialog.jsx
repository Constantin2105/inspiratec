import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';


const confirmSchema = z.object({
  confirmed_time: z.string({ required_error: "Veuillez sélectionner un créneau." }),
  meeting_link: z.string().url({ message: "Veuillez entrer une URL de réunion valide." }),
});

const AdminConfirmInterviewDialog = ({ isOpen, onClose, interview, onConfirm }) => {
  const { user } = useAuth();
  const formStorageKey = useMemo(() => `form-admin-confirm-interview-${user?.id}-${interview?.id || 'new'}`, [user, interview]);

  const form = useForm({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      confirmed_time: '',
      meeting_link: '',
    },
  });

  useEffect(() => {
    if (interview?.meeting_link) {
      form.setValue('meeting_link', interview.meeting_link);
    }
  }, [interview, form.setValue]);

  useFormPersistence(form, formStorageKey);

  const handleFormSubmit = async (data) => {
    await onConfirm(interview.id, data.confirmed_time, data.meeting_link);
    clearFormPersistence(formStorageKey);
  };

  const handleClose = () => {
    clearFormPersistence(formStorageKey);
    onClose();
  }

  if (!interview) return null;

  const scheduledTimesArray = Array.isArray(interview.scheduled_times) 
    ? interview.scheduled_times.map(t => typeof t === 'object' && t.datetime ? t.datetime : t)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer l'entretien</DialogTitle>
          <DialogDescription>
            Sélectionnez un créneau parmi ceux proposés par l'entreprise et ajoutez un lien de réunion.
          </DialogDescription>
        </DialogHeader>
        
        {interview.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Note de l'entreprise</h4>
            </div>
            <p className="text-sm text-muted-foreground italic">"{interview.notes}"</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="confirmed_time"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Créneaux proposés</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {scheduledTimesArray.map((time, index) => (
                        <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={time} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {format(new Date(time), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien de la réunion (Google Meet, Zoom, etc.)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://meet.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>Annuler</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Confirmation...' : 'Confirmer et envoyer les invitations'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminConfirmInterviewDialog;