// ResultDetailTable.jsx

import React from "react";

import ResultDetailRow from "./ResultDetailRow";

const ResultDetailTable = ({
  resultDetails = [],
  isLoading = false,
  isFetching = false,
  onView,
  onDelete,
}) => {
  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <TableHeader />

            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-t">
                  {Array.from({ length: 10 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!resultDetails.length) {
    return (
      <div className="rounded-lg border bg-white px-6 py-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-medium text-gray-900">
            No result details found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            There are no result details matching the current
            filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white">
      {/* Fetching overlay */}
      {isFetching && !isLoading && (
        <div className="absolute right-4 top-4 z-10">
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
            Updating...
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <TableHeader />

          <tbody className="divide-y">
            {resultDetails.map((resultDetail) => (
              <ResultDetailRow
                key={resultDetail._id}
                resultDetail={resultDetail}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Table header
 */
const TableHeader = () => {
  return (
    <thead className="bg-gray-50">
      <tr className="border-b">
        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Question
        </th>

        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Student
        </th>

        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Subject
        </th>

        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Chapter
        </th>

        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Topic
        </th>

        <th className="px-4 py-3 text-left font-medium text-gray-600">
          Type
        </th>

        <th className="px-4 py-3 text-center font-medium text-gray-600">
          Maximum
        </th>

        <th className="px-4 py-3 text-center font-medium text-gray-600">
          Obtained
        </th>

        <th className="px-4 py-3 text-center font-medium text-gray-600">
          Status
        </th>

        <th className="px-4 py-3 text-right font-medium text-gray-600">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default ResultDetailTable;
