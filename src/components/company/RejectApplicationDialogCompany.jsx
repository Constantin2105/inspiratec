import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertDialogCancel } from '@/components/ui/alert-dialog';

const RejectApplicationDialogCompany = ({ open, onOpenChange, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rejeter la candidature</AlertDialogTitle>
          <AlertDialogDescription>
            Veuillez fournir un motif pour le rejet. Cette information sera transmise à nos équipes pour analyse avant d'être communiquée à l'expert.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="rejection-reason">Motif du rejet (obligatoire)</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Ex: Le profil ne correspond pas entièrement aux compétences techniques requises..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={!reason.trim() || isSubmitting} variant="destructive">
            {isSubmitting ? 'Rejet en cours...' : 'Confirmer le rejet'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectApplicationDialogCompany;