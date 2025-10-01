import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '@/components/admin/UserForm';
import { useAdmin } from '@/hooks/useAdmin';
import UserEditForm from '@/components/admin/users/UserEditForm';
import Spinner from '@/components/common/Spinner';

const AdminUserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, handleUserAction, loading } = useAdmin();
  const isEditMode = !!id;

  const user = isEditMode ? users.find(u => u.id === id) : null;

  if (isEditMode && loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }
  
  if(isEditMode && !user && !loading) {
    return <div className="text-center text-destructive">Utilisateur non trouvé.</div>
  }

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Modifier' : 'Créer'} un Utilisateur - Admin</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste des utilisateurs
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? `Modifier ${user.display_name}` : "Créer un nouvel utilisateur"}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Modifiez les informations ci-dessous. Les changements seront appliqués immédiatement."
                : "Remplissez les champs ci-dessous. Le compte sera créé et activé instantanément."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <UserEditForm 
                user={user}
                onFinished={() => navigate('/admin/users')}
                handleUserAction={handleUserAction}
              />
            ) : (
              <UserForm 
                onFinished={() => navigate('/admin/users')}
                handleUserAction={handleUserAction}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminUserFormPage;