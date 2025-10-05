import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/common/Spinner';
import { Briefcase, Send, CheckCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AOsTab = ({ aos, loading, profile, onSelect, selectedId, onWithdrawSuccess, onApplySuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleWithdraw = async (aoId) => {
    const { data: candidature, error: fetchError } = await supabase
      .from('candidatures')
      .select('id')
      .eq('expert_id', profile.id)
      .eq('ao_id', aoId)
      .single();

    if (fetchError || !candidature) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de trouver la candidature à retirer." });
      return;
    }

    const { error } = await supabase
      .from('candidatures')
      .delete()
      .eq('id', candidature.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Succès', description: 'Votre candidature a été retirée.' });
      if(onWithdrawSuccess) onWithdrawSuccess();
      if(onApplySuccess) onApplySuccess();
    }
  };

  const handleApplyClick = async (ao) => {
    if (!user || !profile?.id) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non trouvé.' });
      return;
    }
    
    navigate(`/expert/dashboard/apply/${ao.id}`);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      {aos.length > 0 ? (
        aos.map((ao) => {
          const hasApplied = ao.application_status && ao.application_status !== 'WITHDRAWN';
          const canWithdraw = ao.application_status === 'SUBMITTED';

          return (
            <Card 
              key={ao.id} 
              className={cn(
                "overflow-hidden transition-all duration-300 cursor-pointer",
                selectedId === ao.id ? 'border-primary shadow-lg' : 'hover:shadow-md'
              )}
              onClick={() => onSelect(ao)}
            >
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <div>
                          <CardTitle className="text-xl">{ao.title}</CardTitle>
                          <CardDescription>{ao.location || 'Télétravail'}</CardDescription>
                      </div>
                        <Badge variant="secondary">{ao.contract_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ao.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                      {ao.required_skills?.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                  </div>
                </CardContent>
              </div>
              <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold">{ao.tjm_range ? `€ ${ao.tjm_range}` : 'TJM non communiqué'}</p>
                    {hasApplied && <Badge variant="success" className="gap-1.5"><CheckCircle className="h-3.5 w-3.5"/> Déjà postulé</Badge>}
                </div>

                {hasApplied ? (
                    canWithdraw ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retirer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr de vouloir retirer votre candidature ?</AlertDialogTitle>
                              <AlertDialogDescription>Cette action est définitive et supprimera votre candidature.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleWithdraw(ao.id); }}>Confirmer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button size="sm" disabled>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Postulé
                        </Button>
                    )
                ) : (
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApplyClick(ao); }}>
                        <Send className="mr-2 h-4 w-4" />
                        Postuler
                    </Button>
                )}
              </CardFooter>
            </Card>
          )
        })
      ) : (
        <div className="text-center py-10">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucun appel d'offre pour le moment</h3>
          <p className="mt-1 text-sm text-muted-foreground">Revenez bientôt pour découvrir de nouvelles missions.</p>
        </div>
      )}
    </div>
  );
};

export default AOsTab;