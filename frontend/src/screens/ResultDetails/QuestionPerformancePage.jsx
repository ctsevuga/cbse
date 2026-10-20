import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useGetResultDetailsByQuestionQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import QuestionInfo from "./Common/QuestionInfo";
import QuestionPerformance from "./components/Analytics/QuestionPerformance";
import QuestionTypeBreakdown from "./components/Analytics/QuestionTypeBreakdown";
import MarksDisplay from "./Common/MarksDisplay";
import EvaluationStatusBadge from "./Common/EvaluationStatusBadge";
import QuestionTypeBadge from "./Common/QuestionTypeBadge";
import SubjectInfo from "./Common/SubjectInfo";

/**
 * QuestionPerformancePage
 *
 * Displays performance analytics for one question
 * across all available ResultDetail records.
 *
 * RTK endpoint:
 * - useGetResultDetailsByQuestionQuery
 *
 * Route example:
 *
 * /questions/:questionId/performance
 */

const QuestionPerformancePage = ({
  questionId: providedQuestionId,
  question,

  showQuestionInfo = true,
  showSummary = true,
  showQuestionTypeBreakdown = true,
  showResultRecords = true,

  pageSize = 10,

  className = "",
}) => {
  const params = useParams();

  const questionId =
    providedQuestionId ||
    params.questionId ||
    params.id;

  const [page, setPage] = useState(1);

  const [evaluationStatus, setEvaluationStatus] =
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
  } = useGetResultDetailsByQuestionQuery(
    questionId,
    {
      skip: !questionId,
    },
  );

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data],
  );

  const details = normalizedData.items;

  const questionData =
    question ||
    normalizedData.question ||
    details[0]?.question ||
    null;

  const filteredDetails = useMemo(() => {
    return details.filter((detail) => {
      if (
        evaluationStatus &&
        detail.evaluationStatus !==
          evaluationStatus
      ) {
        return false;
      }

      if (
        questionType &&
        detail.questionType !== questionType
      ) {
        return false;
      }

      return true;
    });
  }, [
    details,
    evaluationStatus,
    questionType,
  ]);

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

  const summary = useMemo(
    () => calculateSummary(details),
    [details],
  );

  const handleStatusChange = (
    value,
  ) => {
    setEvaluationStatus(value);
    setPage(1);
  };

  const handleQuestionTypeChange = (
    value,
  ) => {
    setQuestionType(value);
    setPage(1);
  };

  const clearFilters = () => {
    setEvaluationStatus("");
    setQuestionType("");
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
          message="Loading question performance..."
          description="Please wait while question performance data is being loaded."
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Missing question                                                    */
  /* ------------------------------------------------------------------ */

  if (!questionId) {
    return (
      <PageShell className={className}>
        <EmptyState
          variant="card"
          title="Question not selected"
          message="A valid question is required to view performance."
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
        <EmptyState
          variant="card"
          title="Unable to load question performance"
          message={getErrorMessage(error)}
          actionLabel="Try Again"
          onAction={refetch}
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Empty                                                               */
  /* ------------------------------------------------------------------ */

  if (
    !isFetching &&
    details.length === 0
  ) {
    return (
      <PageShell className={className}>
        {showQuestionInfo && (
          <QuestionInfo
            question={questionData}
            questionId={questionId}
            variant="card"
          />
        )}

        <div className="mt-6">
          <EmptyState
            variant="card"
            title="No performance data"
            message="No result details are available for this question."
            actionLabel="Refresh"
            onAction={refetch}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className={className}>
      {/* ============================================================ */}
      {/* Header                                                        */}
      {/* ============================================================ */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Question Analysis
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Question Performance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze how this question has performed
            across student results.
          </p>
        </div>

        {isFetching && (
          <LoadingState
            variant="inline"
            message="Refreshing..."
            size="sm"
          />
        )}
      </header>

      {/* ============================================================ */}
      {/* Question Information                                          */}
      {/* ============================================================ */}

      {showQuestionInfo && (
        <section>
          <QuestionInfo
            question={questionData}
            questionId={questionId}
            variant="card"
            showSubject
            showChapter
            showTopic
            showType
          />
        </section>
      )}

      {/* ============================================================ */}
      {/* Summary                                                       */}
      {/* ============================================================ */}

      {showSummary && (
        <QuestionPerformanceSummary
          summary={summary}
        />
      )}

      {/* ============================================================ */}
      {/* Context                                                       */}
      {/* ============================================================ */}

      <QuestionContext
        detail={details[0]}
      />

      {/* ============================================================ */}
      {/* Question Type Breakdown                                      */}
      {/* ============================================================ */}

      {showQuestionTypeBreakdown && (
        <section>
          <QuestionTypeBreakdown
            resultDetails={details}
          />
        </section>
      )}

      {/* ============================================================ */}
      {/* Filters                                                       */}
      {/* ============================================================ */}

      {showResultRecords && (
        <QuestionPerformanceFilters
          evaluationStatus={
            evaluationStatus
          }
          questionType={questionType}
          onEvaluationStatusChange={
            handleStatusChange
          }
          onQuestionTypeChange={
            handleQuestionTypeChange
          }
          onClear={clearFilters}
        />
      )}

      {/* ============================================================ */}
      {/* Result Records                                                */}
      {/* ============================================================ */}

      {showResultRecords && (
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Result Records
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Individual student result records
                for this question.
              </p>
            </div>
          </div>

          {paginatedDetails.length > 0 ? (
            <>
              <QuestionResultTable
                details={paginatedDetails}
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
                title="No matching records"
                message="Try changing or clearing the filters."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            </div>
          )}
        </section>
      )}
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
/* Summary                                                                   */
/* ========================================================================= */

const QuestionPerformanceSummary = ({
  summary,
}) => {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard
        label="Attempts"
        value={summary.attempts}
      />

      <SummaryCard
        label="Evaluated"
        value={summary.evaluated}
      />

      <SummaryCard
        label="Pending"
        value={summary.pending}
      />

      <SummaryCard
        label="Maximum Marks"
        value={
          summary.maximumMarks
        }
        marks
      />

      <SummaryCard
        label="Obtained Marks"
        value={
          summary.obtainedMarks
        }
        marks
      />

      <SummaryCard
        label="Average"
        value={`${summary.averageMarks}`}
      />
    </section>
  );
};

const SummaryCard = ({
  label,
  value,
  marks = false,
}) => {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <div className="mt-2 text-lg font-bold text-gray-900">
        {marks ? (
          <MarksDisplay
            obtainedMarks={value}
            showMaximum={false}
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Question Context                                                          */
/* ========================================================================= */

const QuestionContext = ({
  detail,
}) => {
  if (!detail) {
    return null;
  }

  const subject =
    detail.subject;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ContextCard
        title="Subject"
        content={
          subject ? (
            <SubjectInfo
              subject={subject}
              size="sm"
              showCode
            />
          ) : (
            "—"
          )
        }
      />

      <ContextCard
        title="Chapter"
        content={
          getDisplayName(
            detail.chapter,
          )
        }
      />

      <ContextCard
        title="Topic"
        content={
          getDisplayName(
            detail.topic,
          )
        }
      />
    </section>
  );
};

const ContextCard = ({
  title,
  content,
}) => {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <div className="text-sm font-medium text-gray-700">
        {content}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Filters                                                                   */
/* ========================================================================= */

const QuestionPerformanceFilters = ({
  evaluationStatus,
  questionType,
  onEvaluationStatusChange,
  onQuestionTypeChange,
  onClear,
}) => {
  const hasFilters =
    Boolean(
      evaluationStatus ||
        questionType,
    );

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Filter individual result records.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Evaluation Status"
          value={evaluationStatus}
          onChange={
            onEvaluationStatusChange
          }
          options={[
            {
              value: "NOT_ATTEMPTED",
              label: "Not Attempted",
            },
            {
              value: "AUTO_EVALUATED",
              label: "Auto Evaluated",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "EVALUATED",
              label: "Evaluated",
            },
            {
              value: "REVIEW_REQUIRED",
              label: "Review Required",
            },
          ]}
        />

        <FilterSelect
          label="Question Type"
          value={questionType}
          onChange={
            onQuestionTypeChange
          }
          options={[
            {
              value: "MCQ",
              label: "MCQ",
            },
            {
              value: "DESCRIPTIVE",
              label: "Descriptive",
            },
            {
              value: "ASSERTION_REASON",
              label:
                "Assertion / Reason",
            },
            {
              value: "CASE_STUDY",
              label: "Case Study",
            },
            {
              value: "FILL_BLANK",
              label: "Fill in the Blank",
            },
            {
              value: "MATCHING",
              label: "Matching",
            },
            {
              value: "TRUE_FALSE",
              label: "True / False",
            },
          ]}
        />
      </div>
    </section>
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">
          All
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

/* ========================================================================= */
/* Result Table                                                              */
/* ========================================================================= */

const QuestionResultTable = ({
  details,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Result
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Question Type
            </th>

            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
              Marks
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Evaluated By
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {details.map(
            (detail, index) => (
              <QuestionResultRow
                key={
                  detail._id ||
                  detail.id ||
                  index
                }
                detail={detail}
              />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ========================================================================= */
/* Result Row                                                                */
/* ========================================================================= */

const QuestionResultRow = ({
  detail,
}) => {
  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-700">
          {getDisplayName(
            detail.result,
          )}
        </div>

        {detail.result?._id && (
          <div className="mt-0.5 text-[10px] text-gray-400">
            {detail.result._id}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <QuestionTypeBadge
          type={detail.questionType}
        />
      </td>

      <td className="px-4 py-3 text-right">
        <MarksDisplay
          obtainedMarks={
            detail.obtainedMarks
          }
          maximumMarks={
            detail.maximumMarks
          }
        />
      </td>

      <td className="px-4 py-3">
        <EvaluationStatusBadge
          status={
            detail.evaluationStatus
          }
        />
      </td>

      <td className="px-4 py-3">
        <div className="text-xs text-gray-600">
          {getDisplayName(
            detail.evaluatedBy,
          )}
        </div>

        {detail.evaluatedAt && (
          <div className="mt-0.5 text-[10px] text-gray-400">
            {formatDate(
              detail.evaluatedAt,
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

/* ========================================================================= */
/* Summary Calculation                                                       */
/* ========================================================================= */

const calculateSummary = (
  details,
) => {
  const attempts = details.filter(
    (detail) =>
      detail.evaluationStatus !==
      "NOT_ATTEMPTED",
  ).length;

  const evaluated = details.filter(
    (detail) =>
      detail.evaluationStatus ===
        "EVALUATED" ||
      detail.evaluationStatus ===
        "AUTO_EVALUATED",
  ).length;

  const pending = details.filter(
    (detail) =>
      detail.evaluationStatus ===
        "PENDING" ||
      detail.evaluationStatus ===
        "REVIEW_REQUIRED",
  ).length;

  const maximumMarks =
    details.reduce(
      (sum, detail) =>
        sum +
        Number(
          detail.maximumMarks || 0,
        ),
      0,
    );

  const obtainedMarks =
    details.reduce(
      (sum, detail) =>
        sum +
        Number(
          detail.obtainedMarks || 0,
        ),
      0,
    );

  const averageMarks =
    attempts > 0
      ? (
          obtainedMarks /
          attempts
        ).toFixed(2)
      : "0.00";

  return {
    attempts,
    evaluated,
    pending,
    maximumMarks,
    obtainedMarks,
    averageMarks,
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
      question: null,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      question: null,
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
    question:
      response.question ||
      null,
  };
};

/* ========================================================================= */
/* Display Helpers                                                           */
/* ========================================================================= */

const getId = (value) => {
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

const getDisplayName = (
  value,
) => {
  if (!value) {
    return "—";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return (
    value.name ||
    value.title ||
    value.resultName ||
    value.assessmentName ||
    value.chapterName ||
    value.topicName ||
    value.subjectName ||
    value.teacherName ||
    value.fullName ||
    value.email ||
    getId(value) ||
    "—"
  );
};

const formatDate = (
  value,
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
};

/* ========================================================================= */
/* Error Helper                                                              */
/* ========================================================================= */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading question performance.";
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
    "An unexpected error occurred while loading question performance."
  );
};

export default QuestionPerformancePage;
