import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { X, Eye, Link as LinkIcon, User, Briefcase, DollarSign, Calendar, MessageSquare, FolderOpen, Mail, UserCheck, Send, Edit, RotateCcw, BrainCircuit, MessageCircle as MessageCircleWarning, Forward } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import DocumentViewer from '@/components/common/DocumentViewer';
    import RejectApplicationDialog from './RejectApplicationDialog';
    import { CandidatureStatusBadge } from '@/components/common/StatusBadges.jsx';
    import { useAdmin } from '@/hooks/useAdmin';
    import AdminEditApplicationDialog from './AdminEditApplicationDialog';
    import ProgressRing from '@/components/ui/progress-ring';
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
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';

    const AdminApplicationDetailPanel = ({ application, onClose }) => {
      const { handleApplicationAction, loadingAction } = useAdmin();
      const { toast } = useToast();
      const [documentContext, setDocumentContext] = useState(null);
      const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
      const [isEditDialogOpen, setEditDialogOpen] = useState(false);
      const [finalRejectionReason, setFinalRejectionReason] = useState('');

      useEffect(() => {
        if (application?.status === 'REJECTED_BY_ENTERPRISE') {
          setFinalRejectionReason(application.company_rejection_reason || '');
        }
      }, [application]);
      
      const handleUpdateStatus = async (status, reason = null) => {
        let payload = {};
        if (status === 'REJECTED_BY_ADMIN' && reason) {
          payload.motif_refus = reason;
        }
        const result = await handleApplicationAction(status, application.id, payload);
        if(result.success) {
          onClose();
        }
      };

      const handleRejectConfirm = (reason) => {
        handleUpdateStatus('REJECTED_BY_ADMIN', reason);
        setRejectDialogOpen(false);
      };

      const handleEditConfirm = async (formData) => {
        const result = await handleApplicationAction('update_details', application.id, formData);
        if (result.success) {
          setEditDialogOpen(false);
        }
      };

      const handleSendRejectionToExpert = async () => {
        if (!finalRejectionReason.trim()) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Le motif de rejet final ne peut pas être vide.',
            });
            return;
        }
        const result = await handleApplicationAction('send_rejection_to_expert', application.id, { motif_refus: finalRejectionReason });
        if (result.success) {
            onClose();
        }
      };

      if(!application) return null;

      const viewDocument = (url, name) => {
        setDocumentContext({ url, name });
      };

      return (
        <>
          <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 border-b flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-2xl">{application.expert_name}</CardTitle>
                      <CardDescription>Candidature pour: {application.ao_title}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <ScrollArea className="flex-grow">
                  <CardContent className="space-y-6 p-6">
                      
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Statut actuel</p>
                        <CandidatureStatusBadge status={application.status} />
                    </div>

                    {application.status === 'REJECTED_BY_ENTERPRISE' && (
                        <Card className="bg-destructive/10 border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                                    <MessageCircleWarning /> Rejet par l'entreprise
                                </CardTitle>
                                <CardDescription>
                                    L'entreprise a rejeté cette candidature. Vous pouvez modifier le motif avant de le transmettre à l'expert.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="font-semibold">Motif initial de l'entreprise :</Label>
                                    <p className="text-sm text-muted-foreground p-3 bg-background rounded-md mt-1">{application.company_rejection_reason}</p>
                                </div>
                                <div>
                                    <Label htmlFor="final-rejection-reason" className="font-semibold">Motif final à transmettre à l'expert :</Label>
                                    <Textarea
                                        id="final-rejection-reason"
                                        value={finalRejectionReason}
                                        onChange={(e) => setFinalRejectionReason(e.target.value)}
                                        placeholder="Modifiez ou validez le motif ici..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>
                                <Button onClick={handleSendRejectionToExpert} disabled={loadingAction || !finalRejectionReason.trim()}>
                                    <Forward className="mr-2 h-4 w-4" /> Transmettre à l'expert
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {application.matching_score != null && application.matching_reasons != null && (
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5" />
                            Analyse de Matching
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-start gap-6">
                          <div className="flex flex-col items-center gap-2 pt-2">
                            <ProgressRing progress={application.matching_score} size={80} strokeWidth={8} />
                            <span className="text-sm text-muted-foreground font-semibold">Adéquation</span>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Points forts identifiés :</h4>
                            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                              {application.matching_reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                      <Card>
                          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserCheck/>Informations de l'Expert</CardTitle></CardHeader>
                          <CardContent>
                              <p className="text-sm"><strong>Email:</strong> {application.expert_email}</p>
                              <p className="text-sm"><strong>Téléphone:</strong> {application.expert_phone || 'Non renseigné'}</p>
                              <div className="mt-4 flex gap-2">
                                 {application.expert_linkedin_url && <Button variant="outline" asChild><a href={application.expert_linkedin_url} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4" />LinkedIn</a></Button>}
                                 {application.expert_email && <Button variant="outline" asChild><a href={`mailto:${application.expert_email}`}><Mail className="mr-2 h-4 w-4" />Contacter</a></Button>}
                              </div>
                          </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg"><Briefcase/>Détails de la candidature</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}><Edit className="mr-2 h-4 w-4" />Modifier</Button>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><strong>TJM Proposé:</strong> {application.tjm_propose ? `${application.tjm_propose} €` : 'N/A'}</div>
                              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><strong>Disponible le:</strong> {application.date_disponibilite ? format(new Date(application.date_disponibilite), 'd MMM yyyy', { locale: fr }) : 'N/A'}</div>
                          </div>
                          <div className="mt-4">
                              <h4 className="font-semibold mb-2 flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Motivation</h4>
                              <div className="prose prose-sm max-w-none text-muted-foreground bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                                  <p>{application.motivation || "Aucune motivation fournie."}</p>
                              </div>
                          </div>
                           <div className="mt-4">
                              <h4 className="font-semibold mb-2 flex items-center"><FolderOpen className="mr-2 h-4 w-4"/>Documents</h4>
                              <div className="flex flex-wrap gap-2">
                                  {application.cv_url && (
                                      <Button variant="outline" onClick={() => viewDocument(application.cv_url, `CV - ${application.expert_name}.pdf`)}>
                                          <Eye className="mr-2 h-4 w-4" /> Voir le CV
                                      </Button>
                                  )}
                                  {application.dossier_candidature_url ? (
                                    <Button variant="outline" onClick={() => viewDocument(application.dossier_candidature_url, `Dossier - ${application.expert_name}`)}>
                                        <Eye className="mr-2 h-4 w-4" /> Voir le dossier de candidature
                                    </Button>
                                   ) : <p className="text-sm text-muted-foreground">Aucun dossier de candidature.</p>}
                              </div>
                          </div>
                        </CardContent>
                      </Card>

                  </CardContent>
              </ScrollArea>
              <div className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40">
                  <div className="space-y-2">
                      <p className="text-sm font-medium text-center">Actions Administrateur</p>
                      <div className="flex gap-2 justify-center">
                        {application.status === 'SUBMITTED' && (
                            <>
                                <Button onClick={() => handleUpdateStatus('VALIDATED')} variant="success" className="flex-1" disabled={loadingAction}><Send className="mr-2 h-4 w-4" /> Transmettre</Button>
                                <Button onClick={() => setRejectDialogOpen(true)} variant="destructive" className="flex-1" disabled={loadingAction}><X className="mr-2 h-4 w-4" /> Rejeter</Button>
                            </>
                        )}
                        {application.status === 'VALIDATED' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="secondary" className="flex-1" disabled={loadingAction}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Retirer de l'entreprise
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Retirer la candidature ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ramènera la candidature au statut "Soumise" et la rendra invisible pour l'entreprise. Êtes-vous sûr ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApplicationAction('withdraw_from_company', application.id)}>Confirmer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {application.status !== 'SUBMITTED' && application.status !== 'VALIDATED' && application.status !== 'REJECTED_BY_ENTERPRISE' && (
                          <p className="text-sm text-muted-foreground text-center w-full">Aucune action requise pour ce statut.</p>
                        )}
                      </div>
                  </div>
              </div>
          </Card>

          <RejectApplicationDialog
            open={isRejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            onConfirm={handleRejectConfirm}
          />

          <AdminEditApplicationDialog
            isOpen={isEditDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            application={application}
            onConfirm={handleEditConfirm}
            loading={loadingAction}
          />

          {documentContext && (
            <DocumentViewer
              documentUrl={documentContext.url}
              documentName={documentContext.name}
              onOpenChange={() => setDocumentContext(null)}
            />
          )}
        </>
      );
    };

    export default AdminApplicationDetailPanel;