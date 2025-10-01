import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import ProgressRing from '@/components/ui/progress-ring';

const ProfileCompletionCard = ({ percentage, missingFields, onNavigate }) => {
  const isComplete = percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-card to-muted/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <div className="relative h-[90px] w-[90px] flex-shrink-0">
            <ProgressRing radius={45} stroke={6} progress={percentage} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{percentage}%</span>
            </div>
          </div>
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              {isComplete ? <CheckCircle className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-amber-500" />}
              {isComplete ? "Profil complet !" : "Complétez votre profil"}
            </CardTitle>
            <CardDescription>
              {isComplete 
                ? "Félicitations ! Votre profil est prêt à attirer les meilleures opportunités."
                : "Un profil complet augmente vos chances de succès de 70%."
              }
            </CardDescription>
          </div>
        </CardHeader>
        {!isComplete && (
          <CardContent>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Pour atteindre 100%, ajoutez :</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {missingFields.slice(0, 3).map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
                {missingFields.length > 3 && <li>et {missingFields.length - 3} autre(s)...</li>}
              </ul>
            </div>
            <Button onClick={onNavigate} className="w-full">
              Compléter mon profil <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default ProfileCompletionCard;