import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ViewBlogArticle from '@/components/common/ViewBlogArticle';
import { Navigate } from 'react-router-dom';

const ExpertViewBlogArticle = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login/expert" />;
  
  return (
    <div className="max-w-3xl mx-auto">
      <ViewBlogArticle backPath="/expert/dashboard" />
    </div>
  );
};

export default ExpertViewBlogArticle;