import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import {
      X, UserCheck, FolderOpen, MessageSquare, DollarSign, Briefcase, Calendar, FileText, Loader2,
    } from 'lucide-react';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import DocumentViewer from '@/components/common/DocumentViewer';
    import RejectApplicationDialogCompany from '@/components/company/RejectApplicationDialogCompany';
    import { CandidatureStatusBadge } from '@/components/common/StatusBadges.jsx';

    const CompanyApplicationDetailPanel = ({ application, onClose, onAction, loadingAction }) => {
        const navigate = useNavigate();
        const [documentContext, setDocumentContext] = useState(null); // { url, name }
        const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);

        if (!application) return null;

        const handleScheduleInterview = () => {
            if (application && application.candidature_id) {
                navigate(`/company/dashboard/schedule-interview/${application.candidature_id}`);
            }
        };

        const viewDocument = (url, name) => {
          setDocumentContext({ url, name });
        };

        const handleHire = () => {
            if (onAction) {
                onAction('HIRED', application);
            }
        };

        const handleRejectConfirm = (reason) => {
            if (onAction) {
                onAction('REJECTED_BY_ENTERPRISE', application, { reason });
                setRejectDialogOpen(false);
            }
        };

        return (
            <>
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-full max-w-5xl bg-card border-l z-50 shadow-2xl flex flex-col"
                >
                    <div className="flex-shrink-0 border-b p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Candidature pour {application.ao_title}</h2>
                            <p className="text-sm text-muted-foreground">Expert: {application.expert_code}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow">
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Statut actuel</p>
                                <CandidatureStatusBadge status={application.status} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><strong>TJM Proposé:</strong> {application.tjm_propose ? `${application.tjm_propose} €` : 'N/A'}</div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><strong>Disponible le:</strong> {application.date_disponibilite ? format(new Date(application.date_disponibilite), 'd MMM yyyy', { locale: fr }) : 'N/A'}</div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center"><MessageSquare className="mr-2 h-4 w-4"/> Motivation</h4>
                                <div className="prose prose-sm max-w-none text-muted-foreground bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                                    <p>{application.motivation || "Aucune motivation fournie."}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center"><Briefcase className="mr-2 h-4 w-4"/> Projets similaires</h4>
                                <div className="prose prose-sm max-w-none text-muted-foreground bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                                    <p>{application.projets_similaires || "Aucun projet similaire fourni."}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center"><FolderOpen className="mr-2 h-4 w-4"/> Documents</h4>
                                <div className="flex flex-wrap gap-2">
                                    {application.dossier_candidature_url ? (<Button variant="outline" onClick={() => viewDocument(application.dossier_candidature_url, `Dossier - ${application.expert_code}`)}><FileText className="mr-2 h-4 w-4" /> Voir le Dossier de Candidature</Button>) : <p className="text-sm text-muted-foreground">Aucun dossier de candidature fourni.</p>}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    {(application.status === 'VALIDATED' || application.status === 'INTERVIEW_REQUESTED') && (
                        <div className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button onClick={handleScheduleInterview} variant="secondary" className="flex-1" disabled={loadingAction}>
                                    {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />} Programmer un entretien
                                </Button>
                                <Button onClick={() => setRejectDialogOpen(true)} variant="destructive" className="flex-1" disabled={loadingAction}>
                                    {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />} Rejeter
                                </Button>
                                <Button onClick={handleHire} variant="success" className="flex-1" disabled={loadingAction}>
                                    {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />} Recruter
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
                
                {documentContext && (<DocumentViewer documentUrl={documentContext.url} documentName={documentContext.name} onOpenChange={() => setDocumentContext(null)} />)}
                
                <RejectApplicationDialogCompany 
                    open={isRejectDialogOpen} 
                    onOpenChange={setRejectDialogOpen} 
                    onConfirm={handleRejectConfirm} 
                    isSubmitting={loadingAction}
                />
            </>
        );
    };

    export default CompanyApplicationDetailPanel;