import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Award, Briefcase } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const ProjectCard = ({ project }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.ao_title}</CardTitle>
            <CardDescription>Entreprise : Inspiratec</CardDescription>
          </div>
          <Badge variant="success">Recruté</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Votre TJM :</strong> {project.tjm_propose ? `${project.tjm_propose} €` : 'N/C'}</p>
            <p><strong>Date de recrutement :</strong> {format(new Date(project.updated_at), 'd MMMM yyyy', { locale: fr })}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const MyProjectsTab = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Projets</CardTitle>
        <CardDescription>
          Retrouvez ici toutes les missions pour lesquelles vous avez été recruté.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
            <Award className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Aucun projet en cours</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Lorsque vous serez recruté pour une mission, elle apparaîtra ici. Bonne chance !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyProjectsTab;