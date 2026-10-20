import { useNavigate } from "react-router-dom";

import {
  useGetMyTeacherProfileQuery,
} from "../../slices/teacherApiSlice";

const MyTeacherProfileScreen = () => {
  const navigate = useNavigate();

  const {
    data: teacher,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyTeacherProfileQuery();

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 text-center">

          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-xl font-semibold text-white">
            Loading Your Profile
          </h2>

          <p className="text-white/60 text-sm mt-2">
            Please wait while we load your teacher
            profile.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (isError || !teacher) {
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      "Unable to load your teacher profile";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-300/20 flex items-center justify-center mb-5">

            <svg
              className="w-8 h-8 text-red-200"
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
            Profile Unavailable
          </h2>

          <p className="text-white/60 text-sm mt-2 leading-6">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  const user = teacher.user || {};
  const school = teacher.school || {};

  const teacherName =
    user.name || "Teacher";

  const initial =
    teacherName
      .trim()
      .charAt(0)
      .toUpperCase() || "T";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-10">

      <div className="w-full max-w-5xl mx-auto">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 py-6 mb-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center shrink-0"
                title="Back to home"
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
                  My Teacher Profile
                </h1>

                <p className="text-white/60 text-sm mt-1">
                  View your professional profile
                </p>
              </div>

            </div>

            {/* Profile status */}

            <div
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                teacher.isActive
                  ? "bg-emerald-500/10 border-emerald-300/20 text-emerald-200"
                  : "bg-red-500/10 border-red-300/20 text-red-200"
              }`}
            >

              <span
                className={`w-2 h-2 rounded-full ${
                  teacher.isActive
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              <span className="text-sm font-semibold">
                {teacher.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            PROFILE HERO
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden mb-5">

          {/* Decorative header */}

          <div className="h-28 sm:h-36 bg-gradient-to-r from-cyan-500/40 via-blue-600/40 to-purple-600/40 relative">

            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />

          </div>

          <div className="px-5 sm:px-8 pb-7">

            <div className="relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">

              {/* Avatar */}

              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 border-4 border-white/20 shadow-2xl flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shrink-0">
                {initial}
              </div>

              <div className="flex-1 min-w-0 pb-1">

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                  <h2 className="text-2xl sm:text-3xl font-bold text-white truncate">
                    {teacherName}
                  </h2>

                  <span
                    className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${
                      teacher.isActive
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-300/20"
                        : "bg-red-500/15 text-red-200 border border-red-300/20"
                    }`}
                  >
                    {teacher.isActive
                      ? "Active Teacher"
                      : "Inactive Teacher"}
                  </span>

                </div>

                <p className="text-white/60 mt-1">
                  {teacher.qualification ||
                    "Teacher"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            MAIN INFORMATION
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          <InformationCard
            icon={
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
              </svg>
            }
            title="Contact Information"
            subtitle="Your registered contact details"
          >

            <ProfileRow
              label="Full Name"
              value={
                user.name ||
                "Not available"
              }
            />

            <ProfileRow
              label="Phone"
              value={
                user.phone ||
                "Not available"
              }
            />

            <ProfileRow
              label="Email"
              value={
                user.email ||
                "Not available"
              }
            />

          </InformationCard>

          {/* ==================================================
              PROFESSIONAL INFORMATION
          ================================================== */}

          <InformationCard
            icon={
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
            }
            title="Professional Information"
            subtitle="Your teacher profile details"
          >

            <ProfileRow
              label="Employee Code"
              value={
                teacher.employeeCode ||
                "Not available"
              }
              highlight
            />

            <ProfileRow
              label="Qualification"
              value={
                teacher.qualification ||
                "Not specified"
              }
            />

            <ProfileRow
              label="Role"
              value={
                user.role ||
                "TEACHER"
              }
            />

          </InformationCard>

        </div>

        {/* ==================================================
            SCHOOL INFORMATION
        ================================================== */}

        <div className="mt-5">

          <InformationCard
            icon={
              <svg
                className="w-5 h-5 text-emerald-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8"
                />
              </svg>
            }
            title="School Information"
            subtitle="Your associated school"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <ProfileRow
                label="School Name"
                value={
                  school.name ||
                  "Not available"
                }
              />

              <ProfileRow
                label="School Code"
                value={
                  school.code ||
                  "Not available"
                }
                highlight
              />

            </div>

          </InformationCard>

        </div>

        {/* ==================================================
            ACCOUNT STATUS
        ================================================== */}

        <div className="mt-5">

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6">

            <div className="flex items-start gap-4">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  teacher.isActive
                    ? "bg-emerald-500/15 border border-emerald-300/20"
                    : "bg-red-500/15 border border-red-300/20"
                }`}
              >

                {teacher.isActive ? (
                  <svg
                    className="w-5 h-5 text-emerald-200"
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
                ) : (
                  <svg
                    className="w-5 h-5 text-red-200"
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
                )}

              </div>

              <div className="flex-1">

                <h3 className="text-lg font-bold text-white">
                  Profile Status
                </h3>

                <p className="text-sm text-white/60 mt-1 leading-6">

                  {teacher.isActive
                    ? "Your teacher profile is active. You can access the features available to your teacher account."
                    : "Your teacher profile is currently inactive. Please contact your school administrator if you believe this is incorrect."}

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            PROFILE RECORD
        ================================================== */}

        <div className="mt-5 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6">

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
                Profile Record
              </h3>

              <p className="text-xs text-white/50">
                Teacher profile information
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <ProfileRow
              label="Profile ID"
              value={
                teacher._id ||
                "Not available"
              }
            />

            <ProfileRow
              label="User ID"
              value={
                user._id ||
                "Not available"
              }
            />

            <ProfileRow
              label="Created"
              value={formatDate(
                teacher.createdAt,
              )}
            />

            <ProfileRow
              label="Last Updated"
              value={formatDate(
                teacher.updatedAt,
              )}
            />

          </div>

        </div>

        {/* ==================================================
            FOOTER ACTION
        ================================================== */}

        <div className="mt-5 flex justify-center">

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="h-11 px-6 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
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
                d="M3 12l9-9 9 9M5 10v10h14V10"
              />
            </svg>

            Back to Home

          </button>

        </div>

      </div>
    </div>
  );
};

// ======================================================
// Information card
// ======================================================

const InformationCard = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6">

      <div className="flex items-center gap-3 mb-5">

        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {title}
          </h3>

          <p className="text-xs text-white/50">
            {subtitle}
          </p>
        </div>

      </div>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
};

// ======================================================
// Profile row
// ======================================================

const ProfileRow = ({
  label,
  value,
  highlight = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-3 rounded-lg bg-white/5 border border-white/5">

      <span className="text-xs text-white/45 uppercase tracking-wide">
        {label}
      </span>

      <span
        className={`text-sm font-medium sm:text-right break-all ${
          highlight
            ? "text-cyan-200"
            : "text-white"
        }`}
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

export default MyTeacherProfileScreen;
