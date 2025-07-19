const ProgressBar = ({ step }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          1
        </div>
        <div
          className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
        ></div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          2
        </div>
        <div
          className={`w-16 h-1 ${step >= 3 ? "bg-green-600" : "bg-gray-200"}`}
        ></div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step >= 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          ✓
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
