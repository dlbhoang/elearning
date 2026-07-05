import React from 'react';
import { FiUser, FiBookOpen, FiMail, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';

const TeacherIntro = ({ teacher }) => {
  if (!teacher) return null;
  return (
    <div className="w-full bg-gradient-to-br from-primary/10 via-white to-primary/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 md:px-0 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
      <img src={teacher.avatar} alt={teacher.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary shadow-lg mb-4 md:mb-0" />
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2 justify-center md:justify-start">
          <FiUser className="text-primary" /> {teacher.name}
        </h1>
        <p className="text-primary font-semibold flex items-center gap-2 justify-center md:justify-start">
          <FiBookOpen className="text-primary" /> {teacher.subject}
        </p>
        <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><FiMail className="text-primary" /> {teacher.email}</span>
          {teacher.facebook && (
            <a href={teacher.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
              <FiFacebook className="text-primary" size={22} />
            </a>
          )}
          {teacher.linkedin && (
            <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
              <FiLinkedin className="text-primary" size={22} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherIntro; 