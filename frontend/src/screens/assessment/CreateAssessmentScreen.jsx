import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  ListChecks,
  Loader2,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";

import { useCreateAssessmentMutation } from "../../slices/assessmentApiSlice";

import { useGetStreamsQuery } from "../../slices/streamApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";

import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";

import { useGetClassesQuery } from "../../slices/classApiSlice";

import { useGetSectionsQuery } from "../../slices/sectionApiSlice";



const ASSESSMENT_TYPES = [
  
  {
    value: "CHAPTER_TEST",
    label: "Chapter Test",
  },
  {
    value: "UNIT_TEST",
    label: "Unit Test",
  },
  {
    value: "MONTHLY_TEST",
    label: "Monthly Test",
  },
  {
    value: "REVISION_TEST",
    label: "Revision Test",
  },
  {
    value: "MOCK_EXAM",
    label: "Mock Exam",
  },
  {
    value: "PRE_BOARD",
    label: "Pre Board",
  },
  {
    value: "BOARD_PRACTICE",
    label: "Board Practice",
  },
];

const initialForm = {
  academicYear: "",
  class: "",
  section: "",
  stream: "",
  subject: "",
  title: "",
  description: "",
  assessmentType: "",
  durationMinutes: 60,
  totalQuestions: 30,
  totalMarks: 50,
  randomizeQuestions: false,
  randomizeOptions: false,
  maxAttempts: 1,
  startDate: "",
  endDate: "",
  
};

const getArrayData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getId = (item) => item?._id || item?.id || "";

const getName = (item) => item?.name || item?.title || item?.label || "";

const CreateAssessmentScreen = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [createAssessment, { isLoading: isCreating }] =
    useCreateAssessmentMutation();

  const { data: streamsData, isLoading: isStreamsLoading } =
    useGetStreamsQuery();

  const { data: subjectsData, isLoading: isSubjectsLoading } =
    useGetSubjectsQuery();

  const { data: academicYearsData, isLoading: isAcademicYearsLoading } =
    useGetAcademicYearsQuery();

  const { data: classesData, isLoading: isClassesLoading } = useGetClassesQuery(
    form.academicYear
      ? {
          academicYear: form.academicYear,
        }
      : undefined,
  );

  const { data: sectionsData, isLoading: isSectionsLoading } =
    useGetSectionsQuery(
      form.academicYear && form.class
        ? {
            academicYear: form.academicYear,
            class: form.class,
          }
        : undefined,
      {
        skip: !form.academicYear || !form.class,
      },
    );
  

  
  const streams = getArrayData(streamsData);

  const subjects = getArrayData(subjectsData);

  const academicYears = getArrayData(academicYearsData);

  const classes = getArrayData(classesData);

  const sections = getArrayData(sectionsData);

  const isLoadingReferenceData =
    isStreamsLoading ||
    isSubjectsLoading ||
    isAcademicYearsLoading ||
    isClassesLoading;

  const selectedClass = useMemo(
    () => classes.find((item) => getId(item) === form.class),
    [classes, form.class],
  );

  const selectedAcademicYear = useMemo(
    () => academicYears.find((item) => getId(item) === form.academicYear),
    [academicYears, form.academicYear],
  );

  // const availableBlueprints = useMemo(
  //   () =>
  //     questionBlueprints.filter((blueprint) => {
  //       const blueprintClass = getId(blueprint.class);

  //       const blueprintStream = getId(blueprint.stream);

  //       const matchesClass = blueprintClass === form.class;

  //       // A blueprint without a stream is treated
  //       // as a general blueprint for the subject.
  //       const matchesStream =
  //         !blueprintStream || blueprintStream === form.stream;

  //       return matchesClass && matchesStream;
  //     }),
  //   [questionBlueprints, form.class, form.stream],
  // );

  const handleChange = (event) => {
  const { name, value, type, checked } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const handleAcademicYearChange = (event) => {
  const value = event.target.value;

  setForm((previous) => ({
    ...previous,
    academicYear: value,
    class: "",
    section: "",
  }));
};

const handleClassChange = (event) => {
  const value = event.target.value;

  setForm((previous) => ({
    ...previous,
    class: value,
    section: "",
  }));
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.academicYear) {
      toast.error("Please select an academic year.");
      return;
    }

    if (!form.class) {
      toast.error("Please select a class.");
      return;
    }

    if (!form.stream) {
      toast.error("Please select a stream.");
      return;
    }

    if (!form.subject) {
      toast.error("Please select a subject.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Assessment title is required.");
      return;
    }

    if (!form.assessmentType) {
      toast.error("Please select an assessment type.");
      return;
    }

    if (Number(form.durationMinutes) < 1) {
      toast.error("Duration must be at least 1 minute.");
      return;
    }

    if (Number(form.totalQuestions) < 1) {
      toast.error("Total questions must be at least 1.");
      return;
    }

    if (Number(form.totalMarks) < 1) {
      toast.error("Total marks must be greater than 0.");
      return;
    }

    if (Number(form.maxAttempts) < 1) {
      toast.error("Maximum attempts must be at least 1.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Please provide start and end dates.");
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    const payload = {
      academicYear: form.academicYear,

      class: form.class,

      section: form.section || undefined,

      stream: form.stream,

      subject: form.subject,

      title: form.title.trim(),

      description: form.description.trim() || undefined,

      assessmentType: form.assessmentType,

      durationMinutes: Number(form.durationMinutes),

      totalQuestions: Number(form.totalQuestions),

      totalMarks: Number(form.totalMarks),

      randomizeQuestions: form.randomizeQuestions,

      randomizeOptions: form.randomizeOptions,

      maxAttempts: Number(form.maxAttempts),

      startDate: new Date(form.startDate).toISOString(),

      endDate: new Date(form.endDate).toISOString(),

      
    };

    try {
      await createAssessment(payload).unwrap();

      toast.success("Assessment created successfully.");

      navigate("/assessments");
    } catch (error) {
      toast.error(
        error?.data?.message || error?.error || "Unable to create assessment.",
      );
    }
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                to="/assessments"
                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Assessments
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Create Assessment
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-indigo-100 sm:text-base">
                    Build a structured assessment for your students with the
                    right academic context, schedule, and evaluation settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-xs text-indigo-100">Assessment status</p>
                  <p className="font-semibold">Draft</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoadingReferenceData && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading academic information...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Academic Structure
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select the academic year, class, section, stream and subject
                  for this assessment.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-violet-600" />
                  <h3 className="font-semibold text-slate-900">
                    Stream & Subject
                  </h3>
                </div>

                <div className="space-y-5">
                  <SelectField
                    label="Stream"
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    options={streams}
                    placeholder="Select stream"
                    required
                    getOptionLabel={(item) => getName(item)}
                    getOptionValue={(item) => getId(item)}
                  />

                  <SelectField
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    options={subjects}
                    placeholder="Select subject"
                    required
                    getOptionLabel={(item) =>
                      item?.name || item?.shortName || getName(item)
                    }
                    getOptionValue={(item) => getId(item)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">
                    Academic Year, Class & Section
                  </h3>
                </div>

                <div className="space-y-5">
                  <SelectField
                    label="Academic Year"
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleAcademicYearChange}
                    options={academicYears}
                    placeholder="Select academic year"
                    required
                    getOptionLabel={(item) =>
                      item?.name || item?.label || getName(item)
                    }
                    getOptionValue={(item) => getId(item)}
                  />

                  <SelectField
                    label="Class"
                    name="class"
                    value={form.class}
                    onChange={handleClassChange}
                    options={classes}
                    placeholder={
                      form.academicYear
                        ? "Select class"
                        : "Select academic year first"
                    }
                    required
                    disabled={!form.academicYear}
                    getOptionLabel={(item) =>
                      item?.name || item?.className || getName(item)
                    }
                    getOptionValue={(item) => getId(item)}
                  />

                  <SelectField
                    label="Section"
                    name="section"
                    value={form.section}
                    onChange={handleChange}
                    options={sections}
                    placeholder={
                      form.class
                        ? isSectionsLoading
                          ? "Loading sections..."
                          : "Select section"
                        : "Select class first"
                    }
                    disabled={!form.class || isSectionsLoading}
                    getOptionLabel={(item) =>
                      item?.name || item?.sectionName || getName(item)
                    }
                    getOptionValue={(item) => getId(item)}
                  />
                </div>
              </div>
            </div>

            {(selectedAcademicYear || selectedClass) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedAcademicYear && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    {getName(selectedAcademicYear)}
                  </span>
                )}

                {selectedClass && (
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                    {getName(selectedClass)}
                  </span>
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assessment Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Give your assessment a clear title and choose its format.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Assessment Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Mathematics Unit Test 1"
                required
                className="md:col-span-2"
              />

              <SelectField
                label="Assessment Type"
                name="assessmentType"
                value={form.assessmentType}
                onChange={handleChange}
                options={ASSESSMENT_TYPES}
                placeholder="Select assessment type"
                required
                getOptionLabel={(item) => item.label}
                getOptionValue={(item) => item.value}
              />

              <InputField
                label="Maximum Attempts"
                name="maxAttempts"
                type="number"
                min="1"
                value={form.maxAttempts}
                onChange={handleChange}
                placeholder="1"
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add instructions or a short description for this assessment..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assessment Configuration
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Define the question count, marks, duration and attempt
                  settings.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InputField
                label="Duration"
                name="durationMinutes"
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={handleChange}
                suffix="minutes"
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
                icon={<ListChecks className="h-4 w-4" />}
                required
              />

              <InputField
                label="Total Marks"
                name="totalMarks"
                type="number"
                min="1"
                value={form.totalMarks}
                onChange={handleChange}
                icon={<Target className="h-4 w-4" />}
                required
              />

              <InputField
                label="Maximum Attempts"
                name="maxAttempts"
                type="number"
                min="1"
                value={form.maxAttempts}
                onChange={handleChange}
                icon={<CheckCircle2 className="h-4 w-4" />}
                required
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ToggleField
                name="randomizeQuestions"
                checked={form.randomizeQuestions}
                onChange={handleChange}
                title="Randomize Questions"
                description="Show questions in a different order for each attempt."
              />

              <ToggleField
                name="randomizeOptions"
                checked={form.randomizeOptions}
                onChange={handleChange}
                title="Randomize Options"
                description="Shuffle answer options for supported question types."
              />
            </div>
          </section>

          

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assessment Schedule
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set when students can access this assessment.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <DateTimeField
                label="Start Date & Time"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />

              <DateTimeField
                label="End Date & Time"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-indigo-600">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    New assessments are created as Draft
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    You can schedule the assessment after reviewing all the
                    details.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Ready to create your assessment?
                </p>
                <p className="text-xs text-slate-500">
                  Review the academic structure and schedule before saving.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Assessment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
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
  min,
  suffix,
  icon,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
            icon ? "pl-10" : "px-4"
          } ${suffix ? "pr-24" : "pr-4"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  getOptionLabel,
  getOptionValue,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>

        {options.map((item) => (
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
            {getOptionLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
};

const DateTimeField = ({ label, name, value, onChange, required = false }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="datetime-local"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
};

const ToggleField = ({ name, checked, onChange, title, description }) => {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600" />

        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </label>
  );
};

export default CreateAssessmentScreen;
