import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';

const aoSchema = z.object({
  title: z.string().min(5, "Le titre est requis (5 caractères min)."),
  description: z.string().min(20, "La description est requise (20 caractères min)."),
  company_id: z.string().uuid("Veuillez sélectionner une entreprise valide."),
  status: z.enum(['draft', 'pending_review', 'published', 'rejected', 'expired'], { required_error: "Le statut est requis." }),
  location: z.string().min(1, 'Le lieu est requis.'),
  salary_range: z.string().optional(),
  contract_type: z.enum(['Régie (engagement de moyens)', 'Forfait (engagement de résultats)'], { required_error: 'Le type de contrat est requis.' }),
  work_arrangement: z.enum(['Sur site', 'Hybride', 'Télétravail'], { required_error: "Le mode de travail est requis." }),
  experience_level: z.enum(['Junior', 'Intermédiaire', 'Senior', 'Expert'], { required_error: "Le niveau d'expérience est requis." }),
  duration: z.string().optional(),
  candidature_deadline: z.date().optional(),
  required_skills: z.string().transform(val => val.split(',').map(skill => skill.trim()).filter(Boolean)).optional(),
});

const RadioGroupController = ({ control, name, label, options, error }) => (
  <div>
    <Label>{label}</Label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4 mt-2">
          {options.map(opt => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
              <Label htmlFor={`${name}-${opt.value}`} className="font-normal">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
    />
    {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
  </div>
);

const AOForm = ({ ao, companies, onFinished, handleAoAction }) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: zodResolver(aoSchema),
    defaultValues: {
      title: ao?.title || '',
      description: ao?.description || '',
      company_id: ao?.company_id || '',
      status: ao?.status || 'pending_review',
      location: ao?.location || '',
      salary_range: ao?.salary_range || '',
      contract_type: ao?.contract_type || undefined,
      work_arrangement: ao?.work_arrangement || undefined,
      experience_level: ao?.experience_level || undefined,
      duration: ao?.duration || '',
      required_skills: ao?.required_skills?.join(', ') || '',
      candidature_deadline: ao?.candidature_deadline ? new Date(ao.candidature_deadline) : undefined,
    },
  });

  const onSubmit = async (formData) => {
    const action = ao ? 'update' : 'create';
    const payload = ao ? { ...formData, id: ao.id } : formData;
    await handleAoAction(action, payload);
    onFinished();
  };
  
  const companyOptions = companies.map(c => ({ value: c.id, label: c.name }));

  const contractTypeOptions = [
      { value: 'Régie (engagement de moyens)', label: 'Régie (engagement de moyens)' },
      { value: 'Forfait (engagement de résultats)', label: 'Forfait (engagement de résultats)' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <Label htmlFor="title">Titre de la mission *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="company_id">Entreprise *</Label>
          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <Combobox
                options={companyOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Sélectionner une entreprise..."
                searchPlaceholder="Rechercher une entreprise..."
                emptyPlaceholder="Aucune entreprise trouvée."
                className="mt-1"
              />
            )}
          />
          {errors.company_id && <p className="text-sm text-destructive mt-1">{errors.company_id.message}</p>}
        </div>

      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" {...register("description")} rows={5} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RadioGroupController control={control} name="status" label="Statut *" options={[{value: 'published', label: 'Publiée'}, {value: 'pending_review', label: 'En attente'}, {value: 'draft', label: 'Brouillon'}]} error={errors.status} />
        <div>
            <Label htmlFor="location">Lieu *</Label>
            <Input id="location" {...register("location")} />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
        </div>
        <div>
            <Label htmlFor="salary_range">Fourchette de salaire</Label>
            <Input id="salary_range" {...register("salary_range")} />
            {errors.salary_range && <p className="text-sm text-destructive mt-1">{errors.salary_range.message}</p>}
        </div>
        <RadioGroupController control={control} name="contract_type" label="Type de contrat *" options={contractTypeOptions} error={errors.contract_type}/>
        <RadioGroupController control={control} name="work_arrangement" label="Mode de travail *" options={[{value: 'Sur site', label: 'Sur site'}, {value: 'Télétravail', label: 'Télétravail'}, {value: 'Hybride', label: 'Hybride'}]} error={errors.work_arrangement}/>
        <RadioGroupController control={control} name="experience_level" label="Niveau d'expérience *" options={[{value: 'Junior', label: 'Junior'}, {value: 'Intermédiaire', label: 'Intermédiaire'}, {value: 'Senior', label: 'Senior'}, {value: 'Expert', label: 'Expert'}]} error={errors.experience_level}/>
        <div>
            <Label htmlFor="duration">Durée de la mission</Label>
            <Input id="duration" {...register("duration")} />
            {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>}
        </div>
        <div>
            <Label htmlFor="candidature_deadline">Date limite de candidature</Label>
            <Controller name="candidature_deadline" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>)} />
            {errors.candidature_deadline && <p className="text-sm text-destructive mt-1">{errors.candidature_deadline.message}</p>}
        </div>
      </div>
       <div>
        <Label htmlFor="required_skills">Compétences requises (séparées par des virgules)</Label>
        <Input id="required_skills" {...register("required_skills")} />
        {errors.required_skills && <p className="text-sm text-destructive mt-1">{errors.required_skills.message}</p>}
    </div>
      <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onFinished}>Annuler</Button><Button type="submit">{ao ? 'Mettre à jour' : 'Créer'}</Button></div>
    </form>
  );
};

export default AOForm;