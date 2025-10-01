import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { useBlogManager } from '@/hooks/useBlogManager';
import ArticleForm from '@/components/admin/blog/ArticleForm';
import BlogTable from '@/components/admin/blog/BlogTable';
import LinkedInConfig from '@/components/admin/blog/LinkedInConfig';

const ManageBlog = () => {
  const {
    articles,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    editingArticle,
    formData,
    setFormData,
    linkedinAccessToken,
    setLinkedinAccessToken,
    openNewDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    publishToLinkedIn,
  } = useBlogManager();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestion du Blog</h1>
          <p className="text-slate-400 mt-2">
            Créez et gérez les articles de blog avec publication automatique sur LinkedIn
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ArticleForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              editingArticle={editingArticle}
              setIsDialogOpen={setIsDialogOpen}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      <LinkedInConfig token={linkedinAccessToken} setToken={setLinkedinAccessToken} />

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Articles ({articles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-400 mt-2">Chargement...</p>
            </div>
          ) : (
            <BlogTable
              articles={articles}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onPublish={publishToLinkedIn}
              linkedinAccessToken={linkedinAccessToken}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBlog;