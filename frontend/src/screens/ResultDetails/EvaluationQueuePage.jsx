import React, { useMemo, useState } from "react";

import {
  useGetMyResultDetailEvaluationsQuery,
  useGetPendingResultDetailsQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import EvaluationQueueTable from "./components/Evaluation/EvaluationQueueTable";
import EvaluationStatistics from "./components/Evaluation/EvaluationStatistics";
import EvaluationStatusBadge from "./Common/EvaluationStatusBadge";
import QuestionTypeBadge from "./Common/QuestionTypeBadge";

/**
 * EvaluationQueuePage
 *
 * Teacher-facing evaluation queue.
 *
 * RTK endpoints:
 * - useGetMyResultDetailEvaluationsQuery
 * - useGetPendingResultDetailsQuery
 *
 * The page supports:
 * - My evaluation queue
 * - All pending evaluations
 * - Status filtering
 * - Question type filtering
 * - Search
 * - Pagination
 *
 * Example route:
 *
 * /result-details/evaluation-queue
 */

const EvaluationQueuePage = ({
  mode = "my",
  pageSize = 10,
  className = "",
}) => {
  const [page, setPage] = useState(1);

  const [status, setStatus] =
    useState("");

  const [questionType, setQuestionType] =
    useState("");

  const [search, setSearch] =
    useState("");

  /*
   * mode:
   *
   * "my"      -> evaluations assigned to current teacher
   * "pending" -> all pending/review-required records
   */

  const isMyQueue =
    mode === "my";

  const myEvaluationsQuery =
    useGetMyResultDetailEvaluationsQuery(
      undefined,
      {
        skip: !isMyQueue,
      },
    );

  const pendingEvaluationsQuery =
    useGetPendingResultDetailsQuery(
      undefined,
      {
        skip: isMyQueue,
      },
    );

  const activeQuery = isMyQueue
    ? myEvaluationsQuery
    : pendingEvaluationsQuery;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = activeQuery;

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data],
  );

  const details =
    normalizedData.items;

  /* ------------------------------------------------------------------ */
  /* Filtering                                                           */
  /* ------------------------------------------------------------------ */

  const filteredDetails = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return details.filter(
      (detail) => {
        if (
          status &&
          detail.evaluationStatus !==
            status
        ) {
          return false;
        }

        if (
          questionType &&
          detail.questionType !==
            questionType
        ) {
          return false;
        }

        if (normalizedSearch) {
          const searchableText =
            buildSearchText(detail);

          if (
            !searchableText.includes(
              normalizedSearch,
            )
          ) {
            return false;
          }
        }

        return true;
      },
    );
  }, [
    details,
    status,
    questionType,
    search,
  ]);

  /* ------------------------------------------------------------------ */
  /* Pagination                                                          */
  /* ------------------------------------------------------------------ */

  const totalItems =
    filteredDetails.length;

  const totalPages = Math.max(
    Math.ceil(
      totalItems / pageSize,
    ),
    1,
  );

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

  /* ------------------------------------------------------------------ */
  /* Statistics                                                          */
  /* ------------------------------------------------------------------ */

  const statistics = useMemo(
    () =>
      calculateStatistics(
        details,
      ),
    [details],
  );

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const handleStatusChange = (
    value,
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleQuestionTypeChange = (
    value,
  ) => {
    setQuestionType(value);
    setPage(1);
  };

  const handleSearchChange = (
    value,
  ) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus("");
    setQuestionType("");
    setSearch("");
    setPage(1);
  };

  /* ------------------------------------------------------------------ */
  /* Loading                                                             */
  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <PageShell className={className}>
        <LoadingState
          variant="page"
          message="Loading evaluation queue..."
          description="Please wait while evaluation records are being loaded."
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Error                                                               */
  /* ------------------------------------------------------------------ */

  if (isError) {
    return (
      <PageShell className={className}>
        <PageHeader
          mode={mode}
        />

        <EmptyState
          variant="card"
          title="Unable to load evaluation queue"
          message={getErrorMessage(error)}
          actionLabel="Try Again"
          onAction={refetch}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className={className}>
      {/* ============================================================ */}
      {/* Header                                                        */}
      {/* ============================================================ */}

      <PageHeader
        mode={mode}
        isFetching={isFetching}
      />

      {/* ============================================================ */}
      {/* Statistics                                                    */}
      {/* ============================================================ */}

      <EvaluationStatistics
        statistics={statistics}
      />

      {/* ============================================================ */}
      {/* Filters                                                       */}
      {/* ============================================================ */}

      <EvaluationQueueFilters
        search={search}
        status={status}
        questionType={questionType}
        onSearchChange={
          handleSearchChange
        }
        onStatusChange={
          handleStatusChange
        }
        onQuestionTypeChange={
          handleQuestionTypeChange
        }
        onClear={clearFilters}
      />

      {/* ============================================================ */}
      {/* Queue                                                         */}
      {/* ============================================================ */}

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {isMyQueue
                  ? "My Evaluation Queue"
                  : "Pending Evaluations"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {totalItems}{" "}
                {totalItems === 1
                  ? "record"
                  : "records"}{" "}
                match the current filters.
              </p>
            </div>

            {isFetching && (
              <LoadingState
                variant="inline"
                size="sm"
                message="Refreshing..."
              />
            )}
          </div>
        </div>

        {paginatedDetails.length >
        0 ? (
          <>
            <EvaluationQueueTable
              details={
                paginatedDetails
              }
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              variant="compact"
              title={
                details.length === 0
                  ? "Evaluation queue is empty"
                  : "No matching evaluations"
              }
              message={
                details.length ===
                0
                  ? isMyQueue
                    ? "You currently have no result details assigned for evaluation."
                    : "There are currently no pending result details requiring evaluation."
                  : "Try changing or clearing the filters."
              }
              actionLabel={
                details.length ===
                0
                  ? undefined
                  : "Clear Filters"
              }
              onAction={
                details.length ===
                0
                  ? undefined
                  : clearFilters
              }
            />
          </div>
        )}
      </section>
    </PageShell>
  );
};

/* ========================================================================= */
/* Page Header                                                               */
/* ========================================================================= */

const PageHeader = ({
  mode,
  isFetching = false,
}) => {
  const isMyQueue =
    mode === "my";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Result Evaluation
        </p>

        <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {isMyQueue
            ? "My Evaluation Queue"
            : "Evaluation Queue"}
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {isMyQueue
            ? "Review and evaluate result details assigned to you."
            : "Review result details that are waiting for teacher evaluation."}
        </p>
      </div>

      {isFetching && (
        <LoadingState
          variant="inline"
          size="sm"
          message="Refreshing..."
        />
      )}
    </header>
  );
};

/* ========================================================================= */
/* Filters                                                                   */
/* ========================================================================= */

const EvaluationQueueFilters = ({
  search,
  status,
  questionType,
  onSearchChange,
  onStatusChange,
  onQuestionTypeChange,
  onClear,
}) => {
  const hasFilters =
    Boolean(
      search ||
        status ||
        questionType,
    );

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Queue Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Find result details that need evaluation.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Search */}

        <label className="md:col-span-1">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            Search
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Student, question, result..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        {/* Status */}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            Evaluation Status
          </span>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value,
              )
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="REVIEW_REQUIRED">
              Review Required
            </option>

            <option value="NOT_ATTEMPTED">
              Not Attempted
            </option>

            <option value="AUTO_EVALUATED">
              Auto Evaluated
            </option>

            <option value="EVALUATED">
              Evaluated
            </option>
          </select>
        </label>

        {/* Question Type */}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            Question Type
          </span>

          <select
            value={questionType}
            onChange={(event) =>
              onQuestionTypeChange(
                event.target.value,
              )
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">
              All Types
            </option>

            <option value="MCQ">
              MCQ
            </option>

            <option value="DESCRIPTIVE">
              Descriptive
            </option>

            <option value="ASSERTION_REASON">
              Assertion / Reason
            </option>

            <option value="CASE_STUDY">
              Case Study
            </option>

            <option value="FILL_BLANK">
              Fill in the Blank
            </option>

            <option value="MATCHING">
              Matching
            </option>

            <option value="TRUE_FALSE">
              True / False
            </option>
          </select>
        </label>
      </div>
    </section>
  );
};

/* ========================================================================= */
/* Statistics                                                                */
/* ========================================================================= */

const calculateStatistics = (
  details,
) => {
  const total =
    details.length;

  const pending =
    details.filter(
      (detail) =>
        detail.evaluationStatus ===
        "PENDING",
    ).length;

  const reviewRequired =
    details.filter(
      (detail) =>
        detail.evaluationStatus ===
        "REVIEW_REQUIRED",
    ).length;

  const evaluated =
    details.filter(
      (detail) =>
        detail.evaluationStatus ===
          "EVALUATED" ||
        detail.evaluationStatus ===
          "AUTO_EVALUATED",
    ).length;

  const notAttempted =
    details.filter(
      (detail) =>
        detail.evaluationStatus ===
        "NOT_ATTEMPTED",
    ).length;

  return {
    total,
    pending,
    reviewRequired,
    evaluated,
    notAttempted,
  };
};

/* ========================================================================= */
/* Response Normalization                                                    */
/* ========================================================================= */

const normalizeResponse = (
  response,
) => {
  if (!response) {
    return {
      items: [],
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
    };
  }

  const items =
    response.data ||
    response.resultDetails ||
    response.results ||
    response.items ||
    response.docs ||
    [];

  return {
    items: Array.isArray(items)
      ? items
      : [],
  };
};

/* ========================================================================= */
/* Search Helpers                                                            */
/* ========================================================================= */

const buildSearchText = (
  detail,
) => {
  const values = [
    detail._id,

    detail.question?.question,
    detail.question?.text,
    detail.question?.title,

    detail.subject?.name,
    detail.subject?.subjectName,

    detail.chapter?.name,
    detail.chapter?.chapterName,

    detail.topic?.name,
    detail.topic?.topicName,

    detail.result?.name,
    detail.result?.resultName,

    detail.result?.student?.name,
    detail.result?.student?.fullName,
    detail.result?.student?.email,

    detail.student?.name,
    detail.student?.fullName,
    detail.student?.email,
  ];

  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

/* ========================================================================= */
/* Helpers                                                                   */
/* ========================================================================= */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading the evaluation queue.";
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
    "An unexpected error occurred while loading the evaluation queue."
  );
};

export default EvaluationQueuePage;


/* ========================================================================= */
/* Page Shell                                                                */
/* ========================================================================= */

const PageShell = ({
  children,
  className = "",
}) => {
  return (
    <main
      className={`mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </main>
  );
};