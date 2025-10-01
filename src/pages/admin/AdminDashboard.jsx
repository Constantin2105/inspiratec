import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import WorkflowMetrics from '@/components/admin/dashboard/WorkflowMetrics';
import PlatformStats from '@/components/admin/dashboard/PlatformStats';
import { Eye, TrendingUp, Users, Briefcase, UserCheck, FileText, CheckCircle } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import ChartContainer from '@/components/charts/ChartContainer';
import CustomTooltip from '@/components/charts/CustomTooltip';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm">{`${payload.value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const AnalyticsTabContent = () => {
  const { kpis, userGrowth, aoStatusDistribution, candidatureStatusDistribution, monthlyActivity, topCompanies, loading, error } = useAdminAnalytics();
  const [activeIndexAo, setActiveIndexAo] = useState(0);
  const [activeIndexCandidature, setActiveIndexCandidature] = useState(0);

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <p className="text-destructive text-center">Erreur de chargement des statistiques: {error.message}</p>;

  const THEME_COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--primary-green))',
    'hsl(var(--warning))',
    'hsl(var(--success))',
    'hsl(var(--destructive))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))'
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Utilisateurs" value={kpis.users} icon={Users} color="text-primary"/>
        <StatCard title="Total Experts" value={kpis.experts} icon={UserCheck} color="text-success" />
        <StatCard title="Total Entreprises" value={kpis.companies} icon={Briefcase} color="text-primary"/>
        <StatCard title="Total Offres" value={kpis.aos} unit="" icon={FileText} color="text-secondary-foreground"/>
        <StatCard title="Experts Recrutés" value={kpis.hired} unit="" icon={CheckCircle} color="text-warning"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Croissance des Utilisateurs" description="Évolution cumulative des experts et entreprises inscrits.">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorExperts" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary-green))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary-green))" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="Experts" stroke="hsl(var(--primary-green))" fill="url(#colorExperts)" />
              <Area type="monotone" dataKey="Companies" stroke="hsl(var(--primary))" fill="url(#colorCompanies)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Activité Mensuelle" description="Nouvelles offres et candidatures créées chaque mois.">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={monthlyActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Offres" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Candidatures" fill="hsl(var(--primary-green))" radius={[4, 4, 0, 0]} />
              </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Répartition des Appels d'Offres" description="Distribution des offres par statut.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                activeIndex={activeIndexAo}
                activeShape={renderActiveShape}
                data={aoStatusDistribution} 
                cx="50%" 
                cy="50%" 
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndexAo(index)}
              >
                {aoStatusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Répartition des Candidatures" description="Distribution des candidatures par statut.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                activeIndex={activeIndexCandidature}
                activeShape={renderActiveShape}
                data={candidatureStatusDistribution} 
                cx="50%" 
                cy="50%" 
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndexCandidature(index)}
              >
                {candidatureStatusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
       <div className="grid grid-cols-1 gap-8">
           <ChartContainer title="Top 5 des Entreprises" description="Entreprises avec le plus d'appels d'offres publiés." className="h-auto">
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCompanies} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--accent))' }} />
                      <Legend />
                      <Bar dataKey="value" name="Offres Publiées" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
              </ResponsiveContainer>
          </ChartContainer>
       </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Tableau de bord - Admin</title>
      </Helmet>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité sur InspiraTec.</p>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
            <TabsList>
                <TabsTrigger value="overview"><Eye className="mr-2 h-4 w-4"/>Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="analytics"><TrendingUp className="mr-2 h-4 w-4"/>Analytics Détaillés</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
                <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <PlatformStats />
                    <WorkflowMetrics />
                </motion.div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
                <AnalyticsTabContent />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;