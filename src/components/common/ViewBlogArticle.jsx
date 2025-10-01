import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Tags, Video } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Spinner from '@/components/common/Spinner';
import { Badge } from '@/components/ui/badge';
import ReactPlayer from 'react-player';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ViewBlogArticle = ({ backPath: defaultBackPath }) => {
  const { slug } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const backPath = location.state?.from || defaultBackPath || '/blog';

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs_with_details')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) {
        console.error('Error fetching article:', error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  if (!article) {
    return <div className="text-center py-20">Article non trouvé.</div>;
  }
  
  const pageTitle = `${article.title} | Blog Inspiratec`;
  const pageDescription = article.summary || article.content.substring(0, 150);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={article.image_url} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-between items-center"
        >
          <Link to={backPath} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
          <Button asChild variant="outline" className="ml-auto">
            <Link to="/blog">Voir tous les blogs</Link>
          </Button>
        </motion.div>
        
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            {article.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-6 md:p-10">
              <header className="mb-8">
                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{article.author_name || 'InspiraTec'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <time dateTime={article.published_at}>
                      {format(new Date(article.published_at), 'd MMMM yyyy', { locale: fr })}
                    </time>
                  </div>
                </div>
              </header>

              {article.video_url && (
                <div className="my-8 aspect-video">
                  <ReactPlayer url={article.video_url} width="100%" height="100%" controls />
                </div>
              )}
              
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }} 
              />

              {article.tags && article.tags.length > 0 && (
                <footer className="mt-12 border-t pt-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tags className="h-5 w-5 text-muted-foreground"/>
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </footer>
              )}
            </CardContent>
          </Card>
        </motion.article>
      </div>
    </>
  );
};

export default ViewBlogArticle;