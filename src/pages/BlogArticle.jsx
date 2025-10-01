import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

const BlogArticle = () => {
  const { slug } = useParams();
  return (
    <>
      <Helmet>
        <title>Article - InspiraTec</title>
        <meta name="description" content="Contenu de l'article." />
      </Helmet>
      <div className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold">Article: {slug}</h1>
        </motion.div>
      </div>
    </>
  );
};

export default BlogArticle;