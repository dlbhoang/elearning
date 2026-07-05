import React from "react";

const ExerciseQuestion = ({
  ex,
  idx,
  answer,
  submitted,
  handleOptionChange,
}) => {
  // Helper function to get option labels
  const getOptionLabels = () => {
    if (!ex.options || typeof ex.options !== 'object') return [];
    return Object.entries(ex.options).map(([key, value]) => ({
      key,
      value
    }));
  };

  return (
    <div className="mb-8 p-6 border rounded-2xl bg-gray-50 dark:bg-gray-700 shadow-md hover:shadow-xl transition">
      {/* Hiển thị hình ảnh nếu có */}
      {ex.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={ex.image} 
            alt="Exercise" 
            className="w-full max-h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <p className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">
        Câu {idx + 1}: {ex.question}
      </p>

      {/* Trắc nghiệm - Multiple Choice */}
      {ex.type === "multiple_choice" && (
        <div className="space-y-2">
          {getOptionLabels().map(({ key, value }) => (
            <label
              key={key}
              className={`block px-4 py-3 rounded-xl cursor-pointer transition ${
                answer === key
                  ? "bg-blue-500 text-white font-semibold"
                  : "bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-500"
              }`}
            >
              <input
                type="radio"
                className="mr-2 accent-blue-600"
                name={`q${idx}`}
                value={key}
                checked={answer === key}
                onChange={() => handleOptionChange(idx, key)}
                disabled={submitted}
              />
              <span className="font-medium">{key.toUpperCase()}.</span> {value}
            </label>
          ))}
        </div>
      )}

      {/* Điền từ - Fill in the Blank */}
      {ex.type === "fill_blank" && (
        <div>
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
            value={answer || ""}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            disabled={submitted}
            placeholder="Nhập đáp án..."
          />
          {submitted && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <strong>Đáp án:</strong> {ex.answer}
            </p>
          )}
        </div>
      )}

      {/* Tự luận - Essay */}
      {ex.type === "essay" && (
        <div>
          <textarea
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
            value={answer || ""}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            disabled={submitted}
            placeholder="Viết câu trả lời của bạn..."
            rows={4}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
            Bài tự luận sẽ được giáo viên chấm điểm
          </p>
        </div>
      )}

      {/* Nối hình ảnh - Matching */}
      {ex.type === "matching" && ex.options && ex.answer && (
        <div>
          <div className="grid grid-cols-2 gap-6">
            {/* Bên trái - Hình ảnh cần nối */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Bên trái (Kéo từ bên phải hoặc click):</h4>
              {Array.isArray(ex.options) && ex.options.map((item, i) => {
                const connectedItem = answer?.[i];
                return (
                  <div 
                    key={i} 
                    className={`p-3 bg-white dark:bg-gray-600 border-2 rounded-lg transition ${
                      connectedItem 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!submitted) {
                        const droppedItem = e.dataTransfer.getData('text/plain');
                        const currentAnswer = answer || {};
                        
                        // Remove old connection of this right item from any left item
                        Object.keys(currentAnswer).forEach(key => {
                          if (currentAnswer[key] === droppedItem) {
                            delete currentAnswer[key];
                          }
                        });
                        
                        // Connect to current left item
                        currentAnswer[i] = droppedItem;
                        handleOptionChange(idx, currentAnswer);
                      }
                    }}
                  >
                    <div className="mb-2">
                      {item && item.startsWith('data:image') ? (
                        <img src={item} alt={`Left ${i}`} className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="text-gray-900 dark:text-white text-center py-6 font-medium">{item}</div>
                      )}
                    </div>
                    {connectedItem && (
                      <div className="text-xs bg-green-600 text-white px-2 py-1 rounded text-center font-semibold">
                        ✓ {connectedItem.startsWith('data:image') ? '[Hình]' : connectedItem.substring(0, 20)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bên phải - Có thể kéo */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Bên phải (Kéo sang trái):</h4>
              {Array.isArray(ex.answer) && ex.answer.map((item, i) => {
                const isConnected = Object.values(answer || {}).includes(item);
                return (
                  <div
                    key={i}
                    draggable={!submitted && !isConnected}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', item);
                    }}
                    onClick={() => {
                      if (!submitted) {
                        const currentAnswer = answer || {};
                        
                        // Check if this right item is already connected
                        const isAlreadyConnected = Object.values(currentAnswer).includes(item);
                        
                        if (isAlreadyConnected) {
                          // Disconnect it
                          Object.keys(currentAnswer).forEach(key => {
                            if (currentAnswer[key] === item) {
                              delete currentAnswer[key];
                            }
                          });
                        } else {
                          // Connect to first available left item
                          const firstAvailableLeftIndex = Object.keys(currentAnswer).length;
                          if (firstAvailableLeftIndex < Object.keys(ex.options || {}).length) {
                            currentAnswer[firstAvailableLeftIndex] = item;
                          } else {
                            // Find first unconnected left item
                            for (let j = 0; j < (ex.options?.length || 0); j++) {
                              if (!currentAnswer[j]) {
                                currentAnswer[j] = item;
                                break;
                              }
                            }
                          }
                        }
                        handleOptionChange(idx, currentAnswer);
                      }
                    }}
                    className={`p-2 rounded-lg font-medium transition text-left overflow-hidden cursor-move ${
                      isConnected
                        ? "ring-4 ring-green-500 border-2 border-green-600 opacity-50"
                        : "border-2 border-gray-300 dark:border-gray-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    } ${submitted ? "cursor-not-allowed" : ""}`}
                  >
                    {item && item.startsWith('data:image') ? (
                      <img src={item} alt={`Right ${i}`} className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="text-gray-900 dark:text-white text-sm py-3 px-2 text-center">
                        {item || '(trống)'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {submitted && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-600 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Cách nối của bạn:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Array.isArray(ex.options) && ex.options.map((leftItem, i) => (
                  <div key={i} className="text-gray-600 dark:text-gray-400">
                    <div className="text-xs text-gray-500 mb-1">Hình {i + 1}:</div>
                    <div className="font-medium">
                      {answer?.[i] ? (
                        answer[i].startsWith('data:image') ? (
                          <img src={answer[i]} alt="Selected" className="h-16 object-cover rounded" />
                        ) : (
                          <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600">
                            {answer[i]}
                          </div>
                        )
                      ) : (
                        <span className="text-red-500">(chưa nối)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseQuestion;
