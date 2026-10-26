import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers3,
  ListOrdered,
  Loader2,
  Plus,
  Save,
} from "lucide-react";

import {
  useCreateAssessmentSectionMutation,
  useGetAssessmentSectionsByAssessmentQuery,
} from "../../slices/assessmentSectionApiSlice";

import {
  useGetAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

import {
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const formatLabel = (value) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );

const getId = (item) =>
  item?._id || item?.id || "";

const getName = (item) =>
  item?.name ||
  item?.title ||
  item?.code ||
  "";

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.error ||
  "Something went wrong. Please try again.";

const CreateAssessmentSectionScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessment: "",
    sectionCode: "",
    title: "",
    questionType: "",
    marksPerQuestion: "",
    numberOfQuestions: "",
    totalMarks: "",
    instructions: "",
    order: "",
  });

  const [filters, setFilters] = useState({
    stream: "",
    subject: "",
    academicYear: "",
    class: "",
    section: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: streamsData,
    isLoading: streamsLoading,
  } = useGetStreamsQuery();

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery();

  const {
    data: academicYearsData,
    isLoading: academicYearsLoading,
  } = useGetAcademicYearsQuery();

  const {
    data: classesData,
    isLoading: classesLoading,
  } = useGetClassesQuery();

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
  } = useGetSectionsQuery();

  const assessmentParams = useMemo(() => {
    const params = {};

    if (filters.stream) {
      params.stream = filters.stream;
    }

    if (filters.subject) {
      params.subject = filters.subject;
    }

    if (filters.academicYear) {
      params.academicYear =
        filters.academicYear;
    }

    if (filters.class) {
      params.class = filters.class;
    }

    if (filters.section) {
      params.section = filters.section;
    }

    return params;
  }, [filters]);

  const {
    data: assessmentsData,
    isLoading: assessmentsLoading,
    isFetching: assessmentsFetching,
  } = useGetAssessmentsQuery(
    assessmentParams,
  );

  const [
    createAssessmentSection,
    {
      isLoading: creating,
    },
  ] = useCreateAssessmentSectionMutation();

  const streams = Array.isArray(streamsData)
    ? streamsData
    : streamsData?.streams || [];

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.subjects || [];

  const academicYears = Array.isArray(
    academicYearsData,
  )
    ? academicYearsData
    : academicYearsData?.academicYears || [];

  const classes = Array.isArray(classesData)
    ? classesData
    : classesData?.classes || [];

  const sections = Array.isArray(
    sectionsData,
  )
    ? sectionsData
    : sectionsData?.sections || [];

  const assessments = Array.isArray(
    assessmentsData,
  )
    ? assessmentsData
    : assessmentsData?.assessments || [];

  const selectedAssessment = assessments.find(
    (assessment) =>
      getId(assessment) === formData.assessment,
  );

  const {
  data: assessmentSectionsData,
  isLoading: sectionsForAssessmentLoading,
  isFetching: sectionsForAssessmentFetching,
  refetch: refetchAssessmentSections,
} = useGetAssessmentSectionsByAssessmentQuery(
  formData.assessment,
  {
    skip: !formData.assessment,
  },
);

const assessmentSections = Array.isArray(
  assessmentSectionsData,
)
  ? assessmentSectionsData
  : assessmentSectionsData?.sections || [];

const allocatedMarks =
  assessmentSectionsData?.totalMarks ??
  assessmentSections.reduce(
    (total, section) =>
      total + Number(section.totalMarks || 0),
    0,
  );

const assessmentMaximum = Number(
  selectedAssessment?.totalMarks || 0,
);

const remainingMarks =
  assessmentMaximum - allocatedMarks;

const newSectionMarks = Number(
  formData.totalMarks || 0,
);

const projectedTotal =
  allocatedMarks + newSectionMarks;

const projectedRemaining =
  assessmentMaximum - projectedTotal;

const exceedsAssessmentMaximum =
  allocatedMarks > assessmentMaximum;

const newSectionExceedsMaximum =
  allocatedMarks + Number(formData.totalMarks || 0) >
  assessmentMaximum;

  useEffect(() => {
    if (
      !formData.marksPerQuestion ||
      !formData.numberOfQuestions
    ) {
      setFormData((previous) => ({
        ...previous,
        totalMarks: "",
      }));

      return;
    }

    const marks =
      Number(formData.marksPerQuestion) *
      Number(formData.numberOfQuestions);

    setFormData((previous) => ({
      ...previous,
      totalMarks: marks,
    }));
  }, [
    formData.marksPerQuestion,
    formData.numberOfQuestions,
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (
      [
        "stream",
        "subject",
        "academicYear",
        "class",
        "section",
      ].includes(name)
    ) {
      setFormData((previous) => ({
        ...previous,
        assessment: "",
      }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAssessmentChange = (event) => {
    const assessmentId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      assessment: assessmentId,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.assessment) {
      setErrorMessage(
        "Please select an assessment.",
      );
      return;
    }

    if (!formData.sectionCode.trim()) {
      setErrorMessage(
        "Section code is required.",
      );
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage(
        "Section title is required.",
      );
      return;
    }

    if (!formData.questionType) {
      setErrorMessage(
        "Please select a question type.",
      );
      return;
    }

    if (
      formData.marksPerQuestion === "" ||
      Number(formData.marksPerQuestion) < 0
    ) {
      setErrorMessage(
        "Marks per question must be zero or greater.",
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
      setErrorMessage(
        "Number of questions must be a positive integer.",
      );
      return;
    }

    if (
      formData.order === "" ||
      Number(formData.order) < 1 ||
      !Number.isInteger(
        Number(formData.order),
      )
    ) {
      setErrorMessage(
        "Section order must be a positive integer.",
      );
      return;
    }

    try {
      await createAssessmentSection({
        assessment: formData.assessment,
        sectionCode:
          formData.sectionCode.trim(),
        title: formData.title.trim(),
        questionType:
          formData.questionType,
        marksPerQuestion: Number(
          formData.marksPerQuestion,
        ),
        numberOfQuestions: Number(
          formData.numberOfQuestions,
        ),
        totalMarks: Number(
          formData.totalMarks,
        ),
        instructions:
          formData.instructions.trim(),
        order: Number(formData.order),
      }).unwrap();

      setSuccessMessage(
        "Assessment section created successfully.",
      );

      setFormData({
        assessment: "",
        sectionCode: "",
        title: "",
        questionType: "",
        marksPerQuestion: "",
        numberOfQuestions: "",
        totalMarks: "",
        instructions: "",
        order: "",
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }
  };

  const resetFilters = () => {
    setFilters({
      stream: "",
      subject: "",
      academicYear: "",
      class: "",
      section: "",
    });

    setFormData((previous) => ({
      ...previous,
      assessment: "",
    }));
  };

  const isLoadingData =
    streamsLoading ||
    subjectsLoading ||
    academicYearsLoading ||
    classesLoading ||
    sectionsLoading;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Layers3 className="h-4 w-4" />
              Assessment Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create Assessment Section
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a structured section to an
              existing assessment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-3">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Assessment Section Setup
                </h2>
                <p className="mt-1 text-sm text-indigo-100">
                  Select the assessment and
                  define its section structure.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6"
          >
            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 font-bold">
                  !
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Layers3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Academic Structure
                  </h3>
                  <p className="text-sm text-slate-500">
                    Narrow down the assessments
                    using the academic structure.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  label="Stream"
                  name="stream"
                  value={filters.stream}
                  onChange={handleFilterChange}
                  options={streams}
                  placeholder="All streams"
                  disabled={isLoadingData}
                />

                <SelectField
                  label="Subject"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  options={subjects}
                  placeholder="All subjects"
                  disabled={isLoadingData}
                />

                <SelectField
                  label="Academic Year"
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleFilterChange}
                  options={academicYears}
                  placeholder="All academic years"
                  disabled={isLoadingData}
                />

                <SelectField
                  label="Class"
                  name="class"
                  value={filters.class}
                  onChange={handleFilterChange}
                  options={classes}
                  placeholder="All classes"
                  disabled={isLoadingData}
                />

                <SelectField
                  label="Section"
                  name="section"
                  value={filters.section}
                  onChange={handleFilterChange}
                  options={sections}
                  placeholder="All sections"
                  disabled={isLoadingData}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Select Assessment
                    </h3>
                    <p className="text-sm text-slate-500">
                      Choose the assessment to
                      which this section belongs.
                    </p>
                  </div>
                </div>

                {assessmentsFetching && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                )}
              </div>

              <select
                value={formData.assessment}
                onChange={handleAssessmentChange}
                disabled={
                  assessmentsLoading ||
                  assessmentsFetching
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {assessmentsLoading
                    ? "Loading assessments..."
                    : "Select an assessment"}
                </option>

                {assessments.map(
                  (assessment) => (
                    <option
                      key={getId(assessment)}
                      value={getId(
                        assessment,
                      )}
                    >
                      {getName(
                        assessment,
                      )}
                      {assessment.assessmentType
                        ? ` — ${formatLabel(
                            assessment.assessmentType,
                          )}`
                        : ""}
                    </option>
                  ),
                )}
              </select>

              {!assessmentsLoading &&
                assessments.length === 0 && (
                  <p className="mt-3 text-sm text-amber-700">
                    No assessments match the
                    selected filters.
                  </p>
                )}

              {selectedAssessment && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    label="Type"
                    value={formatLabel(
                      selectedAssessment.assessmentType ||
                        "",
                    )}
                  />

                  <InfoCard
                    label="Questions"
                    value={
                      selectedAssessment.totalQuestions ??
                      "-"
                    }
                  />

                  <InfoCard
                    label="Marks"
                    value={
                      selectedAssessment.totalMarks ??
                      "-"
                    }
                  />

                  <InfoCard
                    label="Duration"
                    value={
                      selectedAssessment.durationMinutes
                        ? `${selectedAssessment.durationMinutes} min`
                        : "-"
                    }
                  />
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Section Details
                  </h3>
                  <p className="text-sm text-slate-500">
                    Configure the section name,
                    question type and marking.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Section Code"
                  name="sectionCode"
                  value={formData.sectionCode}
                  onChange={handleChange}
                  placeholder="e.g. A"
                  required
                />

                <InputField
                  label="Section Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Multiple Choice Questions"
                  required
                />

                <SelectField
                  label="Question Type"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  options={QUESTION_TYPES}
                  placeholder="Select question type"
                  required
                  valueIsPrimitive
                />

                <InputField
                  label="Section Order"
                  name="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  required
                />

                <InputField
                  label="Marks Per Question"
                  name="marksPerQuestion"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.marksPerQuestion
                  }
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  required
                />

                <InputField
                  label="Number of Questions"
                  name="numberOfQuestions"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    formData.numberOfQuestions
                  }
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                />

                <InputField
                  label="Total Marks"
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  placeholder="Calculated automatically"
                  disabled
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Instructions
              </label>

              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Enter instructions for students, if required..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Instructions are optional.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Section
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  min,
  step,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      step={step}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  valueIsPrimitive = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      <option value="">
        {placeholder}
      </option>

      {options.map((option) => {
        const optionValue = valueIsPrimitive
          ? option
          : getId(option);

        const optionLabel = valueIsPrimitive
          ? formatLabel(option)
          : getName(option);

        return (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        );
      })}
    </select>
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl border border-indigo-100 bg-white px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
      {value}
    </p>
  </div>
);

export default CreateAssessmentSectionScreen;
