import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, AlertTriangle } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TestimonialCard = ({ testimonial, delay }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 flex-grow">
        <Quote className="h-8 w-8 text-primary/20 mb-4" />
        <p className="text-card-foreground/90 italic leading-relaxed">
          "{testimonial.content}"
        </p>
      </div>
      <div className="bg-muted/50 p-6 mt-auto">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-4 border-2 border-background">
            <AvatarImage src={testimonial.avatar_url} alt={testimonial.display_name} />
            <AvatarFallback>{getInitials(testimonial.display_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-card-foreground">{testimonial.display_name || 'Anonyme'}</p>
            {testimonial.author_type === 'expert' && <p className="text-sm text-primary font-medium">{testimonial.expert_title || 'Expert'}</p>}
            {testimonial.author_type === 'company' && (
              <div className="text-sm text-muted-foreground">
                {testimonial.representative_position && <p>{testimonial.representative_position}</p>}
                <p className="font-medium">{testimonial.company_name}</p>
              </div>
            )}
          </div>
        </div>
        {testimonial.rating && (
          <div className="flex items-center mt-4 pt-4 border-t">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('testimonials_with_author')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setTestimonials(data);
      } catch (err) {
        console.error("Failed to load testimonials:", err.message);
        setError("Erreur de chargement des témoignages.");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <>
      <Helmet>
        <title>Témoignages - InspiraTec</title>
        <meta name="description" content="Découvrez ce que nos clients et experts pensent de notre plateforme." />
      </Helmet>
      <div className="bg-muted/40">
        <div className="container-custom py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Ce qu'ils disent de nous</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              La satisfaction de nos clients et de nos experts est notre plus grande fierté. Découvrez leurs retours d'expérience.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center"><Spinner size="lg" /></div>
          ) : error ? (
            <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} delay={index * 0.1} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Aucun témoignage à afficher pour le moment.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TestimonialsPage;