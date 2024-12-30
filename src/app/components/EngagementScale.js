import React from "react";

const EngagementScale = ({ score = 0 }) => {
  // Function to determine gradient colors based on score
  const getGradientColors = (score) => {
    if (score < 33) {
      return "from-red-400 to-red-500";
    } else if (score < 66) {
      return "from-yellow-400 to-orange-500";
    }
    return "from-green-400 to-green-500";
  };

  // Function to determine emoji based on score
  const getEmoji = (score) => {
    if (score < 33) return "😴";
    if (score < 66) return "🙂";
    return "🤩";
  };

  return (
    <div className="w-full bg-white rounded-xl p-6 mb-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Boring-O-Meter
          </h2>
          <span className="text-2xl font-semibold text-gray-700">
            {getEmoji(score)} {Math.round(score)}%
          </span>
        </div>

        <div className="relative pt-1">
          {/* Background track */}
          <div className="overflow-hidden h-8 rounded-full bg-gray-100">
            {/* Animated progress bar */}
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getGradientColors(
                score
              )}`}
              style={{
                width: `${score}%`,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">😴</span>
              <span className="text-sm font-medium text-gray-600">
                Totally Boring
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                Super Engaging
              </span>
              <span className="text-xl">🤩</span>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {score < 33
              ? "Let's try to make it more engaging!"
              : score < 66
              ? "You're getting there! Keep adding more personality."
              : "Great job! You're keeping it interesting!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EngagementScale;
