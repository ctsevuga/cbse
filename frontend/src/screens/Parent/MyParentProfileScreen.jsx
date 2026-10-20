import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetMyParentProfileQuery,
} from "../../slices/parentApiSlice";

import {
  useGetMyChildrenQuery,
} from "../../slices/studentParentApiSlice";

const MyParentProfileScreen = () => {
  const navigate = useNavigate();

  const {
    data: parent,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyParentProfileQuery();

  /*
    StudentParent relationship endpoint.

    This is the correct endpoint for the logged-in
    parent's "My Children" section.

    Backend:
      getMyChildren()

    It automatically finds the Parent profile using:
      req.user._id
      req.schoolId
  */
  const {
    data: children = [],
    isLoading: isChildrenLoading,
    isError: isChildrenError,
    error: childrenError,
    refetch: refetchChildren,
  } = useGetMyChildrenQuery();

  // ======================================================
  // Loading
  // ======================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="animate-pulse space-y-6">

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10" />

              <div className="flex-1 space-y-3">
                <div className="h-6 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-28 bg-white/10 rounded-xl" />
              <div className="h-28 bg-white/10 rounded-xl" />
            </div>

            <div className="h-32 bg-white/10 rounded-xl" />

          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // Error
  // ======================================================

  if (isError || !parent) {
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      "Unable to load your parent profile.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-300/20 flex items-center justify-center">
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
                d="M12 9v4m0 4h.01M10.29 3.86l-8.1 14a2 2 0 001.74 3l16.14 0a2 2 0 001.74-3l-8.1-14a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mt-5">
            Parent Profile Unavailable
          </h2>

          <p className="text-sm text-white/60 mt-2">
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              Go Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  const parentName =
    parent.user?.name || "Parent";

  const initials =
    parentName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part[0]?.toUpperCase(),
      )
      .join("") || "P";

  const isActive = parent.isActive;

  // ======================================================
  // Profile
  // ======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 sm:py-10">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="px-5 py-6 sm:px-8 sm:py-8 border-b border-white/10">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center shadow-lg">

                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {initials}
                  </span>

                </div>

                <div>
                  <p className="text-sm text-cyan-200 font-medium">
                    Parent Profile
                  </p>

                  <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {parentName}
                  </h1>

                  <p className="text-sm text-white/60 mt-1">
                    Your parent account information
                  </p>
                </div>

              </div>

              <div
                className={`self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-emerald-400/10 border-emerald-300/20 text-emerald-100"
                    : "bg-red-400/10 border-red-300/20 text-red-100"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isActive
                      ? "bg-emerald-300"
                      : "bg-red-300"
                  }`}
                />

                <span className="text-sm font-semibold">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

          </div>

          {/* ==================================================
              Content
          ================================================== */}

          <div className="p-5 sm:p-8 space-y-6">

            {/* ==================================================
                Personal Information
            ================================================== */}

            <section className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-300/10 flex items-center justify-center">

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
                      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                    />

                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      strokeWidth={1.8}
                    />
                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Personal Information
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    Your registered account details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InfoCard
                  label="Full Name"
                  value={parent.user?.name}
                />

                <InfoCard
                  label="Phone Number"
                  value={parent.user?.phone}
                />

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-white/40">
                    Email Address
                  </p>

                  <p className="text-sm font-semibold text-white mt-2 break-all">
                    {parent.user?.email || "Not provided"}
                  </p>
                </div>

              </div>

            </section>

            {/* ==================================================
                My Children
            ================================================== */}

            <section className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-300/10 flex items-center justify-center">

                    <svg
                      className="w-5 h-5 text-blue-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
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
                        d="M23 21v-2a4 4 0 00-3-3.87"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M16 3.13a4 4 0 010 7.75"
                      />
                    </svg>

                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      My Children
                    </h2>

                    <p className="text-xs text-white/40 mt-0.5">
                      Students associated with your parent account
                    </p>
                  </div>

                </div>

                {!isChildrenLoading && !isChildrenError && (
                  <span className="self-start sm:self-center inline-flex items-center rounded-full bg-cyan-400/10 border border-cyan-300/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {children.length}{" "}
                    {children.length === 1
                      ? "Child"
                      : "Children"}
                  </span>
                )}

              </div>

              {/* Children loading */}

              {isChildrenLoading && (
                <div className="space-y-3">

                  <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />

                  <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />

                </div>
              )}

              {/* Children error */}

              {isChildrenError && (
                <div className="rounded-xl bg-red-500/10 border border-red-300/10 p-4">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>
                      <p className="text-sm font-semibold text-red-100">
                        Unable to load children
                      </p>

                      <p className="text-xs text-red-100/60 mt-1">
                        {childrenError?.data?.message ||
                          childrenError?.error ||
                          "The children list could not be loaded."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => refetchChildren()}
                      className="h-9 px-4 rounded-lg bg-red-500/20 border border-red-300/20 text-xs font-semibold text-red-100 hover:bg-red-500/30 transition"
                    >
                      Try Again
                    </button>

                  </div>

                </div>
              )}

              {/* No children */}

              {!isChildrenLoading &&
                !isChildrenError &&
                children.length === 0 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">

                    <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                      <svg
                        className="w-6 h-6 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
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
                          d="M23 21v-2a4 4 0 00-3-3.87"
                        />
                      </svg>

                    </div>

                    <p className="text-sm font-semibold text-white mt-3">
                      No children linked
                    </p>

                    <p className="text-xs text-white/40 mt-1">
                      No active student relationship is currently
                      associated with your account.
                    </p>

                  </div>
                )}

              {/* Children list */}

              {!isChildrenLoading &&
                !isChildrenError &&
                children.length > 0 && (
                  <div className="space-y-3">

                    {children.map((relationship) => {
                      const student = relationship.student;

                      if (!student) {
                        return null;
                      }

                      const studentName =
                        student.user?.name ||
                        "Unnamed Student";

                      const studentInitial =
                        studentName
                          .charAt(0)
                          .toUpperCase();

                      return (
                        <div
                          key={relationship._id}
                          className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.08] transition"
                        >

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-300/10 flex items-center justify-center shrink-0">
                                <span className="text-lg font-bold text-cyan-100">
                                  {studentInitial}
                                </span>
                              </div>

                              <div className="min-w-0">

                                <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                                  {studentName}
                                </h3>

                                <p className="text-xs text-white/40 mt-1">
                                  Admission No:{" "}
                                  <span className="text-white/70">
                                    {student.admissionNumber ||
                                      "Not available"}
                                  </span>
                                </p>

                              </div>

                            </div>

                            <div className="flex flex-wrap items-center gap-2">

                              {relationship.isPrimary && (
                                <span className="inline-flex items-center rounded-full bg-cyan-400/10 border border-cyan-300/20 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                                  Primary Contact
                                </span>
                              )}

                              <span className="inline-flex items-center rounded-full bg-purple-400/10 border border-purple-300/20 px-2.5 py-1 text-xs font-semibold text-purple-100">
                                {formatRelationship(
                                  relationship.relationship,
                                )}
                              </span>

                            </div>

                          </div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">

                            <ChildInfo
                              label="Class"
                              value={student.class?.name}
                            />

                            <ChildInfo
                              label="Section"
                              value={student.section?.name}
                            />

                            <ChildInfo
                              label="Academic Year"
                              value={student.academicYear?.name}
                            />

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

            </section>

            {/* ==================================================
                School Information
            ================================================== */}

            <section className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-300/10 flex items-center justify-center">

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
                      d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01"
                    />
                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    School Information
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    School associated with your account
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InfoCard
                  label="School Name"
                  value={parent.school?.name}
                  fallback="Not available"
                />

                <InfoCard
                  label="School Code"
                  value={parent.school?.code}
                  fallback="Not available"
                />

              </div>

            </section>

            {/* ==================================================
                Account Information
            ================================================== */}

            <section className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-300/10 flex items-center justify-center">

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
                      d="M9 12l2 2 4-4m5.5-3.5a9 9 0 11-13 0"
                    />
                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Account Information
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    Current account status
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <StatusCard
                  label="Parent Profile"
                  isActive={isActive}
                />

                <StatusCard
                  label="User Account"
                  isActive={parent.user?.isActive}
                />

              </div>

            </section>

            {/* ==================================================
                Important Notice
            ================================================== */}

            <div className="rounded-xl bg-blue-500/10 border border-blue-300/10 p-4">

              <div className="flex gap-3">

                <svg
                  className="w-5 h-5 text-blue-200 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4m0 4h.01M10.29 3.86l-8.1 14a2 2 0 001.74 3l8.1-14a2 2 0 00-3.42 0z"
                  />
                </svg>

                <div>
                  <p className="text-sm font-semibold text-blue-100">
                    Need to update your information?
                  </p>

                  <p className="text-xs text-blue-100/60 mt-1 leading-relaxed">
                    Please contact your school administrator if
                    you need to change your registered name,
                    phone number, email address, or other
                    account information.
                  </p>
                </div>

              </div>

            </div>

            {/* ==================================================
                Actions
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">

              <button
                type="button"
                onClick={async () => {
                  try {
                    await Promise.all([
                      refetch(),
                      refetchChildren(),
                    ]);

                    toast.success(
                      "Profile and children refreshed.",
                    );
                  } catch (err) {
                    toast.error(
                      "Unable to refresh profile.",
                    );
                  }
                }}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
                    strokeWidth={1.8}
                    d="M4 4v5h5M20 20v-5h-5M5.1 15a7 7 0 0011.9 2.1L20 14M4 10a7 7 0 0111.9-2.1L20 10"
                  />
                </svg>

                Refresh Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              >
                Back to Dashboard
              </button>

            </div>

          </div>

        </div>

        <div className="text-center mt-5 text-white/40 text-xs">
          Your parent profile is managed by your school.
        </div>

      </div>

    </div>
  );
};

// ========================================================
// Reusable information card
// ========================================================

const InfoCard = ({
  label,
  value,
  fallback = "Not provided",
}) => {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">

      <p className="text-xs uppercase tracking-wide text-white/40">
        {label}
      </p>

      <p className="text-sm font-semibold text-white mt-2">
        {value || fallback}
      </p>

    </div>
  );
};

// ========================================================
// Child information
// ========================================================

const ChildInfo = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-black/10 border border-white/5 p-3">

      <p className="text-[11px] uppercase tracking-wide text-white/30">
        {label}
      </p>

      <p className="text-xs font-semibold text-white/80 mt-1">
        {value || "Not available"}
      </p>

    </div>
  );
};

// ========================================================
// Relationship label
// ========================================================

const formatRelationship = (relationship) => {
  if (!relationship) {
    return "Guardian";
  }

  return relationship
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
};

// ========================================================
// Status card
// ========================================================

const StatusCard = ({
  label,
  isActive,
}) => {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isActive
          ? "bg-emerald-500/5 border-emerald-300/10"
          : "bg-red-500/5 border-red-300/10"
      }`}
    >

      <p className="text-xs uppercase tracking-wide text-white/40">
        {label}
      </p>

      <div className="flex items-center gap-2 mt-2">

        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isActive
              ? "bg-emerald-300"
              : "bg-red-300"
          }`}
        />

        <p className="text-sm font-semibold text-white">
          {isActive ? "Active" : "Inactive"}
        </p>

      </div>

    </div>
  );
};

export default MyParentProfileScreen;
