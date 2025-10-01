import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/common/Spinner';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { LayoutDashboard, Briefcase, Users, Calendar, Settings, Menu, X, FolderKanban, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { cn } from '@/lib/utils/cn';

import OverviewTab from '@/components/company/dashboard/OverviewTab';
import CompanySettings from '@/pages/company/CompanySettings';
import AOsTab from '@/components/company/AOsTab';
import ApplicationsTab from '@/components/company/ApplicationsTab';
import CompanyCreateAO from './CreateAO';
import CompanyAoDetailPanel from '@/components/company/panels/CompanyAoDetailPanel';
import CompanyApplicationDetailPanel from '@/components/company/panels/CompanyApplicationDetailPanel';
import SidebarContent from '@/components/company/layout/SidebarContent';
import PlanningTab from '@/components/company/PlanningTab';
import DocumentsTab from '@/components/company/DocumentsTab';
import MyTeamTab from '@/components/company/MyTeamTab';

const CompanyDashboard = () => {
  const { profile, aos, candidatures, hiredCandidatures, notifications, blogPosts, loading, error, refreshData, duplicateAo, handleAoAction, handleApplicationAction, loadingAction } = useCompany();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingAOId, setEditingAOId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'dashboard');

  const isNestedRoute = params.slug || params.candidatureId;

  useEffect(() => {
    if (!user) return;
    const channel = supabase
        .channel(`notifications:company:${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            (payload) => {
                toast({ variant: 'success', title: "🔔 Nouvelle notification", description: payload.new.message });
                refreshData();
            }
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, refreshData, toast]);

  useEffect(() => {
    let tab = queryParams.get('tab') || 'dashboard';
    if (tab === 'profile') {
      tab = 'settings';
    }
    const aoId = queryParams.get('ao_id');
    const appId = queryParams.get('app_id');

    if (tab === 'create_ao' || tab === 'edit_ao' || tab === 'duplicate_ao') {
      setActiveTab('offers');
    } else {
      setActiveTab(tab);
    }
    
    setEditingAOId(aoId);

    if (appId && candidatures.length > 0) {
        const app = candidatures.find(c => c.candidature_id === appId);
        if (app) setActivePanel({ type: 'application', data: app });
    } else if (tab !== 'applications') {
        if (activePanel?.type === 'application') setActivePanel(null);
    }
    if(tab !== 'offers') {
        if (activePanel?.type === 'ao') setActivePanel(null);
    }

  }, [queryParams, candidatures, activePanel?.type]);

  const handleTabChange = useCallback((tab) => {
    navigate(`/company/dashboard?tab=${tab}`);
    setIsMobileMenuOpen(false);
    setActivePanel(null);
  }, [navigate]);
  
  const handleSelect = (type, data) => {
    const currentId = activePanel?.data?.id || activePanel?.data?.candidature_id;
    const newId = data?.id || data?.candidature_id;

    if (activePanel && activePanel.type === type && currentId === newId) {
        setActivePanel(null);
    } else {
        setActivePanel({ type, data });
        if(type === 'application'){
            navigate(`/company/dashboard?tab=applications&app_id=${newId}`);
        }
    }
  };

  const handleClosePanel = useCallback(() => {
    if(activePanel?.type === 'application') {
        navigate(`/company/dashboard?tab=applications`);
    }
    if(activePanel?.type === 'ao') {
        navigate(`/company/dashboard?tab=offers`);
    }
    setActivePanel(null);
  }, [navigate, activePanel]);

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClosePanel();
  };

  const handleCreateNewAO = () => navigate('/company/dashboard?tab=create_ao');
  const handleEditAO = (ao) => navigate(`/company/dashboard?tab=edit_ao&ao_id=${ao.id}`);
  const handleDuplicateAO = (ao) => duplicateAo(ao).then(() => navigate('/company/dashboard?tab=offers'));
  const handleDeleteAO = (aoId) => handleAoAction('delete', aoId).then(() => handleClosePanel());
  
  const handleFormFinished = () => {
      refreshData();
      navigate('/company/dashboard?tab=offers');
  };
  
  if (loading && !profile) {
    return <div className="flex h-screen items-center justify-center bg-background"><Spinner size="lg" /></div>;
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-destructive">Une erreur est survenue lors du chargement de votre tableau de bord.</p>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }
  
  const navItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'offers', label: 'Mes Offres', icon: Briefcase },
      { id: 'applications', label: 'Candidatures', icon: Users },
      { id: 'planning', label: 'Planning Entretiens', icon: Calendar },
      { id: 'team', label: 'Mon Équipe', icon: ShieldCheck },
      { id: 'documents', label: 'Mes Documents', icon: FolderKanban },
      { id: 'settings', label: 'Paramètres', icon: Settings },
  ];
  
  const renderContent = () => {
    if (isNestedRoute) {
      return <Outlet />;
    }

    const tabFromUrl = queryParams.get('tab');
    if (tabFromUrl === 'create_ao' || (tabFromUrl === 'edit_ao' && editingAOId)) {
        return <ErrorBoundary><CompanyCreateAO aoId={editingAOId} onFinished={handleFormFinished} onBack={() => navigate('/company/dashboard?tab=offers')}/></ErrorBoundary>;
    }

    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="dashboard" className="m-0">
          <ErrorBoundary><OverviewTab aos={aos} candidatures={candidatures} notifications={notifications} blogPosts={blogPosts} loading={loading} onNavigateToCreateAO={handleCreateNewAO} onTabChange={handleTabChange}/></ErrorBoundary>
        </TabsContent>
        <TabsContent value="offers" className="m-0">
          <ErrorBoundary><AOsTab aos={aos} loading={loading || loadingAction} onEdit={handleEditAO} onCreateNew={handleCreateNewAO} onDuplicate={handleDuplicateAO} onSelect={(ao) => handleSelect('ao', ao)} onArchive={(aoId) => handleAoAction('archive', aoId)} onDelete={handleDeleteAO} selectedId={activePanel?.type === 'ao' ? activePanel.data.id : null} /></ErrorBoundary>
        </TabsContent>
        <TabsContent value="applications" className="m-0">
          <ErrorBoundary><ApplicationsTab candidatures={candidatures} aos={aos} loading={loading || loadingAction} onSelect={(app) => handleSelect('application', app)} selectedId={activePanel?.type === 'application' ? activePanel.data.candidature_id : null} /></ErrorBoundary>
        </TabsContent>
        <TabsContent value="planning" className="m-0"><ErrorBoundary><PlanningTab onHire={handleApplicationAction} loadingAction={loadingAction} /></ErrorBoundary></TabsContent>
        <TabsContent value="team" className="m-0"><ErrorBoundary><MyTeamTab hiredCandidatures={hiredCandidatures} loading={loading} /></ErrorBoundary></TabsContent>
        <TabsContent value="documents" className="m-0"><ErrorBoundary><DocumentsTab /></ErrorBoundary></TabsContent>
        <TabsContent value="settings" className="m-0"><ErrorBoundary><CompanySettings /></ErrorBoundary></TabsContent>
      </Tabs>
    );
  };

  const displayName = profile?.display_name || 'Entreprise';

  return (
    <>
      <Helmet>
        <title>Tableau de bord - {displayName}</title>
        <meta name="description" content={`Tableau de bord de l'entreprise ${displayName}. Gérez vos missions et candidatures.`} />
      </Helmet>
      
      <div className="theme-company w-full min-h-screen bg-muted/40 lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:flex flex-col border-r bg-background h-screen sticky top-0">
          <SidebarContent navItems={navItems} activeTab={activeTab} handleTabChange={handleTabChange} profile={profile} user={user} signOut={signOut} navigate={navigate} />
        </aside>

        <div className="flex flex-col flex-1 lg:h-screen">
          <header className="flex h-20 items-center gap-4 border-b bg-background px-6 sticky top-0 z-30 lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
              </Button>
          </header>
          <main className={cn("flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-300", activePanel ? "blur-sm pointer-events-none" : "")}>
            <motion.div
                key={location.pathname + location.search} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
          </main>
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
                {activePanel?.type === 'ao' && (
                <CompanyAoDetailPanel 
                    key="panel-ao"
                    ao={activePanel.data}
                    onClose={handleClosePanel}
                    onEdit={handleEditAO}
                    onDuplicate={handleDuplicateAO}
                    onDelete={handleDeleteAO}
                />
                )}
                {activePanel?.type === 'application' && (
                  <CompanyApplicationDetailPanel 
                    key="panel-application"
                    application={activePanel.data}
                    onClose={handleClosePanel}
                    onAction={(action, details) => handleApplicationAction(action, activePanel.data, details)}
                    loadingAction={loadingAction}
                  />
                )}
            </>
          )}
        </AnimatePresence>
          
        <AnimatePresence>
          {isMobileMenuOpen && (
              <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed inset-0 z-50 flex flex-col w-full max-w-sm border-r bg-background lg:hidden"
              >
                  <SidebarContent navItems={navItems} activeTab={activeTab} handleTabChange={handleTabChange} profile={profile} user={user} signOut={signOut} navigate={navigate} />
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 ml-auto h-8 w-8" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-4 w-4" />
                  </Button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CompanyDashboard;