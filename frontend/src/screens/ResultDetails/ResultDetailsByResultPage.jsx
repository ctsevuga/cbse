
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  useGetResultDetailsByResultQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import ResultSummaryHeader from "./components/Result/ResultSummaryHeader";
import ResultScoreSummary from "./components/Result/ResultScoreSummary";
import ResultQuestionTable from "./components/Result/ResultQuestionTable";
import EvaluationQueue from "./components/Evaluation/EvaluationQueue";
import ResultDetailActions from "./ResultDetail/ResultDetailActions";


const ResultDetailsByResultPage = ({
  resultId: providedResultId,
  result: providedResult,

  showSummary = true,
  showEvaluationQueue = false,
  showActions = true,

  pageSize = 10,

  className = "",
}) => {
  // --------------------------------------------------
  // Route Parameters
  // --------------------------------------------------

  const params = useParams();

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  const resultId =
    providedResultId ||
    params.resultId ||
    params.id;

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resultId]);

  // --------------------------------------------------
  // Fetch Result Details
  // --------------------------------------------------

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetResultDetailsByResultQuery(
    {
      schoolSlug,
      resultId,
    },
    {
      skip: !schoolSlug || !resultId,
    }
  );

  // --------------------------------------------------
  // Normalize Response
  // --------------------------------------------------

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data]
  );

  const result =
    providedResult ||
    normalizedData.result;

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const paginatedDetails = useMemo(() => {
    const start = (page - 1) * pageSize;

    return normalizedData.items.slice(
      start,
      start + pageSize
    );
  }, [
    normalizedData.items,
    page,
    pageSize,
  ]);

  const totalItems =
    normalizedData.pagination?.total ??
    normalizedData.items.length;

  const totalPages =
    normalizedData.pagination?.totalPages ??
    Math.max(
      Math.ceil(totalItems / pageSize),
      1
    );

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  // --------------------------------------------------
  // Missing Result ID
  // --------------------------------------------------

  if (!resultId) {
    return (
      <div className={`w-full p-6 ${className}`}>
        <EmptyState
          variant="card"
          title="Result not selected"
          message="A valid result ID is required to view result details."
        />
      </div>
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <LoadingState
          variant="page"
          message="Loading result details..."
          description="Please wait while the question-level result is being loaded."
        />
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (isError) {
    return (
      <div className={`w-full p-6 ${className}`}>
        <EmptyState
          variant="card"
          title="Unable to load result details"
          message={getErrorMessage(error)}
          actionLabel="Try Again"
          onAction={refetch}
        />
      </div>
    );
  }

  // --------------------------------------------------
  // Empty Result
  // --------------------------------------------------

  if (
    !isFetching &&
    normalizedData.items.length === 0
  ) {
    return (
      <div className={`w-full p-6 ${className}`}>
        {showSummary && (
          <ResultSummaryHeader
            result={result}
          />
        )}

        <div className="mt-6">
          <EmptyState
            variant="card"
            title="No result details found"
            message="This result does not contain any question-level details."
            actionLabel="Refresh"
            onAction={refetch}
          />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main Page
  // --------------------------------------------------

  return (
    <div
      className={[
        "w-full space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Result Header */}

      {showSummary && (
        <ResultSummaryHeader
          result={result}
          resultDetails={normalizedData.items}
        />
      )}

      {/* Actions */}

      {showActions && (
        <ResultDetailActions
          resultId={resultId}
          result={result}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      )}

      {/* Score Summary */}

      <ResultScoreSummary
        result={result}
        resultDetails={normalizedData.items}
      />

      {/* Question Results */}

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Question Results
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Question-level performance for this result.
              </p>
            </div>

            {isFetching && (
              <LoadingState
                variant="inline"
                message="Refreshing..."
                size="sm"
              />
            )}

          </div>
        </div>

        {paginatedDetails.length > 0 ? (
          <>
            <ResultQuestionTable
              resultDetails={paginatedDetails}
              result={result}
              isLoading={isFetching}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              variant="compact"
              title="No question details found"
              message="There are no question details available for this result."
            />
          </div>
        )}

      </section>

      {/* Evaluation Queue */}

      {showEvaluationQueue && (
        <EvaluationQueue
          resultId={resultId}
        />
      )}

    </div>
  );
};


// ==================================================
// Response Normalization
// ==================================================

const normalizeResponse = (response) => {
  if (!response) {
    return {
      items: [],
      result: null,
      pagination: null,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      result: null,
      pagination: null,
    };
  }

  const items =
    response.data ||
    response.resultDetails ||
    response.results ||
    response.items ||
    [];

  return {
    items: Array.isArray(items)
      ? items
      : [],

    result:
      response.result || null,

    pagination:
      response.pagination ||
      response.meta ||
      null,
  };
};

// ==================================================
// Error Helper
// ==================================================

const getErrorMessage = (error) => {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    "An unexpected error occurred while loading the result details."
  );
};

export default ResultDetailsByResultPage;
