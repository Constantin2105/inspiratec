import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Zap, Users, Target, ShieldCheck, ArrowRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card className="h-full text-center p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <div className="mb-4 inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  </motion.div>
);

const FeaturedTestimonial = () => {
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonial = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials_with_author')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'approved')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching featured testimonial:", error);
      } else {
        setTestimonial(data);
      }
      setLoading(false);
    };
    fetchTestimonial();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (!testimonial) {
    return null; // Don't render anything if no featured testimonial
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-primary/5 to-transparent p-8 rounded-2xl border"
    >
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-0 text-center">
          <p className="text-xl md:text-2xl italic text-foreground/90 mb-6">
            "{testimonial.content}"
          </p>
          <div className="flex flex-col items-center">
            <Avatar className="w-16 h-16 mb-4">
              <AvatarImage src={testimonial.avatar_url} alt={testimonial.display_name} />
              <AvatarFallback>{getInitials(testimonial.display_name)}</AvatarFallback>
            </Avatar>
            <h4 className="font-bold text-lg">{testimonial.display_name}</h4>
            <p className="text-muted-foreground">{testimonial.representative_position || 'Partenaire'}</p>
            <p className="text-sm font-semibold text-primary">{testimonial.company_name}</p>
            {testimonial.rating && (
              <div className="flex items-center gap-1 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WhyInspiratec = () => {
  const features = [
    { icon: <Zap size={24} />, title: "Rapidité & Agilité", description: "Accédez rapidement à un vivier de talents qualifiés pour répondre à vos besoins urgents et spécifiques.", delay: 0.1 },
    { icon: <Target size={24} />, title: "Précision du Matching", description: "Notre algorithme avancé et notre expertise humaine garantissent des profils parfaitement adaptés à vos missions.", delay: 0.2 },
    { icon: <Users size={24} />, title: "Communauté d'Experts", description: "Rejoignez un réseau d'experts de haut niveau, validés et prêts à relever vos défis les plus complexes.", delay: 0.3 },
    { icon: <ShieldCheck size={24} />, title: "Processus Sécurisé", description: "Nous assurons un cadre contractuel et administratif simple, transparent et sécurisé pour chaque mission.", delay: 0.4 },
  ];

  return (
    <>
      <Helmet>
        <title>Pourquoi InspiraTec ? - Notre Vision et Nos Valeurs</title>
        <meta name="description" content="Découvrez la mission d'InspiraTec : connecter les entreprises avec les meilleurs experts indépendants grâce à une plateforme innovante, agile et humaine." />
      </Helmet>
      <div className="bg-background text-foreground">
        <div className="container-custom py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Notre mission : Révolutionner la collaboration</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Chez InspiraTec, nous croyons que la flexibilité et l'expertise sont les clés du succès. Nous avons créé une plateforme qui élimine les barrières entre les entreprises visionnaires et les experts passionnés.
            </p>
          </motion.div>
        </div>

        <div className="container-custom pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        <div className="bg-muted/40 py-16 md:py-24">
          <div className="container-custom max-w-4xl mx-auto">
            <FeaturedTestimonial />
          </div>
        </div>

        <div className="bg-background">
          <div className="container-custom py-16 md:py-24">
            <div className="relative overflow-hidden rounded-2xl bg-primary/5 p-8 md:p-16 border">
                <div 
                    aria-hidden="true" 
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundImage: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(var(--secondary) / 0.1), transparent 40%)',
                    }}
                />
                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre manière de travailler ?</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Que vous soyez une entreprise en quête d'expertise ou un talent cherchant des missions stimulantes, InspiraTec est votre partenaire de croissance.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="group">
                                <Link to="/post-mission">
                                    J'ai une mission <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link to="/find-mission">
                                    Je cherche une mission
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhyInspiratec;