import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/home/HeroSection';
import ApproachSection from '@/components/home/ApproachSection';
import ProcessSection from '@/components/home/ProcessSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import FinalCTASection from '@/components/home/FinalCTASection';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleRedirect = (path) => {
    navigate(path);
  };

  return (
    <>
      <Helmet>
        <title>Inspiratec : Trouvez Votre Expert Tech Freelance | Recrutement IT & Missions</title>
        <meta name="description" content="Accélérez vos projets avec nos freelances tech d'élite. Trouvez facilement le développeur, data scientist ou chef de projet freelance pour votre mission. Inscription gratuite." />
        <meta name="keywords" content="experts tech, freelance IT, recrutement tech, développeur, UX designer, chef de projet digital, plateforme mise en relation, talents tech" />
      </Helmet>
      <HeroSection handleRedirect={handleRedirect} />
      <ApproachSection />
      <ProcessSection />
      <BenefitsSection handleRedirect={handleRedirect} />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection handleRedirect={handleRedirect} />
    </>
  );
};

export default Home;