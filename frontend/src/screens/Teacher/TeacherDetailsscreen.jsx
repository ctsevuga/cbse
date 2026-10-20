import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetTeacherDetailsQuery,
  useUpdateTeacherStatusMutation,
} from "../../slices/teacherApiSlice";

const TeacherDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showStatusConfirm, setShowStatusConfirm] =
    useState(false);

  const {
    data: teacher,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTeacherDetailsQuery(id);

  const [
    updateTeacherStatus,
    {
      isLoading: isStatusUpdating,
    },
  ] = useUpdateTeacherStatusMutation();

  // --------------------------------------------------
  // Update teacher status
  // --------------------------------------------------

  const updateStatusHandler = async () => {
    if (!teacher?._id) {
      return;
    }

    const newStatus = !teacher.isActive;

    try {
      await updateTeacherStatus({
        id: teacher._id,
        isActive: newStatus,
      }).unwrap();

      toast.success(
        newStatus
          ? "Teacher activated successfully"
          : "Teacher deactivated successfully",
      );

      setShowStatusConfirm(false);

      refetch();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update teacher status";

      toast.error(message);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 text-center">

          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-xl font-semibold text-white">
            Loading teacher...
          </h2>

          <p className="text-white/60 text-sm mt-2">
            Please wait while we load the teacher details.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (isError || !teacher) {
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      "Teacher not found";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-300/20 flex items-center justify-center mb-5">

            <svg
              className="w-7 h-7 text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              />
            </svg>

          </div>

          <h2 className="text-xl font-bold text-white">
            Unable to load teacher
          </h2>

          <p className="text-white/60 text-sm mt-2">
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/teachers")
              }
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition"
            >
              Back to Teachers
            </button>

          </div>

        </div>

      </div>
    );
  }

  const teacherUser = teacher.user || {};
  const teacherSchool = teacher.school || {};

  const teacherName =
    teacherUser.name ||
    "Unnamed Teacher";

  const initial =
    teacherName
      .trim()
      .charAt(0)
      .toUpperCase() || "T";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-8">

      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            TOP HEADER
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 sm:p-6 mb-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/teachers")
                }
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center shrink-0"
                title="Back to teachers"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Teacher Details
                </h1>

                <p className="text-white/60 text-sm mt-1">
                  View teacher profile information
                </p>
              </div>

            </div>

            {/* Edit button */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teachers/${teacher._id}/edit`,
                )
              }
              className="h-11 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 0 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>

              Edit Teacher
            </button>

          </div>

        </div>

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden mb-5">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              {/* Avatar */}

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border border-white/20 shrink-0 mx-auto sm:mx-0">
                {initial}
              </div>

              {/* Name */}

              <div className="text-center sm:text-left flex-1">

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {teacherName}
                  </h2>

                  <span
                    className={`self-center sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      teacher.isActive
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-300/20"
                        : "bg-red-500/15 text-red-200 border border-red-300/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        teacher.isActive
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    />

                    {teacher.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

                <p className="text-white/60 mt-2">
                  {teacherUser.email ||
                    teacherUser.phone ||
                    "No contact information"}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">

                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white/80">
                    {teacher.employeeCode}
                  </span>

                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white/80">
                    {teacherSchool.code ||
                      "School"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            INFORMATION GRID
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ==================================================
              PERSONAL / USER INFORMATION
          ================================================== */}

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-300/20 flex items-center justify-center">

                <svg
                  className="w-5 h-5 text-cyan-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  />

                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    strokeWidth={1.8}
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M19 8v6m3-3h-6"
                  />
                </svg>

              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  User Information
                </h3>

                <p className="text-xs text-white/50">
                  Linked user account
                </p>
              </div>

            </div>

            <div className="space-y-3">

              <InfoRow
                label="Name"
                value={
                  teacherUser.name ||
                  "Not available"
                }
              />

              <InfoRow
                label="Email"
                value={
                  teacherUser.email ||
                  "Not available"
                }
              />

              <InfoRow
                label="Phone"
                value={
                  teacherUser.phone ||
                  "Not available"
                }
              />

              <InfoRow
                label="Role"
                value={
                  teacherUser.role ||
                  "Not available"
                }
              />

              <InfoRow
                label="Account Status"
                value={
                  teacherUser.isActive
                    ? "Active"
                    : "Inactive"
                }
                valueClassName={
                  teacherUser.isActive
                    ? "text-emerald-300"
                    : "text-red-300"
                }
              />

            </div>

          </div>

          {/* ==================================================
              TEACHER INFORMATION
          ================================================== */}

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-300/20 flex items-center justify-center">

                <svg
                  className="w-5 h-5 text-purple-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M5 12v5c0 1.5 3.1 3 7 3s7-1.5 7-3v-5"
                  />
                </svg>

              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Teacher Information
                </h3>

                <p className="text-xs text-white/50">
                  Professional profile
                </p>
              </div>

            </div>

            <div className="space-y-3">

              <InfoRow
                label="Employee Code"
                value={
                  teacher.employeeCode
                }
              />

              <InfoRow
                label="Qualification"
                value={
                  teacher.qualification ||
                  "Not specified"
                }
              />

              <InfoRow
                label="School"
                value={
                  teacherSchool.name ||
                  "Not available"
                }
              />

              <InfoRow
                label="School Code"
                value={
                  teacherSchool.code ||
                  "Not available"
                }
              />

              <InfoRow
                label="Profile Status"
                value={
                  teacher.isActive
                    ? "Active"
                    : "Inactive"
                }
                valueClassName={
                  teacher.isActive
                    ? "text-emerald-300"
                    : "text-red-300"
                }
              />

            </div>

          </div>

        </div>

        {/* ==================================================
            SYSTEM INFORMATION
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6 mt-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">

              <svg
                className="w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                />
              </svg>

            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Profile Information
              </h3>

              <p className="text-xs text-white/50">
                System record details
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <InfoRow
              label="Teacher ID"
              value={teacher._id}
            />

            <InfoRow
              label="Created"
              value={formatDate(
                teacher.createdAt,
              )}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(
                teacher.updatedAt,
              )}
            />

            <InfoRow
              label="User ID"
              value={
                teacherUser._id ||
                "Not available"
              }
            />

          </div>

        </div>

        {/* ==================================================
            STATUS ACTION
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6 mt-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h3 className="text-lg font-bold text-white">
                Teacher Status
              </h3>

              <p className="text-sm text-white/60 mt-1 max-w-xl">
                {teacher.isActive
                  ? "The teacher is currently active and can be used normally in the school system."
                  : "The teacher is currently inactive and may not be available for active teacher operations."}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowStatusConfirm(
                  true,
                )
              }
              disabled={
                isStatusUpdating
              }
              className={`h-11 px-5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                teacher.isActive
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700"
              }`}
            >

              {teacher.isActive ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636A9 9 0 115.636 18.364 9 9 0 0118.364 5.636zM9 9l6 6m0-6l-6 6"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C16.176 19.29 20 14.591 20 9c0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              )}

              {isStatusUpdating
                ? "Updating..."
                : teacher.isActive
                ? "Deactivate Teacher"
                : "Activate Teacher"}

            </button>

          </div>

        </div>

        {/* ==================================================
            CONFIRMATION PANEL
        ================================================== */}

        {showStatusConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  teacher.isActive
                    ? "bg-red-100"
                    : "bg-emerald-100"
                }`}
              >

                {teacher.isActive ? (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v4m0 4h.01M10.29 3.86l-7.82 14a2 2 0 001.74 3h15.58a2 2 0 001.74-3l-7.82-14a2 2 0 00-3.48 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

              </div>

              <h3 className="text-xl font-bold text-gray-800">
                {teacher.isActive
                  ? "Deactivate Teacher?"
                  : "Activate Teacher?"}
              </h3>

              <p className="text-gray-500 text-sm mt-2 leading-6">

                {teacher.isActive
                  ? `Are you sure you want to deactivate ${teacherName}? The teacher profile will remain in the system but will be marked inactive.`
                  : `Are you sure you want to activate ${teacherName}? The teacher will become active again.`}

              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    setShowStatusConfirm(
                      false,
                    )
                  }
                  disabled={
                    isStatusUpdating
                  }
                  className="flex-1 h-11 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    updateStatusHandler
                  }
                  disabled={
                    isStatusUpdating
                  }
                  className={`flex-1 h-11 rounded-xl font-semibold text-white transition disabled:opacity-60 ${
                    teacher.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isStatusUpdating
                    ? "Updating..."
                    : teacher.isActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

// ======================================================
// Reusable information row
// ======================================================

const InfoRow = ({
  label,
  value,
  valueClassName = "text-white",
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-3 rounded-lg bg-white/5 border border-white/5">

      <span className="text-xs text-white/45 uppercase tracking-wide">
        {label}
      </span>

      <span
        className={`text-sm font-medium sm:text-right break-all ${valueClassName}`}
      >
        {value}
      </span>

    </div>
  );
};

// ======================================================
// Date formatter
// ======================================================

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  try {
    return new Date(date).toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return "Not available";
  }
};

export default TeacherDetailsScreen;
