import React, { useState } from "react";
import ResultDetailViewDrawer from "./ResultDetailViewDrawer";

const ResultDetailDeleteDialog = ({
  result,
  onDelete,
  onClose,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      await onDelete(result.id);
      onClose();
    } catch (err) {
      setError("Failed to delete the result. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!result) return null;

  return (
    <>
      <div className="dialog-overlay">
        <div
          className="delete-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <h2 id="delete-dialog-title">Delete Result</h2>

          <p>
            Are you sure you want to delete{" "}
            <strong>{result.name}</strong>?
            This action cannot be undone.
          </p>

          {error && <p role="alert">{error}</p>}

          <div className="dialog-actions">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              disabled={isDeleting}
            >
              View Details
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <ResultDetailViewDrawer
        open={isDrawerOpen}
        result={result}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default ResultDetailDeleteDialog;