import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Hash,
  ListChecks,
  Loader2,
  MessageSquareText,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useCreateAssessmentChoiceGroupMutation,
} from "../../slices/assessmentChoiceGroupApiSlice";

import {
  useGetAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const CreateAssessmentChoiceGroup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessment: "",
    section: "",
    name: "",
    code: "",
    selectionMode: "ANY",
    requiredQuestions: "",
    maxQuestions: "",
    directions: "",
    totalMarks: "",
    order: "",
  });

  const [formError, setFormError] = useState("");

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
    {
      assessment: formData.assessment,
    },
    {
      skip: !formData.assessment,
    },
  );

  const [
    createAssessmentChoiceGroup,
    {
      isLoading: creating,
    },
  ] = useCreateAssessmentChoiceGroupMutation();

  const assessments =
    assessmentsData?.assessments ||
    assessmentsData?.data ||
    assessmentsData ||
    [];

  const sections =
    sectionsData?.sections ||
    sectionsData?.data ||
    sectionsData ||
    [];

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      section: "",
    }));
  }, [formData.assessment]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const validateForm = () => {
    if (!formData.assessment) {
      return "Please select an assessment.";
    }

    if (!formData.name.trim()) {
      return "Please enter a choice group name.";
    }

    if (!formData.requiredQuestions) {
      return "Please enter the required number of questions.";
    }

    const requiredQuestions = Number(
      formData.requiredQuestions,
    );

    if (
      !Number.isInteger(requiredQuestions) ||
      requiredQuestions < 1
    ) {
      return "Required questions must be a whole number greater than 0.";
    }

    if (formData.maxQuestions) {
      const maxQuestions = Number(
        formData.maxQuestions,
      );

      if (
        !Number.isInteger(maxQuestions) ||
        maxQuestions < 1
      ) {
        return "Maximum questions must be a whole number greater than 0.";
      }

      if (requiredQuestions > maxQuestions) {
        return "Required questions cannot be greater than maximum questions.";
      }
    }

    if (
      formData.totalMarks !== "" &&
      Number(formData.totalMarks) < 0
    ) {
      return "Total marks cannot be negative.";
    }

    if (
      formData.order !== "" &&
      (!Number.isInteger(Number(formData.order)) ||
        Number(formData.order) < 1)
    ) {
      return "Order must be a whole number greater than 0.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError("");

    const payload = {
      assessment: formData.assessment,
      name: formData.name.trim(),
      selectionMode: formData.selectionMode,
      requiredQuestions: Number(
        formData.requiredQuestions,
      ),
    };

    if (formData.section) {
      payload.section = formData.section;
    }

    if (formData.code.trim()) {
      payload.code = formData.code.trim();
    }

    if (formData.maxQuestions !== "") {
      payload.maxQuestions = Number(
        formData.maxQuestions,
      );
    }

    if (formData.directions.trim()) {
      payload.directions =
        formData.directions.trim();
    }

    if (formData.totalMarks !== "") {
      payload.totalMarks = Number(
        formData.totalMarks,
      );
    }

    if (formData.order !== "") {
      payload.order = Number(formData.order);
    }

    try {
      await createAssessmentChoiceGroup(
        payload,
      ).unwrap();

      toast.success(
        "Assessment choice group created successfully.",
      );

      navigate("/assessment-choice-groups");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.error ||
        "Unable to create the assessment choice group.";

      setFormError(message);
      toast.error(message);
    }
  };

  const getAssessmentId = (assessment) =>
    assessment?._id || assessment?.id;

  const getSectionId = (section) =>
    section?._id || section?.id;

  const getAssessmentName = (assessment) =>
    assessment?.name ||
    assessment?.title ||
    assessment?.assessmentName ||
    "Untitled Assessment";

  const getSectionName = (section) =>
    section?.name ||
    section?.title ||
    section?.sectionName ||
    "Untitled Section";

  const selectionDescriptions = {
    ANY: "Students can choose the required number of questions.",
    EXACT: "Students must answer exactly the required number.",
    AT_LEAST:
      "Students must answer at least the required number.",
    AT_MOST:
      "Students can answer up to the specified number.",
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/assessment-choice-groups"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create Choice Group
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Define question selection rules for an assessment.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-7 text-white sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ListChecks className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Assessment Choice Rules
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-indigo-100">
                  Create rules such as “Attempt any 2 questions”
                  or “Answer exactly 3 questions” within an
                  assessment or section.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            {formError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <p>{formError}</p>
              </div>
            )}

            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Assessment Scope
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select where this choice group should be applied.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="assessment"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Assessment
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      id="assessment"
                      name="assessment"
                      value={formData.assessment}
                      onChange={handleChange}
                      disabled={assessmentsLoading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        {assessmentsLoading
                          ? "Loading assessments..."
                          : "Select an assessment"}
                      </option>

                      {assessments.map((assessment) => (
                        <option
                          key={getAssessmentId(assessment)}
                          value={getAssessmentId(assessment)}
                        >
                          {getAssessmentName(assessment)}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {assessmentsError && (
                    <p className="mt-2 text-xs text-red-600">
                      Unable to load assessments.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="section"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Section
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      disabled={
                        !formData.assessment ||
                        sectionsLoading
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        {!formData.assessment
                          ? "Select an assessment first"
                          : sectionsLoading
                            ? "Loading sections..."
                            : "Assessment-wide choice group"}
                      </option>

                      {sections.map((section) => (
                        <option
                          key={getSectionId(section)}
                          value={getSectionId(section)}
                        >
                          {getSectionName(section)}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {sectionsError && (
                    <p className="mt-2 text-xs text-red-600">
                      Unable to load sections for this assessment.
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    Leave empty if the choice group applies to the
                    entire assessment.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Choice Group Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Give the choice group a clear name and optional
                  reference code.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Group Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="e.g. Attempt Any 2"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Code
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      maxLength={50}
                      placeholder="e.g. CG-01"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Code must be unique within the assessment.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Selection Rules
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Define how students should select questions.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label
                    htmlFor="selectionMode"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Selection Mode
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="selectionMode"
                      name="selectionMode"
                      value={formData.selectionMode}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="ANY">Any</option>
                      <option value="EXACT">Exactly</option>
                      <option value="AT_LEAST">At Least</option>
                      <option value="AT_MOST">At Most</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {selectionDescriptions[
                      formData.selectionMode
                    ]}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="requiredQuestions"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Required Questions
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="requiredQuestions"
                    name="requiredQuestions"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.requiredQuestions}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Number students are required to select.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxQuestions"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Maximum Questions
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="maxQuestions"
                    name="maxQuestions"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.maxQuestions}
                    onChange={handleChange}
                    placeholder="e.g. 4"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Maximum number of questions in this group.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Example
                    </p>
                    <p className="mt-1 text-xs leading-5 text-indigo-700">
                      Set Selection Mode to <strong>Any</strong>,
                      Required Questions to <strong>2</strong>, and
                      Maximum Questions to <strong>4</strong> for
                      “Attempt any 2 questions out of 4.”
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Additional Information
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add instructions, marks, and display ordering.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label
                    htmlFor="directions"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Directions
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <MessageSquareText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                    <textarea
                      id="directions"
                      name="directions"
                      value={formData.directions}
                      onChange={handleChange}
                      maxLength={1000}
                      rows={4}
                      placeholder="e.g. Attempt any two questions from the following four questions."
                      className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="totalMarks"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Total Marks
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <Trophy className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="totalMarks"
                      name="totalMarks"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="order"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Display Order
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <Link
              to="/assessment-choice-groups"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Choice Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentChoiceGroup;
