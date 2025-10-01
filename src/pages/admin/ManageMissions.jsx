import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Briefcase, FileText, X, MapPin, Euro, Clock, Calendar, Users } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminApplicationsTab from '@/components/admin/workflow/AdminApplicationsTab';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const AoDetailPanel = ({ ao, onClose, onEdit }) => {
  if (!ao) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l z-50 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold truncate">{ao.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{ao.title}</CardTitle>
            <CardDescription>Par {ao.company_name || 'N/A'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{ao.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Détails de la mission</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/>Lieu</span><span className="font-medium text-right">{ao.location}</span></div>
            <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Euro className="h-4 w-4"/>Salaire</span><span className="font-medium text-right">{ao.salary_range}</span></div>
            <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/>Contrat</span><span className="font-medium text-right">{ao.contract_type}</span></div>
            <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/>Durée</span><span className="font-medium text-right">{ao.duration}</span></div>
            <div className="flex items-start justify-between"><span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/>Expérience</span><span className="font-medium text-right">{ao.experience_level}</span></div>
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
       <div className="p-4 border-t">
        <Button onClick={() => onEdit(ao.id)} className="w-full">
          <Edit className="mr-2 h-4 w-4" /> Modifier
        </Button>
      </div>
    </motion.div>
  );
};

const ManageMissions = () => {
  const { aos, candidatures, loading, refreshData } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedAo, setSelectedAo] = useState(null);

  const handleDelete = async (id) => {
    // This should be handled by a centralized action handler in useAdmin
    console.warn("handleDelete needs to be implemented via useAdmin hook");
    toast({ title: 'Info', description: 'La suppression sera bientôt gérée de manière centralisée.' });
  };

  const handleEdit = (id) => {
    navigate(`/admin/aos/edit/${id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/aos/new');
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'pending_review': return 'warning';
      case 'draft': return 'secondary';
      case 'rejected':
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };
  
  const statusTranslations = {
    published: 'Publiée',
    pending_review: 'En attente',
    draft: 'Brouillon',
    rejected: 'Rejetée',
    expired: 'Expirée'
  };

  return (
    <>
      <Helmet><title>Gestion des Missions - Admin</title></Helmet>
      <div className={cn("relative transition-all duration-300", selectedAo ? "pr-0 md:pr-[448px]" : "")}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Missions</h1>
              <p className="text-muted-foreground">Gérez les appels d'offres et les candidatures associées.</p>
            </div>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Créer un Appel d'Offres</Button>
          </div>

          <Tabs defaultValue="missions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="missions">
                <Briefcase className="mr-2 h-4 w-4" />
                Appels d'Offres ({aos?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="applications">
                <FileText className="mr-2 h-4 w-4" />
                Candidatures ({candidatures?.length || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="missions">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des Appels d'Offres</CardTitle>
                  <CardDescription>Cliquez sur une mission pour voir les détails.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <div className="flex justify-center items-center h-64"><Spinner /></div> : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Entreprise</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date limite</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aos?.map((ao) => (
                          <TableRow key={ao.id} onClick={() => setSelectedAo(ao)} className="cursor-pointer">
                            <TableCell className="font-medium">{ao.title}</TableCell>
                            <TableCell>{ao.company_name}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(ao.status)}>
                                {statusTranslations[ao.status] || ao.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ao.candidature_deadline ? format(new Date(ao.candidature_deadline), "d MMM yyyy", { locale: fr }) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(ao.id); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Vraiment supprimer cette mission ?</AlertDialogTitle>
                                    <AlertDialogDescription>Cette action est irréversible et supprimera aussi toutes les candidatures associées.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={(e) => {e.stopPropagation(); handleDelete(ao.id)}}>Supprimer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="applications">
               {loading ? <div className="flex justify-center items-center h-64"><Spinner /></div> : (
                  <AdminApplicationsTab candidatures={candidatures} onUpdate={refreshData} />
               )}
            </TabsContent>
          </Tabs>
        </div>
        <AnimatePresence>
          {selectedAo && <AoDetailPanel ao={selectedAo} onClose={() => setSelectedAo(null)} onEdit={handleEdit} />}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ManageMissions;