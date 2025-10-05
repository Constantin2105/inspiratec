import React, { useMemo, useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import Spinner from '@/components/common/Spinner';
    import { PackageOpen, Edit, Eye } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
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
    import { supabase } from '@/lib/supabase/client';
    import { useToast } from '@/components/ui/use-toast';
    import { CandidatureStatusBadge } from '@/components/common/StatusBadges.jsx';
    import ViewInterviewDialog from './ViewInterviewDialog';
    
    const ApplicationsTab = ({ applications, loading, error, onUpdate }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [selectedInterview, setSelectedInterview] = useState(null);
    
      const sortedApplications = useMemo(() => {
        if (!applications) return [];
        return [...applications].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }, [applications]);
    
      const handleWithdraw = async (appId) => {
      const { error } = await supabase
        .from('candidatures')
        .delete()
        .eq('id', appId);
    
        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: error.message });
        } else {
          toast({ title: 'Succès', description: 'Votre candidature a été retirée.' });
          onUpdate();
        }
      };
    
      if (loading) {
        return <div className="flex justify-center items-center py-10"><Spinner /></div>;
      }
    
      if (error) {
        return (
          <Card>
            <CardHeader><CardTitle>Mes candidatures</CardTitle></CardHeader>
            <CardContent><p className="text-destructive">Une erreur est survenue lors du chargement de vos candidatures.</p></CardContent>
          </Card>
        );
      }
    
      if (!sortedApplications || sortedApplications.length === 0) {
        return (
          <Card>
            <CardHeader>
              <CardTitle>Mes candidatures</CardTitle>
              <CardDescription>Suivez l'avancement de vos candidatures ici.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 text-center">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune candidature pour le moment</h3>
                <p className="mt-1 text-sm text-muted-foreground">Postulez à des missions pour voir vos candidatures ici.</p>
            </CardContent>
          </Card>
        );
      }
    
      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mes candidatures</CardTitle>
              <CardDescription>Suivez l'avancement de vos candidatures ici.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mission</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Dernière mise à jour</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.ao_title}</TableCell>
                        <TableCell>Inspiratec</TableCell>
                        <TableCell>{format(new Date(app.updated_at), 'd MMM yyyy', { locale: fr })}</TableCell>
                        <TableCell>
                          <CandidatureStatusBadge status={app.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {app.status === 'SUBMITTED' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Retirer</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr de vouloir retirer votre candidature ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette action est définitive et supprimera votre candidature.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleWithdraw(app.id)}>Confirmer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {app.interview && app.interview.status === 'CONFIRMED' && (
                            <Button variant="success" size="sm" onClick={() => setSelectedInterview(app)}>
                                <Eye className="mr-2 h-4 w-4" /> Voir l'entretien
                            </Button>
                          )}
                          {(app.status === 'REJECTED_BY_ADMIN' || app.status === 'REJECTED_BY_ENTERPRISE') && app.motif_refus && (
                             <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="sm">Voir motif</Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Motif du rejet</AlertDialogTitle><AlertDialogDescription>{app.motif_refus}</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Fermer</AlertDialogCancel></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          {selectedInterview && (
            <ViewInterviewDialog 
              application={selectedInterview}
              onOpenChange={() => setSelectedInterview(null)}
              onUpdate={onUpdate}
            />
          )}
        </>
      );
    };
    
    export default ApplicationsTab;