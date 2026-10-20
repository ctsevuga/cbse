import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useGetResultDetailsBySubjectQuery,
} from "../../slices/resultDetailApiSlice";

import LoadingState from "./Common/LoadingState";
import EmptyState from "./Common/EmptyState";
import Pagination from "./Common/Pagination";

import SubjectInfo from "./Common/SubjectInfo";
import SubjectPerformanceSummary from "./components/Result/SubjectPerformanceSummary";
import SubjectQuestionPerformance from "./components/Analytics/SubjectQuestionPerformance";
import QuestionPerformance from "./components/Analytics/QuestionPerformance";
import QuestionTypeBreakdown from "./components/Analytics/QuestionTypeBreakdown";
import ChapterPerformance from "./components/Analytics/ChapterPerformance";
import TopicPerformance from "./components/Analytics/TopicPerformance";
import MarksDisplay from "./Common/MarksDisplay";
import EvaluationStatusBadge from "./Common/EvaluationStatusBadge";
import QuestionTypeBadge from "./Common/QuestionTypeBadge";

/**
 * SubjectResultAnalysisPage
 *
 * Subject-focused result analysis.
 *
 * RTK endpoint:
 * - useGetResultDetailsBySubjectQuery
 *
 * The page can be used as a route:
 *
 * /subjects/:subjectId/result-analysis
 *
 * or with an explicit subjectId prop:
 *
 * <SubjectResultAnalysisPage
 *   subjectId={subjectId}
 * />
 */

const SubjectResultAnalysisPage = ({
  subjectId: providedSubjectId,
  subject,

  resultId = "",

  showSubjectInfo = true,
  showSummary = true,
  showQuestionPerformance = true,
  showQuestionTypeBreakdown = true,
  showChapterPerformance = true,
  showTopicPerformance = true,

  pageSize = 10,

  className = "",
}) => {
  const params = useParams();

  const subjectId =
    providedSubjectId ||
    params.subjectId ||
    params.id;

  const [page, setPage] = useState(1);

  const [filters, setFilters] =
    useState({
      resultId: resultId || "",
      questionType: "",
      evaluationStatus: "",
      chapterId: "",
      topicId: "",
    });

  /*
   * Fetch all ResultDetails belonging to
   * this subject.
   *
   * If your RTK endpoint expects an object,
   * use:
   *
   * {
   *   subjectId,
   *   resultId,
   * }
   *
   * instead.
   */
  const queryArg = useMemo(() => {
    if (resultId) {
      return {
        subjectId,
        resultId,
      };
    }

    return subjectId;
  }, [subjectId, resultId]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetResultDetailsBySubjectQuery(
    queryArg,
    {
      skip: !subjectId,
    },
  );

  const normalizedData = useMemo(
    () => normalizeResponse(data),
    [data],
  );

  /*
   * Apply analysis filters locally.
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
   * Pagination for the question-level table.
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

  const subjectData =
    subject ||
    normalizedData.subject ||
    getSubjectFromDetails(
      normalizedData.items,
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

  const handleClearFilters = () => {
    setFilters({
      resultId: "",
      questionType: "",
      evaluationStatus: "",
      chapterId: "",
      topicId: "",
    });

    setPage(1);
  };

  /* -------------------------------------------------------------------- */
  /* Loading                                                               */
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
            message="Loading subject analysis..."
            description="Please wait while the subject result data is being loaded."
          />
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------------- */
  /* Missing subject                                                       */
  /* -------------------------------------------------------------------- */

  if (!subjectId) {
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
            title="Subject not selected"
            message="A valid subject is required to view subject result analysis."
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
            title="Unable to load subject analysis"
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
          {showSubjectInfo && (
            <SubjectInfo
              subject={subjectData}
              subjectId={subjectId}
              variant="card"
              showDescription
            />
          )}

          <div className="mt-6">
            <EmptyState
              variant="card"
              title="No subject result data"
              message="There are no result details available for this subject."
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
        {/* Header                                                         */}
        {/* ============================================================ */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Result Analysis
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Subject Performance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Analyze question, chapter, topic,
              and question-type performance for
              this subject.
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
        {/* Subject Information                                            */}
        {/* ============================================================ */}

        {showSubjectInfo && (
          <section>
            <SubjectInfo
              subject={subjectData}
              subjectId={subjectId}
              variant="card"
              showDescription
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Summary                                                        */}
        {/* ============================================================ */}

        {showSummary && (
          <section>
            <SubjectPerformanceSummary
              subject={subjectData}
              subjectId={subjectId}
              resultDetails={
                normalizedData.items
              }
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* Filters                                                        */}
        {/* ============================================================ */}

        <SubjectAnalysisFilters
          filters={filters}
          details={normalizedData.items}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
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
                  Question-level performance within
                  this subject.
                </p>
              </div>
            </div>

            {paginatedDetails.length > 0 ? (
              <>
                <SubjectQuestionTable
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
                  title="No matching questions"
                  message="Try changing or clearing the filters."
                  actionLabel="Clear Filters"
                  onAction={handleClearFilters}
                />
              </div>
            )}
          </section>
        )}

        {/* ============================================================ */}
        {/* Question Type Breakdown                                        */}
        {/* ============================================================ */}

        {showQuestionTypeBreakdown && (
          <section>
            <QuestionTypeBreakdown
              resultDetails={
                filteredDetails
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
                filteredDetails
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
                filteredDetails
              }
            />
          </section>
        )}
      </div>
    </main>
  );
};

/* ========================================================================= */
/* Subject Question Table                                                    */
/* ========================================================================= */

const SubjectQuestionTable = ({
  details,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Question
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Chapter
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Topic
            </th>

            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
              Marks
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {details.map(
            (detail, index) => (
              <SubjectQuestionRow
                key={
                  detail._id ||
                  detail.id ||
                  `${getId(detail.question)}-${index}`
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
/* Subject Question Row                                                      */
/* ========================================================================= */

const SubjectQuestionRow = ({
  detail,
}) => {
  const question =
    detail.question;

  const chapter =
    detail.chapter;

  const topic =
    detail.topic;

  return (
    <tr className="transition hover:bg-gray-50">
      <td className="max-w-xs px-4 py-3">
        <div className="min-w-0">
          <QuestionPerformance
            question={question}
            resultDetail={detail}
            compact
          />
        </div>
      </td>

      <td className="px-4 py-3">
        <QuestionTypeBadge
          type={detail.questionType}
        />
      </td>

      <td className="px-4 py-3 text-xs text-gray-600">
        {getDisplayName(chapter)}
      </td>

      <td className="px-4 py-3 text-xs text-gray-600">
        {getDisplayName(topic)}
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
    </tr>
  );
};

/* ========================================================================= */
/* Filters                                                                   */
/* ========================================================================= */

const SubjectAnalysisFilters = ({
  filters,
  details,
  onChange,
  onClear,
}) => {
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

  const results =
    getUniqueOptions(
      details,
      "result",
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
            Analysis Filters
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Narrow the subject performance data.
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
          options={results}
          onChange={(value) =>
            onChange(
              "resultId",
              value,
            )
          }
        />

        <FilterSelect
          label="Question Type"
          value={filters.questionType}
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
          onChange={(value) =>
            onChange(
              "questionType",
              value,
            )
          }
        />

        <FilterSelect
          label="Evaluation Status"
          value={
            filters.evaluationStatus
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
          onChange={(value) =>
            onChange(
              "evaluationStatus",
              value,
            )
          }
        />

        <FilterSelect
          label="Chapter"
          value={filters.chapterId}
          options={chapters}
          onChange={(value) =>
            onChange(
              "chapterId",
              value,
            )
          }
        />

        <FilterSelect
          label="Topic"
          value={filters.topicId}
          options={topics}
          onChange={(value) =>
            onChange(
              "topicId",
              value,
            )
          }
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
  options = [],
  onChange,
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
/* Filters                                                                    */
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
/* Unique Options                                                            */
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

    map.set(id, {
      value: id,
      label: getDisplayName(value),
    });
  });

  return Array.from(
    map.values(),
  );
};

/* ========================================================================= */
/* Subject Helper                                                            */
/* ========================================================================= */

const getSubjectFromDetails = (
  details,
) => {
  const first = details?.[0];

  return first?.subject || null;
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
      subject: null,
      pagination: null,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      subject: null,
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
    subject:
      response.subject ||
      null,
    pagination:
      response.pagination ||
      response.meta ||
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
    value.chapterName ||
    value.topicName ||
    value.subjectName ||
    value.code ||
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
    return "An unexpected error occurred while loading subject result analysis.";
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
    "An unexpected error occurred while loading subject result analysis."
  );
};

export default SubjectResultAnalysisPage;
