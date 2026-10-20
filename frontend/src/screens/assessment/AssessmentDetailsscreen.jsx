import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  Loader2,
  Pencil,
  RefreshCw,
  UserRound,
} from "lucide-react";
import {
  useGetAssessmentDetailsQuery,
  useUpdateAssessmentStatusMutation,
} from "../../slices/assessmentApiSlice";

const STATUS_OPTIONS = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SCHEDULED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-purple-50 text-purple-700 ring-purple-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDateOnly = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
};

const formatAssessmentType = (value) => {
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

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") return value;

  return value._id;
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
  accent = "indigo",
}) => {
  const accentClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          accentClasses[accent] || accentClasses.indigo
        }`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

const AssessmentDetailsScreen = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();

  const {
    data: assessment,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAssessmentDetailsQuery(assessmentId, {
    skip: !assessmentId,
  });

  const [
    updateAssessmentStatus,
    {
      isLoading: isUpdatingStatus,
    },
  ] = useUpdateAssessmentStatusMutation();

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (assessment?.status) {
      setSelectedStatus(assessment.status);
    }
  }, [assessment]);

  const handleStatusUpdate = async () => {
    if (
      !assessmentId ||
      !selectedStatus ||
      selectedStatus === assessment?.status
    ) {
      return;
    }

    try {
      await updateAssessmentStatus({
        assessmentId,
        status: selectedStatus,
      }).unwrap();
    } catch (err) {
      setSelectedStatus(assessment?.status || "DRAFT");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={36}
            className="animate-spin text-indigo-600"
          />
          <p className="text-sm font-medium text-slate-500">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !assessment) {
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      "Unable to load assessment.";

    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FileText size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Assessment not found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {errorMessage}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const school = assessment.school;
  const academicYear = assessment.academicYear;
  const classData = assessment.class;
  const section = assessment.section;
  const stream = assessment.stream;
  const subject = assessment.subject;
  const creator = assessment.createdBy;
  const blueprint = assessment.questionBlueprint;

  const assessmentStatus =
    assessment.status || "DRAFT";

  const currentStatusClass =
    statusStyles[assessmentStatus] ||
    statusStyles.DRAFT;

  const assessmentType =
    formatAssessmentType(
      assessment.assessmentType,
    );

  const assessmentIdValue =
    getId(assessment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Assessments
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <Link
              to={`/assessments/${assessmentIdValue}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 sm:px-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                  <FileText size={28} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                      {assessment.title}
                    </h1>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${currentStatusClass}`}
                    >
                      {assessmentStatus}
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                    {assessment.description ||
                      "No description has been added for this assessment."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10">
                      {assessmentType}
                    </span>

                    {subject?.name && (
                      <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10">
                        {subject.name}
                      </span>
                    )}

                    {classData?.name && (
                      <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10">
                        {classData.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-[280px] rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                  Assessment Status
                </p>

                <div className="mt-3 flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.value,
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-white focus:ring-2 focus:ring-white/30"
                  >
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={
                      handleStatusUpdate
                    }
                    disabled={
                      isUpdatingStatus ||
                      selectedStatus ===
                        assessmentStatus
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingStatus ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <GraduationCap size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Academic Structure
                    </h2>
                    <p className="text-xs text-slate-500">
                      Academic assignment for this
                      assessment
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailItem
                    icon={CalendarDays}
                    label="Academic Year"
                    value={
                      academicYear?.name
                    }
                    accent="blue"
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="Class"
                    value={
                      classData?.name
                    }
                    accent="indigo"
                  />

                  <DetailItem
                    icon={Layers3}
                    label="Section"
                    value={
                      section?.name
                    }
                    accent="purple"
                  />

                  <DetailItem
                    icon={Layers3}
                    label="Stream"
                    value={
                      stream?.name
                    }
                    accent="emerald"
                  />

                  <DetailItem
                    icon={FileText}
                    label="Subject"
                    value={
                      subject?.name
                    }
                    accent="amber"
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="School"
                    value={school?.name}
                    accent="rose"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Assessment Configuration
                    </h2>
                    <p className="text-xs text-slate-500">
                      Questions, marks and attempt settings
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailItem
                    icon={Clock3}
                    label="Duration"
                    value={`${assessment.durationMinutes} minutes`}
                    accent="blue"
                  />

                  <DetailItem
                    icon={FileText}
                    label="Questions"
                    value={
                      assessment.totalQuestions
                    }
                    accent="indigo"
                  />

                  <DetailItem
                    icon={CheckCircle2}
                    label="Total Marks"
                    value={
                      assessment.totalMarks
                    }
                    accent="emerald"
                  />

                  <DetailItem
                    icon={RefreshCw}
                    label="Max Attempts"
                    value={
                      assessment.maxAttempts
                    }
                    accent="purple"
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Randomize Questions
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Question order is randomized
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        assessment.randomizeQuestions
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {assessment.randomizeQuestions
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Randomize Options
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Answer options are randomized
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        assessment.randomizeOptions
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {assessment.randomizeOptions
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Schedule
                    </h2>
                    <p className="text-xs text-slate-500">
                      Assessment availability period
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={CalendarDays}
                    label="Start Date"
                    value={formatDate(
                      assessment.startDate,
                    )}
                    accent="emerald"
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="End Date"
                    value={formatDate(
                      assessment.endDate,
                    )}
                    accent="rose"
                  />
                </div>
              </section>

              {blueprint && (
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <FileText size={19} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Question Blueprint
                      </h2>
                      <p className="text-xs text-slate-500">
                        Blueprint configuration used for this
                        assessment
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailItem
                      icon={FileText}
                      label="Questions"
                      value={
                        blueprint.totalQuestions
                      }
                      accent="purple"
                    />

                    <DetailItem
                      icon={CheckCircle2}
                      label="Total Marks"
                      value={
                        blueprint.totalMarks
                      }
                      accent="indigo"
                    />

                    <DetailItem
                      icon={Layers3}
                      label="Blueprint"
                      value="Configured"
                      accent="emerald"
                    />
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Created By
                    </p>
                    <p className="mt-0.5 font-bold">
                      {creator?.name ||
                        "Unknown User"}
                    </p>
                  </div>
                </div>

                {creator?.email && (
                  <p className="mt-4 break-all text-sm text-slate-300">
                    {creator.email}
                  </p>
                )}

                {creator?.role && (
                  <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    {creator.role}
                  </span>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">
                  Assessment Information
                </h3>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Type
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-800">
                      {assessmentType}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Status
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[
                          assessmentStatus
                        ] ||
                        statusStyles.DRAFT
                      }`}
                    >
                      {assessmentStatus}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Created
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-800">
                      {formatDateOnly(
                        assessment.createdAt,
                      )}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Last Updated
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-800">
                      {formatDateOnly(
                        assessment.updatedAt,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-indigo-900">
                      Status Management
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-indigo-700">
                      Change the assessment status according
                      to the permitted assessment workflow.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleStatusUpdate
                  }
                  disabled={
                    isUpdatingStatus ||
                    selectedStatus ===
                      assessmentStatus
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailsScreen;
