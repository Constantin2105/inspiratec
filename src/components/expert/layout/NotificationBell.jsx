import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

const NotificationBell = ({ notifications, onRefresh }) => {
    const { toast } = useToast();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);

        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de tout marquer comme lu.' });
        } else {
            toast({ description: `Toutes les notifications ont été marquées comme lues.` });
            if(onRefresh) onRefresh();
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                         <h4 className="font-medium text-sm">Notifications</h4>
                         {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}><Check className="mr-2 h-4 w-4"/>Tout marquer comme lu</Button>}
                    </div>
                </div>
                <ScrollArea className="h-72">
                    {notifications.length > 0 ? (
                        <div className="p-2">
                            {notifications.map((notif) => (
                                <div key={notif.id} className={cn("flex items-start space-x-4 rounded-md p-2 text-sm", !notif.is_read && "bg-accent")}>
                                     <span className={cn("flex h-2 w-2 mt-1.5 rounded-full", !notif.is_read && "bg-primary")} />
                                    <div className="grid gap-1">
                                        <p>{notif.message}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(notif.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center p-4">
                            <p className="text-sm text-muted-foreground">Vous n'avez aucune notification.</p>
                        </div>
                    )}
                </ScrollArea>
                 <div className="p-2 border-t text-center">
                    <Button variant="link" size="sm" className="w-full" asChild>
                        <a href="/expert/dashboard?tab=notifications">Voir toutes les notifications</a>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;