import React from 'react';

const ExerciseList = ({ exercises, onDelete }) => {
  // Map type từ API format sang display format
  const getTypeLabel = (type) => {
    const typeMap = {
      'multiple_choice': 'Trắc nghiệm',
      'fill_blank': 'Điền từ',
      'essay': 'Tự luận'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      {exercises.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có bài tập nào cho bài học này.</div>
      ) : (
        exercises.map(ex => (
          <div key={ex.id} className="bg-green-50 dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-lg font-bold text-green-700 dark:text-green-200 mb-2 flex items-center gap-2">
                {ex.question || ex.title || 'Câu hỏi không có tiêu đề'}
                <span className="ml-2 text-xs bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                  {getTypeLabel(ex.type)}
                </span>
              </div>
              {ex.options && typeof ex.options === 'object' && (
                <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  <div className="font-semibold mb-1">Các đáp án:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(ex.options).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-bold">{key.toUpperCase()}.</span> {value}
                        {ex.answer === key && <span className="ml-2 text-green-600 dark:text-green-400">✓ (Đúng)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ex.answer && !ex.options && (
                <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  <span className="font-semibold">Đáp án:</span> {ex.answer}
                </div>
              )}
              {ex.image && (
                <div className="mt-2">
                  <img src={ex.image} alt="Exercise" className="max-h-32 rounded shadow" />
                </div>
              )}
            </div>
            <button
              onClick={() => onDelete(ex.id)}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-full font-semibold shadow hover:bg-red-700 transition self-end sm:self-auto"
            >
              🗑️ Xoá
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ExerciseList; 