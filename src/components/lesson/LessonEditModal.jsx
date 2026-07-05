import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateLesson } from "../../services/lessonService";

const LessonEditModal = ({ lesson, onClose, onLessonUpdated }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setDuration(lesson.duration || "");
    }
  }, [lesson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      setErrorMessage("⚠️ Tiêu đề không được bỏ trống");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const data = await updateLesson(token, lesson.id, {
        title,
        duration,
      });

      if (data.status === "success") {
        console.log("🎉 Cập nhật bài học thành công:", data);
        setSuccessMessage("🎉 Cập nhật bài học thành công!");

        // Delay 1 giây trước khi đóng modal và gọi callback
        setTimeout(() => {
          onLessonUpdated?.();
          onClose?.();
        }, 1000);
      } else {
        console.warn("⚠️ Cập nhật bài học thất bại:", data.message || data);
        setErrorMessage(
          data.message || JSON.stringify(data) || "⚠️ Không thể cập nhật bài học"
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật bài học:", error);
      setErrorMessage(
        error.response?.data?.message || "⚠️ Có lỗi xảy ra khi cập nhật bài học"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl relative">
        <h2 className="text-xl font-bold mb-4 text-center">✏️ Sửa bài học</h2>

        {/* 🔹 Hiển thị lỗi */}
        {errorMessage && (
          <div className="mb-4 text-red-600 font-semibold border border-red-400 bg-red-100 p-2 rounded">
            {errorMessage}
          </div>
        )}

        {/* 🔹 Hiển thị thông báo thành công */}
        {successMessage && (
          <div className="mb-4 text-green-600 font-semibold border border-green-400 bg-green-100 p-2 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tiêu đề *</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Thời lượng</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="VD: 45 phút"
            />
          </div>

          {lesson.media_url && (
            <div>
              <label className="block font-medium mb-1">Video hiện tại:</label>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <a
                  href={lesson.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Xem video hiện tại
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Lưu ý: Chỉ có thể sửa tiêu đề và thời lượng. Để thay đổi video, vui lòng xóa và tạo lại bài học.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LessonEditModal;

