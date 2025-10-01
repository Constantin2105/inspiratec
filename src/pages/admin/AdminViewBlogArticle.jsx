import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabase/client';
    import Spinner from '@/components/common/Spinner';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { ArrowLeft, Edit } from 'lucide-react';
    import ReactPlayer from 'react-player/lazy';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';

    const getStatusBadgeVariant = (status) => {
      const variants = { published: 'success', draft: 'outline', pending_review: 'warning', archived: 'secondary' };
      return variants[status] || 'default';
    };

    const getStatusLabel = (status) => {
      const labels = { published: 'Publié', draft: 'Brouillon', pending_review: 'En attente', archived: 'Archivé' };
      return labels[status] || status;
    };

    const AdminViewBlogArticle = () => {
      const { slug } = useParams();
      const navigate = useNavigate();
      const [article, setArticle] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

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
            setError('Article non trouvé ou une erreur est survenue.');
          } else {
            setArticle(data);
          }
          setLoading(false);
        };

        fetchArticle();
      }, [slug]);

      if (loading) {
        return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
      }

      if (error || !article) {
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">{error || 'Article non trouvé'}</h1>
            <Button asChild variant="link">
              <Link to="/admin/content">Retour à la gestion de contenu</Link>
            </Button>
          </div>
        );
      }

      return (
        <>
          <Helmet>
            <title>Aperçu : {article.title} - Admin</title>
            <meta name="description" content={`Aperçu de l'article de blog: ${article.title}`} />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={() => navigate('/admin/content', { state: { tab: 'blog' } })}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la liste des articles
                </Button>
                <Button onClick={() => navigate(`/admin/blog/edit/${article.slug}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier l'article
                </Button>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">{article.title}</h1>
                    <Badge variant={getStatusBadgeVariant(article.status)} className="text-base flex-shrink-0 ml-4 mt-1">{getStatusLabel(article.status)}</Badge>
                </div>
              
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
                  dangerouslySetInnerHTML={{ __html: article.content || '' }} 
                />
            </div>
          </motion.div>
        </>
      );
    };

    export default AdminViewBlogArticle;