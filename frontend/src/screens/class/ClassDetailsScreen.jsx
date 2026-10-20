
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit,
  Loader2,
  Power,
  School,
  XCircle,
} from "lucide-react";

import {
  useGetClassDetailsQuery,
  useUpdateClassStatusMutation,
} from "../../slices/classApiSlice";

const ClassDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: classRecord,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClassDetailsQuery(id);

  const [
    updateClassStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateClassStatusMutation();

  const handleUpdateStatus = async () => {
    if (!classRecord) {
      return;
    }

    const newStatus = !classRecord.isActive;

    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${classRecord.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateClassStatus({
        id: classRecord._id,
        isActive: newStatus,
      }).unwrap();

      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to update class status. Please try again.",
      );
    }
  };

  const handleEdit = () => {
    navigate(`/classes/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2
              size={38}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading class details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load class
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the class details."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!classRecord) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/classes"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                title="Back to Classes"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <BookOpen
                    size={20}
                    className="text-indigo-600"
                  />

                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Class Details
                  </h1>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage class information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <Edit size={17} />
              <span className="hidden sm:inline">
                Edit Class
              </span>
              <span className="sm:hidden">Edit</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <BookOpen size={30} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {classRecord.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-indigo-100">
                    {classRecord.code}
                  </p>
                </div>
              </div>

              {classRecord.isActive ? (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                  <CheckCircle2 size={17} />
                  Active
                </span>
              ) : (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-white">
                  <XCircle size={17} />
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <BookOpen
                      size={19}
                      className="text-indigo-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Class Name
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {classRecord.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <span className="text-sm font-bold text-violet-600">
                      #
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Class Code
                    </p>

                    <p className="mt-1 text-base font-semibold uppercase tracking-wide text-slate-900">
                      {classRecord.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <School
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      School
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {classRecord.school?.name ||
                        "—"}
                    </p>

                    {classRecord.school?.code && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {classRecord.school.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Class Status
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {classRecord.isActive
                      ? "This class is currently active and available for use."
                      : "This class is currently inactive and may not be available for new academic operations."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                    classRecord.isActive
                      ? "border border-red-200 bg-white text-red-600 hover:bg-red-50 focus:ring-red-100"
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
                  ) : (
                    <>
                      <Power size={18} />
                      {classRecord.isActive
                        ? "Deactivate Class"
                        : "Activate Class"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <BookOpen
                size={19}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Academic Configuration
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Sections, teachers, students, subjects, and
                assessments can be configured for this class
                through their respective management screens.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClassDetailsScreen;
