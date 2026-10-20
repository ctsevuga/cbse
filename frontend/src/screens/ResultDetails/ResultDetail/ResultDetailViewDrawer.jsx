import React from "react";

const ResultDetailViewDrawer = ({ open, result, onClose }) => {
  if (!open || !result) return null;

  return (
    <div className="drawer-overlay">
      <div
        className="result-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-detail-title"
      >
        <div className="drawer-header">
          <h2 id="result-detail-title">Result Details</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        <div className="drawer-content">
          <p>
            <strong>ID:</strong> {result.id}
          </p>

          <p>
            <strong>Name:</strong> {result.name}
          </p>

          {result.description && (
            <p>
              <strong>Description:</strong> {result.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetailViewDrawer;