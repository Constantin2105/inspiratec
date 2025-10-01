import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const mockPosts = [
  {
    id: 1,
    slug: 'tendances-tech-2025',
    title: 'Les 5 tendances technologiques qui définiront 2025',
    excerpt: 'De l\'IA générative au calcul quantique, découvrez les innovations qui façonneront l\'avenir du travail et de la technologie.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    author: { name: 'Jeanne Doe', avatar: 'https://avatar.vercel.sh/jeanne.png' },
    category: 'Innovation',
    date: '2 Juillet 2025',
    featured: true,
  },
  {
    id: 2,
    slug: 'reussir-mission-freelance',
    title: 'Comment réussir sa première mission en tant que freelance ?',
    excerpt: 'Conseils pratiques pour les nouveaux experts : de la prise de brief à la livraison finale, assurez le succès de vos projets.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    author: { name: 'Paul Smith', avatar: 'https://avatar.vercel.sh/paul.png' },
    category: 'Carrière',
    date: '28 Juin 2025',
  },
  {
    id: 3,
    slug: 'pourquoi-externaliser-dev-it',
    title: 'Pourquoi externaliser son développement IT en 2025 ?',
    excerpt: 'Flexibilité, expertise et maîtrise des coûts. Découvrez les avantages de faire appel à des experts externes pour vos projets tech.',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
    author: { name: 'Marie Curie', avatar: 'https://avatar.vercel.sh/marie.png' },
    category: 'Entreprise',
    date: '25 Juin 2025',
  },
   {
    id: 4,
    slug: 'le-futur-du-design-ux-ui',
    title: 'Le futur du design : entre interfaces vocales et expériences immersives',
    excerpt: 'Plongez dans les prochaines révolutions du design d\'interface et découvrez les compétences à acquérir.',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop',
    author: { name: 'Jeanne Doe', avatar: 'https://avatar.vercel.sh/jeanne.png' },
    category: 'Design',
    date: '20 Juin 2025',
  },
];


const BlogPostCard = ({ post }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <img  className="w-full h-48 object-cover" alt={post.title} src="https://images.unsplash.com/photo-1621165031056-2fb2961935d1" />
      <CardHeader>
        <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
        <CardTitle className="text-xl leading-tight">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{post.author.name}</span>
        </div>
        <span>{post.date}</span>
      </CardFooter>
    </Card>
  </motion.div>
)

const FeaturedPost = ({ post }) => (
  <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mb-16"
  >
    <Card className="grid md:grid-cols-2 overflow-hidden rounded-lg shadow-lg">
      <div className="md:order-2">
        <img  className="w-full h-64 md:h-full object-cover" alt={post.title} src="https://images.unsplash.com/photo-1621165031056-2fb2961935d1" />
      </div>
      <div className="p-8 flex flex-col justify-center">
        <Badge variant="default" className="w-fit mb-4">{post.category}</Badge>
        <h2 className="text-3xl font-bold mb-4">
            <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </h2>
        <p className="text-muted-foreground mb-6">{post.excerpt}</p>
        <div className="flex items-center justify-between text-muted-foreground">
           <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{post.author.name}</p>
                <p className="text-sm">{post.date}</p>
              </div>
            </div>
            <Link to={`/blog/${post.slug}`} className="text-primary font-semibold flex items-center gap-1">
                Lire la suite <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
      </div>
    </Card>
  </motion.div>
)


const Blog = () => {
  const featuredPost = mockPosts.find(p => p.featured);
  const otherPosts = mockPosts.filter(p => !p.featured);

  return (
    <>
      <Helmet>
        <title>Blog - InspiraTec</title>
        <meta name="description" content="Articles et actualités sur la technologie, le freelancing et le recrutement. Restez à jour avec les dernières tendances du monde de la tech." />
      </Helmet>
      
      <div className="bg-muted/40">
        <div className="container-custom py-16 md:py-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Le Blog InspiraTec
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Nos analyses, conseils et actualités pour les entreprises innovantes et les experts tech ambitieux.
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-16">
        {featuredPost && <FeaturedPost post={featuredPost} />}
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BlogPostCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;