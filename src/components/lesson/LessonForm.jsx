import React, { useState } from 'react';
import { FiVideo } from 'react-icons/fi';

const LessonForm = ({ onSubmit, initialLesson = {}, onCancel }) => {
  const [lesson, setLesson] = useState({
    title: initialLesson.title || '',
    content: initialLesson.content || '',
    video_url: initialLesson.video_url || '',
    order: initialLesson.order || 1,
  });

  const handleChange = (e) => {
    setLesson({ ...lesson, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lesson.title.trim() || !lesson.content.trim()) return;
    onSubmit({ ...lesson, order: Number(lesson.order) });
    setLesson({ title: '', content: '', video_url: '', order: 1 });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
      <input
        type="text"
        name="title"
        placeholder="Tiêu đề bài học"
        value={lesson.title}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-primary dark:border-primary bg-white dark:bg-gray-800 text-primary dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow"
        required
      />
      <textarea
        name="description"
        placeholder="Mô tả bài học (nếu có)"
        value={lesson.description}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-primary dark:border-primary bg-white dark:bg-gray-800 text-primary dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow"
        rows={2}
      />
      <label className="font-semibold text-primary dark:text-primary mb-1 block">Video URL (nếu có):</label>
      <input
        type="text"
        name="video_url"
        placeholder="URL video bài học"
        value={lesson.video_url}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-primary dark:border-primary bg-white dark:bg-gray-800 text-primary dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow w-full"
      />
      <label className="font-semibold text-primary dark:text-primary mb-1 block">Thứ tự:</label>
      <input
        type="number"
        name="order"
        placeholder="Thứ tự bài học"
        value={lesson.order}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg border border-primary dark:border-primary bg-white dark:bg-gray-800 text-primary dark:text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow w-full"
      />
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

export default LessonForm; 