import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import ExpandableText from '@/components/common/ExpandableText';
    import { X, MapPin, Euro, Briefcase, Clock, Users, Calendar, Send, CheckCircle, RotateCcw } from 'lucide-react';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabase/client';
    import { useAuth } from '@/contexts/AuthContext';
    
    const ExpertAoDetailPanel = ({ ao, profile, onClose, onApplySuccess }) => {
        const { toast } = useToast();
        const { user } = useAuth();
        const navigate = useNavigate();
    
        const hasApplied = ao.application_status && ao.application_status !== 'WITHDRAWN';
        const canWithdraw = ao.application_status === 'SUBMITTED' || ao.application_status === 'DRAFT';
    
        const handleApplyClick = (aoToApply) => {
            if (!user || !profile?.id) {
              toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non trouvé.' });
              return;
            }
        
            if (!profile.cv_url) {
                toast({
                    variant: 'destructive',
                    title: 'CV manquant',
                    description: `Veuillez ajouter votre CV à votre profil avant de postuler.`,
                    action: <Button onClick={() => { onClose(); navigate('/expert/dashboard?tab=profile'); }}>Compléter mon profil</Button>
                });
                return;
            }
            
            onClose();
            navigate(`/expert/dashboard/apply/${aoToApply.id}`);
        };
    
        const handleWithdraw = async (aoId) => {
            const { data: candidature, error: fetchError } = await supabase
                .from('candidatures')
                .select('id')
                .eq('expert_id', profile.id)
                .eq('ao_id', aoId)
                .not('status', 'eq', 'WITHDRAWN')
                .single();
    
            if (fetchError || !candidature) {
                toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de trouver la candidature à retirer." });
                return;
            }
    
            const { error } = await supabase
                .from('candidatures')
                .update({ status: 'WITHDRAWN' })
                .eq('id', candidature.id);
    
            if (error) {
                toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de retirer la candidature.' });
            } else {
                toast({ title: 'Succès', description: 'Votre candidature a été retirée.' });
                onApplySuccess(); // This will trigger a refresh
                onClose();
            }
        };

        const formatExperienceLevel = (level) => {
            if (Array.isArray(level) && level.length > 0) {
                return level.join(' - ');
            }
            return level || 'Non spécifié';
        }
    
        return (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-5xl bg-card border-l z-50 shadow-2xl flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold truncate">{ao.title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ExpandableText text={ao.description} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Détails de la mission</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/>Entreprise</span><span className="font-medium text-right">Inspiratec</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/>Lieu</span><span className="font-medium text-right">{ao.location}</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Euro className="h-4 w-4"/>Fourchette TJM</span><span className="font-medium text-right">{ao.tjm_range ? `€ ${ao.tjm_range}` : 'Non spécifié'}</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/>Contrat</span><span className="font-medium text-right">{ao.contract_type}</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/>Durée</span><span className="font-medium text-right">{ao.duration || 'Non spécifiée'}</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/>Expérience</span><span className="font-medium text-right">{formatExperienceLevel(ao.experience_level)}</span></div>
                                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Deadline</span><span className="font-medium text-right">{ao.candidature_deadline ? format(new Date(ao.candidature_deadline), 'd MMM yyyy', { locale: fr }) : 'N/A'}</span></div>
                            </CardContent>
                        </Card>
                        {ao.required_skills && ao.required_skills.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Compétences requises</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {ao.required_skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40">
                    {hasApplied ? (
                        canWithdraw ? (
                            <Button className="w-full" variant="destructive" onClick={() => handleWithdraw(ao.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retirer ma candidature
                            </Button>
                        ) : (
                            <Button className="w-full" disabled>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Candidature en cours de traitement
                            </Button>
                        )
                    ) : (
                        <Button className="w-full" onClick={() => handleApplyClick(ao)}>
                            <Send className="mr-2 h-4 w-4" />
                            Postuler à cette mission
                        </Button>
                    )}
                </div>
            </motion.div>
        );
    };
    
    export default ExpertAoDetailPanel;