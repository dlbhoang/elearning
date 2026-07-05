import React, { useState } from 'react';

const defaultOptions = { a: '', b: '', c: '', d: '' };

const ExerciseForm = ({ onSubmit, initialExercise = {}, onCancel }) => {
  const [exercise, setExercise] = useState({
    title: initialExercise.title || '',
    description: initialExercise.description || '',
    type: initialExercise.type || 'multiple-choice',
    options: initialExercise.options || defaultOptions,
    correct: initialExercise.correct || 'a',
    answer: initialExercise.answer || '',
    image_url: initialExercise.image_url || '',
  });
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
        setExercise(ex => ({ ...ex, image_url: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercise.title.trim()) return;
    if (exercise.type === 'multiple-choice') {
      if (!exercise.options.a || !exercise.options.b || !exercise.options.c || !exercise.options.d) return;
      if (!['a', 'b', 'c', 'd'].includes(exercise.correct)) return;
    } else {
      if (!exercise.answer.trim()) return;
    }
    onSubmit(exercise);
    setExercise({ title: '', description: '', type: 'multiple-choice', options: defaultOptions, correct: 'a', answer: '', image_url: '' });
    setFilePreview('');
  };

  const imageToShow = exercise.image_url || filePreview;

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
      <input
        type="text"
        name="title"
        placeholder="Tiêu đề bài tập"
        value={exercise.title}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 text-green-700 dark:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        required
      />
      <textarea
        name="description"
        placeholder="Mô tả bài tập (nếu có)"
        value={exercise.description}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 text-green-700 dark:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        rows={2}
      />
      <div className="flex flex-col gap-2">
        <input
          type="text"
          name="image_url"
          placeholder="URL ảnh minh hoạ (nếu có)"
          value={exercise.image_url}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 text-green-700 dark:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        />
        <div className="flex items-center gap-3">
          <label className="font-semibold text-green-700 dark:text-green-200">Hoặc upload ảnh:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
      </div>
      {imageToShow && (
        <div className="flex justify-center mb-2">
          <img src={imageToShow} alt="minh hoạ" className="max-h-32 rounded shadow border border-green-200 dark:border-green-700" />
        </div>
      )}
      <div>
        <label className="font-semibold text-green-700 dark:text-green-200 mb-1 block">Loại bài tập:</label>
        <select
          name="type"
          value={exercise.type}
          onChange={handleChange}
          className="rounded-lg border border-green-300 dark:border-green-700 px-4 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 shadow w-full"
        >
          <option value="multiple-choice">Trắc nghiệm</option>
          <option value="fill-in-the-blank">Điền từ</option>
          <option value="essay">Tự luận</option>
        </select>
      </div>
      {exercise.type === 'multiple-choice' && (
        <div className="space-y-2 bg-green-50 dark:bg-gray-800 p-4 rounded-xl">
          <div className="font-semibold text-green-700 dark:text-green-200 mb-2">Nhập đáp án và chọn đáp án đúng:</div>
          {['a', 'b', 'c', 'd'].map(opt => (
            <div key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                value={opt}
                checked={exercise.correct === opt}
                onChange={handleChange}
                className="accent-green-600"
                required
              />
              <span className="font-bold uppercase">{opt}.</span>
              <input
                type="text"
                name={opt}
                placeholder={`Đáp án ${opt.toUpperCase()}`}
                value={exercise.options[opt]}
                onChange={handleOptionChange}
                className="flex-1 px-3 py-2 rounded border border-green-300 dark:border-green-700 bg-white dark:bg-gray-900 text-green-800 dark:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          ))}
        </div>
      )}
      {(exercise.type === 'fill-in-the-blank' || exercise.type === 'essay') && (
        <div className="space-y-2 bg-green-50 dark:bg-gray-800 p-4 rounded-xl">
          <div className="font-semibold text-green-700 dark:text-green-200 mb-2">Nhập đáp án đúng:</div>
          <input
            type="text"
            name="answer"
            placeholder="Đáp án đúng"
            value={exercise.answer}
            onChange={handleChange}
            className="px-4 py-2 rounded border border-green-300 dark:border-green-700 bg-white dark:bg-gray-900 text-green-800 dark:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
            required
          />
        </div>
      )}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition">Huỷ</button>
        )}
        <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-full font-semibold shadow hover:bg-green-700 transition">
          Lưu
        </button>
      </div>
    </form>
  );
};

export default ExerciseForm; 