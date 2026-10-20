import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hash,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import {
  useGetAssessmentSectionDetailsQuery,
  useUpdateAssessmentSectionMutation,
} from "../../slices/assessmentSectionApiSlice";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const formatLabel = (value = "") =>
  value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

const getId = (value) =>
  typeof value === "object" && value !== null
    ? value._id
    : value;

const EditAssessmentSectionScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: section,
    isLoading,
    isError,
    error,
  } = useGetAssessmentSectionDetailsQuery(id, {
    skip: !id,
  });

  const [updateAssessmentSection, { isLoading: isUpdating }] =
    useUpdateAssessmentSectionMutation();

  const [formData, setFormData] = useState({
    sectionCode: "",
    title: "",
    questionType: "",
    marksPerQuestion: "",
    numberOfQuestions: "",
    totalMarks: "",
    instructions: "",
    order: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!section) return;

    setFormData({
      sectionCode: section.sectionCode || "",
      title: section.title || "",
      questionType: section.questionType || "",
      marksPerQuestion:
        section.marksPerQuestion ?? "",
      numberOfQuestions:
        section.numberOfQuestions ?? "",
      totalMarks: section.totalMarks ?? "",
      instructions: section.instructions || "",
      order: section.order ?? "",
    });
  }, [section]);

  const assessment = useMemo(
    () =>
      section?.assessment &&
      typeof section.assessment === "object"
        ? section.assessment
        : null,
    [section],
  );

  const calculatedMarks =
    Number(formData.marksPerQuestion || 0) *
    Number(formData.numberOfQuestions || 0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.sectionCode.trim()) {
      setFormError("Section code is required.");
      return;
    }

    if (!formData.title.trim()) {
      setFormError("Section title is required.");
      return;
    }

    if (!formData.questionType) {
      setFormError("Please select a question type.");
      return;
    }

    if (
      formData.marksPerQuestion === "" ||
      Number(formData.marksPerQuestion) < 0
    ) {
      setFormError(
        "Marks per question must be 0 or greater.",
      );
      return;
    }

    if (
      formData.numberOfQuestions === "" ||
      Number(formData.numberOfQuestions) < 1 ||
      !Number.isInteger(
        Number(formData.numberOfQuestions),
      )
    ) {
      setFormError(
        "Number of questions must be a positive integer.",
      );
      return;
    }

    if (
      formData.totalMarks === "" ||
      Number(formData.totalMarks) < 0
    ) {
      setFormError(
        "Total marks must be 0 or greater.",
      );
      return;
    }

    if (
      calculatedMarks !== Number(formData.totalMarks)
    ) {
      setFormError(
        "Total marks must equal marks per question multiplied by number of questions.",
      );
      return;
    }

    if (
      formData.order === "" ||
      Number(formData.order) < 1 ||
      !Number.isInteger(Number(formData.order))
    ) {
      setFormError(
        "Order must be a positive integer.",
      );
      return;
    }

    try {
      await updateAssessmentSection({
        assessmentSectionId: id,
        sectionCode: formData.sectionCode
          .trim()
          .toUpperCase(),
        title: formData.title.trim(),
        questionType: formData.questionType,
        marksPerQuestion: Number(
          formData.marksPerQuestion,
        ),
        numberOfQuestions: Number(
          formData.numberOfQuestions,
        ),
        totalMarks: Number(formData.totalMarks),
        instructions:
          formData.instructions.trim(),
        order: Number(formData.order),
      }).unwrap();

      navigate(`/assessment-sections/${id}`);
    } catch (err) {
      setFormError(
        err?.data?.message ||
          err?.error ||
          "Unable to update assessment section.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-12 shadow-xl border border-slate-200">
          <div className="rounded-full bg-indigo-50 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Loading section
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preparing assessment section details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !section) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-red-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <FileText className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Assessment section not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error?.data?.message ||
              "The requested assessment section could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/assessment-sections")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/assessment-sections/${id}`)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Edit Assessment Section
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Update the structure and scoring of this
                assessment section.
              </p>
            </div>
          </div>

          <Link
            to={`/assessment-sections/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            View Section
          </Link>
        </div>

        {assessment && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Assessment
                </span>
              </div>

              <h2 className="mt-1 text-xl font-bold">
                {assessment.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {assessment.subject?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Class
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {assessment.class?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Academic Year
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {assessment.academicYear?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {assessment.status || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/50 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Section Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Define how this section appears in the
                    assessment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="mt-0.5 font-bold">!</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="sectionCode"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Section Code
                  </label>

                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="sectionCode"
                      name="sectionCode"
                      type="text"
                      value={formData.sectionCode}
                      onChange={handleChange}
                      placeholder="e.g. A"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="order"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Display Order
                  </label>

                  <input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Section Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Multiple Choice Questions"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="questionType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Question Type
                </label>

                <select
                  id="questionType"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    Select question type
                  </option>

                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-indigo-600 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Scoring Configuration
                    </h3>
                    <p className="text-sm text-slate-500">
                      Total marks are calculated from the
                      question count and marks per question.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="marksPerQuestion"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Marks / Question
                    </label>

                    <input
                      id="marksPerQuestion"
                      name="marksPerQuestion"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.marksPerQuestion}
                      onChange={handleChange}
                      placeholder="1"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="numberOfQuestions"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Number of Questions
                    </label>

                    <input
                      id="numberOfQuestions"
                      name="numberOfQuestions"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.numberOfQuestions}
                      onChange={handleChange}
                      placeholder="10"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="totalMarks"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Total Marks
                    </label>

                    <input
                      id="totalMarks"
                      name="totalMarks"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      placeholder="10"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm text-slate-500">
                    Calculated total
                  </span>

                  <span className="text-lg font-bold text-indigo-600">
                    {calculatedMarks} marks
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="instructions"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Instructions
                  <span className="ml-2 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <textarea
                  id="instructions"
                  name="instructions"
                  rows="5"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Enter instructions that students should follow for this section..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() =>
                  navigate(`/assessment-sections/${id}`)
                }
                disabled={isUpdating}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssessmentSectionScreen;
