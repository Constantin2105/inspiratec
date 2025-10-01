import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import CompanyAOForm from '@/components/company/forms/CompanyAOForm';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/hooks/useCompany';

const CompanyCreateAO = ({ aoId, onFinished, onBack }) => {
  const { toast } = useToast();
  const { handleAoSubmit, loadingAction } = useCompany();
  const [ao, setAo] = useState(null);
  const [loading, setLoading] = useState(!!aoId);

  useEffect(() => {
    if (aoId) {
      const fetchAo = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('aos')
          .select('*')
          .eq('id', aoId)
          .single();

        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger l'appel d'offres." });
          onBack();
        } else {
          setAo(data);
        }
        setLoading(false);
      };
      fetchAo();
    }
  }, [aoId, toast, onBack]);

  const handleSubmit = async (formData, currentAoId) => {
    const result = await handleAoSubmit(formData, currentAoId);
    if (result.success) {
      onFinished();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>{aoId ? "Modifier" : "Créer"} un Appel d'Offres - InspiraTec</title>
      </Helmet>
      <div className="mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mes offres
        </Button>
      </div>
      <CompanyAOForm ao={ao} onSubmit={handleSubmit} isSubmitting={loadingAction} />
    </div>
  );
};

export default CompanyCreateAO;