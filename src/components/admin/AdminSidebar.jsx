import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, LogOut, PenSquare, GitBranch, ChevronRight, User as UserIcon, Home, FolderKanban } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import AvatarViewer from '@/components/common/AvatarViewer';
import { getInitials } from '@/lib/utils/text';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';

const NavLink = ({ icon: Icon, label, path, isActive, onLinkClick }) => (
    <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start gap-3 relative px-4 h-10 text-sm",
            !isActive && "hover:bg-secondary hover:text-secondary-foreground"
        )}
        onClick={onLinkClick}
    >
        <Link to={path}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate flex-grow text-left">{label}</span>
            {isActive && <ChevronRight className="h-5 w-5 ml-auto text-primary" />}
        </Link>
    </Button>
);

const AdminSidebar = ({ user, profile, signOut, onLinkClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const handleNavigate = (path) => {
        navigate(path);
        if(onLinkClick) onLinkClick();
        setIsUserMenuOpen(false);
    }

    const handleSignOut = () => {
        signOut();
        setIsUserMenuOpen(false);
    }

    const navItems = [
      { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'Utilisateurs', icon: Users, path: '/admin/users' },
      { label: 'Workflow', icon: GitBranch, path: '/admin/workflow' },
      { label: 'Documents', icon: FolderKanban, path: '/admin/documents' },
      { label: 'Contenu', icon: PenSquare, path: '/admin/content' },
      { label: 'Paramètres', icon: Settings, path: '/admin/settings' },
    ];
    
    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex h-20 flex-col items-center justify-center border-b px-6">
                <Link to="/admin/dashboard" className="flex items-center" onClick={onLinkClick}>
                    <img alt="InspiraTec Logo Light" className="h-8 md:h-10 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
                    <img alt="InspiraTec Logo Dark" className="h-8 md:h-10 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
                </Link>
                <p className="text-sm text-muted-foreground mt-1">Mon espace Admin</p>
            </div>
            <ScrollArea className="flex-1">
                <nav className="p-4 space-y-2">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            isActive={location.pathname.startsWith(item.path)}
                            onLinkClick={onLinkClick}
                        />
                    ))}
                </nav>
            </ScrollArea>
            <div className="mt-auto p-4 border-t space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <Link to="/">
                        <Home className="h-5 w-5" />
                        Revenir au site
                    </Link>
                </Button>
                <Separator />
                <div>
                    <Popover modal={true} open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between h-auto p-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <AvatarViewer
                                        src={profile?.avatar_url}
                                        alt={profile?.display_name}
                                        fallback={getInitials(profile?.display_name)}
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
                            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => handleNavigate('/admin/settings')}>
                                <UserIcon className="h-4 w-4" /> Profil
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" /> Déconnexion
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;