import React from "react";
import { Link } from "react-router-dom";

const ResultTable = ({
  results = [],
  onPublish,
  onWithdraw,
  onDelete,
  isPublishing = false,
  isWithdrawing = false,
  isDeleting = false,
}) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700";

      case "EVALUATED":
        return "bg-blue-100 text-blue-700";

      case "PENDING_EVALUATION":
        return "bg-yellow-100 text-yellow-700";

      case "WITHDRAWN":
        return "bg-red-100 text-red-700";

      case "DRAFT":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status.replace(/_/g, " ");
  };

  if (!results.length) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          No results found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Student
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Assessment
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Marks
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Percentage
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {results.map((result) => {
              const studentName =
                result.student?.user?.name ||
                "Unknown Student";

              const admissionNumber =
                result.student?.admissionNumber;

              const assessmentTitle =
                result.assessment?.title ||
                "Unknown Assessment";

              const subjectName =
                result.assessment?.subject?.name;

              return (
                <tr
                  key={result._id}
                  className="hover:bg-gray-50"
                >
                  {/* Student */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {studentName}
                    </div>

                    {admissionNumber && (
                      <div className="text-xs text-gray-500">
                        {admissionNumber}
                      </div>
                    )}
                  </td>

                  {/* Assessment */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {assessmentTitle}
                    </div>

                    {subjectName && (
                      <div className="text-xs text-gray-500">
                        {subjectName}
                      </div>
                    )}
                  </td>

                  {/* Marks */}
                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <span className="font-medium text-gray-900">
                      {result.obtainedMarks}
                    </span>

                    <span className="text-gray-500">
                      {" "}
                      / {result.totalMarks}
                    </span>
                  </td>

                  {/* Percentage */}
                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <span className="font-medium text-gray-900">
                      {result.percentage}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        result.status,
                      )}`}
                    >
                      {formatStatus(result.status)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* View */}
                      <Link
                        to={`/results/${result._id}`}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      {/* Publish */}
                      {result.status ===
                        "EVALUATED" && (
                        <button
                          type="button"
                          onClick={() =>
                            onPublish?.(
                              result._id,
                            )
                          }
                          disabled={
                            isPublishing
                          }
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isPublishing
                            ? "Publishing..."
                            : "Publish"}
                        </button>
                      )}

                      {/* Withdraw */}
                      {result.status ===
                        "PUBLISHED" && (
                        <button
                          type="button"
                          onClick={() =>
                            onWithdraw?.(
                              result._id,
                            )
                          }
                          disabled={
                            isWithdrawing
                          }
                          className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isWithdrawing
                            ? "Withdrawing..."
                            : "Withdraw"}
                        </button>
                      )}

                      {/* Delete */}
                      {result.status !==
                        "PUBLISHED" &&
                        result.status !==
                          "WITHDRAWN" && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete?.(
                                result._id,
                              )
                            }
                            disabled={
                              isDeleting
                            }
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
