import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

export const useAdminActions = (refreshData, adminProfile) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUserAction = async (action, userId, data = {}) => {
    setLoadingAction(true);
    try {
      if (action === 'create') {
        const { error } = await supabase.rpc('create_user_profile_on_signup', { user_id: userId, ...data });
        if (error) throw error;
        toast({ title: "Succès", description: "Utilisateur créé avec succès." });
      } else if (action === 'update') {
        const { error } = await supabase.from('users_with_details').update(data).eq('id', userId);
        if (error) throw error;
        toast({ title: "Succès", description: "Utilisateur mis à jour." });
      } else if (action === 'delete') {
        const { error } = await supabase.rpc('delete_user', { user_id_to_delete: userId });
        if (error) throw error;
        toast({ title: "Succès", description: "Utilisateur supprimé." });
      }
      await refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAoSubmit = async (data, aoId = null) => {
    setLoadingAction(true);
    try {
      const aoData = {
        ...data,
        admin_id: adminProfile?.id,
        status: 'PUBLISHED',
      };
      
      const { error } = aoId
        ? await supabase.from('aos').update(aoData).eq('id', aoId)
        : await supabase.from('aos').insert(aoData);

      if (error) throw error;
      
      toast({ title: 'Succès!', description: `Appel d'offres ${aoId ? 'mis à jour' : 'créé'} et publié avec succès.` });
      await refreshData();
      navigate('/admin/workflow?tab=aos');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAoAction = async (action, aoId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let successMessage = '';

      switch (action) {
        case 'publish':
          updateData = { status: 'PUBLISHED' };
          successMessage = "Appel d'offres publié.";
          break;
        case 'reject':
          updateData = { status: 'REJECTED', rejection_reason: details.rejection_reason };
          successMessage = "Appel d'offres rejeté.";
          break;
        case 'archive':
          updateData = { status: 'ARCHIVED' };
          successMessage = "Appel d'offres archivé.";
          break;
        case 'delete':
          const { error } = await supabase.from('aos').delete().eq('id', aoId);
          if (error) throw error;
          successMessage = "Appel d'offres supprimé.";
          break;
        default:
          throw new Error("Action non reconnue.");
      }

      if (action !== 'delete') {
        const { error } = await supabase.from('aos').update(updateData).eq('id', aoId);
        if (error) throw error;
      }
      
      toast({ title: 'Succès', description: successMessage });
      await refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApplicationAction = useCallback(async (action, applicationId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let rpcName = null;
      let rpcParams = {};
      let successMessage = '';

      switch (action) {
        case 'validate':
          updateData = { status: 'VALIDATED' };
          successMessage = 'Candidature validée et transmise à l\'entreprise.';
          break;
        case 'reject':
          updateData = { status: 'REJECTED_BY_ADMIN', motif_refus: details.reason };
          successMessage = 'Candidature rejetée.';
          break;
        case 'withdraw':
          rpcName = 'withdraw_candidature_from_company';
          rpcParams = { p_candidature_id: applicationId };
          successMessage = 'Candidature retirée de la vue de l\'entreprise.';
          break;
        default:
          throw new Error('Action non reconnue.');
      }

      if (rpcName) {
        const { error } = await supabase.rpc(rpcName, rpcParams);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('candidatures').update(updateData).eq('id', applicationId);
        if (error) throw error;
      }

      toast({ title: 'Succès', description: successMessage });
      await refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  }, [toast, refreshData]);
  
  const handleInterviewAction = useCallback(async (action, interviewId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let successMessage = '';
  
      switch (action) {
        case 'confirm':
          updateData = { 
            status: 'CONFIRMED', 
            confirmed_time: details.confirmed_time,
            meeting_link: details.meeting_link 
          };
          successMessage = 'Entretien confirmé et notifications envoyées.';
          break;
        case 'complete':
          updateData = { status: 'COMPLETED' };
          successMessage = 'Entretien marqué comme terminé.';
          break;
        case 'cancel':
          updateData = { status: 'CANCELLED' };
          successMessage = 'Entretien annulé.';
          break;
        default:
          throw new Error('Action non reconnue.');
      }
  
      const { error } = await supabase.from('interviews').update(updateData).eq('id', interviewId);
      if (error) throw error;
  
      toast({ title: 'Succès', description: successMessage });
      await refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  }, [toast, refreshData]);

  const handleArticleAction = async (action, slug, data) => {
    setLoadingAction(true);
    try {
      if (action === 'delete') {
        const { error } = await supabase.from('blogs').delete().eq('slug', slug);
        if (error) throw error;
        toast({ title: "Succès", description: "Article supprimé." });
      }
      await refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    loadingAction,
    handleUserAction,
    handleAoSubmit,
    handleAoAction,
    handleApplicationAction,
    handleInterviewAction,
    handleArticleAction,
  };
};