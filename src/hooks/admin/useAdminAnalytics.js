import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { format, startOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusTranslations = {
    // AO Statuses
    DRAFT: 'Brouillon',
    SUBMITTED: 'Soumis',
    PUBLISHED: 'Publié',
    REJECTED: 'Rejeté',
    ARCHIVED: 'Archivé',
    EXPIRED: 'Expiré',
    // Candidature Statuses
    VALIDATED: 'Validée',
    REJECTED_BY_ADMIN: 'Refusée (Admin)',
    REJECTED_BY_ENTERPRISE: 'Refusée (Entreprise)',
    INTERVIEW_REQUESTED: 'Entretien demandé',
    HIRED: 'Recruté(e)',
    WITHDRAWN: 'Retirée',
    // Default
    Inconnu: 'Inconnu'
};

const processDataByMonth = (data, dateField) => {
    const monthlyCounts = data.reduce((acc, item) => {
        const month = format(parseISO(item[dateField]), 'MMM yyyy', { locale: fr });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(monthlyCounts)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => new Date(a.name) - new Date(b.name));
};

const processStatusDistribution = (data, statusField) => {
    const statusCounts = data.reduce((acc, item) => {
        const status = item[statusField] || 'Inconnu';
        const translatedStatus = statusTranslations[status] || status;
        acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
};

const processUserGrowth = (data) => {
    const sortedUsers = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let expertCount = 0;
    let companyCount = 0;
    
    const growthData = sortedUsers.map(user => {
        if (user.role === 'expert') expertCount++;
        if (user.role === 'company') companyCount++;
        return {
            date: format(new Date(user.created_at), 'yyyy-MM-dd'),
            Experts: expertCount,
            Companies: companyCount,
        };
    });

    const monthlyGrowth = growthData.reduce((acc, item) => {
        const month = format(parseISO(item.date), 'MMM yyyy', { locale: fr });
        acc[month] = { Experts: item.Experts, Companies: item.Companies };
        return acc;
    }, {});

    return Object.entries(monthlyGrowth)
        .map(([name, values]) => ({ name, ...values }))
        .sort((a,b) => {
            const dateA = new Date(Date.parse(`01 ${a.name.replace(' ', ' 20')}`));
            const dateB = new Date(Date.parse(`01 ${b.name.replace(' ', ' 20')}`));
            return dateA - dateB;
        });
};

const processTopCompanies = (aosData, companyMap) => {
  const companyCounts = aosData.reduce((acc, item) => {
    const companyName = companyMap.get(item.company_id);
    if (companyName) {
      acc[companyName] = (acc[companyName] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(companyCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

export const useAdminAnalytics = () => {
    const { toast } = useToast();
    const [analyticsData, setAnalyticsData] = useState({
        kpis: { users: 0, experts: 0, companies: 0, aos: 0, candidatures: 0, hired: 0 },
        userGrowth: [],
        aoStatusDistribution: [],
        candidatureStatusDistribution: [],
        monthlyActivity: [],
        topCompanies: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                { data: users, error: usersError },
                { data: aos, error: aosError },
                { data: candidatures, error: candidaturesError },
                { data: companies, error: companiesError }
            ] = await Promise.all([
                supabase.from('users').select('id, role, created_at'),
                supabase.from('aos').select('id, status, created_at, company_id'),
                supabase.from('candidatures').select('id, status, applied_at'),
                supabase.from('companies').select('id, name')
            ]);
            
            if (usersError || aosError || candidaturesError || companiesError) {
                throw new Error(usersError?.message || aosError?.message || candidaturesError?.message || companiesError?.message);
            }

            const companyIdToNameMap = new Map(companies.map(c => [c.id, c.name]));

            const processedData = {
                kpis: {
                    users: users.length,
                    experts: users.filter(u => u.role === 'expert').length,
                    companies: users.filter(u => u.role === 'company').length,
                    aos: aos.length,
                    candidatures: candidatures.length,
                    hired: candidatures.filter(c => c.status === 'HIRED').length,
                },
                userGrowth: processUserGrowth(users),
                aoStatusDistribution: processStatusDistribution(aos, 'status'),
                candidatureStatusDistribution: processStatusDistribution(candidatures, 'status'),
                monthlyActivity: (() => {
                    const monthlyAOs = processDataByMonth(aos, 'created_at');
                    const monthlyCandidatures = processDataByMonth(candidatures, 'applied_at');
                    
                    const allMonths = [...new Set([...monthlyAOs.map(d => d.name), ...monthlyCandidatures.map(d => d.name)])];
                    
                    return allMonths.map(month => ({
                        name: month,
                        Offres: monthlyAOs.find(d => d.name === month)?.total || 0,
                        Candidatures: monthlyCandidatures.find(d => d.name === month)?.total || 0,
                    })).sort((a,b) => {
                        const dateA = new Date(Date.parse(`01 ${a.name.replace(' ', ' 20')}`));
                        const dateB = new Date(Date.parse(`01 ${b.name.replace(' ', ' 20')}`));
                        return dateA - dateB;
                    });
                })(),
                topCompanies: processTopCompanies(aos.filter(ao => ao.status === 'PUBLISHED'), companyIdToNameMap),
            };
            
            setAnalyticsData(processedData);

        } catch (err) {
            setError(err);
            toast({ variant: 'destructive', title: 'Erreur de chargement des Analytics', description: err.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...analyticsData, loading, error, refresh: fetchData };
};