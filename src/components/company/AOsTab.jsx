import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Copy, AlertTriangle, Archive, Trash2 } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AoStatusBadge } from '@/components/common/StatusBadges.jsx';
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
import { cn } from '@/lib/utils/cn';

const AOCard = ({ ao, onDuplicate, onSelect, onArchive, onDelete, selectedId }) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(ao.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 cursor-pointer",
          selectedId === ao.id ? 'border-primary shadow-lg' : 'hover:shadow-md'
        )}
        onClick={() => onSelect(ao)}
      >
        <div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 overflow-hidden pr-4">
                <CardTitle className="text-xl truncate">{ao.title}</CardTitle>
                <CardDescription>{ao.location || 'Télétravail'}</CardDescription>
              </div>
              <div className="flex-shrink-0">
                <AoStatusBadge status={ao.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{ao.description}</p>
             {ao.status === 'REJECTED' && ao.rejection_reason && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Motif du rejet: {ao.rejection_reason}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ao.rejection_reason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardContent>
        </div>
        <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          <div className="flex items-center gap-2">
            {ao.status === 'DRAFT' && (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/company/dashboard?tab=edit_ao&ao_id=${ao.id}`); }}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
              </Button>
            )}
            {ao.status === 'REJECTED' && (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/company/dashboard?tab=edit_ao&ao_id=${ao.id}`); }}>
                <Edit className="h-4 w-4 mr-2" /> Modifier et resoumettre
              </Button>
            )}
            {ao.status === 'PUBLISHED' && (
                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onArchive(ao.id); }}>
                    <Archive className="h-4 w-4 mr-2" /> Archiver
                </Button>
            )}
            {(ao.status === 'REJECTED' || ao.status === 'ARCHIVED' || ao.status === 'PUBLISHED' || ao.status === 'EXPIRED' || ao.status === 'FILLED') && (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDuplicate(ao); }}>
                <Copy className="h-4 w-4 mr-2" /> Dupliquer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'appel d'offres "{ao.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AOsTab = ({ aos, loading, onCreateNew, onDuplicate, onSelect, onArchive, onDelete, selectedId }) => {

  const { activeAos, inactiveAos } = useMemo(() => {
    if (!aos) return { activeAos: [], inactiveAos: [] };
    const sortedAos = [...aos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const inactiveStatuses = ['ARCHIVED', 'EXPIRED', 'FILLED'];
    return {
      activeAos: sortedAos.filter(ao => !inactiveStatuses.includes(ao.status)),
      inactiveAos: sortedAos.filter(ao => inactiveStatuses.includes(ao.status)),
    };
  }, [aos]);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  return (
    <Tabs defaultValue="active">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="active">Offres Actives ({activeAos.length})</TabsTrigger>
          <TabsTrigger value="inactive">Offres Inactives ({inactiveAos.length})</TabsTrigger>
        </TabsList>
        <Button onClick={onCreateNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvel Appel d'Offres
        </Button>
      </div>

      <TabsContent value="active">
        {activeAos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Aucun appel d'offres actif.</h3>
            <p className="text-muted-foreground mt-2">Commencez par créer votre premier appel d'offres !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeAos.map((ao) => <AOCard key={ao.id} ao={ao} onDuplicate={() => onDuplicate(ao)} onSelect={onSelect} onArchive={onArchive} onDelete={onDelete} selectedId={selectedId} />)}
          </div>
        )}
      </TabsContent>
      <TabsContent value="inactive">
        {inactiveAos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Aucune offre inactive.</h3>
            <p className="text-muted-foreground mt-2">Les offres expirées ou que vous archivez apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {inactiveAos.map((ao) => <AOCard key={ao.id} ao={ao} onDuplicate={() => onDuplicate(ao)} onSelect={onSelect} onArchive={onArchive} onDelete={onDelete} selectedId={selectedId} />)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AOsTab;