import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAssessmentQuestionDetailsQuery,
  useUpdateAssessmentQuestionMutation,
} from "../../slices/assessmentQuestionApiSlice";
import { useGetAssessmentsQuery } from "../../slices/assessmentApiSlice";
import { useGetSectionsQuery } from "../../slices/sectionApiSlice";
import { useGetQuestionsQuery } from "../../slices/questionApiSlice";
import { useGetAssessmentChoiceGroupsQuery } from "../../slices/assessmentChoiceGroupApiSlice";

const AssessmentQuestionEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    question: "",
    order: "",
    marks: "",
    negativeMarks: "0",
    questionGroup: "",
    choiceGroup: "",
  });

  const {
    data: assessmentQuestion,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useGetAssessmentQuestionDetailsQuery(id, {
    skip: !id,
  });

  const {
    data: assessmentsData,
    isLoading: isLoadingAssessments,
  } = useGetAssessmentsQuery();

  const {
    data: sectionsData,
    isLoading: isLoadingSections,
  } = useGetSectionsQuery(
    assessmentQuestion?.assessment?._id ||
      assessmentQuestion?.assessment ||
      undefined,
    {
      skip: !(
        assessmentQuestion?.assessment?._id ||
        assessmentQuestion?.assessment
      ),
    },
  );

  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
  } = useGetQuestionsQuery(
    assessmentQuestion?.assessment?._id ||
      assessmentQuestion?.assessment
      ? {
          assessment:
            assessmentQuestion?.assessment?._id ||
            assessmentQuestion?.assessment,
        }
      : {},
  );

  const {
    data: choiceGroupsData,
    isLoading: isLoadingChoiceGroups,
  } = useGetAssessmentChoiceGroupsQuery(
    assessmentQuestion?.assessment?._id ||
      assessmentQuestion?.assessment
      ? {
          assessment:
            assessmentQuestion?.assessment?._id ||
            assessmentQuestion?.assessment,
          isActive: true,
        }
      : {},
    {
      skip: !(
        assessmentQuestion?.assessment?._id ||
        assessmentQuestion?.assessment
      ),
    },
  );

  const [updateAssessmentQuestion, { isLoading: isUpdating }] =
    useUpdateAssessmentQuestionMutation();

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

  const questions = useMemo(() => {
    if (Array.isArray(questionsData)) {
      return questionsData;
    }

    return (
      questionsData?.questions ||
      questionsData?.data ||
      []
    );
  }, [questionsData]);

  const choiceGroups = useMemo(() => {
    if (Array.isArray(choiceGroupsData)) {
      return choiceGroupsData;
    }

    return (
      choiceGroupsData?.choiceGroups ||
      choiceGroupsData?.assessmentChoiceGroups ||
      choiceGroupsData?.data ||
      []
    );
  }, [choiceGroupsData]);

  const assessmentId =
    assessmentQuestion?.assessment?._id ||
    assessmentQuestion?.assessment;

  const currentSectionId =
    assessmentQuestion?.section?._id ||
    assessmentQuestion?.section;

  const currentQuestionId =
    assessmentQuestion?.question?._id ||
    assessmentQuestion?.question;

  const currentQuestionGroupId =
    assessmentQuestion?.questionGroup?._id ||
    assessmentQuestion?.questionGroup ||
    "";

  const currentChoiceGroupId =
    assessmentQuestion?.choiceGroup?._id ||
    assessmentQuestion?.choiceGroup ||
    "";

  useEffect(() => {
    if (!assessmentQuestion) {
      return;
    }

    setFormData({
      section: currentSectionId || "",
      question: currentQuestionId || "",
      order:
        assessmentQuestion.order !== undefined
          ? String(assessmentQuestion.order)
          : "",
      marks:
        assessmentQuestion.marks !== undefined
          ? String(assessmentQuestion.marks)
          : "",
      negativeMarks:
        assessmentQuestion.negativeMarks !== undefined
          ? String(assessmentQuestion.negativeMarks)
          : "0",
      questionGroup: currentQuestionGroupId,
      choiceGroup: currentChoiceGroupId,
    });
  }, [
    assessmentQuestion,
    currentSectionId,
    currentQuestionId,
    currentQuestionGroupId,
    currentChoiceGroupId,
  ]);

  useEffect(() => {
    if (isDetailsError) {
      const message =
        detailsError?.data?.message ||
        detailsError?.error ||
        "Unable to load assessment question";

      toast.error(message);
    }
  }, [isDetailsError, detailsError]);

  const getId = (item) => item?._id || item?.id;

  const getAssessmentName = (item) =>
    item?.name ||
    item?.title ||
    item?.assessmentName ||
    item?.code ||
    "Unnamed Assessment";

  const getSectionName = (item) =>
    item?.name ||
    item?.title ||
    item?.sectionName ||
    item?.code ||
    "Unnamed Section";

  const getQuestionText = (item) =>
    item?.questionText ||
    item?.text ||
    item?.content ||
    item?.question ||
    item?.title ||
    item?.name ||
    item?.code ||
    "Unnamed Question";

  const getQuestionGroupName = (item) =>
    item?.name ||
    item?.title ||
    item?.groupName ||
    item?.code ||
    "Unnamed Group";

  const getChoiceGroupName = (item) =>
    item?.name ||
    item?.title ||
    item?.code ||
    "Unnamed Choice Group";

  const filteredSections = useMemo(() => {
    if (!assessmentId) {
      return [];
    }

    return sections.filter((section) => {
      const sectionAssessment =
        section?.assessment?._id ||
        section?.assessment;

      return (
        !sectionAssessment ||
        String(sectionAssessment) ===
          String(assessmentId)
      );
    });
  }, [sections, assessmentId]);

  const filteredQuestions = useMemo(() => {
    if (!assessmentId) {
      return [];
    }

    return questions.filter((question) => {
      const questionAssessment =
        question?.assessment?._id ||
        question?.assessment;

      return (
        !questionAssessment ||
        String(questionAssessment) ===
          String(assessmentId)
      );
    });
  }, [questions, assessmentId]);

  const filteredChoiceGroups = useMemo(() => {
    if (!assessmentId) {
      return [];
    }

    return choiceGroups.filter((group) => {
      const groupAssessment =
        group?.assessment?._id ||
        group?.assessment;

      return (
        !groupAssessment ||
        String(groupAssessment) ===
          String(assessmentId)
      );
    });
  }, [choiceGroups, assessmentId]);

  const selectedSection = useMemo(
    () =>
      filteredSections.find(
        (section) =>
          String(getId(section)) ===
          String(formData.section),
      ),
    [filteredSections, formData.section],
  );

  const selectedQuestion = useMemo(
    () =>
      filteredQuestions.find(
        (question) =>
          String(getId(question)) ===
          String(formData.question),
      ),
    [filteredQuestions, formData.question],
  );

  const selectedChoiceGroup = useMemo(
    () =>
      filteredChoiceGroups.find(
        (group) =>
          String(getId(group)) ===
          String(formData.choiceGroup),
      ),
    [filteredChoiceGroups, formData.choiceGroup],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formData.section) {
      toast.error("Please select a section");
      return;
    }

    if (!formData.question) {
      toast.error("Please select a question");
      return;
    }

    if (!formData.order) {
      toast.error("Please enter question order");
      return;
    }

    if (!formData.marks) {
      toast.error("Please enter marks");
      return;
    }

    if (Number(formData.order) < 1) {
      toast.error("Question order must be at least 1");
      return;
    }

    if (Number(formData.marks) < 0) {
      toast.error("Marks cannot be negative");
      return;
    }

    if (Number(formData.negativeMarks) < 0) {
      toast.error("Negative marks cannot be negative");
      return;
    }

    try {
      await updateAssessmentQuestion({
        id,
        section: formData.section,
        question: formData.question,
        order: Number(formData.order),
        marks: Number(formData.marks),
        negativeMarks:
          formData.negativeMarks === ""
            ? 0
            : Number(formData.negativeMarks),
        questionGroup:
          formData.questionGroup || null,
        choiceGroup:
          formData.choiceGroup || null,
      }).unwrap();

      toast.success(
        "Assessment question updated successfully",
      );

      navigate(
        `/assessment-questions/${id}`,
      );
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update assessment question";

      toast.error(message);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

          <h2 className="text-xl font-semibold text-white">
            Loading Assessment Question
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Please wait while the question details are loaded.
          </p>
        </div>
      </div>
    );
  }

  if (!assessmentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white">
            Assessment Question Not Found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/assessment-questions")
            }
            className="mt-6 h-11 rounded-xl bg-white px-6 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Back to Assessment Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-indigo-100">
              Assessment Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Edit Assessment Question
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Update the question assignment and assessment
              configuration.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/assessment-questions")
            }
            className="h-11 rounded-xl border border-white/30 bg-white/10 px-5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                Question #{assessmentQuestion.order}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                Assessment
              </span>

              {assessmentQuestion.choiceGroup && (
                <span className="rounded-full bg-purple-400/20 px-3 py-1 text-xs font-semibold text-purple-100">
                  Choice Group
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="space-y-6 p-5 sm:p-8"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  Assessment
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  The assessment cannot be changed after the
                  question has been created.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-indigo-100">
                  Assessment
                </label>

                <select
                  value={assessmentId || ""}
                  disabled
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/70 px-4 text-gray-700 outline-none"
                >
                  <option value="">
                    Select assessment
                  </option>

                  {assessments.map((assessment) => (
                    <option
                      key={getId(assessment)}
                      value={getId(assessment)}
                    >
                      {getAssessmentName(assessment)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  Question Assignment
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Select the section and question that should
                  appear in this assessment.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Section
                  </label>

                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    disabled={isLoadingSections}
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">
                      {isLoadingSections
                        ? "Loading sections..."
                        : "Select section"}
                    </option>

                    {filteredSections.map((section) => (
                      <option
                        key={getId(section)}
                        value={getId(section)}
                      >
                        {getSectionName(section)}
                      </option>
                    ))}
                  </select>

                  {selectedSection && (
                    <p className="mt-2 text-xs text-white/60">
                      Selected:{" "}
                      {getSectionName(selectedSection)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Question
                  </label>

                  <select
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    disabled={isLoadingQuestions}
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">
                      {isLoadingQuestions
                        ? "Loading questions..."
                        : "Select question"}
                    </option>

                    {filteredQuestions.map((question) => (
                      <option
                        key={getId(question)}
                        value={getId(question)}
                      >
                        {getQuestionText(question)}
                      </option>
                    ))}
                  </select>

                  {selectedQuestion && (
                    <p className="mt-2 line-clamp-2 text-xs text-white/60">
                      Selected:{" "}
                      {getQuestionText(selectedQuestion)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  Marks & Ordering
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Configure where the question appears and how
                  it is evaluated.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Question Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="1"
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Marks
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Negative Marks
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="negativeMarks"
                    value={formData.negativeMarks}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  Optional Grouping
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Assign the question to a question group or
                  choice group when applicable.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Question Group
                  </label>

                  <input
                    type="text"
                    name="questionGroup"
                    value={formData.questionGroup}
                    onChange={handleChange}
                    placeholder="Question group ID"
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  />

                  <p className="mt-2 text-xs text-white/50">
                    Enter the question group ID when a group is
                    required.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-indigo-100">
                    Choice Group
                  </label>

                  <select
                    name="choiceGroup"
                    value={formData.choiceGroup}
                    onChange={handleChange}
                    disabled={isLoadingChoiceGroups}
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">
                      {isLoadingChoiceGroups
                        ? "Loading choice groups..."
                        : "No choice group"}
                    </option>

                    {filteredChoiceGroups.map((group) => (
                      <option
                        key={getId(group)}
                        value={getId(group)}
                      >
                        {getChoiceGroupName(group)}
                      </option>
                    ))}
                  </select>

                  {selectedChoiceGroup && (
                    <p className="mt-2 text-xs text-white/60">
                      Selected:{" "}
                      {getChoiceGroupName(
                        selectedChoiceGroup,
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/assessment-questions/${id}`,
                  )
                }
                disabled={isUpdating}
                className="h-12 rounded-xl border border-white/30 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isUpdating ||
                  isLoadingSections ||
                  isLoadingQuestions
                }
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <span className="animate-pulse">
                    Updating...
                  </span>
                ) : (
                  "Update Question"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionEditScreen;
