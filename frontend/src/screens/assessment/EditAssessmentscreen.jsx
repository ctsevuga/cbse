import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  Layers3,
  Loader2,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetAssessmentDetailsQuery,
  useUpdateAssessmentMutation,
} from "../../slices/assessmentApiSlice";

import { useGetStreamsQuery } from "../../slices/streamApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";
import { useGetSectionsQuery } from "../../slices/sectionApiSlice";

const ASSESSMENT_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "MIXED",
  "CHAPTER_TEST",
  "UNIT_TEST",
  "MONTHLY_TEST",
  "REVISION_TEST",
  "MOCK_EXAM",
  "PRE_BOARD",
  "BOARD_PRACTICE",
];

const EditAssessmentScreen = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
    error: assessmentError,
  } = useGetAssessmentDetailsQuery(assessmentId);

  const [updateAssessment, { isLoading: isUpdating }] =
    useUpdateAssessmentMutation();

  const { data: streamsData, isLoading: isStreamsLoading } =
    useGetStreamsQuery();

  const { data: subjectsData, isLoading: isSubjectsLoading } =
    useGetSubjectsQuery();

  const { data: academicYearsData, isLoading: isAcademicYearsLoading } =
    useGetAcademicYearsQuery();

  const { data: classesData, isLoading: isClassesLoading } =
    useGetClassesQuery();

  const [form, setForm] = useState({
    academicYear: "",
    class: "",
    section: "",
    stream: "",
    subject: "",
    title: "",
    description: "",
    assessmentType: "",
    durationMinutes: "",
    totalQuestions: "",
    totalMarks: "",
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: 1,
    startDate: "",
    endDate: "",
    questionBlueprint: "",
  });

  const [initialized, setInitialized] = useState(false);

  const streams = useMemo(() => {
    if (Array.isArray(streamsData)) return streamsData;
    return streamsData?.streams || streamsData?.data || [];
  }, [streamsData]);

  const subjects = useMemo(() => {
    if (Array.isArray(subjectsData)) return subjectsData;
    return subjectsData?.subjects || subjectsData?.data || [];
  }, [subjectsData]);

  const academicYears = useMemo(() => {
    if (Array.isArray(academicYearsData)) return academicYearsData;
    return (
      academicYearsData?.academicYears ||
      academicYearsData?.data ||
      []
    );
  }, [academicYearsData]);

  const classes = useMemo(() => {
    if (Array.isArray(classesData)) return classesData;
    return classesData?.classes || classesData?.data || [];
  }, [classesData]);

  const selectedAcademicYear = form.academicYear;
  const selectedClass = form.class;

  const {
    data: sectionsData,
    isLoading: isSectionsLoading,
  } = useGetSectionsQuery(
    {
      academicYear: selectedAcademicYear,
      class: selectedClass,
    },
    {
      skip: !selectedAcademicYear || !selectedClass,
    },
  );

  const sections = useMemo(() => {
    if (Array.isArray(sectionsData)) return sectionsData;
    return sectionsData?.sections || sectionsData?.data || [];
  }, [sectionsData]);

  useEffect(() => {
    if (!assessment || initialized) return;

    const toDateTimeLocal = (value) => {
      if (!value) return "";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return "";

      const offset = date.getTimezoneOffset();
      const localDate = new Date(
        date.getTime() - offset * 60 * 1000,
      );

      return localDate.toISOString().slice(0, 16);
    };

    setForm({
      academicYear:
        assessment.academicYear?._id ||
        assessment.academicYear ||
        "",
      class:
        assessment.class?._id ||
        assessment.class ||
        "",
      section:
        assessment.section?._id ||
        assessment.section ||
        "",
      stream:
        assessment.stream?._id ||
        assessment.stream ||
        "",
      subject:
        assessment.subject?._id ||
        assessment.subject ||
        "",
      title: assessment.title || "",
      description: assessment.description || "",
      assessmentType: assessment.assessmentType || "",
      durationMinutes: assessment.durationMinutes ?? "",
      totalQuestions: assessment.totalQuestions ?? "",
      totalMarks: assessment.totalMarks ?? "",
      randomizeQuestions:
        assessment.randomizeQuestions ?? false,
      randomizeOptions:
        assessment.randomizeOptions ?? false,
      maxAttempts: assessment.maxAttempts ?? 1,
      startDate: toDateTimeLocal(assessment.startDate),
      endDate: toDateTimeLocal(assessment.endDate),
      questionBlueprint:
        assessment.questionBlueprint?._id ||
        assessment.questionBlueprint ||
        "",
    });

    setInitialized(true);
  }, [assessment, initialized]);

  useEffect(() => {
    if (!form.section || !sections.length) return;

    const sectionExists = sections.some(
      (section) =>
        String(section._id) === String(form.section),
    );

    if (!sectionExists) {
      setForm((previous) => ({
        ...previous,
        section: "",
      }));
    }
  }, [
    sections,
    form.section,
  ]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAcademicStructureChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "academicYear"
        ? {
            class: "",
            section: "",
          }
        : {}),
      ...(name === "class"
        ? {
            section: "",
          }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Assessment title is required");
      return;
    }

    if (!form.academicYear) {
      toast.error("Please select an academic year");
      return;
    }

    if (!form.class) {
      toast.error("Please select a class");
      return;
    }

    if (!form.subject) {
      toast.error("Please select a subject");
      return;
    }

    if (!form.assessmentType) {
      toast.error("Please select an assessment type");
      return;
    }

    if (!form.durationMinutes || Number(form.durationMinutes) < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }

    if (!form.totalQuestions || Number(form.totalQuestions) < 1) {
      toast.error("Total questions must be at least 1");
      return;
    }

    if (!form.totalMarks || Number(form.totalMarks) < 1) {
      toast.error("Total marks must be greater than 0");
      return;
    }

    if (!form.maxAttempts || Number(form.maxAttempts) < 1) {
      toast.error("Maximum attempts must be at least 1");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Start date and end date are required");
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      const payload = {
        academicYear: form.academicYear,
        class: form.class,
        section: form.section || null,
        stream: form.stream || null,
        subject: form.subject,
        title: form.title.trim(),
        description: form.description.trim(),
        assessmentType: form.assessmentType,
        durationMinutes: Number(form.durationMinutes),
        totalQuestions: Number(form.totalQuestions),
        totalMarks: Number(form.totalMarks),
        randomizeQuestions: form.randomizeQuestions,
        randomizeOptions: form.randomizeOptions,
        maxAttempts: Number(form.maxAttempts),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(form.questionBlueprint
          ? {
              questionBlueprint:
                form.questionBlueprint,
            }
          : {}),
      };

      await updateAssessment({
        assessmentId,
        ...payload,
      }).unwrap();

      toast.success("Assessment updated successfully");
      navigate(`/assessments/${assessmentId}`);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Unable to update assessment",
      );
    }
  };

  if (isAssessmentLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  if (isAssessmentError || !assessment) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <FileText className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Unable to load assessment
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {assessmentError?.data?.message ||
              "The requested assessment could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isLoadingOptions =
    isStreamsLoading ||
    isSubjectsLoading ||
    isAcademicYearsLoading ||
    isClassesLoading;

  const isLocked = ["COMPLETED", "CANCELLED"].includes(
    assessment.status,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(`/assessments/${assessmentId}`)
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to assessment
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Assessment
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Update the assessment details and academic structure.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
              assessment.status === "DRAFT"
                ? "bg-amber-50 text-amber-700"
                : assessment.status === "SCHEDULED"
                  ? "bg-blue-50 text-blue-700"
                  : assessment.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {assessment.status}
          </div>
        </div>

        {isLocked && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This assessment is{" "}
            <span className="font-bold">
              {assessment.status}
            </span>{" "}
            and cannot be edited.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Academic Structure
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select the academic year, class and section.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-3">
                <SelectField
                  label="Academic Year"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleAcademicStructureChange}
                  disabled={isLocked || isLoadingOptions}
                  required
                >
                  <option value="">Select academic year</option>
                  {academicYears.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name ||
                        item.title ||
                        item.year ||
                        item.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Class"
                  name="class"
                  value={form.class}
                  onChange={handleAcademicStructureChange}
                  disabled={
                    isLocked ||
                    !form.academicYear ||
                    isLoadingOptions
                  }
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name || item.title || item.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Section"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  disabled={
                    isLocked ||
                    !form.academicYear ||
                    !form.class ||
                    isSectionsLoading
                  }
                >
                  <option value="">All sections</option>
                  {sections.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name || item.title || item.label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Stream & Subject
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select the subject and optional stream.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                <SelectField
                  label="Stream"
                  name="stream"
                  value={form.stream}
                  onChange={handleChange}
                  disabled={isLocked || isLoadingOptions}
                >
                  <option value="">No stream</option>
                  {streams.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name || item.title || item.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={isLocked || isLoadingOptions}
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name || item.title || item.shortName}
                    </option>
                  ))}
                </SelectField>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Assessment Details
                    </h2>
                    <p className="text-xs text-slate-500">
                      Define the assessment content and configuration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6">
                <InputField
                  label="Assessment Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter assessment title"
                  disabled={isLocked}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    disabled={isLocked}
                    rows={4}
                    placeholder="Enter a short description..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Assessment Type"
                    name="assessmentType"
                    value={form.assessmentType}
                    onChange={handleChange}
                    disabled={isLocked}
                    required
                  >
                    <option value="">
                      Select assessment type
                    </option>
                    {ASSESSMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replaceAll("_", " ")}
                      </option>
                    ))}
                  </SelectField>

                  <InputField
                    label="Maximum Attempts"
                    name="maxAttempts"
                    type="number"
                    min="1"
                    value={form.maxAttempts}
                    onChange={handleChange}
                    disabled={isLocked}
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Assessment Configuration
                    </h2>
                    <p className="text-xs text-slate-500">
                      Set duration, marks, questions and attempt behavior.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-3">
                <InputField
                  label="Duration (minutes)"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  disabled={isLocked}
                  icon={<Clock3 className="h-4 w-4" />}
                  required
                />

                <InputField
                  label="Total Questions"
                  name="totalQuestions"
                  type="number"
                  min="1"
                  value={form.totalQuestions}
                  onChange={handleChange}
                  disabled={isLocked}
                  required
                />

                <InputField
                  label="Total Marks"
                  name="totalMarks"
                  type="number"
                  min="1"
                  step="0.5"
                  value={form.totalMarks}
                  onChange={handleChange}
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="grid gap-4 border-t border-slate-100 p-6 sm:grid-cols-2">
                <ToggleField
                  label="Randomize Questions"
                  description="Display questions in a random order."
                  name="randomizeQuestions"
                  checked={form.randomizeQuestions}
                  onChange={handleChange}
                  disabled={isLocked}
                />

                <ToggleField
                  label="Randomize Options"
                  description="Randomize answer options where applicable."
                  name="randomizeOptions"
                  checked={form.randomizeOptions}
                  onChange={handleChange}
                  disabled={isLocked}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Assessment Schedule
                    </h2>
                    <p className="text-xs text-slate-500">
                      Set when the assessment starts and ends.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                <InputField
                  label="Start Date & Time"
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleChange}
                  disabled={isLocked}
                  required
                />

                <InputField
                  label="End Date & Time"
                  name="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={isLocked}
                  required
                />
              </div>
            </section>

            <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-300/30 backdrop-blur sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(`/assessments/${assessmentId}`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating || isLocked}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Assessment
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

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
  disabled,
  required,
  icon,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>

    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          icon ? "pl-10" : ""
        }`}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  required,
  children,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </select>
  </div>
);

const ToggleField = ({
  label,
  description,
  name,
  checked,
  onChange,
  disabled,
}) => (
  <label
    className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition ${
      disabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30"
    }`}
  >
    <div>
      <p className="text-sm font-bold text-slate-800">
        {label}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>

    <span className="relative inline-flex shrink-0">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />

      <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-500/20" />

      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition peer-checked:translate-x-5">
        {checked && (
          <Check className="h-3 w-3 text-indigo-600" />
        )}
      </span>
    </span>
  </label>
);

export default EditAssessmentScreen;
