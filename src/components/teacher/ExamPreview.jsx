import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import Swal from "sweetalert2";

export default function ExamPreview({ exam, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Helper function: Kiểm tra xem có phải là ảnh không
  const isImage = (value) => {
    return value && (value.startsWith("http") || value.startsWith("data:image"));
  };

  const questions = exam.questions || [];

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    Swal.fire({
      title: "Nộp bài?",
      text: "Bạn không thể thay đổi câu trả lời sau khi nộp",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Nộp bài",
      cancelButtonText: "Quay lại",
    }).then((result) => {
      if (result.isConfirmed) {
        calculateScore();
        setShowResults(true);
      }
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.correctAnswer;

      if (q.type === "matching") {
        // Matching: so sánh mảng
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
            correct++;
          }
        }
      } else if (q.type === "multiple") {
        // Multiple choice: so sánh array
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const sorted1 = [...userAnswer].sort().join(",");
          const sorted2 = [...correctAnswer].sort().join(",");
          if (sorted1 === sorted2) {
            correct++;
          }
        }
      } else {
        // Single choice hoặc true/false
        if (userAnswer === correctAnswer) {
          correct++;
        }
      }
    });

    const newScore = Math.round((correct / questions.length) * 100);
    setScore(newScore);
  };

  const renderQuestion = (q, idx) => {
    switch (q.type) {
      case "single":
        return (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {(() => {
                let optionsData = q.options;
                if (typeof optionsData === "string") {
                  try {
                    optionsData = JSON.parse(optionsData);
                  } catch (e) {
                    return null;
                  }
                }

                if (Array.isArray(optionsData)) {
                  return optionsData.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        answers[idx] === opt.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        value={opt.id}
                        checked={answers[idx] === opt.id}
                        onChange={() => handleAnswer(opt.id)}
                        className="w-4 h-4"
                        disabled={showResults}
                      />
                      <span className="ml-3">
                        {isImage(opt.text) ? (
                          <img
                            src={opt.text}
                            alt={opt.id}
                            className="h-16 object-cover rounded"
                          />
                        ) : (
                          opt.text
                        )}
                      </span>
                    </label>
                  ));
                }
                return null;
              })()}
            </div>
          </div>
        );

      case "multiple":
        return (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {idx + 1}. {q.question} (Chọn nhiều)
            </p>
            <div className="space-y-2">
              {(() => {
                let optionsData = q.options;
                if (typeof optionsData === "string") {
                  try {
                    optionsData = JSON.parse(optionsData);
                  } catch (e) {
                    return null;
                  }
                }

                if (Array.isArray(optionsData)) {
                  return optionsData.map((opt) => {
                    const isSelected = Array.isArray(answers[idx])
                      ? answers[idx].includes(opt.id)
                      : false;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt.id}
                          checked={isSelected}
                          onChange={(e) => {
                            const currentAnswers = Array.isArray(answers[idx])
                              ? [...answers[idx]]
                              : [];
                            if (e.target.checked) {
                              currentAnswers.push(opt.id);
                            } else {
                              const pos = currentAnswers.indexOf(opt.id);
                              if (pos > -1) currentAnswers.splice(pos, 1);
                            }
                            handleAnswer(currentAnswers);
                          }}
                          className="w-4 h-4"
                          disabled={showResults}
                        />
                        <span className="ml-3">
                          {isImage(opt.text) ? (
                            <img
                              src={opt.text}
                              alt={opt.id}
                              className="h-16 object-cover rounded"
                            />
                          ) : (
                            opt.text
                          )}
                        </span>
                      </label>
                    );
                  });
                }
                return null;
              })()}
            </div>
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {idx + 1}. {q.question}
            </p>
            <div className="flex gap-3">
              {["Đúng", "Sai"].map((option, i) => {
                const value = i === 0 ? "true" : "false";
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    disabled={showResults}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      answers[idx] === value
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                    } disabled:opacity-50`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "matching":
        return (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {idx + 1}. {q.question} (Kéo thả để nối)
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* Bên trái - Items to match */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Bên trái:</p>
                {(() => {
                  let optionsData = q.options;
                  if (typeof optionsData === "string") {
                    try {
                      optionsData = JSON.parse(optionsData);
                    } catch (e) {
                      return null;
                    }
                  }

                  return Array.isArray(optionsData)
                    ? optionsData.map((opt, i) => (
                        <div
                          key={i}
                          className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          {isImage(opt.text) ? (
                            <img
                              src={opt.text}
                              alt={`Item ${i}`}
                              className="h-20 w-full object-cover rounded"
                            />
                          ) : (
                            <p className="text-sm font-medium">{opt.text}</p>
                          )}
                        </div>
                      ))
                    : null;
                })()}
              </div>

              {/* Bên phải - Draggable answers */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Bên phải (Kéo thả):</p>
                {(() => {
                  let answersData = q.correctAnswer;
                  if (typeof answersData === "string") {
                    try {
                      answersData = JSON.parse(answersData);
                    } catch (e) {
                      answersData = [];
                    }
                  }

                  const currentAnswers = Array.isArray(answers[idx]) ? answers[idx] : [];

                  return Array.isArray(answersData)
                    ? answersData.map((ans, i) => (
                        <div
                          key={i}
                          draggable={!showResults}
                          onDragStart={(e) => {
                            if (showResults) return;
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("answerIndex", i.toString());
                            e.dataTransfer.setData("answerValue", JSON.stringify(ans));
                          }}
                          onDragEnd={(e) => {
                            if (showResults) return;
                          }}
                          className={`p-3 border-2 rounded-lg cursor-grab active:cursor-grabbing transition ${
                            currentAnswers[i] === ans
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          } ${showResults ? "opacity-50" : ""}`}
                        >
                          {isImage(ans) ? (
                            <img
                              src={ans}
                              alt={`Answer ${i}`}
                              className="h-20 w-full object-cover rounded"
                            />
                          ) : (
                            <p className="text-sm font-medium">{ans}</p>
                          )}
                        </div>
                      ))
                    : null;
                })()}
              </div>
            </div>

            {/* Drop zones for pairing */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cặp nối của bạn:</p>
              <div className="space-y-2">
                {(() => {
                  let optionsData = q.options;
                  if (typeof optionsData === "string") {
                    try {
                      optionsData = JSON.parse(optionsData);
                    } catch (e) {
                      return null;
                    }
                  }

                  const currentAnswers = Array.isArray(answers[idx]) ? answers[idx] : [];

                  return Array.isArray(optionsData)
                    ? optionsData.map((opt, i) => (
                        <div
                          key={i}
                          onDragOver={(e) => {
                            if (showResults) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            e.currentTarget.classList.add("bg-yellow-100", "dark:bg-yellow-900/30");
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30");
                          }}
                          onDrop={(e) => {
                            if (showResults) return;
                            e.preventDefault();
                            e.currentTarget.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30");
                            
                            const answerValue = JSON.parse(e.dataTransfer.getData("answerValue"));
                            const newAnswers = [...currentAnswers];
                            newAnswers[i] = answerValue;
                            handleAnswer(newAnswers);
                          }}
                          className="p-3 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition"
                        >
                          <div className="flex gap-3 items-center">
                            <div className="flex-1">
                              {isImage(opt.text) ? (
                                <img
                                  src={opt.text}
                                  alt={`Item ${i}`}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <p className="text-sm font-medium">{opt.text}</p>
                              )}
                            </div>
                            <span className="text-gray-500">→</span>
                            <div className="flex-1">
                              {currentAnswers[i] ? (
                                isImage(currentAnswers[i]) ? (
                                  <img
                                    src={currentAnswers[i]}
                                    alt={`Matched ${i}`}
                                    className="h-12 w-12 object-cover rounded"
                                  />
                                ) : (
                                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {currentAnswers[i]}
                                  </p>
                                )
                              ) : (
                                <p className="text-xs text-gray-500 italic">Kéo đáp án vào đây</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    : null;
                })()}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAnswer = (q, idx) => {
    const correctAnswer = q.correctAnswer;
    const userAnswer = answers[idx];
    let isCorrect = false;

    if (q.type === "matching") {
      isCorrect =
        Array.isArray(userAnswer) &&
        Array.isArray(correctAnswer) &&
        JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else if (q.type === "multiple") {
      isCorrect =
        Array.isArray(userAnswer) &&
        Array.isArray(correctAnswer) &&
        [...userAnswer].sort().join(",") === [...correctAnswer].sort().join(",");
    } else {
      isCorrect = userAnswer === correctAnswer;
    }

    // Special rendering for matching questions
    if (q.type === "matching") {
      return (
        <div
          className={`p-4 rounded-lg ${
            isCorrect ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900"
          }`}
        >
          <div className="flex items-start gap-2 mb-4">
            {isCorrect ? (
              <>
                <FiCheck className="text-green-600 dark:text-green-400 mt-1" />
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Đúng
                </span>
              </>
            ) : (
              <>
                <FiX className="text-red-600 dark:text-red-400 mt-1" />
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  Sai
                </span>
              </>
            )}
          </div>

          {/* Display matching pairs */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cặp nối của bạn:
              </p>
              <div className="space-y-2">
                {(() => {
                  let optionsData = q.options;
                  if (typeof optionsData === "string") {
                    try {
                      optionsData = JSON.parse(optionsData);
                    } catch (e) {
                      return null;
                    }
                  }
                  
                  const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                  
                  return Array.isArray(optionsData)
                    ? optionsData.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/30 rounded">
                          <div className="flex-1 flex items-center gap-2">
                            {isImage(opt.text) ? (
                              <img
                                src={opt.text}
                                alt={`Item ${i}`}
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <span className="text-sm font-medium">{opt.text}</span>
                            )}
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex-1 flex items-center gap-2">
                            {currentAnswers[i] ? (
                              isImage(currentAnswers[i]) ? (
                                <img
                                  src={currentAnswers[i]}
                                  alt={`Answer ${i}`}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              ) : (
                                <span className="text-sm text-blue-600 dark:text-blue-400">{currentAnswers[i]}</span>
                              )
                            ) : (
                              <span className="text-xs text-gray-400 italic">Chưa chọn</span>
                            )}
                          </div>
                        </div>
                      ))
                    : null;
                })()}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Đáp án đúng:
              </p>
              <div className="space-y-2">
                {(() => {
                  let optionsData = q.options;
                  if (typeof optionsData === "string") {
                    try {
                      optionsData = JSON.parse(optionsData);
                    } catch (e) {
                      return null;
                    }
                  }
                  
                  const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [];
                  
                  return Array.isArray(optionsData)
                    ? optionsData.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/30 rounded">
                          <div className="flex-1 flex items-center gap-2">
                            {isImage(opt.text) ? (
                              <img
                                src={opt.text}
                                alt={`Item ${i}`}
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <span className="text-sm font-medium">{opt.text}</span>
                            )}
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex-1 flex items-center gap-2">
                            {correctAnswerArray[i] ? (
                              isImage(correctAnswerArray[i]) ? (
                                <img
                                  src={correctAnswerArray[i]}
                                  alt={`Correct ${i}`}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              ) : (
                                <span className="text-sm text-green-600 dark:text-green-400">{correctAnswerArray[i]}</span>
                              )
                            ) : null}
                          </div>
                        </div>
                      ))
                    : null;
                })()}
              </div>
            </div>
          </div>

          {q.explanation && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
              <strong>Giải thích:</strong> {q.explanation}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        className={`p-4 rounded-lg ${
          isCorrect ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900"
        }`}
      >
        <div className="flex items-start gap-2 mb-2">
          {isCorrect ? (
            <>
              <FiCheck className="text-green-600 dark:text-green-400 mt-1" />
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Đúng
              </span>
            </>
          ) : (
            <>
              <FiX className="text-red-600 dark:text-red-400 mt-1" />
              <span className="text-red-600 dark:text-red-400 font-semibold">
                Sai
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Câu trả lời của bạn:</strong>{" "}
          {Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer || "Chưa trả lời"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Đáp án đúng:</strong>{" "}
          {Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}
        </p>
        {q.explanation && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            <strong>Giải thích:</strong> {q.explanation}
          </p>
        )}
      </div>
    );
  };

  if (!exam || !questions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Bài thi này chưa có câu hỏi</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-blue-100 mt-1">Bài thi thử cho giáo viên</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition"
            >
              <FiArrowLeft size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showResults ? (
            // Kết quả
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm">Điểm của bạn</p>
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {score}%
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                  >
                    <p className="font-semibold mb-3">
                      Câu {idx + 1}: {q.question}
                    </p>
                    {renderAnswer(q, idx)}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setAnswers({});
                    setCurrentQuestion(0);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  Làm lại
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            // Form làm bài
            <div className="space-y-6">
              {/* Câu hỏi hiện tại */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                {renderQuestion(questions[currentQuestion], currentQuestion)}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Câu {currentQuestion + 1} / {questions.length}
                  </span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-semibold"
                >
                  ← Câu trước
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-semibold"
                >
                  Câu sau →
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Nộp bài
                </button>
              </div>

              {/* Question list */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Danh sách câu hỏi:</p>
                <div className="grid grid-cols-6 gap-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-full aspect-square rounded-lg font-semibold text-sm transition ${
                        currentQuestion === idx
                          ? "bg-blue-500 text-white"
                          : answers[idx]
                          ? "bg-green-400 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
