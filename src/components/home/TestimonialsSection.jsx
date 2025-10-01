import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';

const TestimonialCard = ({ testimonial }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAuthorTitle = (testimonial) => {
        if (testimonial.author_type === 'expert') {
            return testimonial.expert_title || 'Expert';
        }
        if (testimonial.author_type === 'company') {
            return testimonial.representative_position || 'Entreprise Partenaire';
        }
        return testimonial.author_title || 'Partenaire';
    };
    
    const isUserAuthor = !!testimonial.author_user_id;
    
    let displayName;
    if (isUserAuthor) {
        if (testimonial.author_type === 'expert') {
            displayName = testimonial.first_name || 'Expert Inspiratec';
        } else if (testimonial.author_type === 'company') {
            displayName = testimonial.company_name || 'Entreprise Partenaire';
        } else {
            displayName = testimonial.display_name || 'Utilisateur';
        }
    } else {
        displayName = testimonial.author_name || 'Auteur Anonyme';
    }

    const avatarSrc = isUserAuthor ? testimonial.avatar_url : testimonial.author_avatar_url;

    return (
        <Card className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardHeader className="flex-row items-center gap-4 pb-4">
                <Avatar className="w-14 h-14">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg">{displayName}</h3>
                    <p className="text-sm text-muted-foreground">{getAuthorTitle(testimonial)}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
            </CardContent>
            <CardFooter>
                <div className="flex items-center gap-1">
                    {testimonial.rating && [...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                </div>
            </CardFooter>
        </Card>
    );
};

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomepageTestimonials = async () => {
            setLoading(true);
            try {
                const expertQuery = supabase.from('testimonials_with_author')
                    .select('*')
                    .eq('is_homepage_featured', true)
                    .eq('author_type', 'expert')
                    .eq('status', 'approved')
                    .limit(1)
                    .maybeSingle();

                const companyQuery = supabase.from('testimonials_with_author')
                    .select('*')
                    .eq('is_homepage_featured', true)
                    .eq('author_type', 'company')
                    .eq('status', 'approved')
                    .limit(1)
                    .maybeSingle();

                const [expertRes, companyRes] = await Promise.all([expertQuery, companyQuery]);
                
                const finalTestimonials = [];
                if (expertRes.data) finalTestimonials.push(expertRes.data);
                if (companyRes.data) finalTestimonials.push(companyRes.data);

                setTestimonials(finalTestimonials);

            } catch (error) {
                console.error("Error fetching testimonials:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomepageTestimonials();
    }, []);

    return (
        <section className="py-20 sm:py-32 bg-primary/20">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center">Ce que nos partenaires disent de nous</h2>
                    <p className="mt-4 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                        Découvrez comment Inspiratec transforme la collaboration entre experts et entreprises.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center mt-12"><Spinner /></div>
                ) : testimonials.length > 0 ? (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                           <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                           >
                                <TestimonialCard testimonial={testimonial} />
                           </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center mt-12 text-muted-foreground">Aucun témoignage à afficher pour le moment.</p>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;