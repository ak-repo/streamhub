import React from "react";

function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-1">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
          Welcome to StreamHub
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500">
          Select a chat to start messaging
        </div>
      </div>
      <div>{/* <h1>Recent activities</h1> */}</div>
    </div>
  );
}

export default Welcome;
