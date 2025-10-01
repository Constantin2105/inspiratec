import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import AvatarViewer from '@/components/common/AvatarViewer';
import { ChevronRight, LifeBuoy, User, LogOut } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';

const NavLink = ({ icon: Icon, label, isActive, onClick }) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start gap-3 relative px-4 h-10 text-sm",
            !isActive && "hover:bg-secondary hover:text-secondary-foreground"
        )}
        onClick={onClick}
    >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate flex-grow text-left">{label}</span>
        {isActive && <ChevronRight className="h-5 w-5 ml-auto text-primary" />}
    </Button>
);

const SidebarContent = React.memo(({ navItems, activeTab, handleTabChange, profile, user, signOut, navigate }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    
    const displayName = profile?.display_name || 'Entreprise';
    const getInitials = (name) => {
        if (!name) return 'E';
        const nameParts = name.split(' ');
        if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
            return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleMenuClick = (tab) => {
        handleTabChange(tab);
        setIsUserMenuOpen(false);
    };

    const handleSignOut = () => {
        signOut();
        setIsUserMenuOpen(false);
    };

    return (
        <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 flex-col items-center justify-center border-b px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <img alt="InspiraTec Logo Light" className="h-8 md:h-10 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
                    <img alt="InspiraTec Logo Dark" className="h-8 md:h-10 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mon espace Entreprise</p>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                    {navItems.map(item => (
                        <NavLink
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeTab === item.id}
                            onClick={() => handleTabChange(item.id)}
                        />
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm h-10 px-4" onClick={() => navigate('/support')}>
                    <LifeBuoy className="h-5 w-5" />
                    Support
                </Button>
                <Separator />
                <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between h-auto p-2 hover:bg-secondary hover:text-secondary-foreground">
                            <div className="flex items-center gap-3 overflow-hidden">
                            <AvatarViewer
                                src={profile?.avatar_url}
                                alt={displayName}
                                fallback={getInitials(displayName)}
                                triggerClassName="h-10 w-10"
                            />
                            <div className="text-left overflow-hidden">
                                <p className="font-semibold text-sm truncate">{displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 bg-card text-card-foreground" side={isDesktop ? 'right' : 'top'} align="end">
                       <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-secondary hover:text-secondary-foreground" onClick={() => handleMenuClick('settings')}>
                         <User className="h-4 w-4" /> Profil
                       </Button>
                       <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={handleSignOut}>
                         <LogOut className="h-4 w-4" /> Déconnexion
                       </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
});

export default SidebarContent;