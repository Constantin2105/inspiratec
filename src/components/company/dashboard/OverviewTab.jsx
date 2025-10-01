import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, PlusCircle, ArrowRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';
import { calculateCompanyProfileCompleteness } from '@/lib/utils/profileCompleteness';
import ProfileCompletionCard from '@/components/common/ProfileCompletionCard';
import { useAuth } from '@/contexts/AuthContext';
import CompanyRecentActivity from './CompanyRecentActivity';
import TestimonialCard from './TestimonialCard';
import LatestBlogCard from './LatestBlogCard';

const StatCard = ({ title, value, icon: Icon, onCardClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 + 0.2 }}
  >
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onCardClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          Voir les détails <ArrowRight className="ml-1 h-3 w-3" />
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const OverviewTab = ({ aos, candidatures, notifications, blogPosts, loading, onNavigateToCreateAO, onTabChange }) => {
  const { profile } = useAuth();
  const profileCompleteness = calculateCompanyProfileCompleteness(profile);

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  const onlineAosCount = aos.filter(a => a.status === 'PUBLISHED').length;
  const receivedApplicationsCount = candidatures.filter(app => ['VALIDATED', 'INTERVIEW_REQUESTED'].includes(app.status)).length;
  const welcomeName = profile?.representative_first_name || profile?.company_name || 'cher utilisateur';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Bienvenue, {welcomeName}!</h2>
        <p className="text-muted-foreground">Voici un aperçu de votre activité sur la plateforme.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Offres en Ligne" value={onlineAosCount} icon={Briefcase} onCardClick={() => onTabChange('offers')} delay={0} />
        <StatCard title="Nouvelles Candidatures" value={receivedApplicationsCount} icon={FileText} onCardClick={() => onTabChange('applications')} delay={1} />
        <StatCard title="Total des Offres" value={aos.length} icon={Briefcase} onCardClick={() => onTabChange('offers')} delay={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Prêt à trouver le talent parfait ?</CardTitle>
                        <CardContent className="pt-4">
                            <Button onClick={onNavigateToCreateAO}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Publier une nouvelle mission
                            </Button>
                        </CardContent>
                    </CardHeader>
                </Card>
            </motion.div>
             {profileCompleteness.percentage < 100 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <ProfileCompletionCard 
                        percentage={profileCompleteness.percentage}
                        missingFields={profileCompleteness.missingFields}
                        onNavigate={() => onTabChange('settings')}
                    />
                </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <CompanyRecentActivity notifications={notifications} />
            </motion.div>
        </div>
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <TestimonialCard onUpdate={onTabChange}/>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <LatestBlogCard blogPosts={blogPosts}/>
            </motion.div>
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;