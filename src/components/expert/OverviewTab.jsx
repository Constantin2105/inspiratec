import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase, FileText, CheckSquare, ArrowRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';
import { calculateExpertProfileCompleteness } from '@/lib/utils/profileCompleteness';
import ProfileCompletionCard from '@/components/common/ProfileCompletionCard';
import { useNavigate } from 'react-router-dom';
import FeaturedMissionCard from './dashboard/FeaturedMissionCard';
import RecentActivityFeed from './dashboard/RecentActivityFeed';
import TestimonialCard from './dashboard/TestimonialCard';
import LatestBlogCard from './dashboard/LatestBlogCard';

const StatCard = ({ title, value, icon: Icon, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 + 0.3 }}
    onClick={onClick}
    className={onClick ? 'cursor-pointer' : ''}
  >
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {onClick && (
          <p className="text-xs text-muted-foreground flex items-center">
            Voir les détails <ArrowRight className="ml-1 h-3 w-3" />
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const OverviewTab = ({ candidatures, aos, profile, notifications, blogPosts, loading, onUpdate }) => {
  const navigate = useNavigate();
  const profileCompleteness = calculateExpertProfileCompleteness(profile);

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  const validatedCandidatures = candidatures.filter(app => app.status === 'validated' || app.status === 'dossier_transmis' || app.status === 'recruited').length;

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Bienvenue, {profile?.first_name} !</h1>
          <p className="text-muted-foreground">Voici un résumé de votre activité sur la plateforme.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <StatCard 
            title="Missions Disponibles" 
            value={aos.length} 
            icon={Briefcase} 
            delay={0} 
            onClick={() => navigate('/expert/dashboard?tab=missions')}
          />
          <StatCard 
            title="Candidatures Envoyées" 
            value={candidatures.length} 
            icon={FileText} 
            delay={1} 
            onClick={() => navigate('/expert/dashboard?tab=missions&subtab=applications')}
          />
          <StatCard 
            title="Candidatures Validées" 
            value={validatedCandidatures} 
            icon={CheckSquare} 
            delay={2} 
            onClick={() => navigate('/expert/dashboard?tab=missions&subtab=applications')}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
                <RecentActivityFeed notifications={notifications} />
                <FeaturedMissionCard aos={aos} />
            </div>
            <div className="space-y-8">
                {profileCompleteness.percentage < 100 && (
                    <ProfileCompletionCard 
                        percentage={profileCompleteness.percentage}
                        missingFields={profileCompleteness.missingFields}
                        onNavigate={() => navigate('/expert/dashboard?tab=profile')}
                    />
                )}
                <TestimonialCard onUpdate={onUpdate} />
                <LatestBlogCard blogPosts={blogPosts} />
            </div>
        </div>
    </div>
  );
};

export default OverviewTab;