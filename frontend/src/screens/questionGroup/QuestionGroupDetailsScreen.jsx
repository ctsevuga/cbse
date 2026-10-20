import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  FileText,
  Layers3,
  ListChecks,
  RefreshCw,
  Settings2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  useGetQuestionGroupDetailsQuery,
  useRefreshQuestionGroupStatisticsMutation,
  useUpdateQuestionGroupStatusMutation,
} from "../../slices/questionGroupApiSlice";

const QuestionGroupDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [statusUpdating, setStatusUpdating] = useState(false);

  const {
    data: group,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetQuestionGroupDetailsQuery(id);

  const [
    refreshQuestionGroupStatistics,
    { isLoading: isRefreshingStatistics },
  ] = useRefreshQuestionGroupStatisticsMutation();

  const [updateQuestionGroupStatus] =
    useUpdateQuestionGroupStatusMutation();

  const handleRefreshStatistics = async () => {
    try {
      await refreshQuestionGroupStatistics(id).unwrap();
      await refetch();
    } catch (error) {
      window.alert(
        error?.data?.message ||
          "Failed to refresh question group statistics.",
      );
    }
  };

  const handleUpdateStatus = async () => {
    if (!group) {
      return;
    }

    const nextStatus = !group.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? "Are you sure you want to activate this question group?"
        : "Are you sure you want to deactivate this question group?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setStatusUpdating(true);

      await updateQuestionGroupStatus({
        id: group._id,
        isActive: nextStatus,
      }).unwrap();

      await refetch();
    } catch (error) {
      window.alert(
        error?.data?.message ||
          "Failed to update question group status.",
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const getSubjectName = () => {
    if (!group?.subject) {
      return "Not assigned";
    }

    if (typeof group.subject === "object") {
      return (
        group.subject.name ||
        group.subject.title ||
        group.subject.subjectName ||
        "Not assigned"
      );
    }

    return "Not assigned";
  };

  const getChapterName = () => {
    if (!group?.chapter) {
      return "Not assigned";
    }

    if (typeof group.chapter === "object") {
      return (
        group.chapter.name ||
        group.chapter.title ||
        group.chapter.chapterName ||
        "Not assigned"
      );
    }

    return "Not assigned";
  };

  const getCreatedByName = () => {
    if (!group?.createdBy) {
      return "Unknown";
    }

    if (typeof group.createdBy === "object") {
      return (
        group.createdBy.name ||
        group.createdBy.username ||
        group.createdBy.email ||
        "Unknown"
      );
    }

    return "Unknown";
  };

  const getGroupTypeLabel = (type) => {
    if (!type) {
      return "Not specified";
    }

    return type
      .split("_")
      .map(
        (word) =>
          word.charAt(0) + word.slice(1).toLowerCase(),
      )
      .join(" ");
  };

  const getSelectionModeLabel = (mode) => {
    if (!mode) {
      return "Not specified";
    }

    if (mode === "ALL") {
      return "All Questions";
    }

    if (mode === "ANY") {
      return "Any Questions";
    }

    if (mode === "RANDOM") {
      return "Random Questions";
    }

    return mode;
  };

  const getGroupTypeStyle = (type) => {
    const styles = {
      PASSAGE: "bg-blue-50 text-blue-700 ring-blue-600/20",
      CASE_STUDY: "bg-purple-50 text-purple-700 ring-purple-600/20",
      DATA_INTERPRETATION:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      SOURCE_BASED:
        "bg-orange-50 text-orange-700 ring-orange-600/20",
      COMMON_DIRECTIONS:
        "bg-pink-50 text-pink-700 ring-pink-600/20",
    };

    return (
      styles[type] ||
      "bg-slate-50 text-slate-700 ring-slate-600/20"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-48 rounded-3xl bg-slate-200" />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>

          <div className="mt-6 h-96 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <CircleAlert className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Question group not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error?.data?.message ||
              "The requested question group could not be loaded."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Question Groups
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-100">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-5">
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm sm:flex">
                  <Layers3 className="h-7 w-7 text-white" />
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getGroupTypeStyle(
                        group.groupType,
                      )}`}
                    >
                      {getGroupTypeLabel(group.groupType)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        group.isActive
                          ? "bg-emerald-400/20 text-emerald-100"
                          : "bg-white/15 text-indigo-100"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          group.isActive
                            ? "bg-emerald-300"
                            : "bg-slate-300"
                        }`}
                      />
                      {group.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {group.title}
                  </h1>

                  <p className="mt-2 text-sm text-indigo-100">
                    {getSubjectName()}{" "}
                    {group.chapter && (
                      <>
                        <span className="mx-2">•</span>
                        {getChapterName()}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={statusUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {group.isActive ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}

                  {statusUpdating
                    ? "Updating..."
                    : group.isActive
                      ? "Deactivate"
                      : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={handleRefreshStatistics}
                  disabled={isRefreshingStatistics}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRefreshingStatistics
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Refresh Statistics
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Questions
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {group.questionCount ?? 0}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <ListChecks className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Marks
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {group.totalMarks ?? 0}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Selection
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {getSelectionModeLabel(group.selectionMode)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <Settings2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Group Content
                    </h2>
                    <p className="text-xs text-slate-500">
                      Shared instructions and content
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">
                    Directions
                  </h3>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                    {group.directions || (
                      <span className="italic text-slate-400">
                        No directions provided.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">
                    Shared Content
                  </h3>

                  <div className="min-h-32 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                    {group.sharedContent || (
                      <span className="italic text-slate-400">
                        No shared content provided.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Group Information
                    </h2>
                    <p className="text-xs text-slate-500">
                      Basic group details
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Subject
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getSubjectName()}
                  </p>
                </div>

                <div className="px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Chapter
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getChapterName()}
                  </p>
                </div>

                <div className="px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Group Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getGroupTypeLabel(group.groupType)}
                  </p>
                </div>

                <div className="px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Selection Mode
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getSelectionModeLabel(group.selectionMode)}
                  </p>
                </div>

                <div className="px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Created By
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {getCreatedByName()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Record Information
              </h2>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Created
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatDate(group.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Last Updated
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatDate(group.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      group.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        group.isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                    {group.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 ${
                group.isActive
                  ? "border-emerald-100 bg-emerald-50/70"
                  : "border-amber-100 bg-amber-50/70"
              }`}
            >
              <div className="flex gap-3">
                {group.isActive ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                )}

                <div>
                  <h3
                    className={`font-semibold ${
                      group.isActive
                        ? "text-emerald-800"
                        : "text-amber-800"
                    }`}
                  >
                    {group.isActive
                      ? "Question group is active"
                      : "Question group is inactive"}
                  </h3>

                  <p
                    className={`mt-1 text-sm leading-6 ${
                      group.isActive
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {group.isActive
                      ? "This group is currently available for use."
                      : "This group is currently disabled and may not be available for selection."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionGroupDetailsScreen;
