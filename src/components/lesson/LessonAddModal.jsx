import React, { useState } from "react";
import { createPortal } from "react-dom";
import { createLesson } from "../../services/lessonService";

const LessonAddModal = ({ chapterId, onClose, onLessonAdded }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 🔹 lỗi hiển thị trong modal
  const [successMessage, setSuccessMessage] = useState(""); // 🔹 thông báo thành công

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // reset lỗi
    setSuccessMessage(""); // reset success

    if (!title.trim()) {
      setErrorMessage("⚠️ Tiêu đề không được bỏ trống");
      return;
    }

    if (!videoFile) {
      setErrorMessage("⚠️ Vui lòng chọn video");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const data = await createLesson(token, {
        chapter_id: chapterId,
        title,
        duration,
        description,
        videoFile,
        pptFile,
      });

      if (data.status === "success") {
        console.log("🎉 Thêm bài học thành công:", data.data);
        setSuccessMessage("🎉 Thêm bài học thành công!");

        // Delay 1 giây trước khi đóng modal và gọi callback
        setTimeout(() => {
          onLessonAdded?.(data.data);
          onClose?.();
        }, 1000);
      } else {
        console.warn("⚠️ Thêm bài học thất bại:", data.message || data);
        setErrorMessage(
          data.message || JSON.stringify(data) || "⚠️ Không thể thêm bài học"
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm bài học:", error);
      setErrorMessage(
        error.response?.data?.message || "⚠️ Có lỗi xảy ra khi thêm bài học"
      );
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl relative">
        <h2 className="text-xl font-bold mb-4 text-center">➕ Thêm bài học</h2>

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

          <div>
            <label className="block font-medium mb-1">Mô tả</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ngắn gọn..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Video *</label>
            <input
              type="file"
              accept="video/*"
              className="w-full"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">File PPT (tùy chọn)</label>
            <input
              type="file"
              accept=".ppt,.pptx,.pdf"
              className="w-full"
              onChange={(e) => setPptFile(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LessonAddModal;
