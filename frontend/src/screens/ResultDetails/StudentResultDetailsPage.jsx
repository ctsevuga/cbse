import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useGetResultDetailsByStudentQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import StudentInfo from "./Common/StudentInfo";
import StudentQuestionPerformance from "./components/Analytics/StudentQuestionPerformance";
import SubjectQuestionPerformance from "./components/Analytics/SubjectQuestionPerformance";
import QuestionTypeBreakdown from "./components/Analytics/QuestionTypeBreakdown";
import ChapterPerformance from "./components/Analytics/ChapterPerformance";
import TopicPerformance from "./components/Analytics/TopicPerformance";
import MarksDisplay from "./Common/MarksDisplay";
import EvaluationStatusBadge from "./Common/EvaluationStatusBadge";
import QuestionTypeBadge from "./Common/QuestionTypeBadge";

/**
 * StudentResultDetailsPage
 *
 * Student-focused result analysis page.
 *
 * RTK endpoint:
 * - useGetResultDetailsByStudentQuery
 *
 * The exact argument shape should match the
 * resultDetailApiSlice implementation.
 */

const StudentResultDetailsPage = ({
  studentId: providedStudentId,
  student,

  showStudentInfo = true,
  showQuestionPerformance = true,
  showSubjectPerformance = true,
  showQuestionTypeBreakdown = true,
  showChapterPerformance = true,
  showTopicPerformance = true,

  pageSize = 10,

  className = "",
}) => {
  const params = useParams();

  const studentId =
    providedStudentId ||
    params.studentId ||
    params.id;

  const [page, setPage] = useState(1);

  const [filters, setFilters] =
    useState({
      resultId: "",
      questionType: "",
      subjectId: "",
      chapterId: "",
      topicId: "",
      evaluationStatus: "",
    });

  /*
   * Fetch question-level result details
   * belonging to this student.
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetResultDetailsByStudentQuery(
    studentId,
    {
      skip: !studentId,
    },
  );

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data],
  );

  /*
   * Apply filters locally so the page can
   * support the same ResultDetail dimensions
   * without coupling the presentation layer
   * to the API response format.
   */
  const filteredDetails = useMemo(
    () =>
      applyFilters(
        normalizedData.items,
        filters,
      ),
    [
      normalizedData.items,
      filters,
    ],
  );

  /*
   * Pagination.
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
    filteredDetails.length;

  const totalPages = Math.max(
    Math.ceil(
      totalItems / pageSize,
    ),
    1,
  );

  const handleFilterChange = (
    name,
    value,
  ) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      resultId: "",
      questionType: "",
      subjectId: "",
      chapterId: "",
      topicId: "",
      evaluationStatus: "",
    });

    setPage(1);
  };

  /* -------------------------------------------------------------------- */
  /* Loading                                                              */
  /* -------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <main
        className={[
          "min-h-screen bg-gray-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <LoadingState
            variant="page"
            message="Loading student results..."
            description="Please wait while the student's result details are being loaded."
          />
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------------- */
  /* Missing student                                                       */
  /* -------------------------------------------------------------------- */

  if (!studentId) {
    return (
      <main
        className={[
          "min-h-screen bg-gray-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            variant="card"
            title="Student not selected"
            message="A valid student is required to view result details."
          />
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------------- */
  /* Error                                                                 */
  /* -------------------------------------------------------------------- */

  if (isError) {
    return (
      <main
        className={[
          "min-h-screen bg-gray-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            variant="card"
            title="Unable to load student results"
            message={getErrorMessage(error)}
            actionLabel="Try Again"
            onAction={refetch}
          />
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------------- */
  /* Empty                                                                 */
  /* -------------------------------------------------------------------- */

  if (
    !isFetching &&
    normalizedData.items.length === 0
  ) {
    return (
      <main
        className={[
          "min-h-screen bg-gray-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {showStudentInfo && (
            <StudentInfo
              student={
                student ||
                normalizedData.student
              }
            />
          )}

          <div className="mt-6">
            <EmptyState
              variant="card"
              title="No result details found"
              message="This student does not have any question-level result details."
              actionLabel="Refresh"
              onAction={refetch}
            />
          </div>
        </div>
      </main>
    );
  }

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
        {/* ============================================================ */}
        {/* Page Header                                                    */}
        {/* ============================================================ */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Student Result Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View question-level performance and
              subject-wise analysis for this student.
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
        {/* Student Information                                            */}
        {/* ============================================================ */}

        {showStudentInfo && (
          <section>
            <StudentInfo
              student={
                student ||
                normalizedData.student
              }
              studentId={studentId}
              variant="card"
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Summary                                                        */}
        {/* ============================================================ */}

        <StudentSummary
          details={normalizedData.items}
        />

        {/* ============================================================ */}
        {/* Filters                                                        */}
        {/* ============================================================ */}

        <StudentResultFilters
          filters={filters}
          details={normalizedData.items}
          onChange={handleFilterChange}
          onClear={clearFilters}
        />

        {/* ============================================================ */}
        {/* Question Performance                                           */}
        {/* ============================================================ */}

        {showQuestionPerformance && (
          <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="border-b px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Question Performance
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Detailed performance across all
                  questions attempted by the student.
                </p>
              </div>
            </div>

            {paginatedDetails.length > 0 ? (
              <>
                <StudentQuestionPerformance
                  studentId={studentId}
                  resultDetails={
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
                  title="No matching questions"
                  message="Try changing or clearing the filters."
                  actionLabel="Clear Filters"
                  onAction={clearFilters}
                />
              </div>
            )}
          </section>
        )}

        {/* ============================================================ */}
        {/* Subject Performance                                            */}
        {/* ============================================================ */}

        {showSubjectPerformance && (
          <section>
            <SubjectQuestionPerformance
              studentId={studentId}
              resultDetails={
                normalizedData.items
              }
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Question Type Breakdown                                        */}
        {/* ============================================================ */}

        {showQuestionTypeBreakdown && (
          <section>
            <QuestionTypeBreakdown
              resultDetails={
                normalizedData.items
              }
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Chapter Performance                                            */}
        {/* ============================================================ */}

        {showChapterPerformance && (
          <section>
            <ChapterPerformance
              resultDetails={
                normalizedData.items
              }
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Topic Performance                                              */}
        {/* ============================================================ */}

        {showTopicPerformance && (
          <section>
            <TopicPerformance
              resultDetails={
                normalizedData.items
              }
            />
          </section>
        )}
      </div>
    </main>
  );
};

/* ========================================================================= */
/* Student Summary                                                           */
/* ========================================================================= */

const StudentSummary = ({
  details,
}) => {
  const summary = useMemo(
    () => calculateSummary(details),
    [details],
  );

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <SummaryCard
        label="Questions"
        value={summary.totalQuestions}
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
        isMarks
      />

      <SummaryCard
        label="Obtained Marks"
        value={summary.obtainedMarks}
        isMarks
      />

      <SummaryCard
        label="Percentage"
        value={`${summary.percentage}%`}
      />
    </section>
  );
};

/* ========================================================================= */
/* Summary Card                                                              */
/* ========================================================================= */

const SummaryCard = ({
  label,
  value,
  isMarks = false,
}) => {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <div className="mt-2 text-lg font-bold text-gray-900">
        {isMarks ? (
          <MarksDisplay
            maximumMarks={undefined}
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

const StudentResultFilters = ({
  filters,
  details,
  onChange,
  onClear,
}) => {
  const subjects =
    getUniqueOptions(
      details,
      "subject",
    );

  const chapters =
    getUniqueOptions(
      details,
      "chapter",
    );

  const topics =
    getUniqueOptions(
      details,
      "topic",
    );

  const hasFilters =
    Object.values(filters).some(
      Boolean,
    );

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Filter the student's question-level
            performance.
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <FilterSelect
          label="Result"
          value={filters.resultId}
          onChange={(value) =>
            onChange(
              "resultId",
              value,
            )
          }
          options={getUniqueResults(
            details,
          )}
        />

        <FilterSelect
          label="Subject"
          value={filters.subjectId}
          onChange={(value) =>
            onChange(
              "subjectId",
              value,
            )
          }
          options={subjects}
        />

        <FilterSelect
          label="Chapter"
          value={filters.chapterId}
          onChange={(value) =>
            onChange(
              "chapterId",
              value,
            )
          }
          options={chapters}
        />

        <FilterSelect
          label="Topic"
          value={filters.topicId}
          onChange={(value) =>
            onChange(
              "topicId",
              value,
            )
          }
          options={topics}
        />

        <FilterSelect
          label="Question Type"
          value={
            filters.questionType
          }
          onChange={(value) =>
            onChange(
              "questionType",
              value,
            )
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
              value:
                "ASSERTION_REASON",
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

        <FilterSelect
          label="Evaluation Status"
          value={
            filters.evaluationStatus
          }
          onChange={(value) =>
            onChange(
              "evaluationStatus",
              value,
            )
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
      </div>
    </section>
  );
};

/* ========================================================================= */
/* Filter Select                                                             */
/* ========================================================================= */

const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
}) => {
  return (
    <label className="block">
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
/* Filtering                                                                 */
/* ========================================================================= */

const applyFilters = (
  details,
  filters,
) => {
  if (!Array.isArray(details)) {
    return [];
  }

  return details.filter(
    (detail) => {
      if (
        filters.resultId &&
        getId(detail.result) !==
          filters.resultId
      ) {
        return false;
      }

      if (
        filters.questionType &&
        detail.questionType !==
          filters.questionType
      ) {
        return false;
      }

      if (
        filters.evaluationStatus &&
        detail.evaluationStatus !==
          filters.evaluationStatus
      ) {
        return false;
      }

      if (
        filters.subjectId &&
        getId(detail.subject) !==
          filters.subjectId
      ) {
        return false;
      }

      if (
        filters.chapterId &&
        getId(detail.chapter) !==
          filters.chapterId
      ) {
        return false;
      }

      if (
        filters.topicId &&
        getId(detail.topic) !==
          filters.topicId
      ) {
        return false;
      }

      return true;
    },
  );
};

/* ========================================================================= */
/* Summary Calculation                                                       */
/* ========================================================================= */

const calculateSummary = (
  details,
) => {
  const totalQuestions =
    details.length;

  const attempted =
    details.filter(
      (detail) =>
        detail.evaluationStatus !==
        "NOT_ATTEMPTED",
    ).length;

  const evaluated =
    details.filter(
      (detail) =>
        detail.evaluationStatus ===
          "EVALUATED" ||
        detail.evaluationStatus ===
          "AUTO_EVALUATED",
    ).length;

  const maximumMarks =
    details.reduce(
      (total, detail) =>
        total +
        Number(
          detail.maximumMarks || 0,
        ),
      0,
    );

  const obtainedMarks =
    details.reduce(
      (total, detail) =>
        total +
        Number(
          detail.obtainedMarks || 0,
        ),
      0,
    );

  const percentage =
    maximumMarks > 0
      ? (
          (obtainedMarks /
            maximumMarks) *
          100
        ).toFixed(1)
      : "0.0";

  return {
    totalQuestions,
    attempted,
    evaluated,
    maximumMarks,
    obtainedMarks,
    percentage,
  };
};

/* ========================================================================= */
/* Option Helpers                                                            */
/* ========================================================================= */

const getUniqueOptions = (
  details,
  field,
) => {
  const map = new Map();

  details.forEach((detail) => {
    const value =
      detail?.[field];

    if (!value) {
      return;
    }

    const id = getId(value);

    if (!id) {
      return;
    }

    const label =
      typeof value === "object"
        ? value.name ||
          value.title ||
          value.chapterName ||
          value.topicName ||
          value.subjectName ||
          id
        : id;

    map.set(id, {
      value: id,
      label,
    });
  });

  return Array.from(
    map.values(),
  );
};

const getUniqueResults = (
  details,
) => {
  const map = new Map();

  details.forEach((detail) => {
    const result =
      detail?.result;

    if (!result) {
      return;
    }

    const id = getId(result);

    if (!id) {
      return;
    }

    const label =
      typeof result === "object"
        ? result.name ||
          result.title ||
          result.resultName ||
          result.assessmentName ||
          id
        : id;

    map.set(id, {
      value: id,
      label,
    });
  });

  return Array.from(
    map.values(),
  );
};

/* ========================================================================= */
/* ID Helper                                                                 */
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

/* ========================================================================= */
/* Response Normalization                                                    */
/* ========================================================================= */

const normalizeResponse = (
  response,
) => {
  if (!response) {
    return {
      items: [],
      student: null,
      pagination: null,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      student: null,
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
    student:
      response.student ||
      null,
    pagination:
      response.pagination ||
      response.meta ||
      null,
  };
};

/* ========================================================================= */
/* Error Helper                                                              */
/* ========================================================================= */

const getErrorMessage = (
  error,
) => {
  if (!error) {
    return "An unexpected error occurred while loading the student's results.";
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
    "An unexpected error occurred while loading the student's results."
  );
};

export default StudentResultDetailsPage;
