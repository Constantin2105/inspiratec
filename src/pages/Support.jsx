import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Mail, Phone, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import AvatarViewer from '@/components/common/AvatarViewer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut } from 'lucide-react';
// Removed motion import for maximum stability

const SupportPage = () => {
  const { user, profile, loading, signOut, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleBackToDashboard = () => {
    if (profile?.role) {
      navigate(getRedirectPath(profile.role));
    } else {
      navigate('/');
    }
  };

  const getInitials = () => {
    if (!profile?.display_name) return 'U';
    const nameParts = profile.display_name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return profile.display_name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Support - Inspiratec</title>
        <meta name="description" content="Page de support pour les utilisateurs Inspiratec." />
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50">
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center">
                <img alt="InspiraTec Logo Light" className="h-8 md:h-10 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
                <img alt="InspiraTec Logo Dark" className="h-8 md:h-10 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3">
                  <AvatarViewer
                    src={profile?.avatar_url}
                    alt={profile?.display_name}
                    fallback={getInitials()}
                    triggerClassName="h-9 w-9"
                  />
                  <span className="hidden sm:inline font-medium">{profile?.display_name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Déconnexion
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div> {/* This div directly replaces the motion.div */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Mes demandes</h1>
              </div>
              
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <LifeBuoy className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Besoin d'aide, {profile?.display_name} ?</CardTitle>
                  <CardDescription>Notre équipe est là pour vous aider. Contactez-nous pour toute question ou problème.</CardDescription>
                </CardHeader>
                <CardContent className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="mailto:support@inspiratec.fr" className="block">
                      <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Mail className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold">Par Email</p>
                            <p className="text-sm text-muted-foreground">support@inspiratec.fr</p>
                          </div>
                        </CardHeader>
                      </Card>
                    </a>
                    <a href="tel:+33616186864" className="block">
                      <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Phone className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold">Par Téléphone</p>
                            <p className="text-sm text-muted-foreground">+33 6 16 18 68 64</p>
                          </div>
                        </CardHeader>
                      </Card>
                    </a>
                  </div>
                  <div className="text-center pt-6">
                    <Button onClick={handleBackToDashboard}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour au tableau de bord
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SupportPage;