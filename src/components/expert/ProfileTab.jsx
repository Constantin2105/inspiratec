import React, { useRef, useState, useEffect, useMemo } from 'react';
    import { useForm, Controller } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Separator } from '@/components/ui/separator';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabase/client';
    import { useToast } from '@/components/ui/use-toast';
    import Spinner from '@/components/common/Spinner';
    import { Upload, FileText, Trash2, FolderOpen, Linkedin, X, Loader2, Info } from 'lucide-react';
    import { v4 as uuidv4 } from 'uuid';
    import AvatarViewer from '@/components/common/AvatarViewer';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { useFormPersistence, clearFormPersistence } from '@/hooks/useFormPersistence';

    const profileSchema = z.object({
      first_name: z.string().min(2, "Le prénom est requis."),
      last_name: z.string().min(2, "Le nom de famille est requis."),
      title: z.string().min(5, "Le titre professionnel est requis."),
      phone_number: z.string().regex(/^[0-9+()-\s]*$/, "Ce champ ne doit contenir que des caractères valides pour un numéro de téléphone.").optional(),
      bio: z.string().max(500, "La biographie ne doit pas dépasser 500 caractères.").optional(),
      years_of_experience: z.coerce.number().min(0, "L'expérience doit être un nombre positif.").optional(),
      availability: z.string().optional(),
      daily_rate: z.coerce.number().min(0, "Le tarif journalier doit être un nombre positif.").optional(),
      skills: z.string().optional(),
      portfolio_links: z.string().optional(),
      linkedin_url: z.string().url("Veuillez entrer une URL LinkedIn valide.").optional().or(z.literal('')),
    });

    const PublicDocumentViewer = ({ documentUrl, onOpenChange }) => {
        const [isLoading, setIsLoading] = useState(true);
        const isImage = documentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl);

        const handleClose = () => {
            onOpenChange(false);
        };

        return (
            <AnimatePresence>
                {documentUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="relative bg-background rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col items-center justify-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p>Chargement du document...</p>
                                </div>
                            )}

                            {isImage ? (
                                <img src={documentUrl} alt="Document" className={`object-contain w-full h-full ${isLoading ? 'hidden' : 'block'}`} onLoad={() => setIsLoading(false)} />
                            ) : (
                                <iframe src={documentUrl} className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`} title="Document" onLoad={() => setIsLoading(false)}></iframe>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };


    const ProfileTab = ({ profile, loading, onUpdate }) => {
      const { user, refreshProfile } = useAuth();
      const { toast } = useToast();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [cvFileName, setCvFileName] = useState('');
      const cvInputRef = useRef(null);
      const [documentToView, setDocumentToView] = useState(null);

      const formStorageKey = useMemo(() => `form-expert-profile-${user?.id}`, [user]);

      const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          first_name: '', last_name: '', title: '', phone_number: '', bio: '',
          years_of_experience: 0, availability: '', daily_rate: 0, skills: '', portfolio_links: '', linkedin_url: '',
        }
      });
      
      useFormPersistence(form, formStorageKey);

      useEffect(() => {
        if (profile && !form.formState.isDirty) {
          const storedData = sessionStorage.getItem(formStorageKey);
          if (!storedData) {
            form.reset({
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              title: profile.title || '',
              phone_number: profile.phone_number || '',
              bio: profile.bio || '',
              years_of_experience: profile.years_of_experience || 0,
              availability: profile.availability || '',
              daily_rate: profile.daily_rate || 0,
              skills: (profile.skills || []).join(', '),
              portfolio_links: (profile.portfolio_links || []).join(', '),
              linkedin_url: profile.linkedin_url || '',
            });
          }
          if (profile.cv_url) {
            try {
              const urlParts = new URL(profile.cv_url);
              const pathParts = urlParts.pathname.split('/');
              setCvFileName(decodeURIComponent(pathParts[pathParts.length - 1].split('-').slice(1).join('-')));
            } catch (e) {
              setCvFileName('Fichier CV');
            }
          } else {
            setCvFileName('');
          }
        }
      }, [profile, form.reset, form.formState.isDirty, formStorageKey]);


      const handleFileUpload = async (file, type) => {
        if (!file || !profile?.id) return null;
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({ variant: "destructive", title: "Fichier trop volumineux", description: "La taille du fichier ne doit pas dépasser 10 Mo." });
          return null;
        }

        const bucketMap = {
          cv: 'expert-cvs'
        };
        const bucketName = bucketMap[type];
        const fileName = `${uuidv4()}-${file.name}`;
        const filePath = `${profile.id}/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, { upsert: true });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          return data.publicUrl;
        } catch (error) {
          toast({ variant: "destructive", title: "Erreur de téléversement", description: error.message });
          return null;
        }
      };

      const onFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (file) {
          setIsSubmitting(true);
          const publicUrl = await handleFileUpload(file, type);
          if (publicUrl) {
            let updateData = {};
            if (type === 'cv') updateData = { cv_url: publicUrl };
            
            const { error } = await supabase.from('experts').update({ ...updateData, updated_at: new Date() }).eq('user_id', user.id);
            if (error) {
              toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder le document." });
            } else {
              toast({ title: "Succès", description: "Votre document a été mis à jour." });
              await refreshProfile();
            }
          }
          setIsSubmitting(false);
        }
      };
      
      const getDocumentNameFromUrl = (docUrl) => {
          try {
              const url = new URL(docUrl);
              const pathParts = url.pathname.split('/');
              const encodedName = pathParts[pathParts.length - 1];
              const nameWithoutUUID = encodedName.split('-').slice(1).join('-');
              return decodeURIComponent(nameWithoutUUID);
          } catch (e) {
              return "Fichier invalide";
          }
      };

      const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
          const updateData = {
            first_name: data.first_name,
            last_name: data.last_name,
            title: data.title,
            phone_number: data.phone_number,
            bio: data.bio,
            years_of_experience: data.years_of_experience,
            availability: data.availability,
            daily_rate: data.daily_rate,
            linkedin_url: data.linkedin_url,
            skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
            portfolio_links: data.portfolio_links ? data.portfolio_links.split(',').map(s => s.trim()) : [],
            profile_completed: true,
            updated_at: new Date().toISOString(),
          };

          const { error: expertError } = await supabase.from('experts').update(updateData).eq('user_id', user.id);
          if (expertError) throw expertError;

          const { error: userError } = await supabase.from('users').update({ display_name: `${data.first_name} ${data.last_name}`, updated_at: new Date().toISOString() }).eq('id', user.id);
          if (userError) throw userError;

          toast({ title: "Succès", description: "Votre profil a été mis à jour." });
          clearFormPersistence(formStorageKey);
          await refreshProfile();
          if (onUpdate) onUpdate();
        } catch (error) {
          toast({ variant: "destructive", title: "Erreur", description: error.message });
        } finally {
          setIsSubmitting(false);
        }
      };

      if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;

      return (
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="relative group flex-shrink-0">
                      <AvatarViewer
                        src={profile?.avatar_url}
                        alt={`${profile?.first_name} ${profile?.last_name}`}
                        fallback={profile?.first_name ? profile.first_name.charAt(0) : 'E'}
                        triggerClassName="h-24 w-24 text-3xl"
                      />
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-2xl font-bold">{profile?.display_name}</CardTitle>
                      <CardDescription className="mt-1">
                        C'est votre vitrine. Assurez-vous que les informations sont à jour.
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">La photo de profil est gérée par l'administrateur.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="first_name">Prénom</Label><Controller name="first_name" control={form.control} render={({ field }) => <Input id="first_name" {...field} />} />{form.formState.errors.first_name && <p className="text-sm text-destructive mt-1">{form.formState.errors.first_name.message}</p>}</div>
                    <div><Label htmlFor="last_name">Nom de famille</Label><Controller name="last_name" control={form.control} render={({ field }) => <Input id="last_name" {...field} />} />{form.formState.errors.last_name && <p className="text-sm text-destructive mt-1">{form.formState.errors.last_name.message}</p>}</div>
                  </div>
                  <div><Label htmlFor="title">Titre professionnel</Label><Controller name="title" control={form.control} render={({ field }) => <Input id="title" {...field} placeholder="ex: Développeur Full-Stack Senior" />} />{form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}</div>
                  <div><Label htmlFor="bio">Biographie</Label><Controller name="bio" control={form.control} render={({ field }) => <Textarea id="bio" {...field} rows={4} placeholder="Décrivez votre parcours, vos expertises..." />} />{form.formState.errors.bio && <p className="text-sm text-destructive mt-1">{form.formState.errors.bio.message}</p>}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="phone_number">Numéro de téléphone</Label><Controller name="phone_number" control={form.control} render={({ field }) => <Input id="phone_number" {...field} />} />{form.formState.errors.phone_number && <p className="text-sm text-destructive mt-1">{form.formState.errors.phone_number.message}</p>}</div>
                    <div><Label htmlFor="years_of_experience">Années d'expérience</Label><Controller name="years_of_experience" control={form.control} render={({ field }) => <Input id="years_of_experience" type="number" {...field} />} />{form.formState.errors.years_of_experience && <p className="text-sm text-destructive mt-1">{form.formState.errors.years_of_experience.message}</p>}</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="availability">Disponibilité</Label><Controller name="availability" control={form.control} render={({ field }) => <Input id="availability" {...field} placeholder="ex: Immédiate, Sous 1 mois..." />} />{form.formState.errors.availability && <p className="text-sm text-destructive mt-1">{form.formState.errors.availability.message}</p>}</div>
                    <div><Label htmlFor="daily_rate">Tarif journalier moyen (TJM) en €</Label><Controller name="daily_rate" control={form.control} render={({ field }) => <Input id="daily_rate" type="number" {...field} />} />{form.formState.errors.daily_rate && <p className="text-sm text-destructive mt-1">{form.formState.errors.daily_rate.message}</p>}</div>
                  </div>
                  <div><Label htmlFor="skills">Compétences</Label><Controller name="skills" control={form.control} render={({ field }) => <Input id="skills" {...field} placeholder="ex: React, Node.js, PostgreSQL, AWS..." />} /><p className="text-sm text-muted-foreground mt-1">Séparez les compétences par des virgules.</p></div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="portfolio_links">Liens de portfolio</Label>
                      <Controller name="portfolio_links" control={form.control} render={({ field }) => <Input id="portfolio_links" {...field} placeholder="ex: https://github.com/mon-profil, https://mon-site.com..." />} />
                      <p className="text-sm text-muted-foreground mt-1">Séparez les liens par des virgules.</p>
                    </div>
                    <div>
                      <Label htmlFor="linkedin_url" className="flex items-center"><Linkedin className="h-4 w-4 mr-2" />Profil LinkedIn</Label>
                      <Controller name="linkedin_url" control={form.control} render={({ field }) => <Input id="linkedin_url" {...field} placeholder="https://www.linkedin.com/in/votre-profil" />} />
                      {form.formState.errors.linkedin_url && <p className="text-sm text-destructive mt-1">{form.formState.errors.linkedin_url.message}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Spinner size="sm" /> : "Enregistrer les modifications"}</Button>
                </CardFooter>
              </Card>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle><FolderOpen className="inline-block mr-2 h-6 w-6" />Mes Documents</CardTitle>
                <CardDescription>Gérez votre CV.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                    <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                    <AlertTitle className="font-semibold">Rappel Important pour l'Anonymat</AlertTitle>
                    <AlertDescription>
                    Pour garantir l'anonymat, assurez-vous que votre CV ne contienne aucune photo, numéro de téléphone ou adresse. Utilisez uniquement les initiales de votre nom.
                    </AlertDescription>
                </Alert>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Curriculum Vitae (CV)</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="file" ref={cvInputRef} onChange={(e) => onFileChange(e, 'cv')} accept=".pdf,.doc,.docx" className="hidden" />
                      <Button type="button" size="sm" variant="outline" onClick={() => cvInputRef.current.click()}><Upload className="mr-2 h-4 w-4" />{cvFileName ? "Remplacer" : "Téléverser"}</Button>
                      {profile?.cv_url && (<Button type="button" size="sm" variant="secondary" onClick={() => setDocumentToView(profile.cv_url)}><FileText className="mr-2 h-4 w-4" />Voir</Button>)}
                    </div>
                     {cvFileName && <p className="text-sm text-muted-foreground mt-2 truncate">Fichier: {cvFileName}</p>}
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (max 10Mo)</p>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
          <PublicDocumentViewer documentUrl={documentToView} onOpenChange={() => setDocumentToView(null)} />
        </div>
      );
    };

    export default ProfileTab;