import React, { useMemo, useState } from "react";

import {
  useGetPendingResultDetailsQuery,
} from "../../store/api/resultDetailApiSlice";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";

import EvaluationQueueTable from "./EvaluationQueueTable";
import EvaluationStatistics from "./EvaluationStatistics";

/**
 * PendingEvaluationPage
 *
 * Displays ResultDetail records that are waiting
 * for evaluation.
 *
 * RTK endpoint:
 * - useGetPendingResultDetailsQuery
 *
 * Intended for:
 * - Teacher pending evaluation queue
 * - Admin evaluation monitoring
 * - Manual/descriptive evaluation workflow
 *
 * Example route:
 *
 * /result-details/pending-evaluations
 */

const PendingEvaluationPage = ({
  pageSize = 10,
  className = "",
}) => {
  const [page, setPage] = useState(1);

  const [search, setSearch] =
    useState("");

  const [questionType, setQuestionType] =
    useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useGetPendingResultDetailsQuery();

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data],
  );

  const details =
    normalizedData.items;

  /* ------------------------------------------------------------------ */
  /* Filter                                                             */
  /* ------------------------------------------------------------------ */

  const filteredDetails = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return details.filter(
      (detail) => {
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
    search,
    questionType,
  ]);

  /* ------------------------------------------------------------------ */
  /* Pagination                                                         */
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
  /* Statistics                                                         */
  /* ------------------------------------------------------------------ */

  const statistics = useMemo(
    () =>
      calculateStatistics(
        details,
      ),
    [details],
  );

  /* ------------------------------------------------------------------ */
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */

  const handleSearchChange = (
    value,
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleQuestionTypeChange = (
    value,
  ) => {
    setQuestionType(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setQuestionType("");
    setPage(1);
  };

  /* ------------------------------------------------------------------ */
  /* Loading                                                            */
  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <PageShell className={className}>
        <LoadingState
          variant="page"
          message="Loading pending evaluations..."
          description="Please wait while pending result details are loaded."
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Error                                                              */
  /* ------------------------------------------------------------------ */

  if (isError) {
    return (
      <PageShell className={className}>
        <PageHeader />

        <EmptyState
          variant="card"
          title="Unable to load pending evaluations"
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
        isFetching={isFetching}
        totalItems={details.length}
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

      <PendingEvaluationFilters
        search={search}
        questionType={questionType}
        onSearchChange={
          handleSearchChange
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
                Pending Evaluations
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
                  ? "No pending evaluations"
                  : "No matching evaluations"
              }
              message={
                details.length ===
                0
                  ? "There are currently no result details waiting for evaluation."
                  : "No pending evaluations match the selected filters."
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
/* Page Shell                                                                */
/* ========================================================================= */

const PageShell = ({
  children,
  className = "",
}) => {
  return (
    <main
      className={[
        "min-h-screen bg-gray-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
};

/* ========================================================================= */
/* Header                                                                    */
/* ========================================================================= */

const PageHeader = ({
  isFetching = false,
  totalItems = 0,
}) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
            Evaluation
          </p>

          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
            {totalItems} pending
          </span>
        </div>

        <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Pending Evaluations
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review and evaluate result details that
          are currently waiting for evaluation.
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

const PendingEvaluationFilters = ({
  search,
  questionType,
  onSearchChange,
  onQuestionTypeChange,
  onClear,
}) => {
  const hasFilters =
    Boolean(
      search ||
        questionType,
    );

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Narrow the pending evaluation queue.
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Search */}

        <label>
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
              All Question Types
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
/* Search                                                                    */
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
/* Error                                                                     */
/* ========================================================================= */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading pending evaluations.";
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
    "An unexpected error occurred while loading pending evaluations."
  );
};

export default PendingEvaluationPage;
