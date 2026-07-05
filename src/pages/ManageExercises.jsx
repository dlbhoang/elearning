import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { getMyCourses } from '../services/courseService';
import { getChaptersByCourse, getLessonsByChapter } from '../services/lessonService';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const ManageExercises = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || user?.role !== 'teacher') {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [navigate, token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchChapters(selectedCourse);
    }
  }, [selectedCourse, token]);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessons(selectedChapter);
    } else {
      setLessons([]);
      setSelectedLesson(null);
    }
  }, [selectedChapter, token]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses(token);
      if (Array.isArray(data)) {
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } else if (data.status === "success") {
        setCourses(data.data || []);
        if (data.data?.length > 0) {
          setSelectedCourse(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy courses:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy danh sách khóa học", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (courseId) => {
    try {
      setLoading(true);
      const data = await getChaptersByCourse(token, courseId);
      if (Array.isArray(data)) {
        setChapters(data);
        if (data.length > 0) {
          setSelectedChapter(data[0].id);
        } else {
          setSelectedChapter(null);
        }
      } else if (data.status === "success") {
        setChapters(data.data || []);
        if (data.data?.length > 0) {
          setSelectedChapter(data.data[0].id);
        } else {
          setSelectedChapter(null);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy chapters:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy danh sách chương", "error");
      setChapters([]);
      setSelectedChapter(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (chapterId) => {
    try {
      setLoading(true);
      const data = await getLessonsByChapter(token, chapterId);
      if (Array.isArray(data)) {
        setLessons(data);
        if (data.length > 0) {
          setSelectedLesson(data[0].id);
        } else {
          setSelectedLesson(null);
        }
      } else if (data.status === "success") {
        setLessons(data.data || []);
        if (data.data?.length > 0) {
          setSelectedLesson(data.data[0].id);
        } else {
          setSelectedLesson(null);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy lessons:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy danh sách bài học", "error");
      setLessons([]);
      setSelectedLesson(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/teacher-courses")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <FiArrowLeft size={20} />
            Quay lại
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quản Lý Bài Tập
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chọn khóa học → chương → bài học để xem và quản lý bài tập
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Selection Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Khóa Học
                </label>
                <select
                  value={selectedCourse || ""}
                  onChange={(e) => {
                    setSelectedCourse(Number(e.target.value));
                    setSelectedChapter(null);
                    setSelectedLesson(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Chọn Khóa Học --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Chương
                </label>
                <select
                  value={selectedChapter || ""}
                  onChange={(e) => {
                    setSelectedChapter(Number(e.target.value));
                    setSelectedLesson(null);
                  }}
                  disabled={!selectedCourse}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                >
                  <option value="">-- Chọn Chương --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Bài Học
                </label>
                <select
                  value={selectedLesson || ""}
                  onChange={(e) => setSelectedLesson(Number(e.target.value))}
                  disabled={!selectedChapter}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                >
                  <option value="">-- Chọn Bài Học --</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Area */}
            {selectedLesson ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bài Tập
                  </h2>
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    <FiPlus size={20} />
                    Thêm Bài Tập
                  </button>
                </div>

                <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Tính năng bài tập sẽ được thêm sớm. Hiện tại chưa có bài tập cho bài học này.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {!selectedCourse && "👆 Vui lòng chọn khóa học"}
                  {selectedCourse && !selectedChapter && "👆 Vui lòng chọn chương"}
                  {selectedChapter && !selectedLesson && "👆 Vui lòng chọn bài học"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ManageExercises; 