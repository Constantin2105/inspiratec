import React from 'react';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import Spinner from '@/components/common/Spinner';
    import { Bell, Check } from 'lucide-react';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { cn } from '@/lib/utils/cn';
    import { supabase } from '@/lib/supabase/client';

    const NotificationsTab = ({ notifications, loading, onRefresh }) => {
      const { toast } = useToast();

      const handleMarkAsRead = async (id) => {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de marquer comme lue.' });
        } else {
          onRefresh();
        }
      };
      
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
          onRefresh();
        }
      };

      if (loading) {
        return <div className="flex justify-center items-center py-10"><Spinner /></div>;
      }

      return (
        <Card>
          <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Toutes les mises à jour importantes concernant votre activité.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead} 
                  disabled={!notifications.some(n => !n.is_read)}>
                    <Check className="mr-2 h-4 w-4" />
                    Tout marquer comme lu
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className={cn("flex items-start space-x-4 rounded-lg p-4", !notif.is_read && "bg-secondary/5")}>
                     <span className={cn("flex h-2 w-2 translate-y-1 rounded-full", !notif.is_read && "bg-primary")} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{notif.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(notif.created_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    {!notif.is_read && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notif.id)}>Marquer comme lu</Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune notification pour le moment</h3>
                <p className="mt-1 text-sm text-muted-foreground">Nous vous alerterons ici dès qu'il y aura du nouveau.</p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default NotificationsTab;