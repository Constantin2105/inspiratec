import React from 'react';
import { motion } from 'framer-motion';
import { X, Edit, Trash2, Mail, Phone, User as UserIcon, Building, Briefcase, Calendar, Star, CheckCircle, ExternalLink, FileText, BadgeCheck, Euro, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import AvatarViewer from '@/components/common/AvatarViewer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getInitials } from '@/lib/utils/text';

const DetailItem = ({ icon, label, value, type = 'text' }) => {
  if (!value && typeof value !== 'number' && typeof value !== 'boolean') return null;

  const IconComponent = icon;

  const renderValue = () => {
    switch (type) {
      case 'link':
        return <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center">{value} <ExternalLink className="h-3 w-3 ml-1" /></a>;
      case 'badges':
        return <div className="flex flex-wrap gap-1">{value.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}</div>;
      case 'boolean':
        return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />;
      case 'date':
        return format(new Date(value), 'd MMMM yyyy', { locale: fr });
      case 'currency':
          return `${value} €`;
      default:
        return <p className="text-sm font-medium text-foreground break-words">{value}</p>;
    }
  };

  return (
    <div className="flex items-start space-x-4 py-3">
      <IconComponent className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="text-xs text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const ExpertDetails = ({ user }) => (
  <Card>
    <CardHeader><CardTitle className="text-base">Détails de l'Expert</CardTitle></CardHeader>
    <CardContent className="divide-y divide-border -mt-2">
      <DetailItem icon={Briefcase} label="Titre" value={user.expert_title} />
      <DetailItem icon={UserIcon} label="Bio" value={user.expert_bio} />
      <DetailItem icon={Euro} label="TJM" value={user.daily_rate} type="currency" />
      <DetailItem icon={Calendar} label="Disponibilité" value={user.availability} />
      <DetailItem icon={Star} label="Années d'expérience" value={user.years_of_experience} />
      <DetailItem icon={Zap} label="Compétences" value={user.skills} type="badges" />
      <DetailItem icon={ExternalLink} label="Portfolio" value={user.portfolio_links} type="badges" />
      <DetailItem icon={FileText} label="CV" value={user.cv_url} type="link" />
      <DetailItem icon={BadgeCheck} label="Profil complété" value={user.expert_profile_completed} type="boolean" />
    </CardContent>
  </Card>
);

const CompanyDetails = ({ user }) => (
    <Card>
        <CardHeader><CardTitle className="text-base">Détails de l'Entreprise</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border -mt-2">
            <DetailItem icon={Building} label="Nom de l'entreprise" value={user.company_name} />
            <DetailItem icon={UserIcon} label="Description" value={user.company_description} />
            <DetailItem icon={Briefcase} label="Nom du représentant" value={`${user.representative_first_name || ''} ${user.representative_last_name || ''}`.trim()} />
            <DetailItem icon={Briefcase} label="Poste du représentant" value={user.representative_position} />
            <DetailItem icon={Mail} label="SIREN" value={user.siren} />
            <DetailItem icon={ExternalLink} label="Site Web" value={user.website} type="link" />
            <DetailItem icon={Phone} label="Adresse" value={`${user.address || ''}, ${user.postal_code || ''} ${user.city || ''}, ${user.country || ''}`.replace(/, , /g, ', ').replace(/^,|,$/g, '').trim()} />
            <DetailItem icon={BadgeCheck} label="Profil complété" value={user.company_profile_completed} type="boolean" />
        </CardContent>
    </Card>
);

const AdminDetails = ({ user }) => (
    <Card>
        <CardHeader><CardTitle className="text-base">Détails de l'Administrateur</CardTitle></CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Cet utilisateur a des privilèges d'administrateur.</p>
        </CardContent>
    </Card>
);

const UserDetailPanel = ({ user, onClose, onEdit, onDelete }) => {
    if (!user) return null;

    const displayName = user.role === 'company' ? user.company_name : user.display_name;
    const phoneNumber = user.role === 'expert' ? user.expert_phone : user.company_phone;
    
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l z-50 shadow-2xl flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-muted/40">
                <div className="flex items-center gap-4 overflow-hidden">
                     <AvatarViewer src={user.avatar_url} alt={displayName} fallback={getInitials(displayName)} triggerClassName="h-10 w-10" />
                     <div className="overflow-hidden">
                        <h2 className="text-lg font-semibold truncate">{displayName}</h2>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                     </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
            
            <ScrollArea className="flex-grow p-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informations Générales</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y divide-border -mt-2">
                           <DetailItem icon={Mail} label="Email" value={user.email} />
                           <DetailItem icon={Phone} label="Téléphone" value={phoneNumber} />
                           <DetailItem icon={UserIcon} label="Rôle" value={user.role} />
                           <DetailItem icon={Calendar} label="Inscrit le" value={user.created_at} type="date" />
                        </CardContent>
                    </Card>

                    {user.role === 'expert' && <ExpertDetails user={user} />}
                    {user.role === 'company' && <CompanyDetails user={user} />}
                    {user.role === 'super-admin' && <AdminDetails user={user} />}
                </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto flex-shrink-0 bg-muted/40">
                <div className="flex gap-2">
                    <Button onClick={() => onEdit(user)} className="flex-1"><Edit className="mr-2 h-4 w-4" /> Modifier</Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action est irréversible. Elle supprimera définitivement l'utilisateur et toutes ses données associées.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </motion.div>
    );
};

export default UserDetailPanel;