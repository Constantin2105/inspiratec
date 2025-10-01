import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const FeaturedMissionCard = ({ aos }) => {
  const navigate = useNavigate();
  
  if (!aos || aos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune mission en vedette</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Revenez bientôt pour de nouvelles opportunités.</p>
        </CardContent>
      </Card>
    );
  }

  const featuredMission = aos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardDescription>Mission en Vedette</CardDescription>
                <CardTitle className="text-lg mt-1">{featuredMission.title}</CardTitle>
            </div>
            <Badge variant="secondary">{featuredMission.contract_type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 mb-4">{featuredMission.description}</p>
        <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{featuredMission.location}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{featuredMission.duration || 'Non spécifié'}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => navigate('/expert/dashboard?tab=missions')}>
          Voir les détails <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeaturedMissionCard;