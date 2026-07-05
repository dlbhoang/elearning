import React from 'react';
import { FiTrash2, FiVideo } from 'react-icons/fi';

const LessonList = ({ lessons, onDelete }) => (
  <div className="space-y-4">
    {lessons.length === 0 ? (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có bài học nào cho khoá học này.</div>
    ) : (
      lessons.map(lesson => (
        <div key={lesson.id} className="bg-primary/10 dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300">
          <div>
            <div className="text-lg font-bold text-primary dark:text-primary mb-1 flex items-center gap-2">
              {lesson.title}
              {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline"><FiVideo /></a>}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">{lesson.content}</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Thứ tự: {lesson.order}</span>
              <button onClick={() => onEdit(lesson)} className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90 transition text-sm dark:bg-primary/80 dark:text-gray-900 dark:hover:bg-primary/60 transition-colors">Sửa</button>
              <button onClick={() => onDelete(lesson.id)} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700 transition text-sm dark:bg-red-700 dark:text-white dark:hover:bg-red-900 transition-colors">Xoá</button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default LessonList; 