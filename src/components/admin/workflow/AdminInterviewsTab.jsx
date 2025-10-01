import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, Filter, MoreVertical } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import Spinner from '@/components/common/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { InterviewStatusBadge } from '@/components/common/StatusBadges';
import AdminConfirmInterviewDialog from './AdminConfirmInterviewDialog';

const AdminInterviewsTab = () => {
  const { interviews, loading, error, handleInterviewAction } = useAdmin();
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (interviews) {
      if (filter === 'all') {
        setFilteredInterviews(interviews);
      } else {
        setFilteredInterviews(interviews.filter(iv => iv.status === filter));
      }
    } else {
      setFilteredInterviews([]);
    }
  }, [interviews, filter]);

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-destructive p-4">Erreur: {error.message}</div>;
  }

  const handleOpenConfirmDialog = (interview) => {
    setSelectedInterview(interview);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmInterview = async (interviewId, confirmedTime, meetingLink) => {
    await handleInterviewAction('confirm', interviewId, { confirmed_time: confirmedTime, meeting_link: meetingLink });
    setIsConfirmDialogOpen(false);
    setSelectedInterview(null);
  };

  const getDisplayDate = (interview) => {
    if (interview.confirmed_time) {
      try {
        return format(new Date(interview.confirmed_time), 'd MMMM yyyy HH:mm', { locale: fr });
      } catch (e) { return 'Date invalide'; }
    }
    if (interview.expert_proposed_time) {
      try {
        return format(new Date(interview.expert_proposed_time), 'd MMMM yyyy HH:mm', { locale: fr }) + " (Contre-proposition)";
      } catch (e) { return 'Date invalide'; }
    }
    if (Array.isArray(interview.scheduled_times) && interview.scheduled_times.length > 0) {
      return interview.scheduled_times
        .map(t => {
          const time = t?.datetime || t;
          try {
            return format(new Date(time), 'd/MM HH:mm', { locale: fr });
          } catch(e) {
            return "Date invalide";
          }
        })
        .join(' | ');
    }
    return 'Date non définie';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Gestion des Entretiens</CardTitle>
              <CardDescription>
                Suivez et gérez tous les entretiens entre les entreprises et les experts.
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer par statut
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>Tous</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('PENDING')}>En attente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('CONFIRMED')}>Confirmés</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('COUNTER_PROPOSAL')}>Contre-propositions</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('COMPLETED')}>Terminés</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('CANCELLED')}>Annulés</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expert</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Mission</TableHead>
                    <TableHead>Créneaux / Date confirmée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.expert_name || 'N/A'}</TableCell>
                      <TableCell>{interview.company_name || 'N/A'}</TableCell>
                      <TableCell>{interview.ao_title || 'N/A'}</TableCell>
                      <TableCell>{getDisplayDate(interview)}</TableCell>
                      <TableCell>
                        <InterviewStatusBadge status={interview.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {(interview.status === 'PENDING' || interview.status === 'COUNTER_PROPOSAL') && (
                              <DropdownMenuItem onClick={() => handleOpenConfirmDialog(interview)}>Confirmer un créneau</DropdownMenuItem>
                            )}
                            {interview.status === 'CONFIRMED' && (
                              <DropdownMenuItem onClick={() => handleInterviewAction('complete', interview.id)}>Marquer comme terminé</DropdownMenuItem>
                            )}
                             <DropdownMenuItem onClick={() => handleInterviewAction('cancel', interview.id)} className="text-destructive">Annuler</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold">Aucun entretien trouvé</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Il n'y a aucun entretien correspondant au filtre sélectionné.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedInterview && (
        <AdminConfirmInterviewDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          interview={selectedInterview}
          onConfirm={handleConfirmInterview}
        />
      )}
    </>
  );
};

export default AdminInterviewsTab;