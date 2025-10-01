import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, Edit, Trash2, Clock, Briefcase, MapPin, Euro, Calendar, BarChart3, Users, FileText, Building, X } from 'lucide-react';
import { getStatusBadgeVariant, getStatusLabel } from '@/lib/utils/status';
import ExpandableText from '@/components/common/ExpandableText';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DetailItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="text-base font-semibold">{children}</div>
    </div>
  </div>
);

const AdminAoDetailPanel = ({ ao, onClose, onEdit, onUpdateStatus, onSetRejectionTarget, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!ao) return null;

  const status = ao.status || 'pending_review';

  const confirmDelete = () => {
    onDelete(ao);
    setIsDeleteDialogOpen(false);
    onClose();
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
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold truncate">{ao.title}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" /> {ao.company_name || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            {status === 'REJECTED' && ao.rejection_reason && (
              <Card className="border-destructive bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Offre Rejetée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-destructive/90 mb-2">Motif du rejet :</p>
                  <blockquote className="border-l-2 border-destructive/50 pl-4 italic text-destructive/80">
                    {ao.rejection_reason}
                  </blockquote>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <ExpandableText text={ao.description} maxLines={10} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Détails de la mission</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem icon={MapPin} label="Lieu">{ao.location}</DetailItem>
                    <DetailItem icon={Briefcase} label="Type de contrat">{ao.contract_type}</DetailItem>
                    <DetailItem icon={Euro} label="TJM">{ao.tjm_range || 'Non spécifié'}</DetailItem>
                    <DetailItem icon={Clock} label="Durée">{ao.duration || 'Non spécifiée'}</DetailItem>
                    <DetailItem icon={Users} label="Mode de travail">{ao.work_arrangement}</DetailItem>
                    <DetailItem icon={Calendar} label="Deadline">
                        {ao.candidature_deadline ? format(new Date(ao.candidature_deadline), 'd MMMM yyyy', { locale: fr }) : 'N/A'}
                    </DetailItem>
                </CardContent>
            </Card>

            {ao.experience_level && ao.experience_level.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Niveaux d'expérience</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                    {ao.experience_level.map(level => <Badge key={level} variant="secondary">{level}</Badge>)}
                    </CardContent>
                </Card>
            )}

            {ao.required_skills && ao.required_skills.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Compétences requises</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                    {ao.required_skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </CardContent>
                </Card>
            )}
            
          </div>
        </ScrollArea>
        
        <CardFooter className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40 flex flex-col gap-2">
            {status === 'SUBMITTED' && (
            <div className="flex gap-2 w-full">
                <Button variant="success" className="flex-1" onClick={() => { onUpdateStatus(ao.id, 'PUBLISHED'); onClose(); }}>
                <CheckCircle className="mr-2 h-4 w-4" /> Valider et Publier
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => { onSetRejectionTarget(ao); onClose(); }}>
                <XCircle className="mr-2 h-4 w-4" /> Rejeter
                </Button>
            </div>
            )}
            <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => { onEdit(ao.id); onClose(); }}>
                  <Edit className="mr-2 h-4 w-4" /> Modifier
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
            </div>
        </CardFooter>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet appel d'offres ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'appel d'offres "{ao.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminAoDetailPanel;