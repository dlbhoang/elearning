import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FiBookOpen, FiUsers, FiStar, FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiClock, FiDollarSign, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Swal from "sweetalert2";
import { getMyCourses, deleteCourse, getCourseById, getCourseChapters } from "../services/courseService";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || user?.role !== "teacher") {
      navigate("/login");
    } else {
      if (id) {
        fetchCourseDetail();
      } else {
        fetchCourses();
      }
    }
  }, [token, navigate, id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses(token);
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.status === "success") {
        setCourses(data.data || []);
      } else {
        Swal.fire("Lỗi", data.message || "Không thể lấy khoá học", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy khoá học", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(id, token);
      setCourse(courseData);

      const chaptersData = await getCourseChapters(id, token);
      setChapters(chaptersData || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể lấy chi tiết khoá học", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    Swal.fire({
      title: "Bạn chắc chứ?",
      text: "Bạn sẽ không thể hoàn tác điều này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = await deleteCourse(token, courseId);
          if (data.status === "success") {
            Swal.fire("Đã xóa!", "Khoá học đã được xóa.", "success");
            if (id) {
              navigate("/teacher-courses");
            } else {
              fetchCourses();
            }
          } else {
            Swal.fire("Lỗi", data.message || "Không thể xóa khoá học", "error");
          }
        } catch (err) {
          Swal.fire("Lỗi", err.response?.data?.message || "Không thể xóa khoá học", "error");
        }
      }
    });
  };

  const handleEditCourse = (courseId) => {
    navigate(`/teaching-courses?edit=${courseId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/teacher-courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Course Detail View */}
        {!loading && id && course && (
          <div>
            <button
              onClick={() => navigate("/teacher-courses")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
            >
              <FiArrowLeft size={20} />
              Quay lại
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Course Header */}
              <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Course Info */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/manage-lessons/${id}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      <FiBookOpen size={18} />
                      Quản Lý Bài Học
                    </button>
                    <button
                      onClick={() => navigate(`/teaching-courses?edit=${id}`)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      <FiEdit2 size={18} />
                      Chỉnh Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(id)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      <FiTrash2 size={18} />
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Course Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  {course.subject && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Môn Học</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {course.subject}
                      </p>
                    </div>
                  )}

                  {course.grade && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Khối Lớp</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        Lớp {course.grade}
                      </p>
                    </div>
                  )}

                  {course.duration && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FiClock size={16} className="text-orange-600" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Thời Lượng</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {course.duration}
                      </p>
                    </div>
                  )}

                  {course.price && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FiDollarSign size={16} className="text-green-600" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Giá</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {typeof course.price === 'number' 
                          ? course.price.toLocaleString('vi-VN') 
                          : course.price}
                        {typeof course.price === 'number' ? ' VNĐ' : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chapters Section */}
                {chapters.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Các Chương ({chapters.length})
                    </h2>
                    <div className="space-y-3">
                      {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                            className="w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-4 flex items-center justify-between transition text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {chapter.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {chapter.lessons?.length || chapter.lessonsCount || 0} bài học
                                </p>
                              </div>
                            </div>
                            <div>
                              {expandedChapter === chapter.id ? (
                                <FiChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                              ) : (
                                <FiChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Content - Lessons */}
                          {expandedChapter === chapter.id && (
                            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                              {chapter.lessons && chapter.lessons.length > 0 ? (
                                <div className="space-y-2">
                                  {chapter.lessons.map((lesson, lessonIndex) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                        {lessonIndex + 1}
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white break-words">
                                          {lesson.title}
                                        </h4>
                                        {lesson.duration && (
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            ⏱️ {lesson.duration}
                                          </p>
                                        )}
                                        {lesson.description && (
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Chương này chưa có bài học nào
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courses List View */}
        {!loading && !id && (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Các Khoá Học Của Tôi
                </h1>
                <button
                  onClick={() => navigate("/teaching-courses")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  <FiPlus size={20} />
                  Tạo Khoá Học
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý và theo dõi các khoá học của bạn
              </p>
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
              <div className="text-center py-12">
                <FiBookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Chưa có khoá học nào
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Hãy bắt đầu tạo khoá học đầu tiên của bạn
                </p>
                <button
                  onClick={() => navigate("/teaching-courses")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition"
                >
                  <FiPlus size={20} />
                  Tạo Khoá Học
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {courses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleViewCourse(course.id)}
                  >
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition"></div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Info */}
                  <div className="space-y-3 mb-6 text-sm">
                    {course.subject && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiBookOpen size={16} className="text-blue-600" />
                        <span>{course.subject}</span>
                      </div>
                    )}
                    
                    {course.grade && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiBookOpen size={16} className="text-green-600" />
                        <span>Lớp {course.grade}</span>
                      </div>
                    )}
                    
                    {course.duration && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiBookOpen size={16} className="text-orange-600" />
                        <span>{course.duration}</span>
                      </div>
                    )}

                    {course.students && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiUsers size={16} className="text-purple-600" />
                        <span>{course.students} học viên</span>
                      </div>
                    )}

                    {course.rating && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiStar size={16} className="text-yellow-500" />
                        <span>{course.rating} ⭐</span>
                      </div>
                    )}
                  </div>

                  {/* Course Price */}
                  {course.price && (
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {typeof course.price === 'number' 
                          ? course.price.toLocaleString('vi-VN') 
                          : course.price}
                        {typeof course.price === 'number' ? ' VNĐ' : ''}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditCourse(course.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 px-4 py-2 rounded-lg transition"
                    >
                      <FiEdit2 size={18} />
                      <span className="text-sm font-medium">Chỉnh Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 rounded-lg transition"
                    >
                      <FiTrash2 size={18} />
                      <span className="text-sm font-medium">Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TeacherCourses;
