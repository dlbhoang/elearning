import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiBook, FiClock } from "react-icons/fi";
import Swal from "sweetalert2";
import { getChaptersByCourse, createLesson, updateLesson, deleteLesson } from "../services/lessonService";

const ManageLessons = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    media_url: "",
    media_type: "video",
    description: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || user?.role !== "teacher") {
      navigate("/login");
    } else if (courseId) {
      fetchChapters();
    } else {
      navigate("/teaching-courses");
    }
  }, [token, navigate, courseId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const data = await getChaptersByCourse(token, courseId);
      setChapters(data.data || data || []);
      if (data.data?.length > 0 || data.length > 0) {
        const firstChapter = (data.data || data)[0];
        setSelectedChapter(firstChapter.id);
        fetchLessons(firstChapter.id);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể lấy danh sách chương", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (chapterId) => {
    try {
      // Lessons được trả về cùng với chapters
      setLessons([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!selectedChapter || !formData.title) {
      Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      const data = await createLesson(token, {
        chapter_id: selectedChapter,
        ...formData,
      });

      if (data.status === "success") {
        Swal.fire("Thành công", "Tạo bài học thành công", "success");
        setFormData({ title: "", duration: "", media_url: "", media_type: "video", description: "" });
        setShowForm(false);
        fetchChapters();
      } else {
        Swal.fire("Lỗi", data.message || "Tạo bài học thất bại", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Không thể tạo bài học", "error");
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      const data = await updateLesson(token, editingLesson.id, formData);

      if (data.status === "success") {
        Swal.fire("Thành công", "Cập nhật bài học thành công", "success");
        setFormData({ title: "", duration: "", media_url: "", media_type: "video", description: "" });
        setEditingLesson(null);
        setShowForm(false);
        fetchChapters();
      } else {
        Swal.fire("Lỗi", data.message || "Cập nhật bài học thất bại", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Không thể cập nhật bài học", "error");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const result = await Swal.fire({
      title: "Bạn chắc chứ?",
      text: "Bạn sẽ không thể hoàn tác điều này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const data = await deleteLesson(token, lessonId);
        if (data.status === "success") {
          Swal.fire("Đã xóa!", "Bài học đã được xóa.", "success");
          fetchChapters();
        } else {
          Swal.fire("Lỗi", data.message || "Xóa bài học thất bại", "error");
        }
      } catch (err) {
        Swal.fire("Lỗi", err.message || "Không thể xóa bài học", "error");
      }
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      duration: lesson.duration || "",
      media_url: lesson.media_url || "",
      media_type: lesson.media_type || "video",
      description: lesson.description || "",
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({ title: "", duration: "", media_url: "", media_type: "video", description: "" });
  };

  const chapterLessons = selectedChapter
    ? chapters.find((ch) => ch.id === selectedChapter)?.lessons || []
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/teacher-courses/${courseId}`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <FiArrowLeft size={20} />
            Quay lại
          </button>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiBook size={32} className="text-blue-600" />
              Quản Lý Bài Học
            </h1>
            <button
              onClick={() => {
                setEditingLesson(null);
                setFormData({ title: "", duration: "", media_url: "", media_type: "video", description: "" });
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              <FiPlus size={20} />
              Thêm Bài Học
            </button>
          </div>
        </div>

        {/* Chapter Selection */}
        {chapters.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Chọn Chương
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setSelectedChapter(chapter.id);
                    setExpandedChapter(chapter.id);
                  }}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedChapter === chapter.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {chapter.lessons?.length || 0} bài học
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lessons List */}
        {selectedChapter && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Danh Sách Bài Học
            </h2>

            {chapterLessons.length > 0 ? (
              <div className="space-y-4">
                {chapterLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                        </div>

                        {lesson.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 ml-11">
                            {lesson.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 ml-11 text-sm text-gray-600 dark:text-gray-400">
                          {lesson.duration && (
                            <div className="flex items-center gap-1">
                              <FiClock size={16} />
                              {lesson.duration} phút
                            </div>
                          )}
                          {lesson.media_type && (
                            <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {lesson.media_type === "video" ? "🎥 Video" : lesson.media_type === "ppt" ? "📊 Presentation" : "📄 Khác"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition"
                          title="Xóa"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBook size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Chương này chưa có bài học nào
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingLesson ? "Chỉnh Sửa Bài Học" : "Thêm Bài Học Mới"}
              </h2>

              <form onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Tên Bài Học *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập tên bài học"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập mô tả bài học"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Thời Lượng (phút)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="45"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Loại Media
                    </label>
                    <select
                      value={formData.media_type}
                      onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="video">Video</option>
                      <option value="ppt">Presentation</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    URL Media
                  </label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {editingLesson ? "Cập Nhật" : "Thêm"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ManageLessons;
