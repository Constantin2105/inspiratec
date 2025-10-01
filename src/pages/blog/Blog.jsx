import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowRight, ImageOff } from 'lucide-react';
import { getFromCache, setInCache } from "@/lib/utils/cache";
import { htmlToPlainText } from '@/lib/utils/text';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      const cacheKey = 'cache_blog_articles_all';
      const cachedData = getFromCache(cacheKey);

      if(cachedData) {
        setArticles(cachedData);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs_with_details')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setArticles(data);
        setInCache(cacheKey, data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    if (error) {
      return <p className="text-center text-destructive">Erreur de chargement des articles : {error}</p>;
    }

    if (articles.length === 0) {
      return <p className="text-center text-muted-foreground">Aucun article publié pour le moment.</p>;
    }

    return (
      <motion.div
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {articles.map((article) => (
          <motion.div key={article.id} variants={itemVariants}>
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="p-0">
                <Link to={`/blog/${article.slug}`} className="block aspect-video overflow-hidden bg-muted flex items-center justify-center">
                  {article.image_url ? (
                    <img 
                      src={article.image_url}
                      alt={`Image pour ${article.title}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ImageOff className="h-12 w-12 text-muted-foreground" />
                  )}
                </Link>
                <div className="p-6">
                  <CardTitle className="text-xl font-bold leading-tight line-clamp-2">
                    <Link to={`/blog/${article.slug}`} className="hover:text-primary transition-colors">{article.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-sm pt-2">
                    <span>Publié le {format(new Date(article.created_at), 'd MMMM yyyy', { locale: fr })}</span>
                    <span className="mx-2">•</span>
                    <span>par {article.author_name || 'InspiraTec'}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow px-6">
                <p className="text-muted-foreground line-clamp-3">
                  {article.summary || htmlToPlainText(article.content, 150)}
                </p>
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/blog/${article.slug}`}>
                    Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Blog - InspiraTec</title>
        <meta name="description" content="Découvrez les dernières actualités, conseils et analyses du monde de la tech et du freelancing sur le blog d'InspiraTec." />
      </Helmet>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Notre <span className="text-primary">Blog</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Plongez au cœur de l'innovation, des stratégies et des tendances qui façonnent le futur du travail.
          </p>
        </motion.div>
        {renderContent()}
      </div>
    </>
  );
};

export default Blog;