import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useExpert } from '@/hooks/useExpert';
    import { useAuth } from '@/contexts/AuthContext';
    import Spinner from '@/components/common/Spinner';
    import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabase/client';
    import { LayoutDashboard, Briefcase, User, LogOut, Menu, Settings, ChevronRight, LifeBuoy, X, FolderKanban, Award } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import AvatarViewer from '@/components/common/AvatarViewer';
    import { Tabs, TabsContent } from "@/components/ui/tabs";
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Separator } from '@/components/ui/separator';
    import { cn } from '@/lib/utils/cn';
    import { useMediaQuery } from '@/hooks/useMediaQuery';

    import OverviewTab from '@/components/expert/OverviewTab.jsx';
    import MissionsTab from '@/components/expert/MissionsTab';
    import MyProjectsTab from '@/components/expert/MyProjectsTab';
    import ExpertSettings from '@/pages/expert/ExpertSettings';
    import ProfileTab from '@/components/expert/ProfileTab';
    import ExpertAoDetailPanel from '@/components/expert/ExpertAoDetailPanel';
    import DocumentsTab from '@/components/expert/DocumentsTab';


    const NavLink = ({ icon: Icon, label, isActive, onClick }) => (
        <Button
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 relative px-4 h-10 text-sm"
            onClick={onClick}
        >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate flex-grow text-left">{label}</span>
            {isActive && <ChevronRight className="h-5 w-5 ml-auto text-primary" />}
        </Button>
    );

    const SidebarContent = React.memo(({ navItems, activeTab, handleTabChange, profile, user, signOut, navigate, onLinkClick }) => {
        const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
        const isDesktop = useMediaQuery('(min-width: 1024px)');

        const getInitials = () => {
            if (!profile) return 'EX';
            const firstName = profile.first_name || '';
            const lastName = profile.last_name || '';
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        };

        const handleMenuClick = (tab) => {
            handleTabChange(tab);
            setIsUserMenuOpen(false);
            if (onLinkClick) onLinkClick();
        };
    
        const handleSignOut = () => {
            signOut();
            setIsUserMenuOpen(false);
            if (onLinkClick) onLinkClick();
        };
        
        return (
            <div className="flex h-full max-h-screen flex-col">
                <div className="flex h-20 flex-col items-center justify-center border-b px-6">
                    <Link to="/" className="flex items-center" onClick={onLinkClick}>
                        <img alt="InspiraTec Logo Light" className="h-8 md:h-10 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
                        <img alt="InspiraTec Logo Dark" className="h-8 md:h-10 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Mon espace Expert</p>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeTab === item.id}
                                onClick={() => {
                                    handleTabChange(item.id);
                                    if(onLinkClick) onLinkClick();
                                }}
                            />
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-sm h-10 px-4" onClick={() => { navigate('/support'); if(onLinkClick) onLinkClick(); }}>
                        <LifeBuoy className="h-5 w-5" />
                        Support
                    </Button>
                    <Separator />
                    <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between h-auto p-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <AvatarViewer
                                        src={profile?.avatar_url}
                                        alt={profile?.display_name}
                                        fallback={getInitials()}
                                        triggerClassName="h-10 w-10"
                                    />
                                    <div className="text-left overflow-hidden">
                                        <p className="font-semibold text-sm truncate">{profile?.display_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" side={isDesktop ? 'right' : 'top'} align="end">
                            <Button variant="ghost" className="w-full justify-start gap-3 text-sm" onClick={() => handleMenuClick('profile')}>
                                <User className="h-4 w-4" /> Profil
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" /> Déconnexion
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        );
    });


    const ExpertDashboard = () => {
      const { profile, aos, candidatures, hiredProjects, notifications, blogPosts, loading, error, refreshData, refreshProfile } = useExpert();
      const { user, signOut } = useAuth();
      const { toast } = useToast();
      const location = useLocation();
      const navigate = useNavigate();
      const params = useParams();
      
      const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
      const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'overview');
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [activePanel, setActivePanel] = useState(null);

      useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`notifications:expert:${user.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    toast({
                        title: "🔔 Nouvelle notification",
                        description: payload.new.message,
                    });
                    refreshData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
      }, [user, refreshData, toast]);

      useEffect(() => {
        const tab = queryParams.get('tab') || 'overview';
        const path = location.pathname;
        if (path.includes('/apply/')) {
            setActiveTab(null);
        } else {
            setActiveTab(tab);
        }
      }, [queryParams, location.pathname]);

      const handleTabChange = useCallback((tab) => {
        navigate(`/expert/dashboard?tab=${tab}`);
        setIsMobileMenuOpen(false);
        handleClosePanel();
      }, [navigate]);

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

      if (loading && !profile) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <Spinner size="lg" />
          </div>
        );
      }

      if (error) {
        return (
          <div className="container mx-auto p-4 text-center">
            <p className="text-destructive">Une erreur est survenue lors du chargement de votre tableau de bord.</p>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        );
      }

      const navItems = [
          { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
          { id: 'missions', label: 'Missions', icon: Briefcase },
          { id: 'projects', label: 'Mes Projets', icon: Award },
          { id: 'documents', label: 'Mes Documents', icon: FolderKanban },
          { id: 'profile', label: 'Profil', icon: User },
          { id: 'settings', label: 'Paramètres', icon: Settings },
      ];
      
      const renderContent = () => {
        if (params.slug || params.missionId) {
            return <Outlet />;
        }

        return (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsContent value="overview" className="m-0"><OverviewTab candidatures={candidatures} aos={aos} profile={profile} notifications={notifications} blogPosts={blogPosts} loading={loading} onUpdate={refreshData} /></TabsContent>
            <TabsContent value="missions" className="m-0">
                <MissionsTab 
                    aos={aos} 
                    candidatures={candidatures} 
                    loading={loading}
                    error={error} 
                    profile={profile} 
                    onApplySuccess={refreshData} 
                    onUpdate={refreshData}
                    onSelect={(ao) => handleSelect('ao', ao)}
                    selectedId={activePanel?.type === 'ao' ? activePanel.data.id : null}
                    onSubTabChange={handleClosePanel}
                />
            </TabsContent>
            <TabsContent value="projects" className="m-0"><MyProjectsTab projects={hiredProjects} loading={loading} /></TabsContent>
            <TabsContent value="documents" className="m-0"><DocumentsTab /></TabsContent>
            <TabsContent value="profile" className="m-0">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-4 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                        <p className="text-muted-foreground">
                            Gérez vos informations de profil, vos documents et votre visibilité sur la plateforme.
                        </p>
                    </div>
                    <ProfileTab profile={profile} loading={loading} onUpdate={() => { refreshData(); refreshProfile(); }} />
                </div>
            </TabsContent>
            <TabsContent value="settings" className="m-0"><ExpertSettings /></TabsContent>
          </Tabs>
        );
      };
      
      const pageTitle = navItems.find(item => item.id === activeTab)?.label || "Tableau de bord";
      
      return (
        <>
          <Helmet>
            <title>{pageTitle} - Espace Expert</title>
            <meta name="description" content={`Espace expert - ${pageTitle}`} />
          </Helmet>
          
          <div className="theme-expert w-full min-h-screen bg-muted/40 lg:grid lg:grid-cols-[280px_1fr]">
              <aside className="hidden lg:flex flex-col border-r bg-background h-screen sticky top-0">
                  <SidebarContent 
                    navItems={navItems}
                    activeTab={activeTab} 
                    handleTabChange={handleTabChange} 
                    signOut={signOut} 
                    profile={profile}
                    user={user}
                    navigate={navigate}
                  />
              </aside>

              <div className="flex flex-col flex-1 lg:h-screen">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-30 lg:hidden">
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                      <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="font-semibold text-lg">{pageTitle}</h1>
                </header>
                <main className={cn("flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-300", activePanel ? "blur-sm pointer-events-none" : "")}>
                    <motion.div
                        key={location.pathname + location.search}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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
                                onPointerDown={handleOverlayClick}
                            />
                            {activePanel?.type === 'ao' && (
                                <ExpertAoDetailPanel 
                                    key="panel"
                                    ao={activePanel.data}
                                    profile={profile}
                                    onClose={handleClosePanel}
                                    onApplySuccess={refreshData}
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
                        <SidebarContent 
                            navItems={navItems} 
                            activeTab={activeTab} 
                            handleTabChange={handleTabChange} 
                            profile={profile} 
                            user={user} 
                            signOut={signOut} 
                            navigate={navigate}
                            onLinkClick={() => setIsMobileMenuOpen(false)}
                        />
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

    export default ExpertDashboard;