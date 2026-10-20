import React, { useMemo, useState } from "react";

import {
  useGetResultDetailsByResultQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import ResultSummaryHeader from "./components/Result/ResultSummaryHeader";
import ResultScoreSummary from "./components/Result/ResultScoreSummary";
import ResultDetailFilters from "./ResultDetail/ResultDetailFilters";
import ResultQuestionTable from "./components/Result/ResultQuestionTable";
import SubjectResultSection from "./components/Result/SubjectResultSection";
import EvaluationQueue from "./components/Evaluation/EvaluationQueue";
import ResultDetailActions from "./ResultDetail/ResultDetailActions";

/**
 * ResultDetailsByResultPage
 *
 * Displays all question-level result details belonging
 * to one Result.
 *
 * RTK endpoint used:
 * - useGetResultDetailsByResultQuery
 *
 * Expected query:
 * GET /result-details/result/:resultId
 *
 * The exact argument shape depends on resultDetailApiSlice.
 */

const ResultDetailsByResultPage = ({
  resultId,
  result,

  initialFilters = {},

  showSummary = true,
  showFilters = true,
  showSubjectAnalysis = true,
  showEvaluationQueue = false,
  showActions = true,

  pageSize = 10,

  className = "",
}) => {
  const [page, setPage] = useState(1);

  const [filters, setFilters] =
    useState(initialFilters);

  /*
   * Fetch all ResultDetails belonging to
   * the selected Result.
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetResultDetailsByResultQuery(
    resultId,
    {
      skip: !resultId,
    },
  );

  /*
   * Normalize possible API response shapes.
   *
   * Supports:
   * {
   *   data: [],
   *   pagination: {}
   * }
   *
   * and:
   * {
   *   resultDetails: [],
   *   total: 100
   * }
   *
   * and a direct array.
   */
  const normalizedData = useMemo(() => {
    return normalizeResponse(data);
  }, [data]);

  /*
   * Apply client-side filters when the API
   * response does not already perform filtering.
   */
  const filteredDetails = useMemo(() => {
    return applyFilters(
      normalizedData.items,
      filters,
    );
  }, [
    normalizedData.items,
    filters,
  ]);

  /*
   * Client-side pagination fallback.
   *
   * If your API already paginates the response,
   * this still works when the returned data contains
   * only the current page.
   */
  const paginatedDetails = useMemo(() => {
    const start =
      (page - 1) * pageSize;

    return filteredDetails.slice(
      start,
      start + pageSize,
    );
  }, [
    filteredDetails,
    page,
    pageSize,
  ]);

  const totalItems =
    normalizedData.pagination
      ?.total ??
    filteredDetails.length;

  const totalPages =
    normalizedData.pagination
      ?.totalPages ??
    Math.max(
      Math.ceil(
        totalItems / pageSize,
      ),
      1,
    );

  const handleFilterChange = (
    nextFilters,
  ) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (
    nextPage,
  ) => {
    setPage(nextPage);
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div
        className={[
          "w-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <LoadingState
          variant="page"
          message="Loading result details..."
          description="Please wait while the question-level result is being loaded."
        />
      </div>
    );
  }

  /*
   * Missing result ID.
   */
  if (!resultId) {
    return (
      <div
        className={[
          "w-full p-6",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <EmptyState
          variant="card"
          title="Result not selected"
          message="A valid result is required to view result details."
        />
      </div>
    );
  }

  /*
   * API error.
   */
  if (isError) {
    return (
      <div
        className={[
          "w-full p-6",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <EmptyState
          variant="card"
          title="Unable to load result details"
          message={
            getErrorMessage(error)
          }
          actionLabel="Try Again"
          onAction={refetch}
        />
      </div>
    );
  }

  /*
   * Empty result.
   */
  if (
    !isFetching &&
    normalizedData.items.length ===
      0
  ) {
    return (
      <div
        className={[
          "w-full p-6",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showSummary && (
          <ResultSummaryHeader
            result={
              result ||
              normalizedData.result
            }
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

  return (
    <div
      className={[
        "w-full space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ================================================================ */}
      {/* Result Header                                                     */}
      {/* ================================================================ */}

      {showSummary && (
        <ResultSummaryHeader
          result={
            result ||
            normalizedData.result
          }
          resultDetails={
            normalizedData.items
          }
        />
      )}

      {/* ================================================================ */}
      {/* Actions                                                            */}
      {/* ================================================================ */}

      {showActions && (
        <ResultDetailActions
          resultId={resultId}
          result={
            result ||
            normalizedData.result
          }
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      )}

      {/* ================================================================ */}
      {/* Score Summary                                                     */}
      {/* ================================================================ */}

      <ResultScoreSummary
        result={
          result ||
          normalizedData.result
        }
        resultDetails={
          normalizedData.items
        }
      />

      {/* ================================================================ */}
      {/* Filters                                                            */}
      {/* ================================================================ */}

      {showFilters && (
        <ResultDetailFilters
          filters={filters}
          resultDetails={
            normalizedData.items
          }
          onChange={
            handleFilterChange
          }
          onClear={
            handleClearFilters
          }
        />
      )}

      {/* ================================================================ */}
      {/* Question Results                                                  */}
      {/* ================================================================ */}

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Question Results
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Question-level performance for
                this result.
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
              resultDetails={
                paginatedDetails
              }
              result={
                result ||
                normalizedData.result
              }
              isLoading={isFetching}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={
                handlePageChange
              }
            />
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              variant="compact"
              title="No matching questions"
              message="Try changing or clearing your filters."
              actionLabel="Clear Filters"
              onAction={
                handleClearFilters
              }
            />
          </div>
        )}
      </section>

      {/* ================================================================ */}
      {/* Subject Analysis                                                   */}
      {/* ================================================================ */}

      {showSubjectAnalysis && (
        <SubjectResultSection
          result={
            result ||
            normalizedData.result
          }
          resultDetails={
            normalizedData.items
          }
        />
      )}

      {/* ================================================================ */}
      {/* Evaluation Queue                                                   */}
      {/* ================================================================ */}

      {showEvaluationQueue && (
        <EvaluationQueue
          resultId={resultId}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Response Normalization                                                     */
/* -------------------------------------------------------------------------- */

const normalizeResponse = (
  response,
) => {
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

  const pagination =
    response.pagination ||
    response.meta ||
    null;

  return {
    items: Array.isArray(items)
      ? items
      : [],
    result:
      response.result ||
      null,
    pagination,
  };
};

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

const applyFilters = (
  details,
  filters,
) => {
  if (!Array.isArray(details)) {
    return [];
  }

  return details.filter(
    (detail) => {
      /*
       * Question type.
       */
      if (
        filters.questionType &&
        detail.questionType !==
          filters.questionType
      ) {
        return false;
      }

      /*
       * Evaluation status.
       */
      if (
        filters.evaluationStatus &&
        detail.evaluationStatus !==
          filters.evaluationStatus
      ) {
        return false;
      }

      /*
       * Subject.
       */
      if (
        filters.subjectId &&
        getId(detail.subject) !==
          filters.subjectId
      ) {
        return false;
      }

      /*
       * Chapter.
       */
      if (
        filters.chapterId &&
        getId(detail.chapter) !==
          filters.chapterId
      ) {
        return false;
      }

      /*
       * Topic.
       */
      if (
        filters.topicId &&
        getId(detail.topic) !==
          filters.topicId
      ) {
        return false;
      }

      /*
       * Assessment question.
       */
      if (
        filters.assessmentQuestionId &&
        getId(
          detail.assessmentQuestion,
        ) !==
          filters.assessmentQuestionId
      ) {
        return false;
      }

      /*
       * Question.
       */
      if (
        filters.questionId &&
        getId(detail.question) !==
          filters.questionId
      ) {
        return false;
      }

      return true;
    },
  );
};

/* -------------------------------------------------------------------------- */
/* ID Helper                                                                  */
/* -------------------------------------------------------------------------- */

const getId = (
  value,
) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return (
    value._id ||
    value.id ||
    null
  );
};

/* -------------------------------------------------------------------------- */
/* Error Helper                                                               */
/* -------------------------------------------------------------------------- */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading the result details.";
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return (
    error.data?.message ||
    error.data?.error ||
    error.error ||
    error.message ||
    "An unexpected error occurred while loading the result details."
  );
};

export default ResultDetailsByResultPage;
