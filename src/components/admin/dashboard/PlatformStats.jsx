import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, Star } from 'lucide-react';
import Spinner from '@/components/common/Spinner';

const StatCard = ({ title, value, icon, link, color }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(link)}
            className="cursor-pointer group"
        >
            <Card className="overflow-hidden transition-colors duration-200 group-hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {React.cloneElement(icon, { className: `h-4 w-4 text-muted-foreground` })}
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <p className="text-xs text-muted-foreground">Cliquer pour gérer</p>
                </CardContent>
            </Card>
        </div>
    );
};

const PlatformStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    aos: 0,
    publishedBlogs: 0,
    approvedTestimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { count: usersCount },
        { count: aosCount },
        { count: publishedBlogsCount },
        { count: approvedTestimonialsCount },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('aos').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      ]);

      setStats({
        users: usersCount || 0,
        aos: aosCount || 0,
        publishedBlogs: publishedBlogsCount || 0,
        approvedTestimonials: approvedTestimonialsCount || 0,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de la plateforme:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statItems = [
    { title: "Utilisateurs Totals", value: stats.users, icon: <Users />, link: "/admin/users", color: "text-primary" },
    { title: "Missions (AOs)", value: stats.aos, icon: <Briefcase />, link: "/admin/workflow?tab=aos", color: "text-orange-500" },
    { title: "Articles Publiés", value: stats.publishedBlogs, icon: <FileText />, link: "/admin/content?tab=blog", color: "text-green-500" },
    { title: "Témoignages Approuvés", value: stats.approvedTestimonials, icon: <Star />, link: "/admin/content?tab=testimonials", color: "text-yellow-500" },
  ];

  if (loading) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-[108px] flex justify-center items-center"><Spinner size="sm" /></Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
};

export default PlatformStats;