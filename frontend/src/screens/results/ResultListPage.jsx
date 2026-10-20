import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetResultsQuery,
  usePublishResultMutation,
  useWithdrawResultMutation,
  useDeleteResultMutation,
} from "../../slices/resultApiSlice";

const ResultListPage = () => {
  const [status, setStatus] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [studentId, setStudentId] = useState("");

  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetResultsQuery({
    ...(status && { status }),
    ...(assessmentId && { assessmentId }),
    ...(studentId && { studentId }),
  });

  const [publishResult, { isLoading: isPublishing }] =
    usePublishResultMutation();

  const [withdrawResult, { isLoading: isWithdrawing }] =
    useWithdrawResultMutation();

  const [deleteResult, { isLoading: isDeleting }] =
    useDeleteResultMutation();

  const handlePublish = async (resultId) => {
    if (
      !window.confirm(
        "Are you sure you want to publish this result?",
      )
    ) {
      return;
    }

    try {
      await publishResult(resultId).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to publish result",
      );
    }
  };

  const handleWithdraw = async (resultId) => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this result?",
      )
    ) {
      return;
    }

    try {
      await withdrawResult(resultId).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to withdraw result",
      );
    }
  };

  const handleDelete = async (resultId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this result?",
      )
    ) {
      return;
    }

    try {
      await deleteResult(resultId).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to delete result",
      );
    }
  };

  const clearFilters = () => {
    setStatus("");
    setAssessmentId("");
    setStudentId("");
  };

  const getStatusClass = (resultStatus) => {
    switch (resultStatus) {
      case "PUBLISHED":
        return "text-green-700 bg-green-100";

      case "EVALUATED":
        return "text-blue-700 bg-blue-100";

      case "PENDING_EVALUATION":
        return "text-yellow-700 bg-yellow-100";

      case "WITHDRAWN":
        return "text-red-700 bg-red-100";

      case "DRAFT":
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading results...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>
            {error?.data?.message ||
              error?.error ||
              "Failed to load results."}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Results
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage assessment results.
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Assessment */}
          <div>
            <label
              htmlFor="assessmentId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Assessment ID
            </label>

            <input
              id="assessmentId"
              type="text"
              value={assessmentId}
              onChange={(e) =>
                setAssessmentId(e.target.value)
              }
              placeholder="Enter assessment ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Student */}
          <div>
            <label
              htmlFor="studentId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Student ID
            </label>

            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              placeholder="Enter student ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_EVALUATION">
                Pending Evaluation
              </option>
              <option value="EVALUATED">
                Evaluated
              </option>
              <option value="PUBLISHED">
                Published
              </option>
              <option value="WITHDRAWN">
                Withdrawn
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="mb-3 text-sm text-gray-500">
        {results.length} result
        {results.length !== 1 ? "s" : ""}
      </div>

      {/* Results table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results found.
          </div>
        ) : (
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

                  const assessmentTitle =
                    result.assessment?.title ||
                    "Unknown Assessment";

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

                        {result.student
                          ?.admissionNumber && (
                          <div className="text-xs text-gray-500">
                            {
                              result.student
                                .admissionNumber
                            }
                          </div>
                        )}
                      </td>

                      {/* Assessment */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {assessmentTitle}
                        </div>

                        {result.assessment
                          ?.subject?.name && (
                          <div className="text-xs text-gray-500">
                            {
                              result.assessment
                                .subject.name
                            }
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
                          {result.status.replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/results/${result._id}`}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Link>

                          {result.status ===
                            "EVALUATED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePublish(
                                  result._id,
                                )
                              }
                              disabled={
                                isPublishing
                              }
                              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}

                          {result.status ===
                            "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleWithdraw(
                                  result._id,
                                )
                              }
                              disabled={
                                isWithdrawing
                              }
                              className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Withdraw
                            </button>
                          )}

                          {result.status !==
                            "PUBLISHED" &&
                            result.status !==
                              "WITHDRAWN" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    result._id,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Delete
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
        )}
      </div>
    </div>
  );
};

export default ResultListPage;
