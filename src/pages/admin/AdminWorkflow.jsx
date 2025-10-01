import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, CalendarCheck2, Award } from 'lucide-react';
import AdminAOsTab from '@/components/admin/workflow/AdminAOsTab';
import AdminApplicationsTab from '@/components/admin/workflow/AdminApplicationsTab';
import AdminInterviewsTab from '@/components/admin/workflow/AdminInterviewsTab';
import AdminConfirmedMissionsTab from '@/components/admin/workflow/AdminConfirmedMissionsTab';
import AdminAoDetailPanel from '@/components/admin/workflow/AdminAoDetailPanel';
import AdminApplicationDetailPanel from '@/components/admin/workflow/AdminApplicationDetailPanel';
import RejectAoDialog from '@/components/admin/workflow/RejectAoDialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useNavigate } from 'react-router-dom';

const AdminWorkflow = () => {
  const { aos, candidatures, interviews, hiredCandidatures, loading, error, handleAoAction, refreshData } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('aos');
  const [activePanel, setActivePanel] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  useEffect(() => {
    const channel = supabase.channel('admin-workflow-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aos' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatures' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, () => refreshData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshData]);

  const handleSelect = (type, data) => {
    if (activePanel && activePanel.type === type && activePanel.data.id === data.id) {
        setActivePanel(null);
    } else {
        setActivePanel({ type, data });
    }
  };

  const handleClosePanel = () => {
    setActivePanel(null);
  };
  
  const handleOverlayClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleClosePanel();
  };

  const handleUpdateAoStatus = (aoId, status) => {
    handleAoAction(status === 'PUBLISHED' ? 'publish' : status.toLowerCase(), aoId);
  };

  const handleEditAo = (aoId) => {
    navigate(`/admin/aos/edit/${aoId}`);
  };

  const handleDeleteAo = (ao) => {
    handleAoAction('delete', ao.id);
  };

  const handleConfirmRejection = (reason) => {
    if (rejectionTarget) {
      handleAoAction('reject', rejectionTarget.id, { rejection_reason: reason });
      setRejectionTarget(null);
    }
  };

  const tabs = useMemo(() => [
    { value: 'aos', label: 'Appels d\'Offres', icon: Briefcase, count: aos?.filter(ao => ao.status === 'SUBMITTED').length || 0, component: <AdminAOsTab aos={aos} onSelectAo={(ao) => handleSelect('ao', ao)} loading={loading} error={error} selectedId={activePanel?.type === 'ao' ? activePanel.data.id : null} /> },
    { value: 'applications', label: 'Candidatures', icon: FileText, count: candidatures?.filter(c => c.status === 'SUBMITTED').length || 0, component: <AdminApplicationsTab candidatures={candidatures} loading={loading} error={error} /> },
    { value: 'interviews', label: 'Entretiens', icon: CalendarCheck2, count: interviews?.filter(i => i.status === 'PENDING').length || 0, component: <AdminInterviewsTab interviews={interviews} loading={loading} error={error} /> },
    { value: 'confirmed', label: 'Missions Confirmées', icon: Award, count: 0, component: <AdminConfirmedMissionsTab hiredCandidatures={hiredCandidatures} loading={loading} /> },
  ], [aos, candidatures, interviews, hiredCandidatures, loading, error, activePanel]);

  return (
    <>
      <Helmet>
        <title>Workflow - Admin</title>
        <meta name="description" content="Gérez le workflow des appels d'offres et des candidatures." />
      </Helmet>
      <div className="flex h-full">
          <div className={cn("flex-1 p-4 lg:p-8 transition-all duration-300", activePanel ? "blur-sm pointer-events-none" : "")}>
              <div className="space-y-4 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">Workflow de Validation</h1>
                  <p className="text-muted-foreground">
                      Validez, modifiez ou rejetez les appels d'offres et les candidatures soumis par les utilisateurs.
                  </p>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
                      {tabs.map(tab => (
                          <TabsTrigger key={tab.value} value={tab.value} className="flex gap-2">
                              <tab.icon className="h-4 w-4" />
                              {tab.label}
                              {tab.count > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">{tab.count}</span>}
                          </TabsTrigger>
                      ))}
                  </TabsList>
                  {tabs.map(tab => (
                      <TabsContent key={tab.value} value={tab.value} className="mt-4">
                          {tab.component}
                      </TabsContent>
                  ))}
              </Tabs>
          </div>

          <AnimatePresence>
              {activePanel && (
                  <>
                      <motion.div
                          key="overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/30 z-40"
                          onClick={handleOverlayClick}
                      />
                      {activePanel.type === 'ao' && 
                          <AdminAoDetailPanel
                              key="ao-panel"
                              ao={activePanel.data}
                              onClose={handleClosePanel}
                              onUpdateStatus={handleUpdateAoStatus}
                              onSetRejectionTarget={setRejectionTarget}
                              onEdit={handleEditAo}
                              onDelete={handleDeleteAo}
                          />
                      }
                      {activePanel.type === 'application' && 
                          <AdminApplicationDetailPanel
                              key="app-panel"
                              application={activePanel.data}
                              onClose={handleClosePanel}
                          />
                      }
                  </>
              )}
          </AnimatePresence>
      </div>

      <RejectAoDialog
        isOpen={!!rejectionTarget}
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
        title={rejectionTarget?.title}
      />
    </>
  );
};

export default AdminWorkflow;