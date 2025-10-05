import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { supabase } from '@/lib/supabase/client';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import Spinner from '@/components/common/Spinner';
    import { Briefcase, Send, MapPin } from 'lucide-react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { formatDistanceToNow } from 'date-fns';
    import { fr } from 'date-fns/locale';

    const Missions = () => {
      const [missions, setMissions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [applyingId, setApplyingId] = useState(null);
      const { user, profile } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();

      const fetchMissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('aos')
          .select('*, companies(name)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les missions.' });
          setLoading(false);
          return;
        }

        // Si l'utilisateur est un expert, on récupère ses candidatures
        if (user?.role === 'expert' && profile?.id) {
          const { data: applications } = await supabase
            .from('candidatures')
            .select('ao_id, status')
            .eq('expert_id', profile.id);

          const applicationsMap = new Map();
          applications?.forEach(app => {
            applicationsMap.set(app.ao_id, app.status);
          });

          const missionsWithStatus = data.map(mission => ({
            ...mission,
            application_status: applicationsMap.get(mission.id) || null,
          }));

          setMissions(missionsWithStatus);
        } else {
          setMissions(data);
        }
        setLoading(false);
      };

      useEffect(() => {
        fetchMissions();
      }, [toast, user, profile]);
      
      const handleApply = async (aoId) => {
        if (!user) {
          navigate('/login/expert');
          return;
        }

        if (user.role !== 'expert' || !profile?.id) {
          toast({ variant: 'destructive', title: 'Action non autorisée', description: 'Seuls les experts peuvent postuler.' });
          return;
        }

        if (!profile.profile_completed) {
            toast({
                variant: 'destructive',
                title: 'Profil incomplet',
                description: 'Veuillez compléter votre profil à 80% avant de postuler.',
                action: <Button onClick={() => navigate('/expert/dashboard?tab=profile')}>Compléter</Button>
            });
            return;
        }

        setApplyingId(aoId);

        const { data: existingApplication, error: checkError } = await supabase
          .from('candidatures')
          .select('id')
          .eq('expert_id', profile.id)
          .eq('ao_id', aoId)
          .maybeSingle();

        if (checkError) {
          toast({ variant: 'destructive', title: 'Erreur', description: checkError.message });
          setApplyingId(null);
          return;
        }

        if (existingApplication) {
          toast({ title: 'Déjà postulé', description: 'Vous avez déjà postulé à cette offre.' });
          setApplyingId(null);
          return;
        }

        const { error } = await supabase.from('candidatures').insert({
          ao_id: aoId,
          expert_id: profile.id,
          status: 'pending',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: `La postulation a échoué: ${error.message}` });
          setApplyingId(null);
        } else {
          toast({ title: 'Succès', description: 'Votre candidature a été envoyée !' });
          setApplyingId(null);
          // Recharger les missions pour afficher l'état de candidature
          await fetchMissions();
        }
      };

      return (
        <>
          <Helmet>
            <title>Missions - InspiraTec</title>
            <meta name="description" content="Découvrez toutes les missions disponibles et postulez dès maintenant." />
          </Helmet>
          <div className="container-custom py-12 md:py-20">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Nos Missions</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Trouvez le prochain défi qui correspond à votre expertise. Les meilleures opportunités vous attendent.</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              missions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {missions.map((mission) => (
                    <Card key={mission.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{mission.title}</CardTitle>
                        <CardDescription>{mission.companies.name || 'Entreprise'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                           <MapPin className="h-4 w-4"/><span>{mission.location || 'Télétravail'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-4">{mission.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {mission.required_skills?.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                        </div>
                      </CardContent>
                      <CardFooter className="flex-col items-stretch gap-4 pt-4">
                        {mission.application_status ? (
                          <Button disabled className="w-full">
                            Candidature envoyée
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button disabled={applyingId === mission.id} className="w-full">
                                {applyingId === mission.id ? <Spinner size="sm" /> : <Send className="mr-2 h-4 w-4" />}
                                Postuler
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la candidature</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Votre profil sera envoyé à l'entreprise pour la mission "{mission.title}". Êtes-vous sûr de vouloir continuer ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApply(mission.id)}>Confirmer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <p className="text-xs text-muted-foreground text-center">
                          Publié {formatDistanceToNow(new Date(mission.created_at), { locale: fr, addSuffix: true })}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-6 text-xl font-semibold">Aucune mission disponible</h3>
                  <p className="mt-2 text-muted-foreground">Revenez bientôt, de nouvelles opportunités sont publiées régulièrement.</p>
                </div>
              )
            )}
          </div>
        </>
      );
    };

    export default Missions;