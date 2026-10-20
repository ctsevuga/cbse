
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit,
  Loader2,
  School,
  Star,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  useGetAcademicYearDetailsQuery,
  useSetCurrentAcademicYearMutation,
} from "../../slices/academicYearApiSlice";


const AcademicYearDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
   * ======================================================
   * Get Academic Year
   * ======================================================
   */

  const {
    data: academicYear,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAcademicYearDetailsQuery(id);


  /*
   * ======================================================
   * Set Current Academic Year
   * ======================================================
   */

  const [
    setCurrentAcademicYear,
    {
      isLoading: isSettingCurrent,
    },
  ] = useSetCurrentAcademicYearMutation();


  /*
   * ======================================================
   * Format Date
   * ======================================================
   */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };


  /*
   * ======================================================
   * Format Date + Time
   * ======================================================
   */

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  /*
   * ======================================================
   * Calculate duration
   * ======================================================
   */

  const getDuration = () => {
    if (
      !academicYear?.startDate ||
      !academicYear?.endDate
    ) {
      return "-";
    }

    const start = new Date(
      academicYear.startDate,
    );

    const end = new Date(
      academicYear.endDate,
    );

    const difference =
      end.getTime() - start.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24),
    );

    return `${days} days`;
  };


  /*
   * ======================================================
   * Set Current Academic Year
   * ======================================================
   */

  const handleSetCurrent = async () => {
    if (!academicYear?._id) {
      return;
    }

    if (academicYear.isCurrent) {
      return;
    }

    if (!academicYear.isActive) {
      toast.error(
        "An inactive academic year cannot be set as current.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Set ${academicYear.name} as the current academic year?\n\n` +
        "The current status will be removed from any other academic year belonging to this school.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await setCurrentAcademicYear(
        academicYear._id,
      ).unwrap();

      toast.success(
        `${academicYear.name} is now the current academic year.`,
      );

      /*
       * Refresh the details so the Current status
       * immediately reflects the server response.
       */
      await refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to set the current academic year.",
      );
    }
  };


  /*
   * ======================================================
   * Loading
   * ======================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-24">
          <div className="text-center">

            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading academic year...
            </p>

          </div>
        </div>
      </div>
    );
  }


  /*
   * ======================================================
   * Error
   * ======================================================
   */

  if (isError || !academicYear) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl">

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Academic Year Not Found
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "The requested academic year could not be found or you do not have permission to access it."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/academic-years")
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Academic Years
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

        {/* ==================================================
            Top Navigation
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic-years")
            }
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Academic Years
          </button>


          <div className="flex flex-col gap-2 sm:flex-row">

            {/* Set Current */}

            {!academicYear.isCurrent &&
              academicYear.isActive && (
                <button
                  type="button"
                  onClick={handleSetCurrent}
                  disabled={isSettingCurrent}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSettingCurrent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Current...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      Set as Current
                    </>
                  )}
                </button>
              )}


            {/* Edit */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/academic-years/${academicYear._id}/edit`,
                )
              }
              disabled={isSettingCurrent}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Edit className="h-4 w-4" />
              Edit Academic Year
            </button>

          </div>

        </div>


        {/* ==================================================
            Hero Card
        ================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 sm:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>

                <div>

                  <p className="text-sm font-medium text-indigo-100">
                    Academic Year
                  </p>

                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                    {academicYear.name}
                  </h1>

                  {academicYear.school && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-indigo-100">
                      <School className="h-4 w-4" />

                      <span>
                        {academicYear.school.name}

                        {academicYear.school.code && (
                          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs">
                            {academicYear.school.code}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                </div>

              </div>


              {/* Status */}

              <div className="flex flex-wrap gap-2">

                {academicYear.isCurrent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Current Year
                  </span>
                )}

                {academicYear.isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-emerald-300/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                    <span className="h-2 w-2 rounded-full bg-indigo-200" />
                    Inactive
                  </span>
                )}

              </div>

            </div>

          </div>


          {/* Quick Summary */}

          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <div className="p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Start Date
              </p>

              <p className="mt-2 text-base font-semibold text-slate-800">
                {formatDate(academicYear.startDate)}
              </p>

            </div>


            <div className="p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                End Date
              </p>

              <p className="mt-2 text-base font-semibold text-slate-800">
                {formatDate(academicYear.endDate)}
              </p>

            </div>


            <div className="p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Duration
              </p>

              <p className="mt-2 text-base font-semibold text-slate-800">
                {getDuration()}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            Details
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ==================================================
              Academic Year Information
          ================================================== */}

          <div className="lg:col-span-2">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-indigo-100 p-2">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Academic Year Details
                    </h2>

                    <p className="text-xs text-slate-500">
                      Basic information about this academic year
                    </p>
                  </div>

                </div>

              </div>


              <div className="divide-y divide-slate-100">

                {/* Academic Year Name */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    Academic Year
                  </div>

                  <div className="text-sm font-semibold text-slate-800 sm:col-span-2">
                    {academicYear.name}
                  </div>

                </div>


                {/* School */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    School
                  </div>

                  <div className="sm:col-span-2">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <School className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {academicYear.school?.name ||
                            "-"}
                        </p>

                        {academicYear.school?.code && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            Code:{" "}
                            {academicYear.school.code}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>

                </div>


                {/* Start Date */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    Start Date
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    {formatDate(academicYear.startDate)}
                  </div>

                </div>


                {/* End Date */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    End Date
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    {formatDate(academicYear.endDate)}
                  </div>

                </div>


                {/* Current */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    Current Academic Year
                  </div>

                  <div className="sm:col-span-2">

                    {academicYear.isCurrent ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Yes, this is the current academic year
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <XCircle className="h-4 w-4" />
                        No
                      </span>
                    )}

                  </div>

                </div>


                {/* Active */}

                <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-6">

                  <div className="text-sm font-medium text-slate-500">
                    Status
                  </div>

                  <div className="sm:col-span-2">

                    {academicYear.isActive ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              Record Information
          ================================================== */}

          <div className="space-y-6">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-slate-100 p-2">
                    <Clock3 className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Record Information
                    </h2>

                    <p className="text-xs text-slate-500">
                      System timestamps
                    </p>
                  </div>

                </div>

              </div>


              <div className="space-y-5 p-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </p>

                  <p className="mt-1.5 text-sm font-medium text-slate-700">
                    {formatDateTime(
                      academicYear.createdAt,
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-1.5 text-sm font-medium text-slate-700">
                    {formatDateTime(
                      academicYear.updatedAt,
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Record ID
                  </p>

                  <p className="mt-1.5 break-all font-mono text-xs text-slate-500">
                    {academicYear._id}
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                Status Summary
            ================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="p-5">

                <p className="text-sm font-semibold text-slate-800">
                  Academic Year Status
                </p>

                <div className="mt-4 space-y-3">

                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">

                    <span className="text-sm text-slate-600">
                      Active
                    </span>

                    {academicYear.isActive ? (
                      <span className="font-semibold text-emerald-600">
                        Yes
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500">
                        No
                      </span>
                    )}

                  </div>


                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">

                    <span className="text-sm text-slate-600">
                      Current
                    </span>

                    {academicYear.isCurrent ? (
                      <span className="font-semibold text-indigo-600">
                        Yes
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500">
                        No
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            Bottom Actions
        ================================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic-years")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Academic Years
          </button>


          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Bottom Set Current */}

            {!academicYear.isCurrent &&
              academicYear.isActive && (
                <button
                  type="button"
                  onClick={handleSetCurrent}
                  disabled={isSettingCurrent}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSettingCurrent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Current...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      Set as Current
                    </>
                  )}
                </button>
              )}


            {/* Bottom Edit */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/academic-years/${academicYear._id}/edit`,
                )
              }
              disabled={isSettingCurrent}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Edit className="h-4 w-4" />
              Edit Academic Year
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


export default AcademicYearDetailsScreen;

