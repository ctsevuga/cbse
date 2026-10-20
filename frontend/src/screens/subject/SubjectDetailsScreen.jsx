import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleOff,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";

import {
  useGetSubjectDetailsQuery,
  useUpdateSubjectStatusMutation,
} from "../../slices/subjectApiSlice";

const SubjectDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: subject,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSubjectDetailsQuery(id);

  const [
    updateSubjectStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateSubjectStatusMutation();

  const handleUpdateStatus = async () => {
    if (!subject) {
      return;
    }

    const newStatus = !subject.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } "${subject.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateSubjectStatus({
        subjectId: subject._id,
        isActive: newStatus,
      }).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to update subject status.",
      );
    }
  };

  const getSubjectTypeLabel = (type) => {
    const labels = {
      LANGUAGE: "Language",
      CORE: "Core",
      ELECTIVE: "Elective",
      OPTIONAL: "Optional",
      ADDITIONAL: "Additional",
    };

    return labels[type] || type;
  };

  const getSubjectTypeStyle = (type) => {
    const styles = {
      LANGUAGE:
        "bg-purple-50 text-purple-700 border-purple-200",
      CORE:
        "bg-blue-50 text-blue-700 border-blue-200",
      ELECTIVE:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      OPTIONAL:
        "bg-amber-50 text-amber-700 border-amber-200",
      ADDITIONAL:
        "bg-cyan-50 text-cyan-700 border-cyan-200",
    };

    return (
      styles[type] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2
            size={24}
            className="animate-spin text-blue-600"
          />
          Loading subject...
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <BookOpen size={28} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Unable to load subject
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Subject not found."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/subjects")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Subjects
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/subjects/${subject._id}/edit`)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <Pencil size={17} />
            Edit Subject
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <BookOpen size={28} />
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-100">
                    CBSE Master Subject
                  </p>

                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {subject.name}
                  </h1>

                  {subject.shortName && (
                    <p className="mt-1 text-sm text-blue-100">
                      {subject.shortName}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  subject.isActive
                    ? "bg-emerald-500/20 text-white ring-1 ring-white/30"
                    : "bg-white/15 text-blue-100 ring-1 ring-white/20"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    subject.isActive
                      ? "bg-emerald-300"
                      : "bg-slate-300"
                  }`}
                />
                {subject.isActive
                  ? "Active"
                  : "Inactive"}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject Code
                </p>

                <p className="mt-2 text-lg font-bold tracking-wide text-slate-900">
                  {subject.code}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CBSE Subject Code
                </p>

                <p className="mt-2 text-lg font-bold tracking-wide text-slate-900">
                  {subject.cbseSubjectCode || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject Type
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getSubjectTypeStyle(
                      subject.subjectType,
                    )}`}
                  >
                    {getSubjectTypeLabel(
                      subject.subjectType,
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {subject.isActive ? (
                    <CheckCircle2
                      size={19}
                      className="text-emerald-500"
                    />
                  ) : (
                    <CircleOff
                      size={19}
                      className="text-slate-400"
                    />
                  )}

                  <span className="font-semibold text-slate-800">
                    {subject.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm leading-6 text-blue-800">
                This is a global CBSE master subject. It
                can be used by schools when configuring
                their subject combinations.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                  subject.isActive
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-100"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : subject.isActive ? (
                  <>
                    <CircleOff size={18} />
                    Deactivate Subject
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Activate Subject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isFetching && !isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <Loader2
              size={14}
              className="animate-spin"
            />
            Refreshing...
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailsScreen;