
import React from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit,
  Loader2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetSectionDetailsQuery,
  useUpdateSectionStatusMutation,
} from "../../slices/sectionApiSlice";

const SectionDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: section,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSectionDetailsQuery(id);

  const [
    updateSectionStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateSectionStatusMutation();

  const getTeacherName = (teacher) => {
    if (teacher?.user?.name) {
      return teacher.user.name;
    }

    if (teacher?.name) {
      return teacher.name;
    }

    if (
      teacher?.user?.firstName ||
      teacher?.user?.lastName
    ) {
      return [
        teacher.user.firstName,
        teacher.user.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return "Not assigned";
  };

  const getTeacherEmail = (teacher) => {
    return (
      teacher?.user?.email ||
      teacher?.email ||
      "—"
    );
  };

  const getTeacherPhone = (teacher) => {
    return (
      teacher?.user?.phone ||
      teacher?.phone ||
      "—"
    );
  };

  const getAcademicYearName = (academicYear) => {
    return (
      academicYear?.name ||
      academicYear?.academicYear ||
      "—"
    );
  };

  const getClassName = (classRecord) => {
    return (
      classRecord?.name ||
      classRecord?.code ||
      "—"
    );
  };

  const handleUpdateStatus = async () => {
    if (!section) {
      return;
    }

    const newStatus = !section.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } section "${section.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateSectionStatus({
        id: section._id,
        isActive: newStatus,
      }).unwrap();

      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to update section status. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading section details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !section) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/sections")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Sections
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <XCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load section
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "The requested section could not be found."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => navigate("/sections")}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Sections
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const teacherName = getTeacherName(
    section.classTeacher,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/sections")}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                title="Back to Sections"
              >
                <ArrowLeft size={19} />
              </button>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
                <Users
                  size={24}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Section {section.name}
                  </h1>

                  {section.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <XCircle size={14} />
                      Inactive
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage section information.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(`/sections/${section._id}/edit`)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              >
                <Edit size={18} />
                Edit Section
              </button>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                  section.isActive
                    ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-100"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100"
                }`}
              >
                {isUpdatingStatus ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : section.isActive ? (
                  <XCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}

                {isUpdatingStatus
                  ? "Updating..."
                  : section.isActive
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <Users
                  size={21}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Section Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Basic details of this section.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <Users
                    size={18}
                    className="text-indigo-600"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Section Name
                  </p>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  Section {section.name}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <BookOpen
                    size={18}
                    className="text-indigo-600"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Class
                  </p>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {getClassName(section.class)}
                </p>

                {section.class?.code &&
                  section.class?.name && (
                    <p className="mt-1 text-xs text-slate-500">
                      Code: {section.class.code}
                    </p>
                  )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <CalendarDays
                    size={18}
                    className="text-indigo-600"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Academic Year
                  </p>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {getAcademicYearName(
                    section.academicYear,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className={
                      section.isActive
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                </div>

                <p
                  className={`mt-3 text-lg font-bold ${
                    section.isActive
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }`}
                >
                  {section.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                <UserRound
                  size={21}
                  className="text-violet-600"
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Class Teacher
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Teacher assigned to this section.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-violet-50 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <UserRound
                  size={25}
                  className="text-violet-600"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {teacherName}
              </h3>

              {section.classTeacher ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-700">
                      {getTeacherEmail(
                        section.classTeacher,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {getTeacherPhone(
                        section.classTeacher,
                      )}
                    </p>
                  </div>

                  {section.classTeacher.employeeCode && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                        Employee Code
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          section.classTeacher
                            .employeeCode
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No class teacher has been assigned to
                  this section.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Section Status
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {section.isActive
                  ? "This section is currently active and available for normal school operations."
                  : "This section is currently inactive and should not be used for new assignments."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                section.isActive
                  ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-100"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100"
              }`}
            >
              {isUpdatingStatus ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : section.isActive ? (
                <XCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}

              {isUpdatingStatus
                ? "Updating..."
                : section.isActive
                  ? "Deactivate Section"
                  : "Activate Section"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/sections")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Sections
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/sections/${section._id}/edit`)
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <Edit size={18} />
            Edit Section
          </button>
        </div>
      </main>
    </div>
  );
};

export default SectionDetailsScreen;
