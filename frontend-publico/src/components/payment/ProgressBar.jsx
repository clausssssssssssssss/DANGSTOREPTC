const ProgressBar = ({ step }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-steps">
        <div
          className={`progress-step ${step >= 1 ? "active" : ""}`}
        >
          1
        </div>
        <div
          className={`progress-line ${step >= 2 ? "active" : ""}`}
        ></div>
        <div
          className={`progress-step ${step >= 2 ? "active" : ""}`}
        >
          2
        </div>
        <div
          className={`progress-line ${step >= 3 ? "active" : ""}`}
        ></div>
        <div
          className={`progress-step ${step >= 3 ? "completed" : ""}`}
        >
          ✓
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
