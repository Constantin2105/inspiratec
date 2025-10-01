import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ViewBlogArticle from '@/components/common/ViewBlogArticle';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CompanyViewBlogArticlePage = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login/company" />;
  
  return (
    <>
      <Helmet>
        <title>Blog - Inspiratec</title>
      </Helmet>
      <div className="w-full">
        <ViewBlogArticle backPath="/company/dashboard" />
      </div>
    </>
  );
};

export default CompanyViewBlogArticlePage;