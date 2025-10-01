import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import Spinner from '@/components/common/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';
import { getFromCache, setInCache } from "@/lib/utils/cache";

const BlogArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const cacheKey = `cache_blog_article_${slug}`;
      const cachedData = getFromCache(cacheKey);

      if (cachedData) {
        setArticle(cachedData);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs_with_details')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        
        setArticle(data);
        setInCache(cacheKey, data);

      } catch (err) {
        setError('Article non trouvé ou une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">{error || 'Article non trouvé'}</h1>
        <Link to="/blog" className="text-primary hover:underline">Retour au blog</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - InspiraTec</title>
        <meta name="description" content={article.summary} />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-card p-6 sm:p-10 rounded-xl shadow-lg"
        >
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{article.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 text-muted-foreground">
            <Avatar className="h-12 w-12">
              <AvatarImage src={article.author_avatar_url} alt={article.author_name} />
              <AvatarFallback>{article.author_name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{article.author_name || 'Admin'}</p>
              <p className="text-sm">Publié le {format(new Date(article.created_at), 'd MMMM yyyy', { locale: fr })}</p>
            </div>
          </div>

          {article.image_url && (
            <img 
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg mb-8 aspect-video object-cover"
            />
          )}
          
          {article.video_url && (
            <div className="aspect-video w-full mb-8 overflow-hidden rounded-lg">
              <ReactPlayer url={article.video_url} width="100%" height="100%" controls />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.div>
      </div>
    </>
  );
};

export default BlogArticle;