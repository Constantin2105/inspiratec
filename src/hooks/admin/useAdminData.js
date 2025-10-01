import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export const useAdminData = (adminProfile, authLoading) => {
  const { toast } = useToast();
  const [data, setData] = useState({
    users: [],
    aos: [],
    candidatures: [],
    companies: [],
    experts: [],
    testimonials: [],
    announcements: [],
    blogs: [],
    interviews: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'adminData';
    const cachedData = cache[cacheKey];

    if (!forceRefresh && cachedData && (new Date() - cachedData.timestamp < CACHE_DURATION)) {
        setData(cachedData.data);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const allPromises = {
        users: supabase.from('users_with_details').select('*'),
        aos: supabase.from('aos_with_details').select('*').not('status', 'eq', 'DRAFT').order('created_at', { ascending: false }),
        candidatures: supabase.from('admin_candidatures_view').select('*').not('status', 'eq', 'DRAFT').order('applied_at', { ascending: false }),
        companies: supabase.from('companies').select('*'),
        experts: supabase.from('experts').select('*'),
        testimonials: supabase.from('testimonials_with_author').select('*'),
        announcements: supabase.from('announcements').select('*'),
        blogs: supabase.from('blogs_with_details').select('*'),
        interviews: supabase.from('admin_interviews_details').select('*'),
      };
      
      const results = await Promise.all(Object.entries(allPromises).map(([key, promise]) => promise.then(res => ({ key, ...res }))));

      const loadedData = {};
      const errors = [];

      results.forEach(result => {
        if (result.error) {
          errors.push({ source: result.key, message: result.error.message });
        } else {
          loadedData[result.key] = result.data || [];
        }
      });
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: chartData, error: chartError } = await supabase
        .from('candidatures')
        .select('applied_at')
        .gte('applied_at', sevenDaysAgo.toISOString());
      
      if(chartError) errors.push({ source: 'chartData', message: chartError.message });
      else loadedData.chartData = chartData;

      setData(loadedData);
      cache[cacheKey] = { data: loadedData, timestamp: new Date() };

      if (errors.length > 0) {
        const errorMessage = `Erreurs partielles: ${errors.map(e => `${e.source}: ${e.message}`).join('; ')}.`;
        setError(new Error(errorMessage));
        toast({ variant: 'destructive', title: 'Avertissement', description: `Certaines données n'ont pas pu être chargées.` });
      }
    } catch (err) {
      setError(err);
      toast({ variant: 'destructive', title: 'Erreur de chargement', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminProfile) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, adminProfile, fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { ...data, loading, error, refreshData };
};