import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import courses from '../data/mockCourses.json';
import lessonsData from '../data/lessons.json';
import LessonForm from '../components/lesson/LessonForm';
import LessonList from '../components/lesson/LessonList';

const ManageLessons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (location.state && location.state.courseId) return location.state.courseId;
    return courses[0]?.id || 1;
  });
  const [lessons, setLessons] = useState(lessonsData.filter(l => l.courseId === selectedCourse));
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('token') || user?.role !== 'teacher') navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const filtered = lessonsData.filter(l => l.courseId === selectedCourse);
    setLessons(filtered);
  }, [selectedCourse]);

  const handleAddLesson = (lesson) => {
    const newLesson = {
      ...lesson,
      id: lessonsData.length ? Math.max(...lessonsData.map(l => l.id)) + 1 : 1,
      courseId: selectedCourse,
    };
    lessonsData.push(newLesson);
    setLessons([...lessons, newLesson]);
    setShowForm(false);
  };

  const handleDeleteLesson = (id) => {
    const idx = lessonsData.findIndex(l => l.id === id);
    if (idx !== -1) lessonsData.splice(idx, 1);
    setLessons(lessons.filter(l => l.id !== id));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white flex items-center gap-2">Quản lý bài học</h1>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => setShowForm(true)}
            >
              Thêm bài học
            </button>
          </div>
          <div className="mb-6 flex gap-3 items-center">
            <span className="font-semibold text-blue-700 dark:text-blue-200">Chọn khoá học:</span>
            <select
              className="rounded-lg border border-blue-200 dark:border-blue-700 px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedCourse}
              onChange={e => setSelectedCourse(Number(e.target.value))}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          {/* Modal dialog cho form thêm bài học */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                  onClick={() => setShowForm(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-6">Thêm bài học mới</h2>
                <LessonForm
                  onSubmit={handleAddLesson}
                  onCancel={() => setShowForm(false)}
                  initialLesson={{ order: lessons.length + 1 }}
                />
              </div>
            </div>
          )}
          <LessonList lessons={lessons} onDelete={handleDeleteLesson} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageLessons; 