import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AOsTab from './AOsTab';
import ApplicationsTab from './ApplicationsTab';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';

const MissionsTab = ({ aos, candidatures, loading, error, profile, onApplySuccess, onSelect, selectedId, onSubTabChange, onUpdate }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subTab = searchParams.get('subtab');

  const handleTabSwitch = (value) => {
    if (onSubTabChange) {
      onSubTabChange(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Missions</CardTitle>
        <CardDescription>
          Trouvez de nouvelles opportunités et suivez l'avancement de vos candidatures.
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue={subTab || "opportunities"} className="w-full p-6 pt-0" onValueChange={handleTabSwitch}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="applications">Mes Candidatures</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities" className="mt-4">
          <AOsTab 
            aos={aos} 
            loading={loading} 
            profile={profile} 
            onApplySuccess={onApplySuccess}
            onWithdrawSuccess={onApplySuccess}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        </TabsContent>
        <TabsContent value="applications" className="mt-4">
          <ApplicationsTab applications={candidatures} loading={loading} error={error} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MissionsTab;