import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/admin/ArticleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { clearFormPersistence } from '@/hooks/useFormPersistence';

const AdminCreateBlog = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEditing = !!slug;

    const formPersistenceKey = useMemo(() => `form-blog-article-${slug || 'new'}`, [slug]);

    const handleFinished = () => {
        clearFormPersistence(formPersistenceKey);
        navigate('/admin/content', { state: { tab: 'blog' }, replace: true });
    };

    return (
        <>
            <Helmet>
                <title>{isEditing ? 'Modifier' : 'Créer'} un Article - Admin</title>
            </Helmet>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-6">
                    <Button variant="outline" onClick={handleFinished}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la liste des articles
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Modifier l\'article' : 'Créer un nouvel article'}</CardTitle>
                        <CardDescription>
                            {isEditing ? 'Modifiez les détails de l\'article ci-dessous.' : 'Remplissez le formulaire pour créer un nouvel article de blog.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ArticleForm articleSlug={slug} onFinished={handleFinished} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminCreateBlog;