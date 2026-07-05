import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getExercisesByLesson, deleteLessonExercise } from "../../services/lessonService";
import ExerciseAddModal from "./ExerciseAddModal";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiPlus, FiPlayCircle } from "react-icons/fi";

const ExerciseListModal = ({ lessonId, lessonTitle, onClose, onAddExercise }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoExercise, setDemoExercise] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch exercises
  useEffect(() => {
    fetchExercises();
  }, [lessonId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await getExercisesByLesson(token, lessonId);
      if (res.status === "success") {
        const exercises = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        setExercises(exercises);
      } else {
        Swal.fire("Lỗi", res.message || "Không lấy được câu hỏi", "error");
      }
    } catch (err) {
      console.error("Lỗi fetch exercises:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi khi tải câu hỏi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    const confirmDelete = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa câu hỏi này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const res = await deleteLessonExercise(token, exerciseId);
      if (res.status === "success") {
        setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
        Swal.fire("Thành công", "Đã xóa câu hỏi", "success");
      } else {
        Swal.fire("Lỗi", res.message || "Không thể xóa câu hỏi", "error");
      }
    } catch (err) {
      console.error("Lỗi xóa exercise:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi khi xóa câu hỏi", "error");
    }
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      "multiple_choice": "Trắc nghiệm",
      "fill_blank": "Điền từ",
      "essay": "Tự luận",
      "matching": "Nối câu/hình",
    };
    return typeMap[type] || type;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      "multiple_choice": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "fill_blank": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "essay": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "matching": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-5xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ❓ Danh sách câu hỏi: {lessonTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (exercises.length > 0) {
                  setDemoExercise(exercises[0]);
                  setShowDemoModal(true);
                } else {
                  Swal.fire("Chưa có câu hỏi để demo", "Vui lòng thêm câu hỏi trước.", "info");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              title="Xem bài học như học sinh"
            >
              <FiPlayCircle size={18} />
              Demo
            </button>
            {/* Demo Question Modal */}
            {showDemoModal && demoExercise && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Demo Câu hỏi</h2>
                  <div className="mb-4">
                    <span className="font-bold text-gray-800 dark:text-white">Câu hỏi:</span>
                    <div className="mt-2 text-gray-900 dark:text-white">{demoExercise.question}</div>
                  </div>
                  {demoExercise.type === "multiple_choice" && demoExercise.options && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-800 dark:text-white">Các lựa chọn:</span>
                      <ul className="mt-2 space-y-2">
                        {Object.entries(demoExercise.options).map(([key, value]) => (
                          <li key={key} className="flex items-center gap-2">
                            <span className="font-bold uppercase">{key}.</span>
                            <span>{value}</span>
                            {demoExercise.answer === key && (
                              <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Đáp án đúng</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {demoExercise.type === "fill_blank" && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-800 dark:text-white">Đáp án:</span>
                      <div className="mt-2">{demoExercise.answer}</div>
                    </div>
                  )}
                  {demoExercise.type === "essay" && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-800 dark:text-white">Đáp án mẫu:</span>
                      <div className="mt-2">{demoExercise.answer}</div>
                    </div>
                  )}
                  {demoExercise.type === "matching" && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-800 dark:text-white">Cặp nối:</span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <div className="font-semibold mb-1">Bên trái</div>
                          {Array.isArray(demoExercise.options) && demoExercise.options.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item && item.startsWith('data:image') ? (
                                <img src={item} alt={`Left ${idx}`} className="h-12 object-cover rounded" />
                              ) : item}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="font-semibold mb-1">Bên phải</div>
                          {Array.isArray(demoExercise.answer) && demoExercise.answer.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item && item.startsWith('data:image') ? (
                                <img src={item} alt={`Right ${idx}`} className="h-12 object-cover rounded" />
                              ) : item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {demoExercise.image && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-800 dark:text-white">Ảnh minh họa:</span>
                      <div className="mt-2 flex justify-center">
                        <img src={demoExercise.image} alt="Demo" className="max-h-32 rounded-lg shadow" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowDemoModal(false)}
                      className="px-5 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 font-medium"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold hover:scale-110 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add Exercise Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <FiPlus size={20} />
            Thêm câu hỏi
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Chưa có câu hỏi nào cho bài học này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        Câu {idx + 1}:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(
                          exercise.type
                        )}`}
                      >
                        {getTypeLabel(exercise.type)}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-base">
                      {exercise.question}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Xóa"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content based on type */}
                <div className="ml-8 space-y-2">
                  {exercise.type === "multiple_choice" && exercise.options && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Các lựa chọn:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(exercise.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`px-3 py-2 rounded text-sm ${
                              exercise.answer === key
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 font-semibold"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span className="font-bold">{key.toUpperCase()}.</span> {value}
                            {exercise.answer === key && " ✓"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exercise.type === "fill_blank" && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Đáp án:
                      </p>
                      <div className="px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded text-sm font-semibold">
                        {exercise.answer}
                      </div>
                    </div>
                  )}

                  {exercise.type === "essay" && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Ghi chú/Đáp án mẫu:
                      </p>
                      <div className="px-3 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 rounded text-sm italic">
                        {exercise.answer || "(Không có)"}
                      </div>
                    </div>
                  )}

                  {exercise.type === "matching" && exercise.options && exercise.answer && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Cặp nối:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Bên trái */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Bên trái:
                          </p>
                          <div className="space-y-2">
                            {Array.isArray(exercise.options) && exercise.options.map((item, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-sm text-gray-700 dark:text-gray-300"
                              >
                                {item && item.startsWith('data:image') ? (
                                  <img src={item} alt={`Left ${i}`} className="h-16 object-cover rounded" />
                                ) : (
                                  item
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bên phải */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Bên phải:
                          </p>
                          <div className="space-y-2">
                            {Array.isArray(exercise.answer) && exercise.answer.map((item, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-sm text-gray-700 dark:text-gray-300"
                              >
                                {item && item.startsWith('data:image') ? (
                                  <img src={item} alt={`Right ${i}`} className="h-16 object-cover rounded" />
                                ) : (
                                  item
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {exercise.image && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Hình ảnh:
                      </p>
                      <img
                        src={exercise.image}
                        alt="Exercise"
                        className="max-h-48 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
          >
            Đóng
          </button>
        </div>

        {/* Add Exercise Modal */}
        {showAddModal && (
          <ExerciseAddModal
            lessonId={lessonId}
            onClose={() => setShowAddModal(false)}
            onExerciseAdded={() => {
              setShowAddModal(false);
              fetchExercises();
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default ExerciseListModal;
