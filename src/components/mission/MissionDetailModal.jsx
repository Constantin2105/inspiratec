import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Calendar, Clock, Users, Euro, Code, Building } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const InfoPill = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const MissionDetailModal = ({ ao, isOpen, onClose, children }) => {
  if (!ao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{ao.company_name || 'Entreprise'}</span>
          </div>
          <DialogTitle className="text-3xl font-bold">{ao.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            <MapPin className="h-4 w-4" /> {ao.location || 'Télétravail'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          <InfoPill icon={Briefcase} text={ao.contract_type || 'N/A'} />
          <InfoPill icon={Euro} text={ao.salary_range || 'Non spécifié'} />
          <InfoPill icon={Users} text={ao.experience_level || 'N/A'} />
          <InfoPill icon={Clock} text={ao.duration || 'N/A'} />
          <InfoPill icon={Calendar} text={ao.candidature_deadline ? `Postuler avant le ${format(new Date(ao.candidature_deadline), 'd MMM yyyy', { locale: fr })}` : 'Pas de date limite'} />
        </div>

        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{ao.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Code className="h-5 w-5 text-primary"/>Compétences Requises</h3>
            <div className="flex flex-wrap gap-2">
              {ao.required_skills?.length > 0 ? (
                ao.required_skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
              ) : (
                <p className="text-sm text-muted-foreground">Aucune compétence spécifique requise.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          {children}
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissionDetailModal;