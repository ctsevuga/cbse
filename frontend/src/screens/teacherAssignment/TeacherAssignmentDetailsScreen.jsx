import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  UserRound,
  GraduationCap,
  BookOpen,
  Layers3,
  CalendarDays,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  useGetTeacherAssignmentDetailsQuery,
  useUpdateTeacherAssignmentStatusMutation,
} from "../../slices/teacherAssignmentApiSlice";

const TeacherAssignmentDetailsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(
  (state) => state.auth,
);

const schoolSlug = userInfo?.school?.slug;
  const { id } = useParams();

 const {
  data: assignment,
  isLoading,
  error,
  refetch,
} = useGetTeacherAssignmentDetailsQuery(
  {
    schoolSlug,
    assignmentId: id,
  },
  {
    skip: !schoolSlug || !id,
  },
);

  const [
    updateTeacherAssignmentStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateTeacherAssignmentStatusMutation();

  const handleStatusUpdate = async () => {
    if (!assignment) {
      return;
    }

    const newStatus = !assignment.isActive;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this teacher assignment?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateTeacherAssignmentStatus({
  schoolSlug,
  assignmentId: assignment._id,
  isActive: newStatus,
}).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          `Failed to ${actionText} teacher assignment`,
      );
    }
  };

  const handleEdit = () => {
    navigate(
      `/admin/teacher-assignments/${id}/edit`,
    );
  };

  const handleBack = () => {
    navigate("/admin/teacher-assignments");
  };

  const getAssignmentTypeLabel = (
    assignmentType,
  ) => {
    if (assignmentType === "CLASS_TEACHER") {
      return "Class Teacher";
    }

    if (assignmentType === "SUBJECT_TEACHER") {
      return "Subject Teacher";
    }

    return assignmentType || "-";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-40 rounded-2xl bg-slate-200" />

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="h-20 rounded-xl bg-slate-100" />
                  <div className="h-20 rounded-xl bg-slate-100" />
                  <div className="h-20 rounded-xl bg-slate-100" />
                  <div className="h-20 rounded-xl bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to load assignment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                "Teacher assignment could not be loaded."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const isClassTeacher =
    assignment.assignmentType ===
    "CLASS_TEACHER";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Teacher Assignments
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  {isClassTeacher ? (
                    <GraduationCap className="h-8 w-8 text-white" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-white" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-100">
                    Teacher Assignment
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {getAssignmentTypeLabel(
                      assignment.assignmentType,
                    )}
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    {assignment.academicYear?.name ||
                      "Academic Year"}{" "}
                    •{" "}
                    {assignment.class?.name ||
                      "Class"}{" "}
                    •{" "}
                    {assignment.section?.name ||
                      "Section"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    assignment.isActive
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : assignment.isActive ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  {isUpdatingStatus
                    ? "Updating..."
                    : assignment.isActive
                      ? "Deactivate"
                      : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5">
                  <UserRound className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Teacher Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Assigned teacher details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl font-bold text-white">
                  {(assignment.teacher?.name || "T")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) =>
                      part.charAt(0).toUpperCase(),
                    )
                    .join("")}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {assignment.teacher?.name ||
                      "Teacher"}
                  </h3>

                  <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500">
                    {assignment.teacher?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>
                          {
                            assignment.teacher
                              .email
                          }
                        </span>
                      </div>
                    )}

                    {assignment.teacher?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>
                          {
                            assignment.teacher
                              .phone
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Status
                  </h2>
                  <p className="text-sm text-slate-500">
                    Assignment status
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-32 items-center justify-center p-6">
              <div className="text-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                    assignment.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {assignment.isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {assignment.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <Layers3 className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Assignment Details
                </h2>
                <p className="text-sm text-slate-500">
                  Academic and teaching assignment information
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Academic Year
                </span>
              </div>

              <p className="font-semibold text-slate-800">
                {assignment.academicYear?.name ||
                  "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Class
                </span>
              </div>

              <p className="font-semibold text-slate-800">
                {assignment.class?.name || "-"}
              </p>

              {assignment.class?.code && (
                <p className="mt-1 text-xs text-slate-500">
                  {assignment.class.code}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Layers3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Section
                </span>
              </div>

              <p className="font-semibold text-slate-800">
                {assignment.section?.name ||
                  "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Subject
                </span>
              </div>

              {isClassTeacher ? (
                <p className="font-semibold text-slate-400">
                  Not applicable
                </p>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">
                    {assignment.subject?.name ||
                      "-"}
                  </p>

                  {assignment.subject?.code && (
                    <p className="mt-1 text-xs text-slate-500">
                      {assignment.subject.code}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Assignment Type
                </span>
              </div>

              <p className="font-semibold text-slate-800">
                {getAssignmentTypeLabel(
                  assignment.assignmentType,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  School
                </span>
              </div>

              <p className="font-semibold text-slate-800">
                {assignment.school?.name || "-"}
              </p>

              {assignment.school?.code && (
                <p className="mt-1 text-xs text-slate-500">
                  {assignment.school.code}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Pencil className="h-4 w-4" />
              Edit Assignment
            </button>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                assignment.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isUpdatingStatus ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : assignment.isActive ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}

              {isUpdatingStatus
                ? "Updating..."
                : assignment.isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentDetailsScreen;