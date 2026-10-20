import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useCreateAssessmentQuestionMutation,
} from "../../slices/assessmentQuestionApiSlice";
import {
  useGetAssessmentsQuery,
} from "../../slices/assessmentApiSlice";
import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";
import {
  useGetAssessmentChoiceGroupsQuery,
} from "../../slices/assessmentChoiceGroupApiSlice";

const CreateAssessmentQuestionScreen = () => {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState("");
  const [section, setSection] = useState("");
  const [question, setQuestion] = useState("");
  const [order, setOrder] = useState("");
  const [marks, setMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [questionGroup, setQuestionGroup] = useState("");
  const [choiceGroup, setChoiceGroup] = useState("");

  const [createAssessmentQuestion, { isLoading }] =
    useCreateAssessmentQuestionMutation();

  const {
    data: assessmentsData,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
  } = useGetAssessmentsQuery();

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useGetSectionsQuery(
    assessment
      ? { assessment }
      : undefined,
    {
      skip: !assessment,
    },
  );

  const {
    data: choiceGroupsData,
    isLoading: choiceGroupsLoading,
    isError: choiceGroupsError,
  } = useGetAssessmentChoiceGroupsQuery(
    assessment
      ? {
          assessment,
          isActive: true,
        }
      : undefined,
    {
      skip: !assessment,
    },
  );

  const assessments = Array.isArray(
    assessmentsData,
  )
    ? assessmentsData
    : assessmentsData?.assessments || [];

  const sections = Array.isArray(
    sectionsData,
  )
    ? sectionsData
    : sectionsData?.sections || [];

  const choiceGroups = Array.isArray(
    choiceGroupsData,
  )
    ? choiceGroupsData
    : choiceGroupsData?.choiceGroups || [];

  useEffect(() => {
    setSection("");
    setChoiceGroup("");
  }, [assessment]);

  useEffect(() => {
    if (
      section &&
      !sections.some(
        (item) => item._id === section,
      )
    ) {
      setSection("");
    }
  }, [sections, section]);

  useEffect(() => {
    if (
      choiceGroup &&
      !choiceGroups.some(
        (item) => item._id === choiceGroup,
      )
    ) {
      setChoiceGroup("");
    }
  }, [choiceGroups, choiceGroup]);

  const selectedSection = sections.find(
    (item) => item._id === section,
  );

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!assessment) {
      toast.error("Please select an assessment");
      return;
    }

    if (!section) {
      toast.error("Please select a section");
      return;
    }

    if (!question.trim()) {
      toast.error("Please enter the question ID");
      return;
    }

    if (!order) {
      toast.error("Please enter the question order");
      return;
    }

    if (!marks) {
      toast.error("Please enter the question marks");
      return;
    }

    if (
      selectedSection?.marksPerQuestion !==
        undefined &&
      Number(marks) !==
        Number(selectedSection.marksPerQuestion)
    ) {
      toast.error(
        `Marks must match the section marks per question (${selectedSection.marksPerQuestion})`,
      );
      return;
    }

    if (
      Number(negativeMarks) < 0
    ) {
      toast.error(
        "Negative marks cannot be less than zero",
      );
      return;
    }

    try {
      await createAssessmentQuestion({
        assessment,
        section,
        question: question.trim(),
        order: Number(order),
        marks: Number(marks),
        negativeMarks:
          Number(negativeMarks) || 0,
        ...(questionGroup
          ? { questionGroup }
          : {}),
        ...(choiceGroup
          ? { choiceGroup }
          : {}),
      }).unwrap();

      toast.success(
        "Assessment question created successfully",
      );

      navigate(
        `/assessment-questions`,
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to create assessment question",
      );
    }
  };

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

  const getChoiceGroupName = (item) =>
    item?.name ||
    item?.title ||
    item?.code ||
    "Unnamed Choice Group";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:py-10">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 py-7 sm:py-9">
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-lg">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v12m6-6H6"
              />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Add Assessment Question
          </h2>

          <p className="text-white/70 mt-2 text-sm sm:text-base">
            Assign a question to an assessment section
            and configure its marks and ordering.
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-indigo-100">
                Assessment
              </label>

              <select
                value={assessment}
                onChange={(e) =>
                  setAssessment(e.target.value)
                }
                disabled={
                  assessmentsLoading
                }
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200"
              >
                <option value="">
                  {assessmentsLoading
                    ? "Loading assessments..."
                    : "Select assessment"}
                </option>

                {assessments.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getAssessmentName(
                        item,
                      )}
                    </option>
                  ),
                )}
              </select>

              {assessmentsError && (
                <p className="text-xs text-red-200">
                  Unable to load assessments.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
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
                  sectionsLoading
                }
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200"
              >
                <option value="">
                  {!assessment
                    ? "Select assessment first"
                    : sectionsLoading
                      ? "Loading sections..."
                      : "Select section"}
                </option>

                {sections.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getSectionName(
                        item,
                      )}
                    </option>
                  ),
                )}
              </select>

              {selectedSection && (
                <p className="text-xs text-indigo-100/80">
                  {selectedSection.numberOfQuestions !==
                    undefined &&
                    `Questions: ${selectedSection.numberOfQuestions}`}
                  {selectedSection.marksPerQuestion !==
                    undefined &&
                    ` • Marks/question: ${selectedSection.marksPerQuestion}`}
                </p>
              )}

              {sectionsError && (
                <p className="text-xs text-red-200">
                  Unable to load sections.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-indigo-100">
                Choice Group
                <span className="text-white/50">
                  {" "}
                  (Optional)
                </span>
              </label>

              <select
                value={choiceGroup}
                onChange={(e) =>
                  setChoiceGroup(
                    e.target.value,
                  )
                }
                disabled={
                  !assessment ||
                  choiceGroupsLoading
                }
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200"
              >
                <option value="">
                  {!assessment
                    ? "Select assessment first"
                    : choiceGroupsLoading
                      ? "Loading choice groups..."
                      : "No choice group"}
                </option>

                {choiceGroups.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getChoiceGroupName(
                        item,
                      )}
                    </option>
                  ),
                )}
              </select>

              {choiceGroupsError && (
                <p className="text-xs text-red-200">
                  Unable to load choice groups.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-indigo-100">
                Question Group
                <span className="text-white/50">
                  {" "}
                  (Optional)
                </span>
              </label>

              <input
                type="text"
                value={questionGroup}
                onChange={(e) =>
                  setQuestionGroup(
                    e.target.value,
                  )
                }
                placeholder="Enter question group ID"
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-indigo-100">
                Question ID
              </label>

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value,
                  )
                }
                placeholder="Enter question ID"
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
              />

              <p className="text-xs text-white/60">
                Enter the Question document ID that
                should be assigned to this assessment.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Question Configuration
              </h3>

              <p className="text-sm text-white/60 mt-1">
                Configure the question order and
                scoring information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-indigo-100">
                  Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) =>
                    setOrder(
                      e.target.value,
                    )
                  }
                  placeholder="1"
                  className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-indigo-100">
                  Marks
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={marks}
                  onChange={(e) =>
                    setMarks(
                      e.target.value,
                    )
                  }
                  placeholder={
                    selectedSection?.marksPerQuestion ??
                    "Marks"
                  }
                  className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                />

                {selectedSection?.marksPerQuestion !==
                  undefined && (
                  <p className="text-xs text-indigo-100/70">
                    Section requires{" "}
                    {
                      selectedSection.marksPerQuestion
                    }{" "}
                    mark(s) per question.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-indigo-100">
                  Negative Marks
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={negativeMarks}
                  onChange={(e) =>
                    setNegativeMarks(
                      e.target.value,
                    )
                  }
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                />
              </div>
            </div>
          </div>

          {assessment &&
            section &&
            selectedSection && (
              <div className="rounded-xl bg-indigo-500/20 border border-indigo-300/20 px-4 py-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-cyan-200 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Section scoring rule
                    </p>

                    <p className="text-xs text-white/70 mt-1">
                      Questions in this section must
                      use exactly{" "}
                      <span className="font-semibold text-white">
                        {
                          selectedSection.marksPerQuestion
                        }
                      </span>{" "}
                      mark(s).
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse tracking-wide">
                  Creating Question...
                </span>
              ) : (
                "Create Assessment Question"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentQuestionScreen;
