import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chaptersData from '../data/chapters.json';
import coursesData from '../data/coursesData.json';
import { FiArrowLeft, FiPlayCircle } from 'react-icons/fi';

const CourseChapters = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin khóa học
  const course = coursesData.find(c => String(c.id) === String(courseId));

  // Lấy danh sách chương của khóa học
  const chapters = chaptersData[courseId] || [];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Không tìm thấy khóa học
          </h2>
          <button
            onClick={() => navigate('/my-courses')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Nội dung khóa học: {course.title}
        </h1>

        {chapters.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Chưa có nội dung cho khóa học này.</p>
        )}

        <div className="space-y-8">
          {chapters.map(chapter => (
            <div key={chapter.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-primary">{chapter.title}</h2>
              <ul className="space-y-3">
                {chapter.lessons.map(lesson => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FiPlayCircle className="text-primary" size={20} />
                      <span className="text-gray-900 dark:text-white">{lesson.title}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseChapters;
