import React from 'react';

const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-500/20`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      </div>
    </div>
  </div>
);

export default StatCard;
