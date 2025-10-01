import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, XCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { parseISO } from 'date-fns';
import Spinner from '@/components/common/Spinner';
import { Helmet } from 'react-helmet-async';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const scheduleSchema = z.object({
  slots: z.array(z.object({
    datetime: z.date({ required_error: "Veuillez sélectionner une date et une heure." })
  })).min(1, "Veuillez proposer au moins un créneau.").max(3, "Vous ne pouvez proposer que 3 créneaux au maximum."),
  notes: z.string().optional(),
});

const ScheduleInterviewPage = () => {
  const { candidatureId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const { requestInterview, updateInterviewProposal, loadingAction } = useCompany();
  const [candidature, setCandidature] = useState(null);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      slots: [{ datetime: null }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  useEffect(() => {
    const fetchCandidatureData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('anonymized_candidatures')
        .select('*, candidatures(*, aos(title))')
        .eq('candidature_id', candidatureId)
        .single();

      if (error || !data) {
        console.error("Error fetching candidature:", error);
        navigate('/company/dashboard?tab=applications');
        return;
      }
      
      const combinedData = {
        ...data,
        ao_title: data.candidatures.aos.title,
      };
      setCandidature(combinedData);

      if (isEditMode) {
        const { data: interviewData, error: interviewError } = await supabase
          .from('interviews')
          .select('scheduled_times, notes')
          .eq('candidature_id', candidatureId)
          .in('status', ['PENDING', 'COUNTER_PROPOSAL'])
          .single();
        
        if (!interviewError && interviewData) {
          form.reset({
            slots: interviewData.scheduled_times.map(time => ({ datetime: parseISO(time.datetime) })),
            notes: interviewData.notes || '',
          });
        }
      }
      setLoading(false);
    };
    fetchCandidatureData();
  }, [candidatureId, navigate, isEditMode, form]);

  const onSubmit = async (data) => {
    const slots = data.slots.map(slot => ({ datetime: slot.datetime.toISOString() }));
    const notes = data.notes;
    
    let result;
    if (isEditMode) {
      result = await updateInterviewProposal(candidatureId, slots, notes);
    } else {
      result = await requestInterview(candidatureId, slots, notes);
    }
    
    if (result.success) {
      navigate('/company/dashboard?tab=planning');
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Spinner /></div>;
  }

  const pageTitle = isEditMode ? "Modifier la proposition d'entretien" : "Planifier un entretien";
  const buttonText = isEditMode ? "Mettre à jour" : "Envoyer les propositions";

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {candidature?.expert_code}</title>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pageTitle}</CardTitle>
            <CardDescription>
              {isEditMode ? "Modifiez" : "Proposez"} jusqu'à 3 créneaux à <span className="font-semibold">{candidature.expert_code}</span> pour la mission <span className="font-semibold">"{candidature.ao_title}"</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <FormLabel>Créneaux proposés</FormLabel>
                  <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`slots.${index}.datetime`}
                        render={({ field: formField }) => (
                          <FormItem className="flex items-center gap-2">
                            <DateTimePicker date={formField.value} setDate={formField.onChange} />
                            {fields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  {fields.length < 3 && (
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ datetime: null })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un créneau
                    </Button>
                  )}
                   <FormMessage>{form.formState.errors.slots?.message || form.formState.errors.slots?.root?.message}</FormMessage>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes pour l'équipe Inspiratec (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Précisions sur les disponibilités, contexte de la mission..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={loadingAction}>
                    {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {buttonText}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ScheduleInterviewPage;