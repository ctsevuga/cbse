// ResultDetailActions.jsx

import React from "react";

const EVALUATABLE_STATUSES = [
  "PENDING",
  "REVIEW_REQUIRED",
];

const ResultDetailActions = ({
  resultDetail,
  onView,
  onEdit,
  onEvaluate,
  onDelete,

  // Optional permission controls
  canView = true,
  canEdit = true,
  canEvaluate = true,
  canDelete = true,

  disabled = false,
}) => {
  if (!resultDetail) {
    return null;
  }

  const {
    evaluationStatus,
  } = resultDetail;

  const isEvaluatable =
    EVALUATABLE_STATUSES.includes(
      evaluationStatus,
    );

  const showEvaluate =
    canEvaluate &&
    isEvaluatable &&
    typeof onEvaluate === "function";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* View */}
      {canView &&
        typeof onView === "function" && (
          <ActionButton
            label="View"
            title="View result detail"
            onClick={() =>
              onView(resultDetail)
            }
            disabled={disabled}
            variant="default"
          >
            <EyeIcon />
          </ActionButton>
        )}

      {/* Edit */}
      {canEdit &&
        typeof onEdit === "function" && (
          <ActionButton
            label="Edit"
            title="Edit result detail"
            onClick={() =>
              onEdit(resultDetail)
            }
            disabled={disabled}
            variant="default"
          >
            <EditIcon />
          </ActionButton>
        )}

      {/* Evaluate */}
      {showEvaluate && (
        <ActionButton
          label="Evaluate"
          title="Evaluate result detail"
          onClick={() =>
            onEvaluate(resultDetail)
          }
          disabled={disabled}
          variant="primary"
        >
          <EvaluateIcon />
        </ActionButton>
      )}

      {/* Delete */}
      {canDelete &&
        typeof onDelete === "function" && (
          <ActionButton
            label="Delete"
            title="Delete result detail"
            onClick={() =>
              onDelete(resultDetail)
            }
            disabled={disabled}
            variant="danger"
          >
            <DeleteIcon />
          </ActionButton>
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Action Button                                                              */
/* -------------------------------------------------------------------------- */

const ActionButton = ({
  children,
  label,
  title,
  onClick,
  disabled,
  variant = "default",
}) => {
  const variantClasses = {
    default:
      "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900",

    primary:
      "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700",

    danger:
      "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-8 w-8 items-center justify-center",
        "rounded-md border",
        "transition-colors",
        variantClasses[variant],
        "disabled:cursor-not-allowed",
        "disabled:opacity-40",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const EyeIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z"
      />

      <circle
        cx="12"
        cy="12"
        r="2.75"
      />
    </svg>
  );
};

const EditIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
      />
    </svg>
  );
};

const EvaluateIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 11l3 3L22 4"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
      />
    </svg>
  );
};

const DeleteIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 11v6M14 11v6"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7l1 14h10l1-14"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7V4h6v3"
      />
    </svg>
  );
};

export default ResultDetailActions;
