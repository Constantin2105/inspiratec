import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, Pencil, Eye, UserCheck, MoreVertical } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import Spinner from '@/components/common/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase/client';
import { InterviewStatusBadge } from '@/components/common/StatusBadges';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CompanyViewInterviewDialog from './CompanyViewInterviewDialog';
import AvatarViewer from '@/components/common/AvatarViewer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PlanningTab = ({ onHire, loadingAction }) => {
  const { profile, loading: companyLoading, refreshData, hiredCandidatures } = useCompany();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!profile?.company_profile_id) return;
      setLoading(true);
      try {
        const { data: interviewsData, error: interviewsError } = await supabase
          .from('interviews')
          .select(`
            *,
            candidatures (
              id,
              status,
              ao_id,
              aos ( id, title )
            )
          `)
          .eq('company_id', profile.company_profile_id)
          .order('created_at', { ascending: false });

        if (interviewsError) throw interviewsError;
        
        const candidatureIds = interviewsData.map(iv => iv.candidature_id).filter(Boolean);
        let anonDataMap = {};

        if (candidatureIds.length > 0) {
          const { data: anonData, error: anonError } = await supabase
            .from('anonymized_candidatures')
            .select('candidature_id, expert_code, expert_avatar_url')
            .in('candidature_id', candidatureIds);
          
          if (anonError) throw anonError;

          anonDataMap = anonData.reduce((acc, curr) => {
            acc[curr.candidature_id] = {
              expert_code: curr.expert_code,
              expert_avatar_url: curr.expert_avatar_url
            };
            return acc;
          }, {});
        }

        const formattedData = interviewsData.map(iv => ({
          ...iv,
          ao_title: iv.candidatures?.aos?.title || 'Mission non trouvée',
          expert_display_code: anonDataMap[iv.candidature_id]?.expert_code || 'Expert Inconnu',
          expert_avatar_url: anonDataMap[iv.candidature_id]?.expert_avatar_url,
        }));

        setInterviews(formattedData);

      } catch (error) {
        console.error("Erreur lors du chargement des entretiens:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!companyLoading && profile) {
      fetchInterviews();
    }
  }, [profile, companyLoading, refreshData]);

  const activeInterviews = useMemo(() => {
    const hiredCandidatureIds = new Set(hiredCandidatures.map(c => c.candidature_id));
    return interviews.filter(iv => !hiredCandidatureIds.has(iv.candidature_id));
  }, [interviews, hiredCandidatures]);

  const getDisplayDate = (interview) => {
    if (interview.confirmed_time) {
      return format(new Date(interview.confirmed_time), 'd MMMM yyyy HH:mm', { locale: fr });
    }
    if (interview.scheduled_times && interview.scheduled_times.length > 0) {
      return "Créneaux proposés";
    }
    return 'Date à confirmer';
  };

  const handleHire = (interview) => {
    if (onHire) {
      const applicationData = {
        candidature_id: interview.candidature_id,
        ao_id: interview.candidatures.aos.id, // Corrected from ao_id to aos.id
      };
      onHire('HIRED', applicationData);
    }
  };

  if (loading || companyLoading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Planning des Entretiens</CardTitle>
          <CardDescription>
            Consultez et gérez les entretiens programmés avec les experts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Expert</TableHead>
                      <TableHead>Mission</TableHead>
                      <TableHead>Date de l'entretien</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {activeInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <AvatarViewer
                            src={interview.expert_avatar_url}
                            alt={interview.expert_display_code}
                            fallback={interview.expert_display_code ? interview.expert_display_code.substring(0, 2) : 'EX'}
                          />
                          {interview.expert_display_code}
                        </div>
                      </TableCell>
                      <TableCell>{interview.ao_title}</TableCell>
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
                              {interview.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => navigate(`/company/dashboard/schedule-interview/${interview.candidature_id}?edit=true`)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                              )}
                              {(interview.status === 'CONFIRMED' || interview.status === 'COMPLETED') && (
                                <>
                                  <DropdownMenuItem onClick={() => setSelectedInterview(interview)}>
                                    <Eye className="mr-2 h-4 w-4" /> Voir les détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleHire(interview)} disabled={loadingAction}>
                                    <UserCheck className="mr-2 h-4 w-4" /> Recruter
                                  </DropdownMenuItem>
                                </>
                              )}
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
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold">Aucun entretien programmé</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Lorsque vous programmerez des entretiens avec des candidats, ils apparaîtront ici.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInterview && (
        <CompanyViewInterviewDialog
          interview={selectedInterview}
          onOpenChange={() => setSelectedInterview(null)}
        />
      )}
    </>
  );
};

export default PlanningTab;