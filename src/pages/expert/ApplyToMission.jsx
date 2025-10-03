import React, { useEffect, useState, useRef, useMemo } from 'react';
    import { useParams, useNavigate, useLocation } from 'react-router-dom';
    import { useForm, Controller } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { supabase } from '@/lib/supabase/client';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Helmet } from 'react-helmet-async';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Calendar as CalendarIcon, ArrowLeft, Send, Briefcase, MapPin, Euro, Clock, Upload, FileText } from 'lucide-react';
    import { Calendar } from "@/components/ui/calendar";
    import { format } from "date-fns";
    import { fr } from "date-fns/locale";
    import { cn } from "@/lib/utils/cn";
    import Spinner from '@/components/common/Spinner';
    import { v4 as uuidv4 } from 'uuid';
    import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
    
    const applicationSchema = z.object({
      motivation: z.string().min(50, { message: "La motivation doit contenir au moins 50 caractères." }).max(2000, { message: "La motivation ne peut pas dépasser 2000 caractères." }),
      tjm_propose: z.coerce.number().int().positive({ message: "Le TJM doit être un nombre positif." }),
      date_disponibilite: z.date({ required_error: "Une date de disponibilité est requise." }),
      projets_similaires: z.string().max(2000, { message: "La description des projets ne peut pas dépasser 2000 caractères." }).optional(),
      linkedin_url: z.string().url({ message: "Veuillez entrer une URL LinkedIn valide." }),
      cv_option: z.enum(['profile', 'upload'], { required_error: "Veuillez choisir une option pour le CV." }),
      cv_file: z.any().optional(),
    }).superRefine((data, ctx) => {
      if (data.cv_option === 'upload' && (!data.cv_file || data.cv_file.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cv_file'],
          message: 'Veuillez téléverser un fichier CV.',
        });
      }
    });
    
    const ApplyToMission = () => {
      const { missionId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user, profile, refreshProfile } = useAuth();
      const [mission, setMission] = useState(null);
      const [loading, setLoading] = useState(true);
      const cvInputRef = useRef(null);
    
      const formStorageKey = useMemo(() => `form-apply-mission-${user?.id}-${missionId}-new`, [user, missionId]);
    
      const form = useForm({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
          motivation: '',
          tjm_propose: 0,
          date_disponibilite: undefined,
          projets_similaires: '',
          linkedin_url: '',
          cv_option: 'profile',
          cv_file: null,
        },
        mode: 'onChange'
      });
    
      const { handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = form;
    
      const cvOption = watch('cv_option');
    
      useFormPersistence(form, formStorageKey, { exclude: ['cv_file'] });
    
      useEffect(() => {
        const fetchMissionAndProfile = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('aos')
            .select('*')
            .eq('id', missionId)
            .single();
    
          if (error || !data) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les détails de la mission." });
            navigate('/expert/dashboard?tab=missions');
            return;
          }
          
          setMission(data);
    
          const savedDataRaw = sessionStorage.getItem(formStorageKey);
          
          if (!savedDataRaw && profile) {
            setValue('tjm_propose', profile.daily_rate || 0);
            setValue('linkedin_url', profile.linkedin_url || '');
            if (profile.availability) {
              try {
                const availabilityDate = new Date(profile.availability);
                if (!isNaN(availabilityDate)) setValue('date_disponibilite', availabilityDate);
              } catch (e) { /* Ignore invalid date formats */ }
            }
            setValue('cv_option', profile.cv_url ? 'profile' : 'upload');
          }
          setLoading(false);
        };
    
        if (missionId && profile) {
          fetchMissionAndProfile();
        }
      }, [missionId, navigate, toast, profile, setValue, formStorageKey]);
    
      const handleCvUpload = async (file) => {
        if (!file) return null;
        const bucket = 'application-dossiers';
        const fileName = `${profile.expert_profile_id}/${uuidv4()}-${file.name}`;
        
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) {
          throw new Error(`Erreur lors du téléversement du CV: ${error.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return publicUrl;
      };
    
      const onSubmit = async (values) => {
        try {
          let cvUrl = profile.cv_url;
          const uploadType = values.cv_option === 'upload';
    
          if (uploadType) {
            if (values.cv_file && values.cv_file.length > 0) {
              cvUrl = await handleCvUpload(values.cv_file[0]);
            } else {
                toast({ variant: 'destructive', title: 'CV manquant', description: 'Veuillez téléverser un CV pour postuler.' });
                return;
            }
          }
    
          if (!cvUrl) {
            toast({ variant: 'destructive', title: 'CV manquant', description: 'Veuillez définir un CV sur votre profil ou en téléverser un nouveau.' });
            return;
          }
    
          const payload = {
            ao_id: mission.id,
            expert_id: profile.expert_profile_id,
            status: 'SUBMITTED',
            updated_at: new Date().toISOString(),
            motivation: values.motivation,
            tjm_propose: values.tjm_propose,
            date_disponibilite: values.date_disponibilite.toISOString(),
            projets_similaires: values.projets_similaires,
            linkedin_url: values.linkedin_url,
            cv_url: cvUrl,
            upload_type: uploadType,
            applied_at: new Date().toISOString(),
          };
    
          const { error } = await supabase.from('candidatures').insert(payload);
    
          if (error) throw error;
    
          if (!profile.linkedin_url && values.linkedin_url) {
            await supabase.from('experts').update({ linkedin_url: values.linkedin_url }).eq('id', profile.expert_profile_id);
            await refreshProfile();
          }
    
          toast({ title: 'Succès', description: 'Votre candidature a été envoyée !' });
          clearFormPersistence(formStorageKey);
          setTimeout(() => navigate('/expert/dashboard?tab=missions'), 1000);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: `L'envoi a échoué: ${error.message}` });
        }
      };
    
      if (loading) {
        return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
      }
    
      return (
        <>
          <Helmet>
            <title>Postuler - {mission?.title || 'Mission'}</title>
          </Helmet>
          <div className="container mx-auto max-w-4xl py-8">
            <Button variant="ghost" onClick={() => navigate('/expert/dashboard?tab=missions')} className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux missions
            </Button>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Postuler à la mission</CardTitle>
                    <CardDescription>Finalisez votre candidature pour : <span className="font-semibold text-primary">{mission?.title}</span></CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <CardContent className="space-y-6">
                        <FormField control={control} name="motivation" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Vos motivations</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={6} placeholder="Expliquez pourquoi cette mission vous intéresse et comment vos compétences y répondent..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={control} name="tjm_propose" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">TJM proposé (€)</FormLabel>
                              <FormControl><Input type="number" {...field} placeholder="Ex: 500" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={control} name="date_disponibilite" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Date de disponibilité</FormLabel>
                              <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}</Button></FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} /></PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
    
                        <FormField control={control} name="linkedin_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Profil LinkedIn</FormLabel>
                            <FormControl><Input {...field} placeholder="https://www.linkedin.com/in/votre-profil" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={control} name="cv_option" render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base">Curriculum Vitae (CV)</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="profile" disabled={!profile?.cv_url} /></FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Utiliser le CV de mon profil
                                    {!profile?.cv_url && <span className="text-xs text-destructive">(Aucun CV sur votre profil)</span>}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="upload" /></FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <Upload className="h-4 w-4" /> Téléverser un CV spécifique
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
    
                        {cvOption === 'upload' && (
                          <FormField control={control} name="cv_file" render={({ field }) => (
                            <FormItem>
                              <FormControl><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => field.onChange(e.target.files)} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
    
                        <FormField control={control} name="projets_similaires" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Projets similaires réalisés (optionnel)</FormLabel>
                            <FormControl><Textarea {...field} rows={4} placeholder="Décrivez brièvement 1 ou 2 projets pertinents que vous avez menés à bien." /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                      <CardFooter className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Spinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                          Envoyer ma candidature
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </div>
              <div className="md:col-span-1 space-y-6">
                <Card className="sticky top-24">
                  <CardHeader><CardTitle>Résumé de la mission</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{mission?.title}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{mission?.location}</span></div>
                    <div className="flex items-center gap-2"><Euro className="h-4 w-4 text-muted-foreground" /><span>{mission?.tjm_range || 'Non spécifié'}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{mission?.duration || 'Non spécifiée'}</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      );
    };
    
    export default ApplyToMission;