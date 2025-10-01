import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, DollarSign, ArrowRight, CheckCircle, Zap, Users } from 'lucide-react';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const mockMissions = [
  {
    id: 1,
    title: 'Développeur React Senior pour Projet E-commerce',
    company: 'TechSolutions Inc.',
    location: 'Remote',
    duration: '3-6 mois',
    budget: '600€/jour',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  },
  {
    id: 2,
    title: 'Lead Designer UX/UI - Application Mobile',
    company: 'InnovateApp',
    location: 'Paris, France',
    duration: '6 mois+',
    budget: '650€/jour',
    skills: ['Figma', 'UX Research', 'Design System'],
  },
  {
    id: 3,
    title: 'Chef de Projet Technique - Migration Cloud',
    company: 'CloudFirst Ltd.',
    location: 'Remote (Europe)',
    duration: '12 mois',
    budget: '700€/jour',
    skills: ['AWS', 'CI/CD', 'Agile'],
  },
];

const benefits = [
    { icon: Zap, text: "Missions exclusives auprès de startups et grands comptes." },
    { icon: CheckCircle, text: "Profils vérifiés pour une mise en relation de qualité." },
    { icon: Users, text: "Une communauté d'experts pour échanger et grandir." },
];

const MissionCard = ({ mission, onApplyClick }) => (
    <motion.div whileHover={{ y: -5 }} className="h-full">
        <Card className="h-full flex flex-col rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="text-xl leading-tight">{mission.title}</CardTitle>
                <CardDescription>{mission.company}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex items-center text-sm text-muted-foreground gap-x-6 gap-y-2 flex-wrap">
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {mission.location}</div>
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {mission.duration}</div>
                    <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> {mission.budget}</div>
                </div>
                 <div className="flex flex-wrap gap-2">
                    {mission.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={onApplyClick}>
                    Postuler à cette mission <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    </motion.div>
)

const FindMission = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Trouver une mission - InspiraTec</title>
        <meta name="description" content="Parcourez des centaines de missions freelance en tech et trouvez votre prochain défi. Développeur, Designer, Chef de Projet..." />
      </Helmet>
      
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <div className="bg-gradient-to-b from-primary/10 to-background">
            <div className="container-custom py-16 md:py-24 text-center">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4"
            >
                Votre Prochaine Mission Vous Attend
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
                Accédez à des opportunités exclusives, développez vos compétences et travaillez sur des projets qui ont du sens.
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
            >
                <DialogTrigger asChild>
                    <Button size="lg" className="text-lg">
                        Créer mon profil expert <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </DialogTrigger>
            </motion.div>
            </div>
        </div>

        <div className="container-custom py-16">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-4"
                    >
                        <div className="p-3 bg-primary/10 rounded-full">
                            <benefit.icon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-muted-foreground mt-1">{benefit.text}</p>
                    </motion.div>
                ))}
            </div>

            <h2 className="text-3xl font-bold text-center mb-12">Dernières missions publiées</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockMissions.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    >
                        <DialogTrigger asChild>
                            <div className="cursor-pointer h-full">
                                <MissionCard mission={mission} onApplyClick={() => {}} />
                            </div>
                        </DialogTrigger>
                    </motion.div>
                ))}
            </div>
        </div>
        <DialogContent className="sm:max-w-[425px]">
            <UnifiedSignupForm 
                userType="expert"
                title="Devenez Expert Inspiratec"
                description="Créez votre compte pour postuler aux missions et accéder à tous nos services."
            />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FindMission;