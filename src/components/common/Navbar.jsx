import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, Settings, Menu, X, Search, Briefcase, HelpCircle, BookOpen, LayoutDashboard, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AvatarViewer from "./AvatarViewer";
import { Helmet } from 'react-helmet-async';

const MobileNavLink = ({ children, Icon, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-muted transition-colors rounded-lg text-left">
    {Icon && <Icon className="h-5 w-5" />}
    {children}
  </button>
);

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, getRedirectPath, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const getDisplayName = () => {
    if (!profile) return 'Utilisateur';
    return profile.display_name || profile.email || 'Utilisateur';
  };
  
  const getInitials = () => {
    if (!profile || !profile.display_name) return '?';
    const names = profile.display_name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : '?';
  }
  
  const handleDashboardRedirect = () => {
      if (!profile) return;
      const path = getRedirectPath(profile.role);
      navigate(path);
      setIsMobileMenuOpen(false);
  }

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
           <AvatarViewer
              src={profile?.avatar_url}
              alt={getDisplayName()}
              fallback={getInitials()}
              triggerClassName="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-colors"
            />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[80vw] max-w-xs sm:w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDashboardRedirect}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Tableau de bord</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { 
            let path = getRedirectPath(profile.role);
            if (profile?.role === 'super-admin') path = '/admin/settings';
            if (profile?.role === 'company') path = '/company/dashboard?tab=profile';
            if (profile?.role === 'expert') path = '/expert/dashboard?tab=profile';

            navigate(path);
            setIsMobileMenuOpen(false);
        }}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Profil & Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const navItems = [
    { label: "Trouver une mission", icon: Search, href: "/find-mission", type: "internal" },
    { label: "On a une mission", icon: Briefcase, href: "/post-mission", type: "internal" },
    { label: "Consulting", icon: Globe, href: "https://consulting.inspiratec.fr/", type: "external" },
    { label: "Pourquoi Inspiratec ?", icon: HelpCircle, href: "/why-inspiratec", type: "internal" },
    { label: "Blog", icon: BookOpen, href: "/blog", type: "internal" }
  ];

  return (
    <>
      <Helmet>
        <title>InspiraTec - Votre Partenaire en Consulting Tech</title>
        <meta name="description" content="InspiraTec connecte les entreprises avec les meilleurs experts tech indépendants pour des missions de consulting sur mesure." />
      </Helmet>
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b"
      >
        <div className="container-custom flex justify-between items-center h-20">
          <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <img alt="InspiraTec Logo Light" className="h-8 md:h-10 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
            <img alt="InspiraTec Logo Dark" className="h-8 md:h-10 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
          </Link>

          <nav className="hidden md:flex gap-x-2 items-center">
            {navItems.map(item => (
              item.type === "external" ? (
                <Button key={item.label} variant="ghost" asChild>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                </Button>
              ) : (
                <Button key={item.label} variant="ghost" asChild>
                  <Link to={item.href}>{item.label}</Link>
                </Button>
              )
            ))}
          </nav>

          <div className="flex gap-2 items-center">
            {user && profile ? (
              <UserMenu />
            ) : !user ? (
              <Button asChild>
                <Link to="/login">Mon Espace</Link>
              </Button>
            ) : null}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="md:hidden fixed inset-0 top-20 z-40 bg-background/95 backdrop-blur-md p-4"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map(item => (
                item.type === "external" ? (
                  <MobileNavLink key={item.label} Icon={item.icon} onClick={() => { window.open(item.href, '_blank', 'noopener noreferrer'); setIsMobileMenuOpen(false); }}>
                    {item.label}
                  </MobileNavLink>
                ) : (
                  <MobileNavLink key={item.label} Icon={item.icon} onClick={() => { navigate(item.href); setIsMobileMenuOpen(false); }}>
                    {item.label}
                  </MobileNavLink>
                )
              ))}
              <div className="border-t pt-4 mt-4">
                 {user && profile ? (
                  <>
                    <MobileNavLink Icon={LayoutDashboard} onClick={handleDashboardRedirect}>Tableau de bord</MobileNavLink>
                    <MobileNavLink Icon={LogOut} onClick={handleLogout}>Déconnexion</MobileNavLink>
                  </>
                ) : (
                  <MobileNavLink Icon={UserCircle} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Mon Espace</MobileNavLink>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;