import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, ImageOff } from 'lucide-react';
import { htmlToPlainText } from '@/lib/utils/text';

const BlogSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs_with_details')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setArticles(data);
      } catch (err) {
        console.error("Error fetching blog articles for homepage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container-custom text-center">
          <Spinner />
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null; // Don't render the section if there are no articles
  }

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Dernières Actualités & Analyses</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explorez les tendances, les conseils et les innovations de notre communauté d'experts.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
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
                      <span>{format(new Date(article.created_at), 'd MMMM yyyy', { locale: fr })}</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow px-6">
                  <p className="text-muted-foreground line-clamp-3">
                    {article.summary || htmlToPlainText(article.content, 150)}
                  </p>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button asChild className="w-full" variant="secondary">
                    <Link to={`/blog/${article.slug}`}>
                      Lire l'article <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Button asChild size="lg">
            <Link to="/blog">Explorer le blog</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;