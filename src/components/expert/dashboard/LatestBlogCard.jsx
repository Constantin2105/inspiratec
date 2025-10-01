import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rss } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LatestBlogCard = ({ blogPosts }) => {
  if (!blogPosts || blogPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog InspiraTec</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Rss className="mx-auto h-10 w-10" />
          <p className="mt-4 text-sm">Aucun article de blog pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  const latestPost = blogPosts[0];

  return (
    <Card>
      <CardHeader>
        <CardDescription>Dernier article du blog</CardDescription>
        <CardTitle className="line-clamp-2 text-lg">{latestPost.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {latestPost.summary || 'Pas de résumé disponible.'}
        </p>
        <p className="text-xs text-muted-foreground">
            Publié le {format(new Date(latestPost.created_at), 'd MMMM yyyy', { locale: fr })} par {latestPost.author_name}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/expert/dashboard/blog/${latestPost.slug}`}>
            Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LatestBlogCard;