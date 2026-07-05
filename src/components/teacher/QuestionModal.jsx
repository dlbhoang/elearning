import React, { useState } from "react";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

export default function QuestionModal({
  isOpen,
  exam,
  questionForm,
  setQuestionForm,
  handleAddQuestion,
  handleDeleteQuestion,
  handleEditQuestion,
  editingQuestionId,
  onClose,
}) {
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadingSide, setUploadingSide] = useState(null); // 'left' hoặc 'right'

  if (!isOpen || !exam) return null;

  // Helper function: Kiểm tra xem có phải là ảnh không
  const isImage = (value) => {
    return value && (value.startsWith('http') || value.startsWith('data:image'));
  };

  // Upload ảnh lên backend (backend sẽ upload lên Cloudinary)
  const uploadImage = async (file, side, idx) => {
    try {
      setUploadingIdx(idx);
      setUploadingSide(side);

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://81.17.103.180:5001/api';
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.url) {
        // Lưu URL từ Cloudinary
        if (side === 'left') {
          const newOptions = [...questionForm.options];
          newOptions[idx].text = data.url;
          setQuestionForm({ ...questionForm, options: newOptions });
        } else {
          const newAnswers = [...questionForm.correctAnswer];
          newAnswers[idx] = data.url;
          setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
        }
      } else {
        alert('Upload ảnh thất bại: ' + (data.message || 'Lỗi server'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi upload ảnh: ' + error.message);
    } finally {
      setUploadingIdx(null);
      setUploadingSide(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Câu hỏi cho: {exam.title}</h2>

        {/* Danh sách câu hỏi */}
        <div className="space-y-3 mb-6">
          {exam.questions?.length > 0 ? (
            exam.questions.map((q) => (
              <div
                key={q.id}
                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{q.question}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Sửa"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {q.options && (
                  <ul className="ml-4 list-disc text-sm mt-2 space-y-2">
                    {(() => {
                      let optionsData = q.options;
                      // Nếu options là string, parse thành object/array
                      if (typeof optionsData === 'string') {
                        try {
                          optionsData = JSON.parse(optionsData);
                        } catch (e) {
                          console.error('Lỗi parse options:', e);
                          return null;
                        }
                      }
                      
                      if (Array.isArray(optionsData)) {
                        // Convert array thành object
                        const optionsObj = optionsData.reduce((acc, opt) => {
                          acc[opt.id] = opt.text;
                          return acc;
                        }, {});
                        return Object.entries(optionsObj).map(([key, value]) => (
                          <li key={key}>
                            <b>{key}.</b>{' '}
                            {isImage(value) ? (
                              <img src={value} alt={key} className="h-12 w-auto object-cover rounded inline ml-2" />
                            ) : (
                              value
                            )}
                          </li>
                        ));
                      } else if (typeof optionsData === 'object') {
                        // Đã là object
                        return Object.entries(optionsData).map(([key, value]) => (
                          <li key={key}>
                            <b>{key}.</b>{' '}
                            {isImage(value) ? (
                              <img src={value} alt={key} className="h-12 w-auto object-cover rounded inline ml-2" />
                            ) : (
                              value
                            )}
                          </li>
                        ));
                      }
                      return null;
                    })()}
                  </ul>
                )}

                {/* Hiển thị đáp án dựa trên type */}
                {q.type === 'matching' ? (
                  <div className="text-xs text-green-600 mt-2 space-y-2">
                    <p className="font-semibold">✅ Cặp nối:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        let optionsData = q.options;
                        let answersData = q.correctAnswer;
                        
                        // Parse options
                        if (typeof optionsData === 'string') {
                          try {
                            optionsData = JSON.parse(optionsData);
                          } catch (e) {
                            return null;
                          }
                        }
                        
                        // Parse answers
                        if (typeof answersData === 'string') {
                          try {
                            answersData = JSON.parse(answersData);
                          } catch (e) {
                            answersData = [];
                          }
                        }
                        
                        if (Array.isArray(optionsData)) {
                          return optionsData.map((opt, idx) => {
                            const answer = Array.isArray(answersData) ? answersData[idx] : null;
                            return (
                              <div key={idx} className="border rounded p-2 bg-blue-50 dark:bg-gray-600">
                                <div className="text-xs font-semibold mb-1">Trái:</div>
                                {isImage(opt.text) ? (
                                  <img src={opt.text} alt={`Left ${idx}`} className="h-10 w-auto object-cover rounded mb-1" />
                                ) : (
                                  <div className="text-xs break-words mb-1">{opt.text}</div>
                                )}
                                <div className="text-xs font-semibold mb-1 mt-2">↔ Phải:</div>
                                {answer ? (
                                  isImage(answer) ? (
                                    <img src={answer} alt={`Right ${idx}`} className="h-10 w-auto object-cover rounded" />
                                  ) : (
                                    <div className="text-xs break-words">{answer}</div>
                                  )
                                ) : (
                                  <div className="text-xs text-red-600">Chưa có đáp án</div>
                                )}
                              </div>
                            );
                          });
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Đáp án đúng:{" "}
                    {Array.isArray(q.correctAnswer)
                      ? q.correctAnswer.length > 0 && isImage(q.correctAnswer[0])
                        ? `[Ảnh x${q.correctAnswer.length}]`
                        : q.correctAnswer.join(", ")
                      : isImage(q.correctAnswer)
                      ? "[Ảnh]"
                      : q.correctAnswer}
                  </p>
                )}

                {q.explanation && (
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Giải thích: {q.explanation}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có câu hỏi nào</p>
          )}
        </div>

        {/* Form thêm câu hỏi */}
        <div className="space-y-4 border-t pt-4">
          <input
            type="text"
            placeholder="Nhập nội dung câu hỏi"
            value={questionForm.question}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, question: e.target.value })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
          />

          <select
            value={questionForm.type}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, type: e.target.value })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
          >
            <option value="single">Trắc nghiệm 1 đáp án</option>
            <option value="multiple">Trắc nghiệm nhiều đáp án</option>
            <option value="true_false">Đúng / Sai</option>
            <option value="matching">Nối câu/hình</option>
          </select>

          {/* Nếu không phải True/False và không phải Matching thì hiển thị option */}
          {questionForm.type !== "true_false" && questionForm.type !== "matching" && (
            <div className="grid grid-cols-2 gap-2">
              {questionForm.options.map((opt, idx) => (
                <input
                  key={opt.id}
                  type="text"
                  placeholder={`Đáp án ${opt.id}`}
                  value={opt.text}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[idx].text = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  className="p-2 border rounded-lg dark:bg-gray-700"
                />
              ))}
            </div>
          )}

          {/* Matching - Nối hình ảnh/câu */}
          {questionForm.type === "matching" && (
            <div className="space-y-4 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tạo cặp nối: Bên trái ↔ Bên phải
              </div>
              
              {/* Bên trái - Hình ảnh */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Bên trái (Hình ảnh/Text cần nối):
                </label>
                {questionForm.options && questionForm.options.map((opt, idx) => (
                  <div key={idx} className="mb-3 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Mục {idx + 1}:
                        </label>
                        {isImage(opt.text) ? (
                          <div className="mt-2 rounded border p-2 bg-white dark:bg-gray-700">
                            <img src={opt.text} alt={`Left ${idx}`} className="h-20 w-auto object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...questionForm.options];
                                newOptions[idx].text = '';
                                setQuestionForm({ ...questionForm, options: newOptions });
                              }}
                              className="mt-2 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Text hoặc URL ảnh"
                            value={opt.text}
                            onChange={(e) => {
                              const newOptions = [...questionForm.options];
                              newOptions[idx].text = e.target.value;
                              setQuestionForm({ ...questionForm, options: newOptions });
                            }}
                            className="w-full text-xs px-2 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 mb-2"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              uploadImage(file, 'left', idx);
                            }
                          }}
                          className="text-xs w-full mt-2"
                          disabled={uploadingIdx === idx && uploadingSide === 'left'}
                        />
                        {uploadingIdx === idx && uploadingSide === 'left' && (
                          <div className="mt-2 text-xs text-blue-600">⏳ Đang upload...</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = questionForm.options.filter((_, i) => i !== idx);
                          setQuestionForm({ ...questionForm, options: newOptions });
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
                    const newOptions = [...(questionForm.options || []), { id: String.fromCharCode(65 + (questionForm.options?.length || 0)), text: '' }];
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  + Thêm mục
                </button>
              </div>

              {/* Bên phải - Đáp án */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Bên phải (Text/Hình ảnh đáp án):
                </label>
                {questionForm.correctAnswer && Array.isArray(questionForm.correctAnswer) ? (
                  questionForm.correctAnswer.map((item, idx) => (
                    <div key={idx} className="mb-3 p-3 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg">
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400">
                            Đáp án {idx + 1}:
                          </label>
                          
                          {isImage(item) ? (
                            <div className="rounded border p-2 bg-white dark:bg-gray-700">
                              <img src={item} alt={`Right ${idx}`} className="h-20 w-auto object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newAnswers = [...questionForm.correctAnswer];
                                  newAnswers[idx] = '';
                                  setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
                                }}
                                className="mt-2 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Xóa ảnh
                              </button>
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder="Nhập text đáp án..."
                              value={typeof item === 'string' && !item.startsWith('data:image') ? item : ''}
                              onChange={(e) => {
                                const newAnswers = [...questionForm.correctAnswer];
                                newAnswers[idx] = e.target.value;
                                setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
                              }}
                              className="w-full text-xs px-2 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                            />
                          )}

                          {/* Input File */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                uploadImage(file, 'right', idx);
                              }
                            }}
                            className="text-xs w-full"
                            disabled={uploadingIdx === idx && uploadingSide === 'right'}
                          />

                          {uploadingIdx === idx && uploadingSide === 'right' && (
                            <div className="mt-2 text-xs text-blue-600">⏳ Đang upload...</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newAnswers = questionForm.correctAnswer.filter((_, i) => i !== idx);
                            setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    const newAnswers = Array.isArray(questionForm.correctAnswer) ? [...questionForm.correctAnswer, ''] : [''];
                    setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  + Thêm đáp án
                </button>
              </div>
            </div>
          )}

          {questionForm.type !== "matching" && (
            <input
              type="text"
              placeholder="Đáp án đúng (VD: A hoặc A,B)"
              value={
                Array.isArray(questionForm.correctAnswer)
                  ? questionForm.correctAnswer.join(",")
                  : questionForm.correctAnswer
              }
              onChange={(e) => {
                const val = e.target.value.includes(",")
                  ? e.target.value.split(",").map((s) => s.trim())
                  : e.target.value;
                setQuestionForm({ ...questionForm, correctAnswer: val });
              }}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
            />
          )}

          {/* Giải thích */}
          <textarea
            placeholder="Giải thích"
            value={questionForm.explanation}
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                explanation: e.target.value,
              })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
          />

          <button
            onClick={handleAddQuestion}
            className="w-full px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            {editingQuestionId ? "🔄 Cập nhật câu hỏi" : "+ Thêm câu hỏi"}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
