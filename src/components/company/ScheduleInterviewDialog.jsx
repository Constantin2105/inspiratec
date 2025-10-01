import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import Spinner from '@/components/common/Spinner';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { X } from 'lucide-react';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const scheduleSchema = z.object({
  scheduled_times: z.array(z.object({ datetime: z.date({ required_error: "Veuillez sélectionner une date." }) })).min(1, 'Au moins un créneau est requis.'),
  notes: z.string().optional(),
});

const ScheduleInterviewDialog = ({ open, setOpen, candidature, onInterviewRequested }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const formStorageKey = useMemo(() => `form-schedule-interview-${user?.id}-${candidature?.id}`, [user, candidature]);

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduled_times: [{ datetime: null }],
      notes: '',
    },
  });

  const { control, handleSubmit, formState: { isSubmitting, errors } } = form;
  
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'scheduled_times'
  });

  useFormPersistence(form, formStorageKey);
  
  const onSubmit = async (values) => {
    try {
      const { error } = await supabase.rpc('request_interview', {
        p_candidature_id: candidature.id,
        p_scheduled_times: values.scheduled_times,
        p_notes: values.notes,
      });

      if (error) throw error;
      
      toast({ title: 'Succès', description: 'La demande d\'entretien a été envoyée.' });
      clearFormPersistence(formStorageKey);
      onInterviewRequested();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    }
  };
  
  const handleClose = () => {
    clearFormPersistence(formStorageKey);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Planifier un entretien</DialogTitle>
          <DialogDescription>
            Proposez des créneaux à l'expert pour l'appel d'offres : {candidature?.ao_title}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Créneaux proposés</Label>
              <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`scheduled_times.${index}.datetime`}
                      render={({ field: controllerField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <DateTimePicker date={controllerField.value} setDate={controllerField.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <FormMessage>{errors.scheduled_times?.message || errors.scheduled_times?.root?.message}</FormMessage>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ datetime: null })}
              >
                Ajouter un créneau
              </Button>
            </div>

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <FormControl>
                    <Textarea id="notes" {...field} placeholder="Instructions, lien de visioconférence, etc." />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                Envoyer la proposition
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;