import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  Hash,
  Layers3,
  ListChecks,
  Pencil,
  School,
  Sparkles,
} from "lucide-react";

import { useGetAssessmentSectionDetailsQuery } from "../../slices/assessmentSectionApiSlice";

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  const classes = {
    DRAFT:
      "bg-slate-100 text-slate-700 ring-slate-200",
    SCHEDULED:
      "bg-blue-50 text-blue-700 ring-blue-200",
    ACTIVE:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    COMPLETED:
      "bg-violet-50 text-violet-700 ring-violet-200",
    CANCELLED:
      "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    classes[status] ||
    "bg-slate-100 text-slate-700 ring-slate-200"
  );
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-slate-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>

    <p className="break-words text-sm font-semibold text-slate-800">
      {value || "—"}
    </p>
  </div>
);

const AssessmentSectionDetailsScreen = () => {
  const { id } = useParams();

  const {
    data: assessmentSection,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAssessmentSectionDetailsQuery(id, {
    skip: !id,
  });

  const assessment =
    assessmentSection?.assessment;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-10 w-64 rounded-xl bg-slate-200" />

          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-8 w-80 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-3xl bg-white shadow-sm lg:col-span-2" />
            <div className="h-80 rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Unable to load assessment section details.";

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-red-100/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FileText className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load section
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {message}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refetch}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>

              <Link
                to="/assessment-sections"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Sections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessmentSection) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Assessment section not found
          </h2>

          <Link
            to="/assessment-sections"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Sections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/assessment-sections"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sections
          </Link>

          <Link
            to={`/assessment-sections/${assessmentSection._id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Pencil className="h-4 w-4" />
            Edit Section
          </Link>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-200 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                <Layers3 className="h-4 w-4" />
                Assessment Section
              </span>

              {assessment?.status && (
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusClasses(
                    assessment.status,
                  )}`}
                >
                  {formatLabel(assessment.status)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <span className="text-lg font-black">
                      {assessmentSection.sectionCode}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-indigo-100">
                      Section {assessmentSection.order}
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {assessmentSection.title}
                    </h1>
                  </div>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-indigo-100">
                  {assessment?.title ||
                    "Assessment Section"}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-amber-300" />

                <div>
                  <p className="text-xs text-indigo-100">
                    Total Marks
                  </p>
                  <p className="text-xl font-bold">
                    {assessmentSection.totalMarks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Section Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Question configuration and marks
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={Hash}
                  label="Section Code"
                  value={
                    assessmentSection.sectionCode
                  }
                />

                <DetailItem
                  icon={ListChecks}
                  label="Question Type"
                  value={formatLabel(
                    assessmentSection.questionType,
                  )}
                />

                <DetailItem
                  icon={ClipboardList}
                  label="Questions"
                  value={
                    assessmentSection.numberOfQuestions
                  }
                />

                <DetailItem
                  icon={Sparkles}
                  label="Marks / Question"
                  value={
                    assessmentSection.marksPerQuestion
                  }
                />

                <DetailItem
                  icon={FileText}
                  label="Total Marks"
                  value={
                    assessmentSection.totalMarks
                  }
                />

                <DetailItem
                  icon={Layers3}
                  label="Display Order"
                  value={assessmentSection.order}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Instructions
                  </h2>
                  <p className="text-sm text-slate-500">
                    Instructions displayed for this section
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {assessmentSection.instructions ||
                    "No specific instructions have been added for this section."}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Assessment
                  </h2>
                  <p className="text-sm text-slate-500">
                    Parent assessment information
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={FileText}
                  label="Assessment"
                  value={assessment?.title}
                />

                <DetailItem
                  icon={School}
                  label="School"
                  value={
                    assessment?.school?.name
                  }
                />

                <DetailItem
                  icon={BookOpen}
                  label="Subject"
                  value={
                    assessment?.subject?.name
                  }
                />

                <DetailItem
                  icon={Layers3}
                  label="Class"
                  value={
                    assessment?.class?.name
                  }
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Academic Year"
                  value={
                    assessment?.academicYear?.name
                  }
                />

                <DetailItem
                  icon={Layers3}
                  label="Section"
                  value={
                    assessment?.section?.name
                  }
                />

                <DetailItem
                  icon={BookOpen}
                  label="Stream"
                  value={
                    assessment?.stream?.name
                  }

                />

                <DetailItem
                  icon={ListChecks}
                  label="Assessment Type"
                  value={formatLabel(
                    assessment?.assessmentType,
                  )}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Assessment Schedule
                  </h2>
                  <p className="text-sm text-slate-500">
                    Timing information
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Start Date
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      assessment?.startDate,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    End Date
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      assessment?.endDate,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                    Duration
                  </p>
                  <p className="mt-1 font-semibold text-indigo-900">
                    {assessment?.durationMinutes
                      ? `${assessment.durationMinutes} minutes`
                      : "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Assessment Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configuration applied to the assessment
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Total Questions
                  </span>
                  <span className="font-bold text-slate-900">
                    {assessment?.totalQuestions ||
                      "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Total Marks
                  </span>
                  <span className="font-bold text-slate-900">
                    {assessment?.totalMarks ||
                      "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Maximum Attempts
                  </span>
                  <span className="font-bold text-slate-900">
                    {assessment?.maxAttempts ||
                      "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Randomize Questions
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      assessment?.randomizeQuestions
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {assessment?.randomizeQuestions
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Randomize Options
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      assessment?.randomizeOptions
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {assessment?.randomizeOptions
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            </section>

            {assessment?.createdBy && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Created By
                </h2>

                <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {assessment.createdBy.name}
                  </p>

                  {assessment.createdBy.email && (
                    <p className="mt-1 break-all text-sm text-slate-500">
                      {assessment.createdBy.email}
                    </p>
                  )}

                  {assessment.createdBy.role && (
                    <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                      {formatLabel(
                        assessment.createdBy.role,
                      )}
                    </span>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSectionDetailsScreen;
