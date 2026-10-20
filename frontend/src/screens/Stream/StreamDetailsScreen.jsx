
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Layers3,
  Building2,
  FileText,
  Hash,
  Clock3,
  AlertCircle,
} from "lucide-react";

import {
  useGetStreamDetailsQuery,
  useUpdateStreamStatusMutation,
} from "../../slices/streamApiSlice";

const StreamDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: stream,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStreamDetailsQuery(id);

  const [
    updateStreamStatus,
    {
      isLoading: isUpdatingStatus,
    },
  ] = useUpdateStreamStatusMutation();

  const handleUpdateStatus = async () => {
    if (!stream) {
      return;
    }

    const newStatus = !stream.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } stream "${stream.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateStreamStatus({
        id: stream._id,
        isActive: newStatus,
      }).unwrap();

      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to update stream status. Please try again.",
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="text-sm font-medium text-slate-500">
                Loading stream details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !stream) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/streams")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Streams
          </button>

          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={28} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Unable to load stream
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {error?.data?.message ||
                  error?.error ||
                  "The requested stream could not be loaded."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/streams")}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Streams
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/streams/${stream._id}/edit`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Edit3 size={17} />
            Edit Stream
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <Layers3 size={32} />
                </div>

                <div>
                  <p className="text-sm font-medium text-indigo-100">
                    Stream Details
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {stream.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                      <Hash size={13} />
                      {stream.code}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        stream.isActive
                          ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30"
                          : "bg-red-400/20 text-red-100 ring-1 ring-red-300/30"
                      }`}
                    >
                      {stream.isActive ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}

                      {stream.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  stream.isActive
                    ? "bg-white text-red-600 hover:bg-red-50"
                    : "bg-white text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : stream.isActive ? (
                  <>
                    <XCircle size={17} />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Activate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Layers3 size={20} />
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Stream Name
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {stream.name}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Hash size={20} />
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Stream Code
                </p>

                <p className="mt-1 text-lg font-bold uppercase text-slate-900">
                  {stream.code}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Building2 size={20} />
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  School
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {stream.school?.name || "—"}
                </p>

                {stream.school?.code && (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {stream.school.code}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  {stream.isActive ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    stream.isActive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {stream.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileText size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {stream.description?.trim() ||
                      "No description has been provided for this stream."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Clock3 size={18} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Created
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(stream.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <RefreshCw size={18} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Last Updated
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(stream.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/streams")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
              >
                <ArrowLeft size={17} />
                Back to List
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/streams/${stream._id}/edit`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Edit3 size={17} />
                Edit Stream
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDetailsScreen;
