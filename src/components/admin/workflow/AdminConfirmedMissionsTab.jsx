import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AvatarViewer from '@/components/common/AvatarViewer';

const AdminConfirmedMissionsTab = ({ hiredCandidatures, loading }) => {
  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missions Confirmées</CardTitle>
        <CardDescription>
          Liste de tous les experts qui ont été recrutés pour des missions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hiredCandidatures && hiredCandidatures.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead>Date de recrutement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hiredCandidatures.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <AvatarViewer
                          src={candidature.expert_profile_picture_url}
                          alt={candidature.expert_name}
                          fallback={candidature.expert_name ? candidature.expert_name.substring(0, 2).toUpperCase() : 'EX'}
                        />
                        {candidature.expert_name}
                      </div>
                    </TableCell>
                    <TableCell>{candidature.company_name}</TableCell>
                    <TableCell>{candidature.ao_title}</TableCell>
                    <TableCell>
                      {format(new Date(candidature.updated_at), 'd MMMM yyyy', { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
            <Award className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Aucune mission confirmée</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Lorsqu'une entreprise recrute un expert, la mission apparaîtra ici.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminConfirmedMissionsTab;