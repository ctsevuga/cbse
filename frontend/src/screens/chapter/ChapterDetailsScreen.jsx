import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit3,
  Hash,
  Power,
  XCircle,
} from "lucide-react";

import {
  useGetChapterDetailsQuery,
  useUpdateChapterStatusMutation,
} from "../../slices/chapterApiSlice";

const ChapterDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: chapter,
    isLoading,
    isError,
    error,
  } = useGetChapterDetailsQuery(id);

  const [
    updateChapterStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateChapterStatusMutation();

  const handleUpdateStatus = async () => {
    if (!chapter) return;

    const newStatus = !chapter.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } "${chapter.title}"?`,
    );

    if (!confirmed) return;

    try {
      await updateChapterStatus({
        chapterId: chapter._id,
        isActive: newStatus,
      }).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to update chapter status.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading chapter...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error?.data?.message ||
                error?.error ||
                "Failed to load chapter."}
            </div>

            <button
              type="button"
              onClick={() => navigate("/chapters")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Chapters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <BookOpen className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-100">
                    Chapter {chapter.chapterNumber}
                  </p>

                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {chapter.title}
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    {chapter.subject?.name || "Subject"}
                    {chapter.subject?.code
                      ? ` • ${chapter.subject.code}`
                      : ""}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    chapter.isActive
                      ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/30"
                      : "bg-slate-900/20 text-slate-100 ring-1 ring-white/20"
                  }`}
                >
                  {chapter.isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {chapter.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Subject
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {chapter.subject?.name ||
                        "—"}
                    </p>

                    {chapter.subject?.code && (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {chapter.subject.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Hash className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Chapter Number
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-800">
                      Chapter{" "}
                      {chapter.chapterNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {chapter.description ||
                    "No description available for this chapter."}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Chapter Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {chapter.isActive
                      ? "This chapter is currently available for use."
                      : "This chapter is currently inactive."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    chapter.isActive
                      ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-100 hover:from-red-600 hover:to-rose-700"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-100 hover:from-emerald-600 hover:to-green-700"
                  }`}
                >
                  <Power className="h-5 w-5" />

                  {isUpdatingStatus
                    ? "Updating..."
                    : chapter.isActive
                      ? "Deactivate Chapter"
                      : "Activate Chapter"}
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => navigate("/chapters")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Chapters
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/chapters/${chapter._id}/edit`,
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:from-blue-700 hover:to-indigo-700"
              >
                <Edit3 className="h-5 w-5" />
                Edit Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterDetailsScreen;