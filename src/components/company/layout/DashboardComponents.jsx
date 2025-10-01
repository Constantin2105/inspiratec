import React from 'react';
import { Button } from '@/components/ui/button';
import { Inbox, ChevronRight } from 'lucide-react';

export const NavLink = ({ icon: Icon, label, isActive, onClick }) => (
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

export const PlaceholderTab = ({ title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
    <Icon className="w-16 h-16 text-muted-foreground mb-4" />
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="text-muted-foreground mt-2">Cette fonctionnalité est en cours de développement et sera bientôt disponible.</p>
  </div>
);

export const EmptyApplicationsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucune candidature pour le moment</h3>
        <p className="mt-1 text-sm text-muted-foreground">Les profils qualifiés pour vos missions seront bientôt disponibles.</p>
    </div>
);