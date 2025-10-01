import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Briefcase, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Connexion - InspiraTec</title>
        <meta name="description" content="Choisissez votre type de compte pour vous connecter." />
      </Helmet>
      <div className="relative flex flex-col justify-center items-center min-h-screen container mx-auto px-4 py-8 sm:py-16">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Revenir sur le site</span>
                <span className="sm:hidden">Retour</span>
              </Link>
            </Button>
        </div>
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center pt-16 sm:pt-0"> {/* Added responsive top padding here */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 md:mb-12"
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Accédez à votre espace</h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground">Êtes-vous un expert ou une entreprise ?</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Link to="/login/expert" className="block h-full w-full">
                  <Card className="p-6 md:p-8 text-center bg-card text-card-foreground border hover:border-primary transition-all duration-300 h-full flex flex-col justify-center items-center group hover:shadow-xl hover:-translate-y-1">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-4" />
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl sm:text-2xl font-bold">Espace Expert</CardTitle>
                      <CardDescription className="mt-2 text-sm sm:text-base text-muted-foreground">
                        Trouvez des missions, gérez vos candidatures et développez votre carrière.
                      </CardDescription>
                    </CardHeader>
                    <div className="mt-4 flex items-center text-primary font-semibold text-sm sm:text-base">
                      Me connecter en tant qu'expert
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <Link to="/login/company" className="block h-full w-full">
                  <Card className="p-6 md:p-8 text-center bg-card text-card-foreground border hover:border-primary transition-all duration-300 h-full flex flex-col justify-center items-center group hover:shadow-xl hover:-translate-y-1">
                    <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-4" />
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl sm:text-2xl font-bold">Espace Entreprise</CardTitle>
                      <CardDescription className="mt-2 text-sm sm:text-base text-muted-foreground">
                        Publiez des missions, trouvez les meilleurs talents et gérez vos projets.
                      </CardDescription>
                    </CardHeader>
                    <div className="mt-4 flex items-center text-primary font-semibold text-sm sm:text-base">
                      Me connecter en tant qu'entreprise
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="mt-8 md:mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-muted-foreground mb-4">Vous n'avez pas de compte ?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/signup/expert">S'inscrire comme Expert</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/signup/company">S'inscrire comme Entreprise</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;