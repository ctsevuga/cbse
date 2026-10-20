// ResultDetailForm.jsx

import React, { useEffect, useState } from "react";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const EVALUATION_STATUSES = [
  "NOT_ATTEMPTED",
  "AUTO_EVALUATED",
  "PENDING",
  "EVALUATED",
  "REVIEW_REQUIRED",
];

const DEFAULT_FORM = {
  result: "",
  assessmentQuestion: "",
  question: "",
  subject: "",
  chapter: "",
  topic: "",
  questionType: "",
  maximumMarks: "",
  obtainedMarks: 0,
  evaluationStatus: "PENDING",
  evaluatedBy: "",
};

const ResultDetailForm = ({
  initialData = null,
  mode = "create",

  /**
   * Optional data supplied by the parent.
   *
   * These should normally come from your Result,
   * AssessmentQuestion, Question, Subject, Chapter,
   * Topic and Teacher APIs.
   */
  results = [],
  assessmentQuestions = [],
  teachers = [],

  isLoading = false,
  isSubmitting = false,

  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  const isEditMode = mode === "edit";

  /* ---------------------------------------------------------------------- */
  /* Initialize form                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!initialData) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      result: getId(initialData.result),
      assessmentQuestion: getId(
        initialData.assessmentQuestion,
      ),
      question: getId(initialData.question),
      subject: getId(initialData.subject),
      chapter: getId(initialData.chapter),
      topic: getId(initialData.topic),
      questionType:
        initialData.questionType || "",
      maximumMarks:
        initialData.maximumMarks ?? "",
      obtainedMarks:
        initialData.obtainedMarks ?? 0,
      evaluationStatus:
        initialData.evaluationStatus || "PENDING",
      evaluatedBy:
        getId(initialData.evaluatedBy),
    });
  }, [initialData]);

  /* ---------------------------------------------------------------------- */
  /* Assessment Question Selection                                          */
  /* ---------------------------------------------------------------------- */

  const selectedAssessmentQuestion =
    assessmentQuestions.find(
      (item) =>
        getId(item) === form.assessmentQuestion,
    );

  /**
   * When an AssessmentQuestion is selected, populate
   * the related fields automatically.
   *
   * Adjust these property names according to the
   * shape returned by your AssessmentQuestion API.
   */
  useEffect(() => {
    if (!selectedAssessmentQuestion) {
      return;
    }

    const assessmentQuestion =
      selectedAssessmentQuestion;

    const question =
      assessmentQuestion.question;

    const subject =
      assessmentQuestion.subject ||
      question?.subject;

    const chapter =
      assessmentQuestion.chapter ||
      question?.chapter;

    const topic =
      assessmentQuestion.topic ||
      question?.topic;

    const questionType =
      assessmentQuestion.questionType ||
      question?.questionType ||
      "";

    const maximumMarks =
      assessmentQuestion.maximumMarks ??
      assessmentQuestion.marks ??
      question?.maximumMarks ??
      "";

    setForm((previous) => ({
      ...previous,

      question: getId(question),

      subject: getId(subject),

      chapter: getId(chapter),

      topic: getId(topic),

      questionType,

      maximumMarks,
    }));
  }, [selectedAssessmentQuestion]);

  /* ---------------------------------------------------------------------- */
  /* Input handlers                                                         */
  /* ---------------------------------------------------------------------- */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleAssessmentQuestionChange = (
    event,
  ) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      assessmentQuestion: value,
    }));

    setErrors((previous) => ({
      ...previous,
      assessmentQuestion: "",
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  const validate = () => {
    const nextErrors = {};

    if (!form.result) {
      nextErrors.result =
        "Result is required.";
    }

    if (!form.assessmentQuestion) {
      nextErrors.assessmentQuestion =
        "Assessment question is required.";
    }

    if (!form.question) {
      nextErrors.question =
        "Question is required.";
    }

    if (!form.subject) {
      nextErrors.subject =
        "Subject is required.";
    }

    if (!form.questionType) {
      nextErrors.questionType =
        "Question type is required.";
    }

    if (
      form.maximumMarks === "" ||
      Number(form.maximumMarks) < 0
    ) {
      nextErrors.maximumMarks =
        "Maximum marks must be 0 or greater.";
    }

    if (
      form.obtainedMarks === "" ||
      Number(form.obtainedMarks) < 0
    ) {
      nextErrors.obtainedMarks =
        "Obtained marks must be 0 or greater.";
    }

    if (
      Number(form.obtainedMarks) >
      Number(form.maximumMarks)
    ) {
      nextErrors.obtainedMarks =
        "Obtained marks cannot exceed maximum marks.";
    }

    if (!form.evaluationStatus) {
      nextErrors.evaluationStatus =
        "Evaluation status is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      result: form.result,
      assessmentQuestion:
        form.assessmentQuestion,
      question: form.question,
      subject: form.subject,

      ...(form.chapter
        ? { chapter: form.chapter }
        : {}),

      ...(form.topic
        ? { topic: form.topic }
        : {}),

      questionType: form.questionType,

      maximumMarks:
        Number(form.maximumMarks),

      obtainedMarks:
        Number(form.obtainedMarks),

      evaluationStatus:
        form.evaluationStatus,

      evaluatedBy:
        form.evaluatedBy || null,
    };

    await onSubmit?.(payload);
  };

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-lg border bg-white p-6">
        <FormSkeleton />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ================================================================ */}
      {/* Result Information                                               */}
      {/* ================================================================ */}

      <section className="rounded-lg border bg-white">
        <SectionHeader title="Result Information" />

        <div className="grid gap-5 p-5">
          <FormField
            label="Result"
            required
            error={errors.result}
          >
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              disabled={isEditMode}
              className={inputClass(
                errors.result,
              )}
            >
              <option value="">
                Select result
              </option>

              {results.map((result) => (
                <option
                  key={result._id}
                  value={result._id}
                >
                  {getResultLabel(result)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Question Information                                             */}
      {/* ================================================================ */}

      <section className="rounded-lg border bg-white">
        <SectionHeader title="Question Information" />

        <div className="grid gap-5 p-5">
          <FormField
            label="Assessment Question"
            required
            error={errors.assessmentQuestion}
          >
            <select
              name="assessmentQuestion"
              value={form.assessmentQuestion}
              onChange={
                handleAssessmentQuestionChange
              }
              disabled={isEditMode}
              className={inputClass(
                errors.assessmentQuestion,
              )}
            >
              <option value="">
                Select assessment question
              </option>

              {assessmentQuestions.map(
                (assessmentQuestion) => (
                  <option
                    key={assessmentQuestion._id}
                    value={assessmentQuestion._id}
                  >
                    {getAssessmentQuestionLabel(
                      assessmentQuestion,
                    )}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {/* Question */}
          <FormField
            label="Question"
            required
            error={errors.question}
          >
            <ReferenceDisplay
              value={selectedAssessmentQuestion?.question}
              placeholder={
                form.question ||
                "Select an assessment question"
              }
            />
          </FormField>

          {/* Question Type */}
          <FormField
            label="Question Type"
            required
            error={errors.questionType}
          >
            <select
              name="questionType"
              value={form.questionType}
              onChange={handleChange}
              className={inputClass(
                errors.questionType,
              )}
            >
              <option value="">
                Select question type
              </option>

              {QUESTION_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Academic Classification                                           */}
      {/* ================================================================ */}

      <section className="rounded-lg border bg-white">
        <SectionHeader title="Academic Classification" />

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <FormField
            label="Subject"
            required
            error={errors.subject}
          >
            <ReferenceDisplay
              value={
                selectedAssessmentQuestion?.subject
              }
              placeholder={
                form.subject || "Automatically selected"
              }
            />
          </FormField>

          <FormField
            label="Chapter"
            error={errors.chapter}
          >
            <ReferenceDisplay
              value={
                selectedAssessmentQuestion?.chapter
              }
              placeholder={
                form.chapter || "Not specified"
              }
            />
          </FormField>

          <FormField
            label="Topic"
            error={errors.topic}
          >
            <ReferenceDisplay
              value={
                selectedAssessmentQuestion?.topic
              }
              placeholder={
                form.topic || "Not specified"
              }
            />
          </FormField>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Marks                                                             */}
      {/* ================================================================ */}

      <section className="rounded-lg border bg-white">
        <SectionHeader title="Marks" />

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <FormField
            label="Maximum Marks"
            required
            error={errors.maximumMarks}
          >
            <input
              type="number"
              name="maximumMarks"
              min="0"
              step="0.01"
              value={form.maximumMarks}
              onChange={handleChange}
              className={inputClass(
                errors.maximumMarks,
              )}
            />
          </FormField>

          <FormField
            label="Obtained Marks"
            required
            error={errors.obtainedMarks}
          >
            <input
              type="number"
              name="obtainedMarks"
              min="0"
              step="0.01"
              max={form.maximumMarks || undefined}
              value={form.obtainedMarks}
              onChange={handleChange}
              className={inputClass(
                errors.obtainedMarks,
              )}
            />
          </FormField>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Evaluation                                                        */}
      {/* ================================================================ */}

      <section className="rounded-lg border bg-white">
        <SectionHeader title="Evaluation" />

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <FormField
            label="Evaluation Status"
            required
            error={errors.evaluationStatus}
          >
            <select
              name="evaluationStatus"
              value={form.evaluationStatus}
              onChange={handleChange}
              className={inputClass(
                errors.evaluationStatus,
              )}
            >
              {EVALUATION_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatEnumLabel(status)}
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField
            label="Evaluated By"
            error={errors.evaluatedBy}
          >
            <select
              name="evaluatedBy"
              value={form.evaluatedBy}
              onChange={handleChange}
              className={inputClass(
                errors.evaluatedBy,
              )}
            >
              <option value="">
                Not assigned
              </option>

              {teachers.map((teacher) => (
                <option
                  key={teacher._id}
                  value={teacher._id}
                >
                  {getTeacherLabel(teacher)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Actions                                                           */}
      {/* ================================================================ */}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Result Detail"
              : "Create Result Detail"}
        </button>
      </div>
    </form>
  );
};

/* ========================================================================== */
/* Reusable Form Components                                                   */
/* ========================================================================== */

const SectionHeader = ({ title }) => {
  return (
    <div className="border-b bg-gray-50 px-5 py-3">
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  );
};

const FormField = ({
  label,
  required = false,
  error,
  children,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

const ReferenceDisplay = ({
  value,
  placeholder = "—",
}) => {
  if (!value) {
    return (
      <div className="flex min-h-[40px] items-center rounded-md border bg-gray-50 px-3 text-sm text-gray-400">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="min-h-[40px] rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
      {getDisplayName(value) || placeholder}
    </div>
  );
};

const FormSkeleton = () => {
  return (
    <>
      <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />

      <div className="h-12 w-full animate-pulse rounded bg-gray-200" />

      <div className="h-32 w-full animate-pulse rounded bg-gray-200" />

      <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
    </>
  );
};

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || "";
};

const getDisplayName = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ||
    value.title ||
    value.fullName ||
    value.label ||
    value._id ||
    ""
  );
};

const getResultLabel = (result) => {
  if (!result) {
    return "";
  }

  if (result.name) {
    return result.name;
  }

  if (result.student?.name) {
    return `${result.student.name} - ${
      result._id
    }`;
  }

  if (result.student?.fullName) {
    return `${result.student.fullName} - ${
      result._id
    }`;
  }

  return result._id;
};

const getAssessmentQuestionLabel = (
  assessmentQuestion,
) => {
  if (!assessmentQuestion) {
    return "";
  }

  const question =
    assessmentQuestion.question;

  const questionText =
    question?.questionText ||
    question?.text ||
    question?.title;

  if (questionText) {
    return truncate(questionText, 80);
  }

  if (assessmentQuestion.questionNumber) {
    return `Question ${assessmentQuestion.questionNumber}`;
  }

  return assessmentQuestion._id;
};

const getTeacherLabel = (teacher) => {
  if (!teacher) {
    return "";
  }

  return (
    teacher.name ||
    teacher.fullName ||
    [
      teacher.firstName,
      teacher.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    teacher.email ||
    teacher._id
  );
};

const formatEnumLabel = (value) => {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
};

const truncate = (value, length) => {
  if (!value) {
    return "";
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}...`;
};

const inputClass = (error) => {
  return [
    "w-full rounded-md border px-3 py-2 text-sm",
    "bg-white text-gray-900",
    "outline-none transition",
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300",
  ].join(" ");
};

export default ResultDetailForm;
