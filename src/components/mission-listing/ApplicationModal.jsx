import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Votre lettre de motivation doit contenir au moins 50 caractères."),
});

const ApplicationModal = ({ mission, isOpen, onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data) => {
    if (!user || !mission) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('candidatures')
        .insert({
          ao_id: mission.id,
          expert_id: user.id,
          cover_letter: data.coverLetter,
          status: 'pending_admin_validation'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Candidature envoyée !",
        description: "Votre candidature a été soumise avec succès. Vous serez notifié de son avancement.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Postuler pour : {mission?.title}</DialogTitle>
          <DialogDescription>
            Rédigez une lettre de motivation pour vous démarquer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coverLetter">Lettre de motivation</Label>
              <Textarea
                id="coverLetter"
                placeholder="Expliquez pourquoi vous êtes le candidat idéal pour cette mission..."
                className="min-h-[150px]"
                {...register("coverLetter")}
              />
              {errors.coverLetter && <p className="text-red-500 text-sm">{errors.coverLetter.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : "Envoyer ma candidature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;