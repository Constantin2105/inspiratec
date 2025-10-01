import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '@/components/admin/UserForm';
import { useAdmin } from '@/hooks/useAdmin';

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUserAction } = useAdmin();

  return (
    <>
      <Helmet>
        <title>{id ? 'Modifier' : 'Créer'} un Utilisateur - Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{id ? 'Modifier' : 'Créer'} un Utilisateur</h1>
            <p className="text-muted-foreground">
              {id ? 'Mettez à jour les informations de l\'utilisateur.' : 'Ajoutez un nouvel utilisateur à la plateforme.'}
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'utilisateur</CardTitle>
            <CardDescription>
              Remplissez les champs ci-dessous. Un e-mail de bienvenue et de vérification sera envoyé à l'utilisateur pour qu'il puisse définir son mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm 
              userId={id} 
              onFinished={() => navigate('/admin/users')}
              handleUserAction={handleUserAction}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminCreateUser;