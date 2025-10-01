import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarPlus as CalendarIcon, Loader2, Save, Send } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
import { useAuth } from '@/contexts/AuthContext';
import MultiSelectCheckbox from '@/components/ui/multi-select-checkbox';

const experienceLevels = [
  { value: 'Junior', label: 'Junior' },
  { value: 'Confirmé', label: 'Confirmé' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Expert', label: 'Expert' },
];

const companyAoSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères." }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères." }),
  location: z.string().min(2, { message: "Le lieu est requis." }),
  tjm_range: z.string().optional(),
  contract_type: z.enum(['Régie', 'Forfait'], { required_error: 'Le type de contrat est requis.' }),
  required_skills: z.string().min(2, { message: "Veuillez lister quelques compétences." }),
  work_arrangement: z.enum(['Remote', 'Sur site', 'Hybride'], { required_error: "Le mode de travail est requis." }),
  duration: z.string().optional(),
  experience_level: z.array(z.string()).optional(),
  candidature_deadline: z.date({ required_error: "La date limite de candidature est requise." }),
});

const CompanyAOForm = ({ ao, onSubmit, isSubmitting }) => {
  const { user } = useAuth();
  const formStorageKey = useMemo(() => `form-company-ao-${user?.id}-${ao?.id || 'new'}`, [user, ao]);
  
  const form = useForm({
    resolver: zodResolver(companyAoSchema),
    defaultValues: ao ? {
      ...ao,
      required_skills: Array.isArray(ao.required_skills) ? ao.required_skills.join(', ') : '',
      experience_level: Array.isArray(ao.experience_level) ? ao.experience_level : (ao.experience_level ? [ao.experience_level] : []),
      candidature_deadline: ao.candidature_deadline ? new Date(ao.candidature_deadline) : undefined,
    } : {
      title: '',
      description: '',
      location: '',
      tjm_range: '',
      contract_type: undefined,
      required_skills: '',
      work_arrangement: undefined,
      duration: '',
      experience_level: [],
    },
  });

  useFormPersistence(form, formStorageKey);

  const handleFormSubmit = async (status) => {
    await form.handleSubmit(async (data) => {
        const payload = {
            ...data,
            required_skills: data.required_skills.split(',').map(skill => skill.trim()).filter(Boolean),
            status: status,
        };
        const success = await onSubmit(payload, ao?.id);
        if (success) {
            clearFormPersistence(formStorageKey);
        }
    })();
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Form {...form}>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <Card>
            <CardHeader>
              <CardTitle>{ao ? "Modifier l'Appel d'Offres" : "Créer un Appel d'Offres"}</CardTitle>
              <CardDescription>
                Remplissez les détails de votre appel d'offres. Vous pouvez l'enregistrer comme brouillon ou le soumettre pour validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Titre de l'offre</FormLabel>
                    <FormControl><Input placeholder="Développeur React Senior" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description détaillée</FormLabel>
                    <FormControl><Textarea placeholder="Décrivez les responsabilités, le projet..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Lieu</FormLabel><FormControl><Input placeholder="Paris, France" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField
                control={form.control}
                name="contract_type"
                render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Type de contrat</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Régie" /></FormControl><FormLabel className="font-normal">Régie</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Forfait" /></FormControl><FormLabel className="font-normal">Forfait</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_arrangement"
                render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Mode de travail</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Remote" /></FormControl><FormLabel className="font-normal">Remote</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Sur site" /></FormControl><FormLabel className="font-normal">Sur site</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Hybride" /></FormControl><FormLabel className="font-normal">Hybride</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 space-y-3">
                    <FormLabel>Niveau d'expérience</FormLabel>
                    <FormControl>
                      <MultiSelectCheckbox
                        options={experienceLevels}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="tjm_range" render={({ field }) => (<FormItem><FormLabel>Fourchette TJM (optionnel)</FormLabel><FormControl><Input placeholder="500€ - 700€" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Durée (si applicable)</FormLabel><FormControl><Input placeholder="6 mois" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField
                control={form.control}
                name="required_skills"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Compétences requises (séparées par des virgules)</FormLabel>
                    <FormControl><Textarea placeholder="React, Node.js, PostgreSQL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidature_deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Date limite de candidature</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus locale={fr} />
                      </PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => handleFormSubmit('DRAFT')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer en brouillon
            </Button>
            <Button type="button" onClick={() => handleFormSubmit('SUBMITTED')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Soumettre pour validation
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default CompanyAOForm;