import React from "react";

const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-green-400 to-emerald-600 h-4 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-right">
        {current}/{total} đã làm
      </p>
    </div>
  );
};

export default ProgressBar;
