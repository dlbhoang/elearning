import React, { useState } from "react";
import { createPortal } from "react-dom";
import { createLessonExercise } from "../../services/lessonService";
import Swal from "sweetalert2";

const defaultOptions = { a: '', b: '', c: '', d: '' };

const ExerciseAddModal = ({ lessonId, onClose, onExerciseAdded }) => {
  const [exercise, setExercise] = useState({
    question: '',
    type: 'multiple-choice',
    options: defaultOptions,
    correct: 'a',
    answer: '',
    image: '',
    timestamp: 0,
    matchingLeft: [],    // Bên trái: items cần nối
    matchingRight: [],   // Bên phải: đáp án
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filePreview, setFilePreview] = useState('');

  const handleChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (e) => {
    setExercise({
      ...exercise,
      options: { ...exercise.options, [e.target.name]: e.target.value },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreview(ev.target.result);
        setExercise(ex => ({ ...ex, image: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!exercise.question.trim()) {
      setErrorMessage("⚠️ Câu hỏi không được bỏ trống");
      return;
    }

    if (exercise.type === 'multiple-choice') {
      if (!exercise.options.a || !exercise.options.b || !exercise.options.c || !exercise.options.d) {
        setErrorMessage("⚠️ Vui lòng điền đầy đủ 4 đáp án");
        return;
      }
      if (!['a', 'b', 'c', 'd'].includes(exercise.correct)) {
        setErrorMessage("⚠️ Vui lòng chọn đáp án đúng");
        return;
      }
    } else if (exercise.type === 'matching') {
      if (!exercise.matchingLeft || exercise.matchingLeft.length === 0 || !exercise.matchingRight || exercise.matchingRight.length === 0) {
        setErrorMessage("⚠️ Matching phải có ít nhất 1 cặp nối");
        return;
      }
    } else {
      if (!exercise.answer.trim()) {
        setErrorMessage("⚠️ Vui lòng nhập đáp án");
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Map type từ form sang API format
      const typeMap = {
        'multiple-choice': 'multiple_choice',
        'fill-in-the-blank': 'fill_blank',
        'essay': 'essay',
        'matching': 'matching'
      };

      // Prepare data theo API format
      let exerciseData = {
        lesson_id: lessonId,
        type: typeMap[exercise.type] || exercise.type,
        question: exercise.question,
        timestamp: exercise.timestamp || 0,
        image: exercise.image || null,
      };

    if (exercise.type === 'multiple-choice') {
      if (!exercise.options.a || !exercise.options.b || !exercise.options.c || !exercise.options.d) {
        setErrorMessage("⚠️ Vui lòng điền đầy đủ 4 đáp án");
        return;
      }
      if (!['a', 'b', 'c', 'd'].includes(exercise.correct)) {
        setErrorMessage("⚠️ Vui lòng chọn đáp án đúng");
        return;
      }
      exerciseData.options = exercise.options;
      exerciseData.answer = exercise.correct;
    } else if (exercise.type === 'matching') {
        // Filter out empty strings from matching items
        const leftFiltered = exercise.matchingLeft.filter(item => item && String(item).trim() !== '');
        const rightFiltered = exercise.matchingRight.filter(item => item && String(item).trim() !== '');
        
        if (leftFiltered.length === 0 || rightFiltered.length === 0) {
          setErrorMessage("⚠️ Matching phải có ít nhất 1 cặp nối (không được để trống)");
          return;
        }
        
        exerciseData.options = leftFiltered;
        exerciseData.answer = rightFiltered;
      } else {
        if (!exercise.answer.trim()) {
          setErrorMessage("⚠️ Vui lòng nhập đáp án");
          return;
        }
        exerciseData.options = null;
        exerciseData.answer = exercise.answer;
      }

      const data = await createLessonExercise(token, exerciseData);

      if (data.status === "success") {
        console.log("🎉 Thêm bài tập thành công:", data.data);
        setSuccessMessage("🎉 Thêm bài tập thành công!");

        setTimeout(() => {
          onExerciseAdded?.(data.data);
          onClose?.();
        }, 1000);
      } else {
        setErrorMessage(data.message || "⚠️ Không thể thêm bài tập");
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm bài tập:", error);
      setErrorMessage(
        error.response?.data?.message || "⚠️ Có lỗi xảy ra khi thêm bài tập"
      );
    } finally {
      setLoading(false);
    }
  };

  const imageToShow = exercise.image || filePreview;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          ➕ Thêm bài tập
        </h2>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 text-red-600 font-semibold border border-red-400 bg-red-100 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 p-3 rounded">
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 text-green-600 font-semibold border border-green-400 bg-green-100 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 p-3 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Câu hỏi */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Câu hỏi *
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={exercise.question}
              onChange={(e) => setExercise({ ...exercise, question: e.target.value })}
              placeholder="Nhập câu hỏi bài tập..."
              rows={3}
              required
            />
          </div>

          {/* Loại bài tập */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Loại bài tập *
            </label>
            <select
              name="type"
              value={exercise.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="multiple-choice">Trắc nghiệm</option>
              <option value="fill-in-the-blank">Điền từ</option>
              <option value="essay">Tự luận</option>
              <option value="matching">Nối câu/hình</option>
            </select>
          </div>

          {/* Timestamp - Hiển thị ở giây thứ mấy */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Hiển thị ở giây thứ (0 = luôn hiển thị)
            </label>
            <input
              type="number"
              name="timestamp"
              value={exercise.timestamp}
              onChange={handleChange}
              min="0"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 30 (giây)"
            />
          </div>

          {/* Multiple choice options */}
          {exercise.type === 'multiple-choice' && (
            <div className="space-y-3 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Nhập đáp án và chọn đáp án đúng:
              </div>
              {['a', 'b', 'c', 'd'].map(opt => (
                <div key={opt} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct"
                    value={opt}
                    checked={exercise.correct === opt}
                    onChange={handleChange}
                    className="accent-blue-600 w-5 h-5"
                    required
                  />
                  <span className="font-bold uppercase text-gray-700 dark:text-gray-300 w-6">
                    {opt}.
                  </span>
                  <input
                    type="text"
                    name={opt}
                    placeholder={`Đáp án ${opt.toUpperCase()}`}
                    value={exercise.options[opt]}
                    onChange={handleOptionChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* Fill-in-the-blank hoặc Essay */}
          {(exercise.type === 'fill-in-the-blank' || exercise.type === 'essay') && (
            <div className="space-y-2 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nhập đáp án đúng:
              </div>
              <textarea
                name="answer"
                placeholder={exercise.type === 'fill-in-the-blank' ? "Nhập đáp án..." : "Nhập đáp án mẫu (nếu có)..."}
                value={exercise.answer}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={exercise.type === 'essay' ? 4 : 2}
                required
              />
            </div>
          )}

          {/* Matching - Nối hình ảnh */}
          {exercise.type === 'matching' && (
            <div className="space-y-4 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tạo cặp nối hình ảnh: Bên trái ↔ Bên phải
              </div>
              
              {/* Bên trái - Hình ảnh */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Bên trái (Hình ảnh cần nối):
                </label>
                {exercise.matchingLeft.map((item, idx) => (
                  <div key={idx} className="mb-4 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Hình {idx + 1}:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const newLeft = [...exercise.matchingLeft];
                                newLeft[idx] = ev.target.result;
                                setExercise({ ...exercise, matchingLeft: newLeft });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs w-full"
                        />
                        {item && (
                          <div className="mt-2 rounded border p-1">
                            <img src={item} alt={`Left ${idx}`} className="h-20 object-cover rounded" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExercise({ ...exercise, matchingLeft: exercise.matchingLeft.filter((_, i) => i !== idx) });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setExercise({ ...exercise, matchingLeft: [...exercise.matchingLeft, ''] });
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  + Thêm hình
                </button>
              </div>

              {/* Bên phải - Text hoặc Hình ảnh */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Bên phải (Text hoặc Hình ảnh đáp án):
                </label>
                {exercise.matchingRight.map((item, idx) => (
                  <div key={idx} className="mb-4 p-3 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 space-y-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400">
                          Đáp án {idx + 1}:
                        </label>
                        
                        {/* Input Text */}
                        <input
                          type="text"
                          value={typeof item === 'string' && !item.startsWith('data:image') ? item : ''}
                          onChange={(e) => {
                            const newRight = [...exercise.matchingRight];
                            newRight[idx] = e.target.value;
                            setExercise({ ...exercise, matchingRight: newRight });
                          }}
                          placeholder="Nhập text đáp án..."
                          className="w-full text-xs px-2 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        />

                        {/* Input File */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const newRight = [...exercise.matchingRight];
                                newRight[idx] = ev.target.result;
                                setExercise({ ...exercise, matchingRight: newRight });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs w-full"
                        />

                        {/* Preview */}
                        {item && (
                          <div className="mt-2 rounded border p-1 bg-white dark:bg-gray-700">
                            {item.startsWith('data:image') ? (
                              <img src={item} alt={`Right ${idx}`} className="h-20 object-cover rounded" />
                            ) : (
                              <div className="text-xs text-gray-700 dark:text-gray-300 break-words">
                                <strong>Preview:</strong> {item}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExercise({ ...exercise, matchingRight: exercise.matchingRight.filter((_, i) => i !== idx) });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setExercise({ ...exercise, matchingRight: [...exercise.matchingRight, ''] });
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  + Thêm đáp án
                </button>
              </div>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Ảnh minh họa (tùy chọn)
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="image"
                placeholder="URL ảnh hoặc upload file..."
                value={exercise.image}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
            </div>
            {imageToShow && (
              <div className="mt-2 flex justify-center">
                <img 
                  src={imageToShow} 
                  alt="Preview" 
                  className="max-h-32 rounded-lg shadow border border-gray-200 dark:border-gray-600" 
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Đang lưu..." : "Thêm bài tập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ExerciseAddModal;

