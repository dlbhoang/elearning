import React from "react";
import { FaCheckCircle, FaPlay, FaLock } from "react-icons/fa";

const LessonItem = ({ lesson, onClick, index }) => {
  return (
    <div className="flex justify-between items-start bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition duration-300 gap-4">
      {/* Left: Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {index + 1}. {lesson.title}
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              lesson.isFree
                ? "bg-green-100 text-green-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            {lesson.isFree ? "Miễn phí" : "Trả phí"}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.description}</p>
      </div>

      {/* Right: Action */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onClick}
          disabled={lesson.completed}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            lesson.completed
              ? "bg-green-500 text-white"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          {lesson.completed ? (
            <>
              <FaCheckCircle className="text-white" /> Đã hoàn thành
            </>
          ) : lesson.isFree ? (
            <>
              <FaPlay className="text-white" /> Bắt đầu học
            </>
          ) : (
            <>
              <FaLock className="text-white" /> Trả phí để học
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonItem;
