import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Spinner from "../common/Spinner";
import { useToast } from "../ui/use-toast";

const TalentCard = ({ user, delay = 0 }) => {
  const { toast } = useToast();
  
  const handleNotImplemented = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "La consultation détaillée des profils arrive très prochainement.",
    });
  };

  const displayName = user.role === 'expert' 
    ? `${user.first_name || ''} ${user.last_name ? user.last_name.charAt(0) + '.' : ''}`.trim() 
    : user.company_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={user.avatar_url} 
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{displayName}</h3>
            <p className="text-primary font-medium truncate">{user.expert_title || user.company_description?.substring(0, 40) + '...'}</p>
            {(user.city || user.country) &&
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>
              </div>
            }
          </div>
        </div>
        
        {user.role === 'expert' && user.skills?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {user.skills.slice(0, 4).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={handleNotImplemented}
        >
          Voir le profil
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

const TalentsSection = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_with_details')
        .select(`
          id, role, first_name, last_name, company_name, expert_title, 
          company_description, city, country, skills, avatar_url
        `)
        .in('role', ['expert', 'company'])
        .or('profile_completed.eq.true,role.eq.company')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if(error) {
        console.error("Error fetching talents", error);
        setError(error);
      } else {
        setTalents(data);
      }
      setLoading(false);
    }

    fetchTalents();
  }, []);

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "La consultation de tous les profils arrive très prochainement.",
    });
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-8"><Spinner/></div>;
    if (error) return <div className="text-center text-destructive py-8">Impossible de charger les talents.</div>;
    if (talents.length === 0) return <div className="text-center text-muted-foreground py-8">Aucun profil à afficher pour le moment.</div>;
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {talents.map((talent, index) => (
          <TalentCard key={talent.id} user={talent} delay={index * 0.1} />
        ))}
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Découvrez nos talents & entreprises partenaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une sélection de nos meilleurs experts et des entreprises qui nous font confiance.
          </p>
        </motion.div>
        
        {renderContent()}
        
        <div className="text-center">
            <Button size="lg" variant="outline" className="rounded-full" onClick={handleNotImplemented}>
              Voir tous les profils
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>
    </section>
  );
};

export default TalentsSection;