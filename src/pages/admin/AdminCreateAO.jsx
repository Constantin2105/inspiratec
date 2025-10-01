
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import AdminAOForm from '@/components/admin/forms/AdminAOForm';
import Spinner from '@/components/common/Spinner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AdminCreateAO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies, loading: adminLoading, handleAoSubmit, loadingAction } = useAdmin();
  const [ao, setAo] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchAo = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('aos')
          .select('*, companies(id, name)')
          .eq('id', id)
          .single();

        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger l'appel d'offres." });
          navigate('/admin/workflow');
        } else {
          setAo({ ...data, company_id: data.companies?.id });
        }
        setLoading(false);
      };
      fetchAo();
    }
  }, [id, toast, navigate]);

  const handleSubmit = async (formData, aoId) => {
    const result = await handleAoSubmit(formData, aoId);
    if (result.success) {
      navigate('/admin/workflow');
      return true;
    }
    return false;
  };

  if (loading || adminLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{id ? "Modifier" : "Créer"} un Appel d'Offres - Admin</title>
      </Helmet>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/workflow')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au workflow
        </Button>
      </div>
      <AdminAOForm 
        ao={ao} 
        onSubmit={handleSubmit} 
        isSubmitting={loadingAction}
        companies={companies}
      />
    </div>
  );
};

export default AdminCreateAO;
