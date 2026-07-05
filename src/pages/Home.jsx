import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedCourses from '../components/FeaturedCourses';
import TeachersSection from '../components/TeachersSection';

import BenefitsSection from '../components/BenefitsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import ChatbotButton from '../components/ChatbotButton';
import ChatbotWindow from '../components/ChatbotWindow';
import TeacherIntro from '../components/TeacherIntro';
import teachers from '../data/teacher.json';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="pt-20 lg:pt-24">
      <FeaturedCourses />
      <TeachersSection />
     
    
      <Footer />
      {isChatOpen && <ChatbotWindow onClose={toggleChat} />}
      <ChatbotButton onClick={toggleChat} />
    </div>
  );
};

export default Home;
