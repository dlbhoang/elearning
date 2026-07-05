import React from 'react';
import { FiUser, FiBookOpen, FiMail, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';

const TeacherCard = ({ teacher }) => {
  if (!teacher) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 text-center flex flex-col items-center">
      <img src={teacher.avatar} alt={teacher.name} className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-blue-200 dark:border-blue-700 shadow" />
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 justify-center"><FiUser /> {teacher.name}</h2>
      <p className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 justify-center"><FiBookOpen /> {teacher.subject}</p>
      {teacher.experience && (
        <p className="text-sm text-gray-500 flex items-center gap-2 justify-center">🏆 {teacher.experience} năm kinh nghiệm</p>
      )}
      <p className="text-gray-600 dark:text-gray-300 mt-2">{teacher.bio}</p>
      {teacher.email && (
        <p className="text-sm text-gray-500 flex items-center gap-2 justify-center"><FiMail /> {teacher.email}</p>
      )}
      {(teacher.facebook || teacher.instagram || teacher.linkedin) && (
        <div className="flex gap-4 mt-3 justify-center">
          {teacher.facebook && (
            <a href={teacher.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><FiFacebook size={22} /></a>
          )}
          {teacher.instagram && (
            <a href={teacher.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700"><FiInstagram size={22} /></a>
          )}
          {teacher.linkedin && (
            <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900"><FiLinkedin size={22} /></a>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherCard;
