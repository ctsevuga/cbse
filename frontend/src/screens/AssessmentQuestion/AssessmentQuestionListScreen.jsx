import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAssessmentQuestionsQuery } from "../../slices/assessmentQuestionApiSlice";
import { useGetMyAssessmentsQuery } from "../../slices/assessmentApiSlice";

const AssessmentQuestionListScreen = () => {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState("");

  const [showFilters, setShowFilters] = useState(true);

  const { data: assessmentsData, isLoading: isAssessmentsLoading } =
    useGetMyAssessmentsQuery();

  const {
    data: assessmentQuestionsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAssessmentQuestionsQuery({
    ...(assessment && { assessment }),
  });

  const assessments = useMemo(() => {
    if (Array.isArray(assessmentsData)) {
      return assessmentsData;
    }

    return assessmentsData?.assessments || assessmentsData?.data || [];
  }, [assessmentsData]);

  const filteredAssessments = useMemo(() => {
    if (!assessmentStatus) {
      return assessments;
    }

    return assessments.filter((item) => item.status === assessmentStatus);
  }, [assessments, assessmentStatus]);

  const assessmentQuestions = useMemo(() => {
    let questions = [];

    if (Array.isArray(assessmentQuestionsData)) {
      questions = assessmentQuestionsData;
    } else {
      questions =
        assessmentQuestionsData?.assessmentQuestions ||
        assessmentQuestionsData?.data ||
        [];
    }

    if (!assessmentStatus) {
      return questions;
    }

    const matchingAssessmentIds = new Set(
      filteredAssessments.map((item) => String(item._id)),
    );

    return questions.filter((item) => {
      const assessmentId =
        typeof item.assessment === "object"
          ? item.assessment?._id
          : item.assessment;

      return matchingAssessmentIds.has(String(assessmentId));
    });
  }, [assessmentQuestionsData, assessmentStatus, filteredAssessments]);

  const getAssessmentName = (item) => {
    if (!item?.assessment) {
      return "—";
    }

    if (typeof item.assessment === "object") {
      return (
        item.assessment.name ||
        item.assessment.title ||
        item.assessment.code ||
        "—"
      );
    }

    return "—";
  };

  const getSectionName = (item) => {
    if (!item?.section) {
      return "—";
    }

    if (typeof item.section === "object") {
      return (
        item.section.name || item.section.title || item.section.code || "—"
      );
    }

    return "—";
  };

  const getQuestionName = (item) => {
    if (!item?.question) {
      return "—";
    }

    if (typeof item.question === "object") {
      return (
        item.question.name ||
        item.question.title ||
        item.question.text ||
        item.question.question ||
        item.question.code ||
        "Question"
      );
    }

    return "Question";
  };

  const getQuestionGroupName = (item) => {
    if (!item?.questionGroup) {
      return "No group";
    }

    if (typeof item.questionGroup === "object") {
      return (
        item.questionGroup.name ||
        item.questionGroup.title ||
        item.questionGroup.code ||
        "Question group"
      );
    }

    return "Question group";
  };

  const getChoiceGroupName = (item) => {
    if (!item?.choiceGroup) {
      return "No choice";
    }

    if (typeof item.choiceGroup === "object") {
      return (
        item.choiceGroup.name ||
        item.choiceGroup.title ||
        item.choiceGroup.code ||
        "Choice group"
      );
    }

    return "Choice group";
  };

  const hasFilters = Boolean(assessment || assessmentStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-100">
                  Assessment Management
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Assessment Questions
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                  Manage questions assigned to assessments, sections, and
                  question groups.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Filter Questions
                  </h2>
                  <p className="text-sm text-white/60">
                    Narrow the list using an assessment.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Assessment Status */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-indigo-100">
                      Assessment Status
                    </label>

                    <select
                      value={assessmentStatus}
                      onChange={(e) => {
                        setAssessmentStatus(e.target.value);
                        setAssessment("");
                      }}
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-gray-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300"
                    >
                      <option value="">All Statuses</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Assessment */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-indigo-100">
                      Assessment
                    </label>

                    <select
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      disabled={isAssessmentsLoading}
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-gray-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                      <option value="">
                        {isAssessmentsLoading
                          ? "Loading assessments..."
                          : "All assessments"}
                      </option>

                      {filteredAssessments.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name ||
                            item.title ||
                            item.code ||
                            "Untitled Assessment"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            {isLoading || isFetching ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />

                <p className="font-medium text-white">
                  Loading assessment questions...
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Please wait while the questions are being loaded.
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-500/10 px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-2xl">
                  !
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Unable to load questions
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                  {error?.data?.message ||
                    error?.error ||
                    "Something went wrong while loading assessment questions."}
                </p>

                <button
                  type="button"
                  onClick={refetch}
                  className="mt-5 rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Try Again
                </button>
              </div>
            ) : assessmentQuestions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl">
                  ?
                </div>

                <h3 className="text-xl font-semibold text-white">
                  No assessment questions found
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm text-white/60">
                  {hasFilters
                    ? "No questions match your selected filters. Try changing or clearing the filters."
                    : "No questions have been assigned to an assessment yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Showing</p>

                    <p className="text-xl font-bold text-white">
                      {assessmentQuestions.length}{" "}
                      {assessmentQuestions.length === 1
                        ? "Question"
                        : "Questions"}
                    </p>
                  </div>
                </div>

                <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left">
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            #
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Assessment
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Section
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Question
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Group
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Marks
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {assessmentQuestions.map((item, index) => (
                          <tr
                            key={item._id}
                            className="border-b border-white/10 transition last:border-0 hover:bg-white/5"
                          >
                            <td className="px-5 py-4 text-sm font-semibold text-white">
                              {item.order || index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[180px] truncate text-sm font-semibold text-white">
                                {getAssessmentName(item)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[160px] truncate text-sm text-white/80">
                                {getSectionName(item)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/assessment-questions/${item._id}`)
                                }
                                className="max-w-[240px] truncate text-left text-sm font-medium text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-100 hover:decoration-cyan-100"
                                title="View question details"
                              >
                                {getQuestionName(item)}
                              </button>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="w-fit rounded-full bg-purple-400/10 px-2.5 py-1 text-xs font-medium text-purple-200">
                                  {getQuestionGroupName(item)}
                                </span>

                                {item.choiceGroup && (
                                  <span className="w-fit rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                                    {getChoiceGroupName(item)}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-white">
                                {item.marks}
                              </p>

                              {Number(item.negativeMarks) > 0 && (
                                <p className="text-xs text-red-300">
                                  -{item.negativeMarks}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/assessment-questions/${item._id}`,
                                    )
                                  }
                                  className="rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 lg:hidden">
                  {assessmentQuestions.map((item, index) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-flex rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                            Question #{item.order || index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/assessment-questions/${item._id}`)
                            }
                            className="mt-2 block text-left text-lg font-semibold text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-100"
                          >
                            {getQuestionName(item)}
                          </button>
                        </div>

                        <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                          <p className="text-xs text-white/50">Marks</p>
                          <p className="font-bold text-white">{item.marks}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Assessment
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {getAssessmentName(item)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Section
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {getSectionName(item)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Question Group
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {getQuestionGroupName(item)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Choice Group
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {getChoiceGroupName(item)}
                          </p>
                        </div>
                      </div>

                      {Number(item.negativeMarks) > 0 && (
                        <div className="mt-3 rounded-xl border border-red-300/10 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                          Negative marks: -{item.negativeMarks}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/assessment-questions/${item._id}`)
                          }
                          className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionListScreen;
