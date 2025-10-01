import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, MapPin, Euro, Briefcase, Clock, Users, Calendar, Edit, Copy, XCircle, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ExpandableText from '@/components/common/ExpandableText';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

const CompanyAoDetailPanel = ({ ao, onClose, onEdit, onDuplicate, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const confirmDelete = () => {
    onDelete(ao.id);
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
          <h2 className="text-lg font-semibold truncate">{ao.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            {ao.status === 'REJECTED' && ao.rejection_reason && (
              <Card className="border-destructive bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Offre Rejetée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-destructive/90 mb-2">Motif de l'administrateur :</p>
                  <blockquote className="border-l-2 border-destructive/50 pl-4 italic text-destructive/80">
                    {ao.rejection_reason}
                  </blockquote>
                </CardContent>
              </Card>
            )}
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
                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/>Lieu</span><span className="font-medium text-right">{ao.location}</span></div>
                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Euro className="h-4 w-4"/>Fourchette TJM</span><span className="font-medium text-right">{ao.tjm_range ? `€ ${ao.tjm_range}` : 'Non spécifié'}</span></div>
                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/>Contrat</span><span className="font-medium text-right">{ao.contract_type}</span></div>
                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/>Durée</span><span className="font-medium text-right">{ao.duration || 'Non spécifiée'}</span></div>
                <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Deadline</span><span className="font-medium text-right">{ao.candidature_deadline ? format(new Date(ao.candidature_deadline), 'd MMM yyyy', { locale: fr }) : 'N/A'}</span></div>
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
                  {ao.required_skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40 space-y-2">
            <div className="flex gap-2">
              {(ao.status === 'DRAFT' || ao.status === 'REJECTED') && (
                <Button onClick={() => onEdit(ao)} variant="outline" className="flex-1"><Edit className="mr-2 h-4 w-4" /> Modifier</Button>
              )}
              <Button onClick={() => onDuplicate(ao)} variant="secondary" className="flex-1"><Copy className="mr-2 h-4 w-4" /> Dupliquer</Button>
            </div>
            <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Supprimer l'offre</Button>
        </div>
      </motion.div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette offre ?</AlertDialogTitle>
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

export default CompanyAoDetailPanel;