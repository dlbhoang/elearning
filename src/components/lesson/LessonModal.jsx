import React, { useState, useEffect } from "react";
import LessonAddModal from "./LessonAddModal";
import LessonEditModal from "./LessonEditModal";
import Swal from "sweetalert2";
import { getLessonsByChapter, deleteLesson, getExercisesByLesson } from "../../services/lessonService";
import ExerciseListModal from "../exercise/ExerciseListModal";
import ExerciseAddModal from "../exercise/ExerciseAddModal";
const LessonListModal = ({ chapterId, refreshLessons }) => {
  const [lessons, setLessons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedLessonTitle, setSelectedLessonTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch lessons từ API
  const fetchLessons = async () => {
    try {
      const res = await getLessonsByChapter(token, chapterId);
      if (res.status === "success") setLessons(res.data);
      else Swal.fire("Lỗi", res.message || "Không lấy được lessons", "error");
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi khi fetch lessons", "error");
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [chapterId]);

  // Xoá bài học (gọi riêng)
  const handleDelete = async (lessonId) => {
    const confirmDelete = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn xoá bài học này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });
    
    if (!confirmDelete.isConfirmed) return;

    try {
      const data = await deleteLesson(token, lessonId);
      if (data.status === "success") {
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        refreshLessons?.();
        Swal.fire("Đã xoá!", "Bài học đã được xoá.", "success");
      } else {
        Swal.fire("Lỗi", data.message || "Không thể xoá bài học", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Có lỗi khi xoá bài học", "error");
    }
  };


  const handleEdit = (lesson) => {
    Swal.close(); // Đóng Swal modal trước
    setEditingLesson(lesson);
    setShowEditModal(true);
  };

  const openLessonList = () => {
    const hasLessons = lessons.length > 0;

    const lessonHtml = hasLessons
      ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
        ${lessons
          .map(
            (lesson, idx) => `
            <div class="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white dark:bg-gray-800 flex flex-col justify-between">
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-lg mb-1">${
                  idx + 1
                }. ${lesson.title}</div>
                <div class="text-gray-600 dark:text-gray-300 mb-1">⏱ Thời lượng: ${
                  lesson.duration || "Chưa có"
                }</div>
                <div class="text-gray-500 dark:text-gray-400 mb-2">🗓 Ngày tạo: ${new Date(
                  lesson.created_at
                ).toLocaleString()}</div>
                ${
                  lesson.media_url
                    ? `<video class="w-full h-32 object-cover mb-2 rounded" src="${lesson.media_url}" controls></video>
                       <a href="${lesson.media_url}" target="_blank" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm inline-block mb-2">🎬 Xem video</a>`
                    : `<span class="text-red-500 font-medium">❌ Chưa có media</span>`
                }
              </div>
              <div class="flex justify-end gap-2 mt-2 flex-wrap">
                <button class="question-btn" data-id="${lesson.id}">❓ Câu hỏi</button>
                <button class="exercise-btn" data-id="${lesson.id}">📝 Bài tập</button>
                <button class="edit-btn" data-id="${lesson.id}">Sửa</button>
                <button class="delete-btn" data-id="${lesson.id}">Xoá</button>
              </div>
            </div>`
          )
          .join("")}
      </div>`
      : `<p class="text-gray-500 dark:text-gray-400 text-center my-4">Chưa có bài học nào</p>`;

    Swal.fire({
      title: "📚 Danh sách bài học",
      html: lessonHtml,
      showCancelButton: true,
      confirmButtonText: "➕ Thêm bài học",
      cancelButtonText: "Đóng",
      width: "90%",
      scrollbarPadding: false,
      customClass: {
        confirmButton: "bg-green-500 text-black font-semibold hover:bg-green-600",
        cancelButton: "bg-gray-300 text-black hover:bg-gray-400",
        popup: "rounded-xl shadow-lg",
      },
      didOpen: () => {
        // Gắn sự kiện Xem câu hỏi
        const questionButtons = document.querySelectorAll(".question-btn");
        questionButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const lessonId = btn.dataset.id;
            const lesson = lessons.find((l) => String(l.id) === String(lessonId));
            if (lesson) {
              Swal.close();
              setSelectedLessonId(lessonId);
              setSelectedLessonTitle(lesson.title);
              setShowExerciseList(true);
            }
          });
        });

        // Gắn sự kiện Xoá
        const deleteButtons = document.querySelectorAll(".delete-btn");
       deleteButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // giữ modal mở
    const lessonId = btn.dataset.id; // giữ nguyên chuỗi
    if (!lessonId) {
      console.error("Lesson ID không hợp lệ:", btn.dataset.id);
      return;
    }
    handleDelete(lessonId);
  });
});


        // Gắn sự kiện Thêm bài tập
        const exerciseButtons = document.querySelectorAll(".exercise-btn");
        exerciseButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const lessonId = btn.dataset.id;
            Swal.close();
            setSelectedLessonId(lessonId);
            setShowExerciseModal(true);
          });
        });

        // Gắn sự kiện Sửa
        const editButtons = document.querySelectorAll(".edit-btn");
        editButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const lessonId = btn.dataset.id;
            const lesson = lessons.find((l) => String(l.id) === String(lessonId));
            if (lesson) {
              handleEdit(lesson);
            } else {
              Swal.fire("Lỗi", "Không tìm thấy bài học", "error");
            }
          });
        });
      },
    }).then((result) => {
      if (result.isConfirmed) setShowAddModal(true);
    });
  };

  return (
    <>
      <button
        onClick={openLessonList}
        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
      >
        ➕ Thêm bài học
      </button>

      {showAddModal && (
        <LessonAddModal
          chapterId={chapterId}
          onClose={() => setShowAddModal(false)}
          onLessonAdded={() => {
            setShowAddModal(false);
            fetchLessons();
            refreshLessons?.();
          }}
        />
      )}

      {showEditModal && editingLesson && (
        <LessonEditModal
          lesson={editingLesson}
          onClose={() => {
            setShowEditModal(false);
            setEditingLesson(null);
          }}
          onLessonUpdated={() => {
            setShowEditModal(false);
            setEditingLesson(null);
            fetchLessons();
            refreshLessons?.();
          }}
        />
      )}

      {showExerciseModal && selectedLessonId && (
        <ExerciseAddModal
          lessonId={selectedLessonId}
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedLessonId(null);
          }}
          onExerciseAdded={() => {
            setShowExerciseModal(false);
            setSelectedLessonId(null);
            fetchLessons();
            refreshLessons?.();
          }}
        />
      )}

      {showExerciseList && selectedLessonId && (
        <ExerciseListModal
          lessonId={selectedLessonId}
          lessonTitle={selectedLessonTitle}
          onClose={() => {
            setShowExerciseList(false);
            setSelectedLessonId(null);
            setSelectedLessonTitle("");
          }}
          onAddExercise={() => {
            setShowExerciseList(false);
            setSelectedLessonId(null);
            setSelectedLessonTitle("");
            // Fetch lại khi thêm bài tập xong
            fetchLessons();
          }}
        />
      )}
    </>
  );
};

export default LessonListModal;
