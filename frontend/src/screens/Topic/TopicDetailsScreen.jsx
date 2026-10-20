import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit3,
  FileText,
  Layers,
  Power,
  XCircle,
} from "lucide-react";

import {
  useGetTopicDetailsQuery,
  useUpdateTopicStatusMutation,
} from "../../slices/topicApiSlice";

const TopicDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: topicData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTopicDetailsQuery(id);

  const [
    updateTopicStatus,
    {
      isLoading: updatingStatus,
    },
  ] = useUpdateTopicStatusMutation();

  const topic =
    topicData?.data ||
    topicData ||
    null;

  const updateStatusHandler = async () => {
    if (!topic) {
      return;
    }

    const newStatus = !topic.isActive;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} the topic "${topic.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateTopicStatus({
        id: topic._id,
        isActive: newStatus,
      }).unwrap();

      await refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          "Unable to update topic status.",
      );
    }
  };

  const getSubjectName = () =>
    topic?.subject?.name ||
    topic?.subject?.subjectName ||
    "-";

  const getSubjectCode = () =>
    topic?.subject?.code ||
    topic?.subject?.subjectCode ||
    topic?.subject?.cbseSubjectCode ||
    "";

  const getChapterName = () =>
    topic?.chapter?.title ||
    topic?.chapter?.name ||
    "-";

  const getChapterNumber = () =>
    topic?.chapter?.chapterNumber ||
    topic?.chapter?.chapterNo ||
    "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-sm text-slate-500">
                Loading topic details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />

            <h2 className="mt-4 text-lg font-semibold text-red-800">
              Unable to load topic
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error?.data?.message ||
                "Topic not found or could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = topic.isActive !== false;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <BookOpen className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Topic Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and manage topic information
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/topics/${topic._id}/edit`,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={updateStatusHandler}
              disabled={updatingStatus}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200"
              }`}
            >
              <Power className="h-4 w-4" />

              {updatingStatus
                ? "Updating..."
                : isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Layers className="h-8 w-8 text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium text-indigo-100">
                    Topic
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {topic.name}
                  </h2>

                  <p className="mt-1 text-sm text-indigo-100">
                    {getSubjectName()}
                    {getSubjectCode()
                      ? ` • ${getSubjectCode()}`
                      : ""}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? "bg-white text-emerald-700"
                      : "bg-white/15 text-white ring-1 ring-white/25"
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Subject
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {getSubjectName()}
              </p>

              {getSubjectCode() && (
                <p className="mt-1 text-xs text-slate-500">
                  {getSubjectCode()}
                </p>
              )}
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Chapter
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {getChapterNumber()
                  ? `Chapter ${getChapterNumber()}`
                  : "Chapter"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {getChapterName()}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <p
                className={`mt-2 font-semibold ${
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {isActive
                  ? "Available"
                  : "Inactive"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Topic visibility status
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Topic Information
                    </h3>

                    <p className="text-xs text-slate-500">
                      Detailed information about this topic
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Topic Name
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-800">
                    {topic.name}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    {topic.description ? (
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {topic.description}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        No description provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold text-slate-800">
                  Chapter
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Parent chapter information
                </p>
              </div>

              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>

                <h4 className="mt-4 font-semibold text-slate-800">
                  {getChapterName()}
                </h4>

                {getChapterNumber() && (
                  <p className="mt-1 text-sm text-indigo-600">
                    Chapter {getChapterNumber()}
                  </p>
                )}

                {topic.chapter?.description && (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {topic.chapter.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Topic Status
              </p>

              <div
                className={`mt-3 rounded-xl p-4 ${
                  isActive
                    ? "bg-emerald-50"
                    : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-slate-500" />
                  )}

                  <div>
                    <p
                      className={`font-semibold ${
                        isActive
                          ? "text-emerald-800"
                          : "text-slate-700"
                      }`}
                    >
                      {isActive
                        ? "Active Topic"
                        : "Inactive Topic"}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {isActive
                        ? "This topic is currently active."
                        : "This topic is currently inactive."}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={updateStatusHandler}
                disabled={updatingStatus}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Power className="h-4 w-4" />

                {updatingStatus
                  ? "Updating Status..."
                  : isActive
                    ? "Deactivate Topic"
                    : "Activate Topic"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/topics")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailsScreen;