import React from "react";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-700 ring-gray-200",
  },

  PENDING_EVALUATION: {
    label: "Pending Evaluation",
    className:
      "bg-yellow-100 text-yellow-800 ring-yellow-200",
  },

  EVALUATED: {
    label: "Evaluated",
    className:
      "bg-blue-100 text-blue-800 ring-blue-200",
  },

  PUBLISHED: {
    label: "Published",
    className:
      "bg-green-100 text-green-800 ring-green-200",
  },

  WITHDRAWN: {
    label: "Withdrawn",
    className:
      "bg-red-100 text-red-800 ring-red-200",
  },
};

const ResultStatusBadge = ({
  status,
  className = "",
}) => {
  const config =
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className:
        "bg-gray-100 text-gray-700 ring-gray-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default ResultStatusBadge;
