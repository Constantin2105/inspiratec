import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

const CompanyRecentActivity = ({ notifications }) => {

  const getIconForType = (type) => {
    return <Bell className="h-5 w-5 text-primary" />;
  };

  const recentNotifications = notifications ? notifications.slice(0, 4) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Vos dernières notifications importantes.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentNotifications.length > 0 ? (
          <ul className="space-y-4">
            {recentNotifications.map((notif) => (
              <li key={notif.id} className="flex items-start gap-4">
                <div className={cn("bg-primary/10 p-2 rounded-full", !notif.is_read && "animate-pulse")}>
                    {getIconForType(notif.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente.</p>
        )}
      </CardContent>
      {notifications && notifications.length > 0 && (
        <CardFooter>
            <Button asChild variant="outline" className="w-full">
                <Link to="/company/dashboard/notifications">
                    Voir toutes les notifications <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CompanyRecentActivity;