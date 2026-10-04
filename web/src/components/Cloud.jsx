import React from "react";
import { useNavigate } from "react-router-dom";

function Cloud() {
  const navigate = useNavigate();

  const storageStats = {
    used: 1.8,
    total: 5,
    percentage: (1.8 / 5) * 100,
  };
  return (
    <div>
      {/* Cloud Storage - Minimal Version */}
      <div className="flex items-center space-x-3 bg-gray-900 dark:bg-gray-750 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
        {/* Storage Info */}
        <div className="text-right">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {storageStats.used}GB / {storageStats.total}GB
          </div>
          <div className="w-20 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 mt-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
              style={{ width: `${storageStats.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => navigate("/hub/uploads")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Cloud;
