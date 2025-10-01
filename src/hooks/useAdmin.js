
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

export const useAdmin = () => {
  const { profile: adminProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState({
    users: [],
    aos: [],
    candidatures: [],
    hiredCandidatures: [],
    companies: [],
    experts: [],
    testimonials: [],
    announcements: [],
    blogs: [],
    interviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError(null);

    try {
      const [
        usersRes,
        aosRes,
        candidaturesRes,
        companiesRes,
        expertsRes,
        testimonialsRes,
        announcementsRes,
        blogsRes,
        interviewsRes,
      ] = await Promise.all([
        supabase.from('users_with_details').select('*'),
        supabase.from('aos_with_details').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_candidatures_view').select('*').order('applied_at', { ascending: false }),
        supabase.from('companies').select('*'),
        supabase.from('experts').select('*'),
        supabase.from('testimonials_with_author').select('*'),
        supabase.from('announcements').select('*'),
        supabase.from('blogs_with_details').select('*'),
        supabase.from('admin_interviews_details').select('*').order('created_at', { ascending: false }),
      ]);

      const errors = [
        usersRes.error,
        aosRes.error,
        candidaturesRes.error,
        companiesRes.error,
        expertsRes.error,
        testimonialsRes.error,
        announcementsRes.error,
        blogsRes.error,
        interviewsRes.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(', '));
      }

      const allCandidatures = candidaturesRes.data || [];
      const hiredCandidatures = allCandidatures.filter(c => c.status === 'HIRED');
      const activeCandidatures = allCandidatures.filter(c => c.status !== 'HIRED');
      const hiredCandidatureIds = new Set(hiredCandidatures.map(c => c.id));

      const allInterviews = interviewsRes.data || [];
      const activeInterviews = allInterviews.filter(i => !hiredCandidatureIds.has(i.candidature_id));

      setData({
        users: usersRes.data || [],
        aos: aosRes.data || [],
        candidatures: activeCandidatures,
        hiredCandidatures: hiredCandidatures,
        companies: companiesRes.data || [],
        experts: expertsRes.data || [],
        testimonials: testimonialsRes.data || [],
        announcements: announcementsRes.data || [],
        blogs: blogsRes.data || [],
        interviews: activeInterviews,
      });
    } catch (err) {
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données administrateur.',
      });
    } finally {
      setLoading(false);
    }
  }, [authLoading, toast]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('admin-dashboard-realtime');
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatures' }, (payload) => {
        console.log('Realtime update received for candidatures:', payload);
        toast({
          title: "Mise à jour en temps réel",
          description: "Les données des candidatures ont été mises à jour.",
        });
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aos' }, (payload) => {
        console.log('Realtime update received for AOs:', payload);
        toast({
          title: "Mise à jour en temps réel",
          description: "Les données des appels d'offres ont été mises à jour.",
        });
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, (payload) => {
        console.log('Realtime update received for interviews:', payload);
        toast({
          title: "Mise à jour en temps réel",
          description: "Les données des entretiens ont été mises à jour.",
        });
        refreshData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matchings' }, (payload) => {
        console.log('Realtime update received for new matching:', payload);
        toast({
          title: "Nouveau matching calculé !",
          description: "Le score de la candidature est en cours de mise à jour.",
        });
        setTimeout(() => {
          refreshData();
        }, 500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, toast, refreshData]);

  const handleUserAction = async (action, userId, data) => {
    setLoadingAction(true);
    try {
      let result;
      if (action === 'create') {
        result = await supabase.from('users').insert(data).select().single();
      } else if (action === 'update') {
        result = await supabase.from('users').update(data).eq('id', userId).select().single();
      } else if (action === 'delete') {
        result = await supabase.from('users').delete().eq('id', userId);
      } else {
        throw new Error('Action non reconnue');
      }

      if (result.error) throw result.error;
      toast({ title: 'Succès', description: `Utilisateur ${action === 'create' ? 'créé' : action === 'update' ? 'mis à jour' : 'supprimé'}.` });
      return { success: true, data: result.data };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAoSubmit = async (aoData, aoId = null) => {
    setLoadingAction(true);
    try {
      const dataToSubmit = { ...aoData, admin_id: adminProfile.id };
      let result;
      if (aoId) {
        result = await supabase.from('aos').update(dataToSubmit).eq('id', aoId).select().single();
      } else {
        result = await supabase.from('aos').insert(dataToSubmit).select().single();
      }
      if (result.error) throw result.error;
      toast({ title: 'Succès', description: `Appel d'offres ${aoId ? 'mis à jour' : 'créé'}.` });
      return { success: true, data: result.data };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAoAction = async (action, aoId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let successMessage = "";

      switch (action) {
        case 'publish':
          updateData = { status: 'PUBLISHED', rejection_reason: null };
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
          const { error: deleteError } = await supabase.from('aos').delete().eq('id', aoId);
          if (deleteError) throw deleteError;
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
      return { success: true };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApplicationAction = async (action, candidatureId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let successMessage = "";

      switch (action) {
        case 'VALIDATED':
          updateData = { status: 'VALIDATED', motif_refus: null, company_rejection_reason: null };
          successMessage = "Candidature transmise à l'entreprise.";
          break;
        case 'REJECTED_BY_ADMIN':
          updateData = { status: 'REJECTED_BY_ADMIN', motif_refus: details.motif_refus };
          successMessage = "Candidature rejetée et motif transmis à l'expert.";
          break;
        case 'withdraw_from_company':
          const { error: rpcError } = await supabase.rpc('withdraw_candidature_from_company', { p_candidature_id: candidatureId });
          if (rpcError) throw rpcError;
          successMessage = "Candidature retirée de la vue de l'entreprise.";
          break;
        case 'update_details':
          updateData = { ...details };
          successMessage = "Détails de la candidature mis à jour.";
          break;
        case 'send_rejection_to_expert':
            updateData = { motif_refus: details.motif_refus };
            successMessage = "Motif de rejet transmis à l'expert.";
            break;
        default:
          throw new Error("Action non reconnue.");
      }

      if (action !== 'withdraw_from_company') {
        const { error } = await supabase.from('candidatures').update(updateData).eq('id', candidatureId);
        if (error) throw error;
      }

      toast({ title: 'Succès', description: successMessage });
      return { success: true };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  const handleInterviewAction = async (action, interviewId, details = {}) => {
    setLoadingAction(true);
    try {
      let updateData = {};
      let successMessage = "";

      switch (action) {
        case 'confirm':
          updateData = { status: 'CONFIRMED', ...details };
          successMessage = "Entretien confirmé et notifications envoyées.";
          break;
        case 'complete':
          updateData = { status: 'COMPLETED' };
          successMessage = "Entretien marqué comme terminé.";
          break;
        case 'cancel':
          updateData = { status: 'CANCELLED' };
          successMessage = "Entretien annulé.";
          break;
        default:
          throw new Error("Action non reconnue.");
      }

      const { error } = await supabase.from('interviews').update(updateData).eq('id', interviewId);
      if (error) throw error;

      toast({ title: 'Succès', description: successMessage });
      return { success: true };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  const handleArticleAction = async (action, articleId, data) => {
    setLoadingAction(true);
    try {
      let result;
      if (action === 'create') {
        result = await supabase.from('blogs').insert(data).select().single();
      } else if (action === 'update') {
        result = await supabase.from('blogs').update(data).eq('id', articleId).select().single();
      } else if (action === 'delete') {
        result = await supabase.from('blogs').delete().eq('id', articleId);
      } else {
        throw new Error('Action non reconnue');
      }

      if (result.error) throw result.error;
      toast({ title: 'Succès', description: `Article ${action === 'create' ? 'créé' : action === 'update' ? 'mis à jour' : 'supprimé'}.` });
      return { success: true, data: result.data };
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return { success: false, error };
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    profile: adminProfile,
    ...data,
    loading: authLoading || loading,
    loadingAction,
    error,
    refreshData,
    handleUserAction,
    handleAoSubmit,
    handleAoAction,
    handleApplicationAction,
    handleInterviewAction,
    handleArticleAction,
  };
};
