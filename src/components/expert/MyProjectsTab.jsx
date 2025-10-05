import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Award, Briefcase, MapPin, Calendar, Clock, DollarSign, Building2, Wrench } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ProjectCard = ({ project }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1">
            {project.company_logo && (
              <img 
                src={project.company_logo} 
                alt={project.company_name} 
                className="w-12 h-12 rounded-lg object-cover border"
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1 line-clamp-2">{project.ao_title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{project.company_name}</span>
              </div>
              {project.company_city && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{project.company_city}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="success" className="ml-2 flex-shrink-0">Recruté</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.ao_description && (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.ao_description}
            </p>
          </div>
        )}
        
        <Separator />
        
        <div className="grid grid-cols-1 gap-3 text-sm">
          {project.ao_location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Localisation : </span>
                <span className="text-muted-foreground">{project.ao_location}</span>
              </div>
            </div>
          )}
          
          {project.tjm_propose && (
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Votre TJM : </span>
                <span className="text-muted-foreground">{project.tjm_propose} €</span>
              </div>
            </div>
          )}
          
          {project.ao_tjm_range && (
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Budget mission : </span>
                <span className="text-muted-foreground">{project.ao_tjm_range}</span>
              </div>
            </div>
          )}
          
          {project.ao_duration && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Durée : </span>
                <span className="text-muted-foreground">{project.ao_duration}</span>
              </div>
            </div>
          )}
          
          {project.ao_contract_type && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Type : </span>
                <span className="text-muted-foreground">{project.ao_contract_type}</span>
              </div>
            </div>
          )}
          
          {project.date_disponibilite && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Début mission : </span>
                <span className="text-muted-foreground">{format(new Date(project.date_disponibilite), 'd MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          )}
          
          {project.updated_at && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Date de recrutement : </span>
                <span className="text-muted-foreground">{format(new Date(project.updated_at), 'd MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          )}
          
          {project.ao_required_skills && project.ao_required_skills.length > 0 && (
            <div className="flex items-start gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block mb-1">Compétences requises :</span>
                <div className="flex flex-wrap gap-1">
                  {project.ao_required_skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {project.ao_work_arrangement && project.ao_work_arrangement !== 'Non spécifié' && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Modalité de travail : </span>
                <span className="text-muted-foreground">{project.ao_work_arrangement}</span>
              </div>
            </div>
          )}
        </div>
        
        {(project.company_description || project.company_website || project.company_address) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">À propos de l'entreprise</h4>
              
              {project.company_description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.company_description}
                </p>
              )}
              
              {project.company_website && (
                <a 
                  href={project.company_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  🌐 Site web
                </a>
              )}
              
              {project.company_address && (
                <p className="text-sm text-muted-foreground">
                  📍 {project.company_address}
                  {project.company_postal_code && `, ${project.company_postal_code}`}
                  {project.company_city && ` ${project.company_city}`}
                  {project.company_country && `, ${project.company_country}`}
                </p>
              )}
            </div>
          </>
        )}
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