import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export const useExpert = () => {
    const { profile: expertProfile, loading: authLoading, refreshProfile: authRefreshProfile } = useAuth();
    const { toast } = useToast();
    const [data, setData] = useState({
        aos: [],
        candidatures: [],
        hiredProjects: [],
        notifications: [],
        blogPosts: [],
        testimonials: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async(currentProfile, forceRefresh = false) => {
        if (!currentProfile ? .expert_profile_id || !currentProfile ? .id) {
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
            const expertId = currentProfile.expert_profile_id;
            const userId = currentProfile.id;

            const promises = [
                supabase.from('aos_with_details').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }).then(res => ({...res, source: 'aos' })),
                supabase.from('candidatures_with_details').select('ao_id, status').eq('expert_id', expertId).then(res => ({...res, source: 'application_statuses' })),
                supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(res => ({...res, source: 'notifications' })),
                supabase.from('blogs_with_details').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(3).then(res => ({...res, source: 'blogPosts' })),
                supabase.from('testimonials').select('*').eq('author_user_id', userId).then(res => ({...res, source: 'testimonials' })),
            ];

            const fullCandidaturesPromise = supabase
                .from('candidatures')
                .select(`
          id, ao_id, expert_id, applied_at, updated_at, motivation, tjm_propose,
          date_disponibilite, projets_similaires, motif_refus, linkedin_url, cv_url,
          dossier_candidature_url, status, admin_rejection_reason, company_rejection_reason,
          matching_id, matching_score, upload_type,
          aos ( 
            id, 
            title, 
            description, 
            location, 
            tjm_range, 
            contract_type, 
            required_skills, 
            work_arrangement, 
            duration, 
            experience_level,
            company_name,
            candidature_deadline,
            created_at,
            company_id,
            companies (
              id,
              name,
              logo_url,
              description,
              website,
              city,
              address,
              postal_code,
              country
            )
          )
        `)
                .eq('expert_id', expertId)
                .order('applied_at', { ascending: false });

            const [results, fullCandidaturesRes] = await Promise.all([
                Promise.allSettled(promises),
                fullCandidaturesPromise,
            ]);

            const loadedData = {
                aos: [],
                candidatures: [],
                hiredProjects: [],
                notifications: [],
                blogPosts: [],
                testimonials: [],
            };
            const errors = [];

            let applicationStatusData = [];

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    const res = result.value;
                    if (res.error) {
                        errors.push({ source: res.source, message: res.error.message });
                    } else {
                        if (res.source === 'application_statuses') {
                            applicationStatusData = res.data || [];
                        } else {
                            loadedData[res.source] = res.data || [];
                        }
                    }
                } else {
                    errors.push({ source: 'unknown', message: result.reason.message });
                }
            });

            if (fullCandidaturesRes.error) {
                errors.push({ source: 'full_candidatures', message: fullCandidaturesRes.error.message });
            } else {
                const allCandidatures = (fullCandidaturesRes.data || []).map(c => {
                    // Récupération des données de l'entreprise via la jointure
                    const company = c.aos ? .companies;
                    const companyName = company ? .name || c.aos ? .company_name || 'Non spécifié';

                    return {
                        ...c,
                        // Informations de l'AO
                        ao_title: c.aos ? .title || 'Titre non disponible',
                        ao_description: c.aos ? .description || '',
                        ao_location: c.aos ? .location || 'Non spécifié',
                        ao_tjm_range: c.aos ? .tjm_range || 'Non spécifié',
                        ao_contract_type: c.aos ? .contract_type || 'Non spécifié',
                        ao_required_skills: c.aos ? .required_skills || [],
                        ao_work_arrangement: c.aos ? .work_arrangement || 'Non spécifié',
                        ao_duration: c.aos ? .duration || 'Non spécifié',
                        ao_experience_level: c.aos ? .experience_level || [],
                        ao_candidature_deadline: c.aos ? .candidature_deadline || null,
                        ao_created_at: c.aos ? .created_at || null,

                        // Informations de l'entreprise (via jointure)
                        company_name: companyName,
                        company_logo: company ? .logo_url || null,
                        company_description: company ? .description || '',
                        company_website: company ? .website || null,
                        company_city: company ? .city || null,
                        company_address: company ? .address || null,
                        company_postal_code: company ? .postal_code || null,
                        company_country: company ? .country || null,
                        company_id: c.aos ? .company_id || null,
                    };
                });
                loadedData.candidatures = allCandidatures;
                loadedData.hiredProjects = allCandidatures.filter(c => c.status === 'HIRED');
            }

            const applicationStatusMap = new Map();
            applicationStatusData.forEach(app => {
                if (app.ao_id) {
                    applicationStatusMap.set(app.ao_id, app.status);
                }
            });

            loadedData.aos = loadedData.aos.map(ao => ({
                ...ao,
                application_status: applicationStatusMap.get(ao.id) || null,
            }));

            if (loadedData.candidatures.length > 0) {
                const candidatureIds = loadedData.candidatures.map(c => c.id);
                const { data: interviews, error: interviewsError } = await supabase
                    .from('interviews')
                    .select('*')
                    .in('candidature_id', candidatureIds)
                    .eq('status', 'CONFIRMED');

                if (interviewsError) {
                    errors.push({ source: 'interviews', message: interviewsError.message });
                } else if (interviews) {
                    const interviewsMap = interviews.reduce((acc, interview) => {
                        acc[interview.candidature_id] = interview;
                        return acc;
                    }, {});
                    loadedData.candidatures = loadedData.candidatures.map(c => ({
                        ...c,
                        interview: interviewsMap[c.id] || null,
                    }));
                }
            }

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
        if (!authLoading && expertProfile) {
            fetchData(expertProfile);
        } else if (!authLoading) {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, expertProfile]);

    const refreshData = useCallback(async() => {
        if (expertProfile) {
            await fetchData(expertProfile, true);
        }
    }, [expertProfile, fetchData]);

    return { profile: expertProfile, ...data, loading: authLoading || loading, error, refreshData, refreshProfile: authRefreshProfile };
};