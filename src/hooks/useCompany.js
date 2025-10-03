import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export const useCompany = () => {
    const { profile: companyProfile, loading: authLoading, refreshProfile: authRefreshProfile } = useAuth();
    const { toast } = useToast();
    const [data, setData] = useState({
        aos: [],
        candidatures: [],
        hiredCandidatures: [],
        notifications: [],
        blogPosts: [],
        testimonials: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    const fetchData = useCallback(async(currentProfile, forceRefresh = false) => {
        if (!currentProfile || !currentProfile.company_profile_id || !currentProfile.id) {
            if (!authLoading) setLoading(false);
            return;
        }

        const cacheKey = currentProfile.id;
        const cachedData = cache[cacheKey];

        if (!forceRefresh && cachedData && (new Date() - cachedData.timestamp < CACHE_DURATION)) {
            setData(cachedData.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const companyId = currentProfile.company_profile_id;
            const userId = currentProfile.id;

            const { data: aosData, error: aosError } = await supabase
                .from('aos_with_details')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (aosError) throw aosError;

            const aoIds = aosData.map(ao => ao.id);
            let allCandidaturesData = [];
            let hiredCandidaturesData = [];

            if (aoIds.length > 0) {
                const { data: anonCandidaturesData, error: candidaturesError } = await supabase
                    .from('anonymized_candidatures')
                    .select('*')
                    .in('ao_id', aoIds)
                    // Fetch all relevant statuses, filtering will happen client-side
                    .in('status', ['VALIDATED', 'INTERVIEW_REQUESTED', 'REJECTED_BY_ENTERPRISE'])
                    .order('created_at', { ascending: false });

                if (candidaturesError) throw candidaturesError;

                allCandidaturesData = anonCandidaturesData.map(c => {
                    const ao = aosData.find(ao => ao.id === c.ao_id);
                    return {
                        ...c,
                        ao_title: ao && ao.title ? ao.title : 'Mission inconnue'
                    };
                });

                // Récupérer les vraies informations des experts embauchés (DÉSANONYMISATION)
                const { data: hiredCandidatures, error: hiredError } = await supabase
                    .from('candidatures')
                    .select('id, ao_id, expert_id, applied_at, updated_at, motivation, tjm_propose, date_disponibilite, projets_similaires, motif_refus, linkedin_url, cv_url, dossier_candidature_url, status')
                    .in('ao_id', aoIds)
                    .eq('status', 'HIRED')
                    .order('updated_at', { ascending: false });

                console.log('✅ Candidatures HIRED brutes:', hiredCandidatures);
                console.log('❌ Erreur si présente:', hiredError);

                if (!hiredError && hiredCandidatures && hiredCandidatures.length > 0) {
                    // Récupérer les IDs des experts depuis les candidatures
                    const expertIds = hiredCandidatures.map(c => c.expert_id).filter(Boolean);
                    console.log('🔑 Expert IDs extraits:', expertIds);

                    // Récupérer les infos des experts en une seule requête
                    const { data: expertsData, error: expertsError } = await supabase
                        .from('experts')
                        .select('id, user_id, first_name, last_name, profile_picture_url, title, phone_number')
                        .in('id', expertIds);

                    console.log('✅ Experts récupérés:', expertsData);
                    console.log('❌ Erreur experts si présente:', expertsError);

                    // Créer un map pour accès rapide
                    const expertsMap = {};
                    if (expertsData) {
                        expertsData.forEach(exp => {
                            expertsMap[exp.id] = exp;
                        });
                    }

                    // Combiner les données
                    hiredCandidaturesData = hiredCandidatures.map(c => {
                        const ao = aosData.find(ao => ao.id === c.ao_id);
                        const expert = expertsMap[c.expert_id];

                        console.log(`📊 Mapping candidature ${c.id}:`, {
                            candidature_id: c.id,
                            expert_id: c.expert_id,
                            expert_found: expert,
                            expert_name: expert ? `${expert.first_name} ${expert.last_name}` : 'Non trouvé'
                        });

                        return {
                            ...c,
                            candidature_id: c.id, // S'assurer que candidature_id est présent
                            ao_title: ao && ao.title ? ao.title : 'Mission inconnue',
                            expert_name: expert && expert.first_name && expert.last_name ?
                                `${expert.first_name} ${expert.last_name}` : 'Expert',
                            expert_avatar_url: expert && expert.profile_picture_url ? expert.profile_picture_url : null,
                            expert_title: expert && expert.title ? expert.title : '',
                            expert_phone: expert && expert.phone_number ? expert.phone_number : '',
                        };
                    });

                    console.log('✅ Experts désanonymisés (final):', hiredCandidaturesData);
                }
            }

            const activeCandidatures = allCandidaturesData;
            const hiredCandidatures = hiredCandidaturesData;

            const promises = [
                supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(res => ({...res, source: 'notifications' })),
                supabase.from('blogs_with_details').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(3).then(res => ({...res, source: 'blogPosts' })),
                supabase.from('testimonials').select('*').eq('author_user_id', userId).then(res => ({...res, source: 'testimonials' })),
            ];

            const results = await Promise.allSettled(promises);

            const loadedData = {
                aos: aosData || [],
                candidatures: activeCandidatures,
                hiredCandidatures: hiredCandidatures,
                notifications: [],
                blogPosts: [],
                testimonials: [],
            };
            const errors = [];

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    const res = result.value;
                    if (res.error) {
                        errors.push({ source: res.source, message: res.error.message });
                    } else {
                        loadedData[res.source] = res.data || [];
                    }
                } else {
                    errors.push({ source: 'unknown', message: result.reason.message });
                }
            });

            setData(loadedData);
            cache[cacheKey] = { data: loadedData, timestamp: new Date() };

            if (errors.length > 0) {
                const errorMessage = `Erreurs partielles lors du chargement: ${errors.map(e => e.source).join(', ')}.`;
                setError(new Error(errorMessage));
                toast({
                    variant: 'destructive',
                    title: 'Avertissement',
                    description: `Certaines données n'ont pas pu être chargées.`,
                });
            }

        } catch (err) {
            setError(err);
            toast({
                variant: 'destructive',
                title: 'Erreur de chargement',
                description: 'Impossible de charger les données de votre tableau de bord. Veuillez réessayer.',
            });
        } finally {
            setLoading(false);
        }
    }, [authLoading, toast]);

    useEffect(() => {
        if (!authLoading && companyProfile) {
            fetchData(companyProfile);
        } else if (!authLoading) {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, companyProfile]);

    const refreshData = useCallback(async() => {
        if (companyProfile) {
            await fetchData(companyProfile, true);
        }
    }, [companyProfile, fetchData]);

    const handleAoSubmit = async(aoData, aoId = null) => {
        setLoadingAction(true);
        try {
            let result;
            if (aoId) {
                const { data, error } = await supabase
                    .from('aos')
                    .update(aoData)
                    .eq('id', aoId)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await supabase
                    .from('aos')
                    .insert(aoData)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            }
            toast({
                title: "Succès",
                description: `L'appel d'offres a été ${aoId ? 'mis à jour' : 'créé'} avec succès.`,
            });
            await refreshData();
            return { success: true, data: result };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Une erreur est survenue : ${error.message}`,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const duplicateAo = async(originalAo) => {
        setLoadingAction(true);
        try {
            if (!originalAo) {
                throw new Error("Les données de l'appel d'offres original sont manquantes.");
            }

            const newAoData = {
                company_id: originalAo.company_id,
                admin_id: originalAo.admin_id,
                title: `${originalAo.title} (Copie)`,
                description: originalAo.description,
                location: originalAo.location,
                tjm_range: originalAo.tjm_range,
                contract_type: originalAo.contract_type,
                required_skills: originalAo.required_skills,
                work_arrangement: originalAo.work_arrangement,
                duration: originalAo.duration,
                experience_level: originalAo.experience_level,
                candidature_deadline: originalAo.candidature_deadline,
                company_name: originalAo.company_name,
                status: 'DRAFT',
                rejection_reason: null,
            };

            const { data: newAo, error: insertError } = await supabase
                .from('aos')
                .insert(newAoData)
                .select()
                .single();

            if (insertError) throw insertError;

            toast({
                title: "Succès",
                description: "L'appel d'offres a été dupliqué en tant que brouillon.",
            });
            await refreshData();
            return { success: true, data: newAo };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur de duplication",
                description: error.message,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const handleApplicationAction = async(action, application, details = {}) => {
        setLoadingAction(true);
        const candidatureId = application.candidature_id;
        try {
            let updateData = {};
            let successMessage = "";

            switch (action) {
                case 'REJECTED_BY_ENTERPRISE':
                    updateData = { status: 'REJECTED_BY_ENTERPRISE', company_rejection_reason: details.reason };
                    successMessage = "Candidature rejetée. Nos équipes ont été notifiées.";
                    break;
                case 'HIRED':
                    updateData = { status: 'HIRED' };
                    successMessage = "Félicitations, l'expert a été recruté et ajouté à votre équipe !";
                    break;
                default:
                    throw new Error("Action non reconnue.");
            }

            const { error } = await supabase
                .from('candidatures')
                .update(updateData)
                .eq('id', candidatureId);

            if (error) throw error;

            toast({
                title: "Succès",
                description: successMessage,
            });
            await refreshData();
            return { success: true };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Une erreur est survenue : ${error.message}`,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const handleAoAction = async(action, aoId) => {
        setLoadingAction(true);
        try {
            let successMessage = "";

            if (action === 'archive') {
                const { error } = await supabase.from('aos').update({ status: 'ARCHIVED' }).eq('id', aoId);
                if (error) throw error;
                successMessage = "L'appel d'offres a été archivé.";
            } else if (action === 'delete') {
                const { count, error: countError } = await supabase
                    .from('candidatures')
                    .select('*', { count: 'exact', head: true })
                    .eq('ao_id', aoId);

                if (countError) throw countError;

                if (count > 0) {
                    throw new Error("Impossible de supprimer une offre avec des candidatures. Veuillez d'abord archiver l'offre.");
                }

                const { error } = await supabase.from('aos').delete().eq('id', aoId);
                if (error) throw error;
                successMessage = "L'appel d'offres a été supprimé.";
            } else {
                throw new Error("Action non reconnue.");
            }

            toast({
                title: "Succès",
                description: successMessage,
            });
            await refreshData();
            return { success: true };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur de suppression",
                description: error.message,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const requestInterview = async(candidatureId, slots, notes) => {
        setLoadingAction(true);
        try {
            const { error } = await supabase.rpc('request_interview', {
                p_candidature_id: candidatureId,
                p_scheduled_times: slots,
                p_notes: notes,
            });

            if (error) throw error;

            toast({
                title: "Succès",
                description: "La proposition d'entretien a bien été envoyée à l'administrateur.",
            });
            await refreshData();
            return { success: true };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Une erreur est survenue : ${error.message}`,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    const updateInterviewProposal = async(candidatureId, slots, notes) => {
        setLoadingAction(true);
        try {
            const { error } = await supabase.rpc('update_interview_proposal', {
                p_candidature_id: candidatureId,
                p_scheduled_times: slots,
                p_notes: notes,
            });

            if (error) throw error;

            toast({
                title: "Succès",
                description: "La proposition d'entretien a été mise à jour.",
            });
            await refreshData();
            return { success: true };
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Une erreur est survenue lors de la mise à jour : ${error.message}`,
            });
            return { success: false, error };
        } finally {
            setLoadingAction(false);
        }
    };

    return {
        profile: companyProfile,
        ...data,
        loading: authLoading || loading,
        loadingAction,
        error,
        refreshData,
        refreshProfile: authRefreshProfile,
        handleAoSubmit,
        duplicateAo,
        handleApplicationAction,
        handleAoAction,
        requestInterview,
        updateInterviewProposal,
    };
};