import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FiPlus, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import LessonListModal from "../components/lesson/LessonModal";
import { 
  getChaptersByCourse, 
  createChapter, 
  updateChapter, 
  deleteChapter 
} from "../services/lessonService";

const ManageChapters = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // lấy courseId từ URL
  const token = localStorage.getItem("token");

  const [chapters, setChapters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  const [chapterData, setChapterData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || user?.role !== "teacher") navigate("/login");
    else fetchChapters();
  }, [navigate, courseId]);

  const fetchChapters = async () => {
    try {
      const res = await getChaptersByCourse(token, courseId);
      if (res.status === "success") setChapters(res.data);
      else Swal.fire("Lỗi", res.message, "error");
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy danh sách chapter", "error");
    }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterData.title.trim()) {
      Swal.fire("Lỗi", "Tên chapter không được để trống", "error");
      return;
    }

    try {
      const chapterPayload = { ...chapterData, course_id: courseId };
      const data = editingChapter
        ? await updateChapter(token, editingChapter.id, chapterPayload)
        : await createChapter(token, chapterPayload);

      if (data.status === "success") {
        Swal.fire("Thành công", data.message || "Lưu chapter thành công", "success");
        setShowForm(false);
        setEditingChapter(null);
        setChapterData({ title: "", description: "" });
        fetchChapters();
      } else {
        Swal.fire(
          "Lỗi",
          typeof data.message === "string"
            ? data.message
            : JSON.stringify(data.message),
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi server khi lưu chapter", "error");
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterData({
      title: chapter.title,
      description: chapter.description || "",
    });
    setShowForm(true);
  };

  const handleDeleteChapter = async (id) => {
    const confirm = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn xoá chapter này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        const data = await deleteChapter(token, id);
        if (data.status === "success") {
          Swal.fire("Đã xoá!", "Chapter đã được xoá.", "success");
          fetchChapters();
        } else {
          Swal.fire("Lỗi", data.message, "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Lỗi", err.response?.data?.message || "Không thể xoá chapter", "error");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white">
              Quản lý Chapter
            </h1>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => setShowForm(true)}
            >
              <FiPlus /> Thêm Chapter
            </button>
          </div>

          {/* Form thêm/sửa */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                  onClick={() => {
                    setShowForm(false);
                    setEditingChapter(null);
                    setChapterData({ title: "", description: "" });
                  }}
                >
                  <FiX />
                </button>
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-6">
                  {editingChapter ? "Sửa Chapter" : "Thêm Chapter"}
                </h2>
                <form
                  onSubmit={handleSaveChapter}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    placeholder="Tên Chapter"
                    value={chapterData.title}
                    onChange={(e) =>
                      setChapterData({ ...chapterData, title: e.target.value })
                    }
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  />
                  <textarea
                    placeholder="Mô tả"
                    value={chapterData.description}
                    onChange={(e) =>
                      setChapterData({
                        ...chapterData,
                        description: e.target.value,
                      })
                    }
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
                      onClick={() => setShowForm(false)}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-600 text-white rounded-full"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Danh sách chapter */}
          {chapters.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300 py-10">
              Hiện chưa có chapter nào.{" "}
              <button
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
                onClick={() => setShowForm(true)}
              >
                + Thêm Chapter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Tiêu đề chapter */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600">
                    {ch.title}
                  </h2>

                  {/* Mô tả */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {ch.description || "Không có mô tả"}
                  </p>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditChapter(ch)}
                        className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700 transition"
                        title="Sửa chapter"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 transition"
                        title="Xoá chapter"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {/* Nút xem bài học */}
<LessonListModal
  lessons={ch.lessons || []}
  chapterId={ch.id}          // ✅ thêm dòng này
  refreshLessons={fetchChapters} // để load lại khi thêm lesson
/>                  </div>
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

export default ManageChapters;
