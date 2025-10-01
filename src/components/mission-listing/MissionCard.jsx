import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Briefcase, Calendar, Euro } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const MissionCard = ({ mission, onToggleFavorite, isFavorite, onApply }) => {
  const timeAgo = mission.created_at ? formatDistanceToNow(parseISO(mission.created_at), { addSuffix: true, locale: fr }) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-primary/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-primary">{mission.title}</h3>
              <p className="text-sm text-muted-foreground">{mission.company?.company_name || 'Entreprise'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(mission.id)}>
              <Star className={`h-5 w-5 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {mission.place || "Non spécifié"}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {mission.duration || "N/A"}</span>
            {mission.adr_min && <span className="flex items-center gap-1.5"><Euro className="h-4 w-4" /> {mission.adr_min}€ - {mission.adr_max}€ / j</span>}
          </div>
          <p className="text-sm line-clamp-3">{mission.description}</p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center bg-muted/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Publié {timeAgo}
          </p>
          <Button onClick={onApply}>Postuler</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MissionCard;