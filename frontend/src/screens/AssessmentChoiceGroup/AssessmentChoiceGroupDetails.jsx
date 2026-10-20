import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Hash,
  Info,
  Layers3,
  ListChecks,
  Loader2,
  MessageSquareText,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  useGetAssessmentChoiceGroupDetailsQuery,
} from "../../slices/assessmentChoiceGroupApiSlice";

const AssessmentChoiceGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: choiceGroup,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAssessmentChoiceGroupDetailsQuery(id);

  const getAssessmentName = () => {
    if (
      choiceGroup?.assessment &&
      typeof choiceGroup.assessment === "object"
    ) {
      return (
        choiceGroup.assessment.name ||
        choiceGroup.assessment.title ||
        choiceGroup.assessment.assessmentName ||
        "Untitled Assessment"
      );
    }

    return "Assessment";
  };

  const getSectionName = () => {
    if (!choiceGroup?.section) {
      return "Assessment-wide";
    }

    if (
      typeof choiceGroup.section === "object"
    ) {
      return (
        choiceGroup.section.name ||
        choiceGroup.section.title ||
        choiceGroup.section.sectionName ||
        "Untitled Section"
      );
    }

    return "Section";
  };

  const getSelectionModeLabel = () => {
    switch (choiceGroup?.selectionMode) {
      case "EXACT":
        return "Exactly";
      case "AT_LEAST":
        return "At least";
      case "AT_MOST":
        return "At most";
      case "ANY":
      default:
        return "Any";
    }
  };

  const getSelectionDescription = () => {
    const count =
      choiceGroup?.requiredQuestions || 0;

    const max =
      choiceGroup?.maxQuestions;

    switch (choiceGroup?.selectionMode) {
      case "EXACT":
        return `Students must answer exactly ${count} question${
          count === 1 ? "" : "s"
        }.`;

      case "AT_LEAST":
        return `Students must answer at least ${count} question${
          count === 1 ? "" : "s"
        }.`;

      case "AT_MOST":
        return `Students can answer at most ${count} question${
          count === 1 ? "" : "s"
        }.`;

      case "ANY":
      default:
        if (max) {
          return `Students can answer any ${count} question${
            count === 1 ? "" : "s"
          } from a maximum of ${max}.`;
        }

        return `Students can answer any ${count} question${
          count === 1 ? "" : "s"
        }.`;
    }
  };

  const getSelectionColor = () => {
    switch (choiceGroup?.selectionMode) {
      case "EXACT":
        return {
          wrapper:
            "border-purple-200 bg-purple-50",
          icon:
            "bg-purple-100 text-purple-600",
          badge:
            "bg-purple-100 text-purple-700",
        };

      case "AT_LEAST":
        return {
          wrapper:
            "border-blue-200 bg-blue-50",
          icon:
            "bg-blue-100 text-blue-600",
          badge:
            "bg-blue-100 text-blue-700",
        };

      case "AT_MOST":
        return {
          wrapper:
            "border-orange-200 bg-orange-50",
          icon:
            "bg-orange-100 text-orange-600",
          badge:
            "bg-orange-100 text-orange-700",
        };

      case "ANY":
      default:
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50",
          icon:
            "bg-emerald-100 text-emerald-600",
          badge:
            "bg-emerald-100 text-emerald-700",
        };
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      ).format(new Date(date));
    } catch {
      return "—";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Loading choice group
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Please wait while we retrieve the details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !choiceGroup) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link
              to="/assessment-choice-groups"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Choice Groups
            </Link>
          </div>

          <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <XCircle className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Unable to load choice group
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error?.data?.message ||
                  "The assessment choice group could not be found or could not be loaded."}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Try Again
                </button>

                <Link
                  to="/assessment-choice-groups"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to List
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectionColors =
    getSelectionColor();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/assessment-choice-groups"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Choice Group Details
                </h1>

                {choiceGroup.isActive !==
                  false ? (
                  <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                    Active
                  </span>
                ) : (
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 sm:inline-flex">
                    Inactive
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                View the configuration and selection rules for
                this choice group.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/assessment-choice-groups/${id}/edit`,
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <Edit3 className="h-4 w-4" />
            Edit Choice Group
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 text-white sm:px-8">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur">
                  <ListChecks className="h-7 w-7" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {choiceGroup.name}
                    </h2>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                      {choiceGroup.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {choiceGroup.code && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-indigo-100">
                      <Hash className="h-3.5 w-3.5" />
                      <span className="font-mono">
                        {choiceGroup.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-100">
                  Selection
                </p>

                <p className="mt-1 text-xl font-bold">
                  {getSelectionModeLabel()}{" "}
                  {choiceGroup.requiredQuestions}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Assessment
                    </p>

                    <p className="mt-1 break-words font-semibold text-slate-900">
                      {getAssessmentName()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Layers3 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Section
                    </p>

                    <p className="mt-1 break-words font-semibold text-slate-900">
                      {getSectionName()}
                    </p>

                    {!choiceGroup.section && (
                      <p className="mt-1 text-xs text-slate-400">
                        This group applies across the assessment.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Selection Rules
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  How students are expected to select questions.
                </p>
              </div>

              <div
                className={`rounded-2xl border p-5 ${selectionColors.wrapper}`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selectionColors.icon}`}
                  >
                    <Target className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {getSelectionModeLabel()}{" "}
                        {
                          choiceGroup.requiredQuestions
                        }{" "}
                        question
                        {choiceGroup.requiredQuestions ===
                        1
                          ? ""
                          : "s"}
                      </h4>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${selectionColors.badge}`}
                      >
                        {choiceGroup.selectionMode}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {getSelectionDescription()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Required Questions
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {choiceGroup.requiredQuestions}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Maximum Questions
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {choiceGroup.maxQuestions ??
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="my-8 h-px bg-slate-100" />

            <div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Additional Information
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Instructions, marks, and display configuration.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Trophy className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Total Marks
                      </p>
                      <p className="font-semibold text-slate-900">
                        {choiceGroup.totalMarks ??
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ListChecks className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Display Order
                      </p>
                      <p className="font-semibold text-slate-900">
                        {choiceGroup.order ??
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      {choiceGroup.isActive !==
                      false ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Status
                      </p>
                      <p className="font-semibold text-slate-900">
                        {choiceGroup.isActive !==
                        false
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {choiceGroup.directions && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <MessageSquareText className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Directions
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {choiceGroup.directions}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="my-8 h-px bg-slate-100" />

            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Info className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Record Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    System information for this choice group.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">
                        Created
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        {formatDate(
                          choiceGroup.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">
                        Last Updated
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        {formatDate(
                          choiceGroup.updatedAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Link
              to="/assessment-choice-groups"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Choice Groups
            </Link>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/assessment-choice-groups/${id}/edit`,
                )
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Edit3 className="h-4 w-4" />
              Edit Choice Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentChoiceGroupDetails;
