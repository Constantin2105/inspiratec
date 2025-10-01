import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const aoSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères." }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères." }),
  company_id: z.string().uuid({ message: "Veuillez sélectionner une entreprise." }).optional(),
  company_name: z.string().optional(),
  location: z.string().min(2, { message: "Le lieu est requis." }),
  salary_range: z.string().optional(),
  contract_type: z.enum(['Régie', 'Forfait'], { required_error: 'Le type de contrat est requis.' }),
  required_skills: z.string().min(2, { message: "Veuillez lister quelques compétences." }),
  work_arrangement: z.enum(['Remote', 'Sur site', 'Hybride'], { required_error: "Le mode de travail est requis." }),
  duration: z.string().optional(),
  experience_level: z.enum(['Junior', 'Confirmé', 'Senior', 'Expert'], { required_error: "Le niveau d'expérience est requis." }),
  candidature_deadline: z.date().optional(),
});

const AOForm = ({ ao, onSubmit, isSubmitting, isAdmin = false, companies = [] }) => {
  const form = useForm({
    resolver: zodResolver(aoSchema),
    defaultValues: ao ? {
      ...ao,
      required_skills: Array.isArray(ao.required_skills) ? ao.required_skills.join(', ') : '',
      candidature_deadline: ao.candidature_deadline ? new Date(ao.candidature_deadline) : undefined,
    } : {
      title: '',
      description: '',
      company_id: '',
      location: '',
      salary_range: '',
      contract_type: undefined,
      required_skills: '',
      work_arrangement: undefined,
      duration: '',
      experience_level: undefined,
    },
  });

  const handleFormSubmit = (status) => (data) => {
    const payload = {
      ...data,
      required_skills: data.required_skills.split(',').map(skill => skill.trim()).filter(Boolean),
      status: status,
    };
    if (isAdmin && !payload.company_id) {
        const company = companies.find(c => c.name === payload.company_name);
        if(company) payload.company_id = company.id;
    }
    onSubmit(payload, ao?.id);
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{ao ? "Modifier l'Appel d'Offres" : "Créer un Appel d'Offres"}</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Remplissez les détails de l'appel d'offres. Vous pouvez le publier ou l'enregistrer comme brouillon."
                  : "Remplissez les détails de votre appel d'offres. Vous pouvez l'enregistrer comme brouillon ou le soumettre pour validation."
                }
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

              {isAdmin && (
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sélectionner une entreprise" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                  <FormItem className="md:col-span-2 space-y-3"><FormLabel>Niveau d'expérience</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Junior" /></FormControl><FormLabel className="font-normal">Junior</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Confirmé" /></FormControl><FormLabel className="font-normal">Confirmé</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Senior" /></FormControl><FormLabel className="font-normal">Senior</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Expert" /></FormControl><FormLabel className="font-normal">Expert</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="salary_range" render={({ field }) => (<FormItem><FormLabel>Fourchette salariale (optionnel)</FormLabel><FormControl><Input placeholder="50k€ - 70k€" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                      </PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
            {isAdmin ? (
              <>
                <Button type="button" variant="outline" onClick={form.handleSubmit(handleFormSubmit('DRAFT'))} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Enregistrer en brouillon
                </Button>
                <Button type="button" onClick={form.handleSubmit(handleFormSubmit('PUBLISHED'))} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {ao ? 'Mettre à jour et Publier' : 'Publier l\'offre'}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={form.handleSubmit(handleFormSubmit('DRAFT'))} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Enregistrer en brouillon
                </Button>
                <Button type="button" onClick={form.handleSubmit(handleFormSubmit('SUBMITTED'))} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Soumettre pour validation
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default AOForm;