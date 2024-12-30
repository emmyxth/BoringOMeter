import React from "react";

const EngagementScale = ({ score = 0 }) => {
  return (
    <div className="w-full space-y-4 mb-4">
      <h2 className="text-xl font-semibold">
        Boring Score: {Math.round(score)}
      </h2>

      <div className="relative pt-1">
        {/* Progress bar */}
        <div className="overflow-hidden h-6 rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-2 text-lg text-gray-600">
          <span className="flex items-center">
            {/* <svg
              className="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0zm-9.5-4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            </svg> */}
            😴 I'm snoozing
          </span>
          <span className="flex items-center">
            😍 I'm captivated
            {/* <svg
              className="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg> */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EngagementScale;
