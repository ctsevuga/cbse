import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useGetResultDetailByAssessmentQuestionQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import QuestionInfo from "./Common/QuestionInfo";
import SubjectInfo from "./Common/SubjectInfo";
import MarksDisplay from "./Common/MarksDisplay";
import EvaluationStatusBadge from "./Common/EvaluationStatusBadge";
import QuestionTypeBadge from "./Common/QuestionTypeBadge";

/**
 * AssessmentQuestionResultPage
 *
 * Displays result information for one specific
 * AssessmentQuestion instance.
 *
 * RTK endpoint:
 * - useGetResultDetailByAssessmentQuestionQuery
 *
 * Route:
 * /assessment-questions/:assessmentQuestionId/results
 */

const AssessmentQuestionResultPage = ({
  assessmentQuestionId:
    providedAssessmentQuestionId,

  assessmentQuestion,
  question,

  showQuestionInfo = true,
  showContext = true,
  showSummary = true,
  showResultRecords = true,

  pageSize = 10,

  className = "",
}) => {
  const params = useParams();

  const assessmentQuestionId =
    providedAssessmentQuestionId ||
    params.assessmentQuestionId ||
    params.id;

  const [page, setPage] = useState(1);

  const [evaluationStatus, setEvaluationStatus] =
    useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useGetResultDetailByAssessmentQuestionQuery(
      assessmentQuestionId,
      {
        skip: !assessmentQuestionId,
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
    assessmentQuestion?.question ||
    null;

  const assessmentQuestionData =
    assessmentQuestion ||
    normalizedData.assessmentQuestion ||
    details[0]?.assessmentQuestion ||
    null;

  const filteredDetails = useMemo(() => {
    if (!evaluationStatus) {
      return details;
    }

    return details.filter(
      (detail) =>
        detail.evaluationStatus ===
        evaluationStatus,
    );
  }, [
    details,
    evaluationStatus,
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

  const firstDetail = details[0];

  const subject =
    normalizedData.subject ||
    firstDetail?.subject ||
    questionData?.subject ||
    null;

  const chapter =
    firstDetail?.chapter ||
    questionData?.chapter ||
    null;

  const topic =
    firstDetail?.topic ||
    questionData?.topic ||
    null;

  const questionType =
    firstDetail?.questionType ||
    assessmentQuestionData?.questionType ||
    questionData?.questionType ||
    null;

  const handleStatusChange = (
    value,
  ) => {
    setEvaluationStatus(value);
    setPage(1);
  };

  const clearFilters = () => {
    setEvaluationStatus("");
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
          message="Loading assessment question results..."
          description="Please wait while the result records are being loaded."
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Missing ID                                                          */
  /* ------------------------------------------------------------------ */

  if (!assessmentQuestionId) {
    return (
      <PageShell className={className}>
        <EmptyState
          variant="card"
          title="Assessment question not selected"
          message="A valid assessment question is required to view its results."
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
          title="Unable to load assessment question results"
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
            questionId={
              getId(questionData)
            }
            variant="card"
            showSubject
            showChapter
            showTopic
            showType
          />
        )}

        <EmptyState
          variant="card"
          title="No result records found"
          message="No ResultDetail records are currently associated with this assessment question."
          actionLabel="Refresh"
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

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Assessment Question
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Assessment Question Results
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View student results and evaluation
            status for this assessment question.
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
            questionId={
              getId(questionData)
            }
            variant="card"
            showSubject
            showChapter
            showTopic
            showType
          />
        </section>
      )}

      {/* ============================================================ */}
      {/* Assessment Question Context                                  */}
      {/* ============================================================ */}

      {showContext && (
        <AssessmentQuestionContext
          assessmentQuestion={
            assessmentQuestionData
          }
          subject={subject}
          chapter={chapter}
          topic={topic}
          questionType={
            questionType
          }
        />
      )}

      {/* ============================================================ */}
      {/* Summary                                                       */}
      {/* ============================================================ */}

      {showSummary && (
        <AssessmentQuestionSummary
          summary={summary}
        />
      )}

      {/* ============================================================ */}
      {/* Filters                                                       */}
      {/* ============================================================ */}

      {showResultRecords && (
        <ResultFilters
          evaluationStatus={
            evaluationStatus
          }
          onStatusChange={
            handleStatusChange
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
                Student Results
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Result details generated from this
                assessment question.
              </p>
            </div>
          </div>

          {paginatedDetails.length > 0 ? (
            <>
              <AssessmentQuestionResultTable
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
                title="No matching results"
                message="No result records match the selected evaluation status."
                actionLabel="Clear Filter"
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
/* Assessment Question Context                                               */
/* ========================================================================= */

const AssessmentQuestionContext = ({
  assessmentQuestion,
  subject,
  chapter,
  topic,
  questionType,
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <ContextCard
        title="Assessment Question"
        value={
          getDisplayName(
            assessmentQuestion,
          )
        }
      />

      <ContextCard
        title="Subject"
        value={
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
        value={getDisplayName(chapter)}
      />

      <ContextCard
        title="Topic"
        value={getDisplayName(topic)}
      />

      <ContextCard
        title="Question Type"
        value={
          questionType ? (
            <QuestionTypeBadge
              type={questionType}
            />
          ) : (
            "—"
          )
        }
      />
    </section>
  );
};

const ContextCard = ({
  title,
  value,
}) => {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <div className="text-sm font-medium text-gray-700">
        {value}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Summary                                                                   */
/* ========================================================================= */

const AssessmentQuestionSummary = ({
  summary,
}) => {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard
        label="Students"
        value={summary.students}
      />

      <SummaryCard
        label="Attempted"
        value={summary.attempted}
      />

      <SummaryCard
        label="Evaluated"
        value={summary.evaluated}
      />

      <SummaryCard
        label="Maximum Marks"
        value={summary.maximumMarks}
        marks
      />

      <SummaryCard
        label="Obtained Marks"
        value={summary.obtainedMarks}
        marks
      />

      <SummaryCard
        label="Average Marks"
        value={summary.averageMarks}
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
/* Filters                                                                   */
/* ========================================================================= */

const ResultFilters = ({
  evaluationStatus,
  onStatusChange,
  onClear,
}) => {
  const hasFilter =
    Boolean(evaluationStatus);

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Filter results by evaluation status.
          </p>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear Filter
          </button>
        )}
      </div>

      <label className="block max-w-sm">
        <span className="mb-1.5 block text-xs font-medium text-gray-600">
          Evaluation Status
        </span>

        <select
          value={evaluationStatus}
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

          <option value="NOT_ATTEMPTED">
            Not Attempted
          </option>

          <option value="AUTO_EVALUATED">
            Auto Evaluated
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="EVALUATED">
            Evaluated
          </option>

          <option value="REVIEW_REQUIRED">
            Review Required
          </option>
        </select>
      </label>
    </section>
  );
};

/* ========================================================================= */
/* Result Table                                                              */
/* ========================================================================= */

const AssessmentQuestionResultTable = ({
  details,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Student
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Result
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type
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
              <AssessmentQuestionResultRow
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

const AssessmentQuestionResultRow = ({
  detail,
}) => {
  const student =
    detail.result?.student ||
    detail.result?.user ||
    detail.student ||
    null;

  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-700">
          {getDisplayName(student)}
        </div>

        {student?._id && (
          <div className="mt-0.5 text-[10px] text-gray-400">
            {student._id}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="text-xs font-medium text-gray-700">
          {getDisplayName(
            detail.result,
          )}
        </div>
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
  const students = details.length;

  const attempted = details.filter(
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
    students > 0
      ? (
          obtainedMarks /
          students
        ).toFixed(2)
      : "0.00";

  return {
    students,
    attempted,
    evaluated,
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
      assessmentQuestion: null,
      subject: null,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      question: null,
      assessmentQuestion: null,
      subject: null,
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

    assessmentQuestion:
      response.assessmentQuestion ||
      null,

    subject:
      response.subject ||
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
    value.studentName ||
    value.fullName ||
    value.chapterName ||
    value.topicName ||
    value.subjectName ||
    value.teacherName ||
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
    return "An unexpected error occurred while loading assessment question results.";
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
    "An unexpected error occurred while loading assessment question results."
  );
};

export default AssessmentQuestionResultPage;
