import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, UserCheck } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const WorkflowMetrics = () => {
  const [metrics, setMetrics] = useState({
    submittedAOs: 0,
    submittedCandidatures: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const fetchAllMetrics = useCallback(async () => {
    setLoading(true);
    setActivityLoading(true);

    try {
      const { count: submittedAOsCount } = await supabase.from('aos').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED');
      const { count: submittedCandidaturesCount } = await supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED');
      
      setMetrics({
        submittedAOs: submittedAOsCount || 0,
        submittedCandidatures: submittedCandidaturesCount || 0,
      });
      setLoading(false);

      const { data: recentAos } = await supabase.from('aos_with_details').select('title, company_name, created_at').order('created_at', { ascending: false }).limit(3);
      const { data: recentApps } = await supabase.from('candidatures_with_details').select('expert_name, ao_title, applied_at').order('applied_at', { ascending: false }).limit(3);

      const combinedActivity = [
        ...(recentAos || []).map(item => ({ ...item, type: 'ao', date: item.created_at })),
        ...(recentApps || []).map(item => ({ ...item, type: 'application', date: item.applied_at })),
      ];

      combinedActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(combinedActivity.slice(0, 4));
      
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setLoading(false);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMetrics();
    
    const changes = supabase.channel('workflow-metrics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aos' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatures' }, fetchAllMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, [fetchAllMetrics]);

  if (loading) {
    return <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"><Card className="p-8 flex justify-center items-center col-span-full h-24"><Spinner /></Card></div>;
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tâches prioritaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Qualifier les nouveaux Appels d'Offres</p>
                      <p className="text-sm text-muted-foreground">{metrics.submittedAOs} en attente</p>
                    </div>
                    <Button asChild variant="secondary" size="sm"><Link to="/admin/workflow?tab=qualification">Qualifier</Link></Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Valider les nouvelles candidatures</p>
                      <p className="text-sm text-muted-foreground">{metrics.submittedCandidatures} en attente</p>
                    </div>
                    <Button asChild variant="secondary" size="sm"><Link to="/admin/workflow?tab=validation">Valider</Link></Button>
                  </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {activityLoading ? <Spinner /> : recentActivity.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${item.type === 'ao' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                            {item.type === 'ao' ? <Briefcase className="h-4 w-4 text-green-500" /> : <UserCheck className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                            {item.type === 'ao' ? (
                                <>Nouvel AO <span className="font-semibold">"{item.title}"</span> soumis par <span className="font-semibold">{item.company_name}</span>.</>
                            ) : (
                                <>Candidature de <span className="font-semibold">{item.expert_name}</span> reçue pour <span className="font-semibold">"{item.ao_title}"</span>.</>
                            )}
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr })}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default WorkflowMetrics;