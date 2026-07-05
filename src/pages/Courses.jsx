import React, { useState } from 'react';
import coursesData from '../data/allCourses.json';
import CourseCard from '../components/CourseCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]))];

const Courses = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const navigate = useNavigate();
  const grades = getUnique(coursesData, 'grade');
  const subjects = subject
    ? getUnique(coursesData.filter(c => c.grade === grade), 'subject')
    : getUnique(coursesData, 'subject');

  const filtered = coursesData.filter(c =>
    (!grade || c.grade === grade) && (!subject || c.subject === subject)
  );

  const handleRegister = (course) => {
    // Có thể xử lý logic đăng ký ở đây nếu muốn
    // Hoặc để CourseCard tự xử lý
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-primary text-center mb-8">Tất cả khoá học</h1>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <select value={grade} onChange={e => { setGrade(e.target.value); setSubject(''); }} className="px-4 py-2 rounded-lg border border-primary text-primary font-semibold bg-white dark:bg-gray-900 dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Tất cả lớp</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="px-4 py-2 rounded-lg border border-primary text-primary font-semibold bg-white dark:bg-gray-900 dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Tất cả môn</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20 text-lg">Không tìm thấy khoá học phù hợp.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filtered.map(course => (
                <div key={course.id} className="relative group">
                  <CourseCard course={course} onRegister={handleRegister} />
                  <button
                    className="absolute bottom-6 right-6 px-4 py-1 bg-primary/90 text-white rounded-full font-semibold shadow hover:bg-primary transition text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Courses; 