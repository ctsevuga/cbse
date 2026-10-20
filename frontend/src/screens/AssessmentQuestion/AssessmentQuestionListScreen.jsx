import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAssessmentQuestionsQuery,
  
} from "../../slices/assessmentQuestionApiSlice";
import { useGetAssessmentsQuery } from "../../slices/assessmentApiSlice";
import { useGetSectionsQuery } from "../../slices/sectionApiSlice";
import { useGetAssessmentChoiceGroupsQuery } from "../../slices/assessmentChoiceGroupApiSlice";

const AssessmentQuestionListScreen = () => {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState("");
  const [section, setSection] = useState("");
  const [questionGroup, setQuestionGroup] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const {
    data: assessmentsData,
    isLoading: isAssessmentsLoading,
  } = useGetAssessmentsQuery();

  const {
    data: sectionsData,
    isLoading: isSectionsLoading,
  } = useGetSectionsQuery(
    assessment ? { assessment } : {},
  );

  const {
    data: choiceGroupsData,
    isLoading: isChoiceGroupsLoading,
  } = useGetAssessmentChoiceGroupsQuery(
    assessment
      ? {
          assessment,
          isActive: true,
        }
      : {},
  );

  const {
    data: assessmentQuestionsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAssessmentQuestionsQuery({
    ...(assessment && { assessment }),
    ...(section && { section }),
    ...(questionGroup && { questionGroup }),
  });

  

  const assessments = useMemo(() => {
    if (Array.isArray(assessmentsData)) {
      return assessmentsData;
    }

    return (
      assessmentsData?.assessments ||
      assessmentsData?.data ||
      []
    );
  }, [assessmentsData]);

  const sections = useMemo(() => {
    if (Array.isArray(sectionsData)) {
      return sectionsData;
    }

    return (
      sectionsData?.sections ||
      sectionsData?.data ||
      []
    );
  }, [sectionsData]);

  const choiceGroups = useMemo(() => {
    if (Array.isArray(choiceGroupsData)) {
      return choiceGroupsData;
    }

    return (
      choiceGroupsData?.choiceGroups ||
      choiceGroupsData?.data ||
      []
    );
  }, [choiceGroupsData]);

  const assessmentQuestions = useMemo(() => {
    if (Array.isArray(assessmentQuestionsData)) {
      return assessmentQuestionsData;
    }

    return (
      assessmentQuestionsData?.assessmentQuestions ||
      assessmentQuestionsData?.data ||
      []
    );
  }, [assessmentQuestionsData]);

  useEffect(() => {
    if (!assessment) {
      setSection("");
      setQuestionGroup("");
      return;
    }

    const sectionExists = sections.some(
      (item) =>
        String(item._id) === String(section),
    );

    if (section && !sectionExists) {
      setSection("");
    }

    const choiceGroupExists = choiceGroups.some(
      (item) =>
        String(item._id) === String(questionGroup),
    );

    if (questionGroup && !choiceGroupExists) {
      setQuestionGroup("");
    }
  }, [
    assessment,
    sections,
    choiceGroups,
    section,
    questionGroup,
  ]);

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
        item.section.name ||
        item.section.title ||
        item.section.code ||
        "—"
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

  const handleAssessmentChange = (e) => {
    setAssessment(e.target.value);
    setSection("");
    setQuestionGroup("");
  };

  

  const clearFilters = () => {
    setAssessment("");
    setSection("");
    setQuestionGroup("");
  };

  const hasFilters =
    Boolean(assessment) ||
    Boolean(section) ||
    Boolean(questionGroup);

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
                  Manage questions assigned to assessments,
                  sections, and question groups.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/assessment-questions/create")
                }
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-5 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98]"
              >
                <span className="mr-2 text-xl">+</span>
                Add Question
              </button>
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
                    Narrow the list using assessment,
                    section, or question group.
                  </p>
                </div>

                <div className="flex gap-2">
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      Clear Filters
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowFilters((prev) => !prev)
                    }
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    {showFilters
                      ? "Hide Filters"
                      : "Show Filters"}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-indigo-100">
                      Assessment
                    </label>

                    <select
                      value={assessment}
                      onChange={handleAssessmentChange}
                      disabled={isAssessmentsLoading}
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-gray-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                      <option value="">
                        {isAssessmentsLoading
                          ? "Loading assessments..."
                          : "All assessments"}
                      </option>

                      {assessments.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name ||
                            item.title ||
                            item.code ||
                            "Untitled Assessment"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-indigo-100">
                      Section
                    </label>

                    <select
                      value={section}
                      onChange={(e) =>
                        setSection(e.target.value)
                      }
                      disabled={
                        !assessment ||
                        isSectionsLoading
                      }
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-gray-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                      <option value="">
                        {!assessment
                          ? "Select an assessment first"
                          : isSectionsLoading
                            ? "Loading sections..."
                            : "All sections"}
                      </option>

                      {sections.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name ||
                            item.title ||
                            item.code ||
                            "Untitled Section"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-indigo-100">
                      Question Group
                    </label>

                    <select
                      value={questionGroup}
                      onChange={(e) =>
                        setQuestionGroup(
                          e.target.value,
                        )
                      }
                      disabled={
                        !assessment ||
                        isChoiceGroupsLoading
                      }
                      className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-gray-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                      <option value="">
                        {!assessment
                          ? "Select an assessment first"
                          : isChoiceGroupsLoading
                            ? "Loading groups..."
                            : "All question groups"}
                      </option>

                      {choiceGroups.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name ||
                            item.title ||
                            item.code ||
                            "Untitled Group"}
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
                  Please wait while the questions are
                  being loaded.
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

                <button
                  type="button"
                  onClick={() =>
                    navigate("/assessment-questions/create")
                  }
                  className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-700 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600"
                >
                  Add Assessment Question
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">
                      Showing
                    </p>

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
                        {assessmentQuestions.map(
                          (item, index) => (
                            <tr
                              key={item._id}
                              className="border-b border-white/10 transition last:border-0 hover:bg-white/5"
                            >
                              <td className="px-5 py-4 text-sm font-semibold text-white">
                                {item.order || index + 1}
                              </td>

                              <td className="px-5 py-4">
                                <p className="max-w-[180px] truncate text-sm font-semibold text-white">
                                  {getAssessmentName(
                                    item,
                                  )}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="max-w-[160px] truncate text-sm text-white/80">
                                  {getSectionName(
                                    item,
                                  )}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="max-w-[240px] truncate text-sm font-medium text-white">
                                  {getQuestionName(
                                    item,
                                  )}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="w-fit rounded-full bg-purple-400/10 px-2.5 py-1 text-xs font-medium text-purple-200">
                                    {getQuestionGroupName(
                                      item,
                                    )}
                                  </span>

                                  {item.choiceGroup && (
                                    <span className="w-fit rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                                      {getChoiceGroupName(
                                        item,
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-white">
                                  {item.marks}
                                </p>

                                {Number(
                                  item.negativeMarks,
                                ) > 0 && (
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
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 lg:hidden">
                  {assessmentQuestions.map(
                    (item, index) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                              Question #
                              {item.order || index + 1}
                            </span>

                            <h3 className="mt-2 text-lg font-semibold text-white">
                              {getQuestionName(
                                item,
                              )}
                            </h3>
                          </div>

                          <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                            <p className="text-xs text-white/50">
                              Marks
                            </p>
                            <p className="font-bold text-white">
                              {item.marks}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Assessment
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {getAssessmentName(
                                item,
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Section
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {getSectionName(
                                item,
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Question Group
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {getQuestionGroupName(
                                item,
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Choice Group
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {getChoiceGroupName(
                                item,
                              )}
                            </p>
                          </div>
                        </div>

                        {Number(
                          item.negativeMarks,
                        ) > 0 && (
                          <div className="mt-3 rounded-xl border border-red-300/10 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                            Negative marks: -
                            {item.negativeMarks}
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/assessment-questions/${item._id}`,
                              )
                            }
                            className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                          >
                            View
                          </button>

                         
                        </div>
                      </div>
                    ),
                  )}
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
