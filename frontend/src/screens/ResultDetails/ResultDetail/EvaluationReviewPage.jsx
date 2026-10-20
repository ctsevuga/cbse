import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  useGetResultDetailByIdQuery,
} from "../../store/api/resultDetailApiSlice";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

import ResultDetailView from "./ResultDetailView";
import EvaluationReview from "./EvaluationReview";
import EvaluationStatusBadge from "./EvaluationStatusBadge";
import QuestionTypeBadge from "./QuestionTypeBadge";
import MarksDisplay from "./MarksDisplay";
import StudentInfo from "./StudentInfo";
import SubjectInfo from "./SubjectInfo";

/**
 * EvaluationReviewPage
 *
 * Review page for a single ResultDetail.
 *
 * RTK endpoint:
 * - useGetResultDetailByIdQuery
 *
 * Intended workflow:
 *
 * EvaluationQueuePage
 *       ↓
 * EvaluationReviewPage
 *       ↓
 * ResultDetail
 *       ↓
 * EvaluationReview
 *       ↓
 * EvaluationStatusControl / EvaluationPanel
 *
 * Example route:
 *
 * /result-details/:resultDetailId/review
 */

const EvaluationReviewPage = ({
  resultDetailId:
    providedResultDetailId,

  className = "",
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const resultDetailId =
    providedResultDetailId ||
    params.resultDetailId ||
    params.id;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useGetResultDetailByIdQuery(
      resultDetailId,
      {
        skip: !resultDetailId,
      },
    );

  const detail =
    normalizeResultDetail(data);

  /* ------------------------------------------------------------------ */
  /* Loading                                                             */
  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <PageShell className={className}>
        <LoadingState
          variant="page"
          message="Loading evaluation review..."
          description="Please wait while the result detail is being loaded."
        />
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Missing ID                                                          */
  /* ------------------------------------------------------------------ */

  if (!resultDetailId) {
    return (
      <PageShell className={className}>
        <EmptyState
          variant="card"
          title="Result detail not selected"
          message="A valid ResultDetail ID is required to review an evaluation."
          actionLabel="Back to Evaluation Queue"
          onAction={() =>
            navigate(
              "/result-details/evaluation-queue",
            )
          }
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
        <ReviewPageHeader
          onBack={() =>
            navigate(-1)
          }
        />

        <EmptyState
          variant="card"
          title="Unable to load evaluation"
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

  if (!detail) {
    return (
      <PageShell className={className}>
        <ReviewPageHeader
          onBack={() =>
            navigate(-1)
          }
        />

        <EmptyState
          variant="card"
          title="Result detail not found"
          message="The requested ResultDetail could not be found."
          actionLabel="Back to Evaluation Queue"
          onAction={() =>
            navigate(
              "/result-details/evaluation-queue",
            )
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell className={className}>
      {/* ============================================================ */}
      {/* Header                                                        */}
      {/* ============================================================ */}

      <ReviewPageHeader
        detail={detail}
        onBack={() =>
          navigate(-1)
        }
        isFetching={isFetching}
      />

      {/* ============================================================ */}
      {/* Review Status Banner                                          */}
      {/* ============================================================ */}

      <ReviewStatusBanner
        status={
          detail.evaluationStatus
        }
      />

      {/* ============================================================ */}
      {/* Student / Result / Subject Context                            */}
      {/* ============================================================ */}

      <ReviewContext
        detail={detail}
      />

      {/* ============================================================ */}
      {/* Main Review Layout                                            */}
      {/* ============================================================ */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ---------------------------------------------------------- */}
        {/* Question / Result Detail                                   */}
        {/* ---------------------------------------------------------- */}

        <section className="min-w-0">
          <ResultDetailView
            resultDetail={detail}
            detail={detail}
          />
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Evaluation Review                                          */}
        {/* ---------------------------------------------------------- */}

        <aside className="min-w-0">
          <EvaluationReview
            resultDetail={detail}
            detail={detail}
          />
        </aside>
      </div>
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

const ReviewPageHeader = ({
  detail,
  onBack,
  isFetching = false,
}) => {
  const questionType =
    detail?.questionType;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-800"
          aria-label="Go back"
        >
          <span
            aria-hidden="true"
            className="text-lg"
          >
            ←
          </span>
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
              Evaluation Review
            </p>

            {questionType && (
              <QuestionTypeBadge
                type={questionType}
              />
            )}
          </div>

          <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Review Result Detail
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review the student's response and
            evaluation before finalizing the result.
          </p>
        </div>
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
/* Review Status Banner                                                      */
/* ========================================================================= */

const ReviewStatusBanner = ({
  status,
}) => {
  const config =
    getStatusConfig(status);

  return (
    <section
      className={[
        "rounded-xl border p-4",
        config.container,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className={[
              "text-sm font-semibold",
              config.title,
            ].join(" ")}
          >
            {config.heading}
          </p>

          <p
            className={[
              "mt-1 text-xs",
              config.description,
            ].join(" ")}
          >
            {config.message}
          </p>
        </div>

        <EvaluationStatusBadge
          status={status}
        />
      </div>
    </section>
  );
};

/* ========================================================================= */
/* Context                                                                   */
/* ========================================================================= */

const ReviewContext = ({
  detail,
}) => {
  const student =
    detail.result?.student ||
    detail.student ||
    null;

  const subject =
    detail.subject ||
    detail.question?.subject ||
    null;

  const result =
    detail.result ||
    null;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Student */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Student
        </p>

        {student ? (
          <StudentInfo
            student={student}
            size="sm"
          />
        ) : (
          <p className="text-sm text-gray-500">
            Student information unavailable
          </p>
        )}
      </div>

      {/* Result */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Result
        </p>

        <p className="truncate text-sm font-semibold text-gray-800">
          {getDisplayName(result)}
        </p>

        {result?._id && (
          <p className="mt-1 truncate text-[10px] text-gray-400">
            {result._id}
          </p>
        )}
      </div>

      {/* Subject */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Subject
        </p>

        {subject ? (
          <SubjectInfo
            subject={subject}
            size="sm"
            showCode
          />
        ) : (
          <p className="text-sm text-gray-500">
            Subject information unavailable
          </p>
        )}
      </div>
    </section>
  );
};

/* ========================================================================= */
/* Status Configuration                                                      */
/* ========================================================================= */

const getStatusConfig = (
  status,
) => {
  switch (status) {
    case "REVIEW_REQUIRED":
      return {
        heading:
          "Review Required",
        message:
          "This result detail has been flagged and requires teacher review before it can be finalized.",
        container:
          "border-orange-200 bg-orange-50",
        title:
          "text-orange-800",
        description:
          "text-orange-700",
      };

    case "PENDING":
      return {
        heading:
          "Pending Evaluation",
        message:
          "This result detail is waiting for evaluation.",
        container:
          "border-yellow-200 bg-yellow-50",
        title:
          "text-yellow-800",
        description:
          "text-yellow-700",
      };

    case "EVALUATED":
      return {
        heading:
          "Already Evaluated",
        message:
          "This result detail has already been evaluated. Review the evaluation before making changes.",
        container:
          "border-green-200 bg-green-50",
        title:
          "text-green-800",
        description:
          "text-green-700",
      };

    case "AUTO_EVALUATED":
      return {
        heading:
          "Auto Evaluated",
        message:
          "This result detail was evaluated automatically. Review the result if manual verification is required.",
        container:
          "border-blue-200 bg-blue-50",
        title:
          "text-blue-800",
        description:
          "text-blue-700",
      };

    case "NOT_ATTEMPTED":
      return {
        heading:
          "Not Attempted",
        message:
          "The student did not attempt this question.",
        container:
          "border-gray-200 bg-gray-50",
        title:
          "text-gray-800",
        description:
          "text-gray-600",
      };

    default:
      return {
        heading:
          "Evaluation",
        message:
          "Review the result detail and evaluation information.",
        container:
          "border-gray-200 bg-gray-50",
        title:
          "text-gray-800",
        description:
          "text-gray-600",
      };
  }
};

/* ========================================================================= */
/* Response Normalization                                                    */
/* ========================================================================= */

const normalizeResultDetail = (
  response,
) => {
  if (!response) {
    return null;
  }

  /*
   * Supports:
   *
   * {
   *   data: { ... }
   * }
   *
   * and:
   *
   * {
   *   resultDetail: { ... }
   * }
   *
   * and a direct ResultDetail object.
   */

  if (
    response.resultDetail
  ) {
    return response.resultDetail;
  }

  if (
    response.data &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response._id ||
    response.id
  ) {
    return response;
  }

  return null;
};

/* ========================================================================= */
/* Display Helpers                                                           */
/* ========================================================================= */

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
    value.subjectName ||
    value.chapterName ||
    value.topicName ||
    value.email ||
    value._id ||
    value.id ||
    "—"
  );
};

/* ========================================================================= */
/* Error Helper                                                              */
/* ========================================================================= */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading the evaluation.";
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
    "An unexpected error occurred while loading the evaluation."
  );
};

export default EvaluationReviewPage;
