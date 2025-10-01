import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, User, CheckCircle, Link as LinkIcon, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { InterviewStatusBadge } from '@/components/common/StatusBadges';
import { useToast } from '@/components/ui/use-toast';
import AvatarViewer from '@/components/common/AvatarViewer';

const DetailItem = ({ icon: Icon, label, value, children }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div>
            <p className="font-semibold text-sm">{label}</p>
            {value && <p className="text-muted-foreground">{value}</p>}
            {children}
        </div>
    </div>
);

const CompanyViewInterviewDialog = ({ interview, onOpenChange }) => {
    const { toast } = useToast();

    if (!interview || interview.status !== 'CONFIRMED') {
        return null;
    }
    
    const { ao_title, expert_display_code, expert_avatar_url, confirmed_time, meeting_link, status } = interview;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(meeting_link);
        toast({
            title: "Copié !",
            description: "Le lien de la réunion a été copié dans le presse-papiers.",
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Détails de l'entretien confirmé
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Voici les détails de votre entretien avec l'expert.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 my-4 py-4 border-t border-b">
                    <div className="flex items-center gap-3">
                         <AvatarViewer
                            src={expert_avatar_url}
                            alt={expert_display_code}
                            fallback={expert_display_code ? expert_display_code.substring(0, 2) : 'EX'}
                          />
                        <div>
                            <p className="font-semibold">{expert_display_code}</p>
                            <p className="text-sm text-muted-foreground">Expert</p>
                        </div>
                    </div>
                    <DetailItem icon={Briefcase} label="Mission" value={ao_title} />
                    <DetailItem 
                        icon={CheckCircle} 
                        label="Créneau confirmé" 
                        value={format(new Date(confirmed_time), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })} 
                    />
                    {meeting_link && (
                        <DetailItem icon={LinkIcon} label="Lien de la visioconférence">
                            <div className="flex items-center gap-2">
                                <a href={meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                    {meeting_link}
                                </a>
                                <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DetailItem>
                    )}
                </div>

                <div className="flex justify-between items-center gap-2 bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-semibold">Statut actuel :</p>
                    <InterviewStatusBadge status={status} />
                </div>

                <AlertDialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CompanyViewInterviewDialog;