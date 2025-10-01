import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import NotificationsTab from '@/components/company/NotificationsTab';
import { useCompany } from '@/hooks/useCompany';
import { motion } from 'framer-motion';

const AllNotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, loading, refreshData } = useCompany();

  return (
    <>
      <Helmet>
        <title>Toutes les Notifications - Espace Entreprise</title>
        <meta name="description" content="Consultez toutes vos notifications." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/company/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Toutes les Notifications</h1>
        </div>
        <NotificationsTab
          notifications={notifications}
          loading={loading}
          onRefresh={refreshData}
        />
      </motion.div>
    </>
  );
};

export default AllNotificationsPage;