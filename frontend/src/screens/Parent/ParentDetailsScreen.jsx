import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  CheckCircle2,
  UserCheck,
  UserX,
  Edit,
  Users,
  GraduationCap,
  School,
  Phone,
  Mail,
  ExternalLink,
  Star,
} from "lucide-react";

import {
  useGetParentDetailsQuery,
  useUpdateParentStatusMutation,
} from "../../slices/parentApiSlice";

import {
  useGetStudentsByParentQuery,
} from "../../slices/studentParentApiSlice";

const ParentDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ======================================================
  // Parent details
  // ======================================================

  const {
    data: parent,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetParentDetailsQuery(id);

  // ======================================================
  // Parent's children
  //
  // Controller:
  // getStudentsByParent
  //
  // GET /student-parents/parent/:parentId
  // ======================================================

  const {
    data: children = [],
    isLoading: isChildrenLoading,
    isFetching: isChildrenFetching,
    isError: isChildrenError,
    error: childrenError,
    refetch: refetchChildren,
  } = useGetStudentsByParentQuery(id, {
    skip: !id,
  });

  // ======================================================
  // Update parent status
  // ======================================================

  const [
    updateParentStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateParentStatusMutation();

  const updateStatusHandler = async () => {
    if (!parent?._id) {
      return;
    }

    const nextStatus = !parent.isActive;

    const action = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this parent profile?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateParentStatus({
        id: parent._id,
        isActive: nextStatus,
      }).unwrap();

      toast.success(
        `Parent profile ${
          nextStatus ? "activated" : "deactivated"
        } successfully`,
      );

      await refetch();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update parent status";

      toast.error(message);
    }
  };

  // ======================================================
  // Navigation
  // ======================================================

  const handleBack = () => {
    navigate("/parents");
  };

  const handleEdit = () => {
    if (!parent?._id) return;

    navigate(`/parents/${parent._id}/edit`);
  };

  const handleViewStudent = (studentId) => {
    if (!studentId) return;

    navigate(`/admin/students/${studentId}`);
  };

  // ======================================================
  // Helpers
  // ======================================================

  const getStudent = (relationship) => {
    return relationship?.student;
  };

  const getStudentName = (relationship) => {
    return (
      relationship?.student?.user?.name ||
      "Unnamed Student"
    );
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part[0]?.toUpperCase(),
        )
        .join("") || "S"
    );
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case "MALE":
        return "Male";

      case "FEMALE":
        return "Female";

      case "OTHER":
        return "Other";

      default:
        return gender || "-";
    }
  };

  const getStreamLabel = (stream) => {
    switch (stream) {
      case "SCIENCE":
        return "Science";

      case "COMMERCE":
        return "Commerce";

      case "HUMANITIES":
        return "Humanities";

      default:
        return stream || "-";
    }
  };

  // ======================================================
  // Loading
  // ======================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10" />

              <div className="flex-1 space-y-3">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>

            <div className="h-24 bg-white/10 rounded-xl" />

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-20 bg-white/10 rounded-xl" />
              <div className="h-20 bg-white/10 rounded-xl" />
              <div className="h-20 bg-white/10 rounded-xl" />
              <div className="h-20 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // Error
  // ======================================================

  if (isError || !parent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-300/20 flex items-center justify-center">
            <UserX className="w-8 h-8 text-red-200" />
          </div>

          <h2 className="text-xl font-bold text-white mt-5">
            Unable to load parent
          </h2>

          <p className="text-sm text-white/60 mt-2">
            {error?.data?.message ||
              error?.error ||
              "The parent profile could not be found."}
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
              onClick={handleBack}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              Back to Parents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const parentName =
    parent.user?.name || "Unnamed Parent";

  const initials = getInitials(parentName);

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            Main Card
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="px-5 py-6 sm:px-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {initials}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                      {parentName}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        parent.isActive
                          ? "bg-emerald-400/10 text-emerald-200 border-emerald-300/20"
                          : "bg-red-400/10 text-red-200 border-red-300/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          parent.isActive
                            ? "bg-emerald-300"
                            : "bg-red-300"
                        }`}
                      />

                      {parent.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-white/60 mt-1">
                    Parent Profile
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="h-10 px-4 rounded-lg bg-cyan-500/20 border border-cyan-300/20 text-cyan-100 hover:bg-cyan-500/30 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Edit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              Profile Information
          ================================================== */}

          <div className="p-5 sm:p-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Personal Information */}

              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-300/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-200" />
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Personal Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <InfoRow
                    label="Full Name"
                    value={parent.user?.name}
                  />

                  <InfoRow
                    icon={<Phone className="w-3.5 h-3.5" />}
                    label="Phone Number"
                    value={parent.user?.phone}
                  />

                  <InfoRow
                    icon={<Mail className="w-3.5 h-3.5" />}
                    label="Email Address"
                    value={parent.user?.email}
                  />

                  <InfoRow
                    label="Role"
                    value={parent.user?.role}
                  />
                </div>
              </div>

              {/* School Information */}

              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-purple-400/10 border border-purple-300/10 flex items-center justify-center">
                    <School className="w-5 h-5 text-purple-200" />
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    School Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <InfoRow
                    label="School Name"
                    value={parent.school?.name}
                  />

                  <InfoRow
                    label="School Code"
                    value={parent.school?.code}
                  />

                  <InfoRow
                    label="Profile Status"
                    value={
                      parent.isActive
                        ? "Active"
                        : "Inactive"
                    }
                    valueClassName={
                      parent.isActive
                        ? "text-emerald-200"
                        : "text-red-200"
                    }
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                Children Section
            ================================================== */}

            <div className="mt-5 rounded-xl bg-white/5 border border-white/10 overflow-hidden">

              {/* Children header */}

              <div className="px-5 py-5 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-300/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-amber-200" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Children / Students
                      </h2>

                      <p className="text-sm text-white/50 mt-0.5">
                        Students currently associated with this parent
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isChildrenFetching && !isChildrenLoading && (
                      <span className="text-xs text-white/50">
                        Refreshing...
                      </span>
                    )}

                    <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-bold">
                      {children.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Children loading */}

              {isChildrenLoading && (
                <div className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-20 rounded-xl bg-white/5" />
                    <div className="h-20 rounded-xl bg-white/5" />
                  </div>
                </div>
              )}

              {/* Children error */}

              {isChildrenError && !isChildrenLoading && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-red-400/10 border border-red-300/10 flex items-center justify-center">
                    <UserX className="w-6 h-6 text-red-200" />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-white">
                    Unable to load children
                  </h3>

                  <p className="mt-1 text-xs text-white/50">
                    {childrenError?.data?.message ||
                      childrenError?.error ||
                      "Children information could not be loaded."}
                  </p>

                  <button
                    type="button"
                    onClick={() => refetchChildren()}
                    className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* No children */}

              {!isChildrenLoading &&
                !isChildrenError &&
                children.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-white/30" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-white">
                      No children linked
                    </h3>

                    <p className="mt-1 text-sm text-white/50 max-w-md mx-auto">
                      No active student-parent relationships were found
                      for this parent.
                    </p>
                  </div>
                )}

              {/* Children list */}

              {!isChildrenLoading &&
                !isChildrenError &&
                children.length > 0 && (
                  <div className="p-4 sm:p-5 space-y-3">

                    {children.map((relationship) => {
                      const student =
                        getStudent(relationship);

                      const studentName =
                        getStudentName(
                          relationship,
                        );

                      const studentId =
                        student?._id;

                      return (
                        <div
                          key={
                            relationship._id
                          }
                          className="group rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 p-4"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            {/* Student identity */}

                            <div className="flex items-start gap-3 min-w-0">

                              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-indigo-100">
                                  {getInitials(
                                    studentName,
                                  )}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold text-white truncate">
                                    {studentName}
                                  </h3>

                                  {relationship.isPrimary && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-300/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                                      <Star className="w-3 h-3 fill-current" />
                                      Primary
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs text-white/50">
                                  Admission No:{" "}
                                  <span className="text-white/70 font-medium">
                                    {student?.admissionNumber ||
                                      "-"}
                                  </span>
                                </p>

                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white/60">
                                    {student?.class
                                      ?.name ||
                                      "Class not assigned"}
                                  </span>

                                  <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white/60">
                                    {student?.section
                                      ?.name ||
                                      "Section not assigned"}
                                  </span>

                                  {relationship.relationship && (
                                    <span className="rounded-md bg-cyan-400/10 border border-cyan-300/10 px-2 py-1 text-[11px] text-cyan-200">
                                      {relationship.relationship}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Student information */}

                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">

                              <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-[10px] uppercase tracking-wide text-white/30">
                                  Gender
                                </span>

                                <span className="text-xs font-medium text-white/70">
                                  {getGenderLabel(
                                    student?.gender,
                                  )}
                                </span>
                              </div>

                              <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-[10px] uppercase tracking-wide text-white/30">
                                  Stream
                                </span>

                                <span className="text-xs font-medium text-white/70">
                                  {getStreamLabel(
                                    student?.stream,
                                  )}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewStudent(
                                    studentId,
                                  )
                                }
                                disabled={!studentId}
                                className="h-9 px-3 rounded-lg bg-indigo-500/20 border border-indigo-300/20 text-indigo-100 hover:bg-indigo-500/30 transition flex items-center gap-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Student
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* ==================================================
                Status Management
            ================================================== */}

            <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      parent.isActive
                        ? "bg-emerald-400/10 border border-emerald-300/10"
                        : "bg-red-400/10 border border-red-300/10"
                    }`}
                  >
                    {parent.isActive ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    ) : (
                      <UserX className="w-5 h-5 text-red-200" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Account Status
                    </h2>

                    <p className="text-sm text-white/50 mt-1">
                      {parent.isActive
                        ? "This parent profile is currently active."
                        : "This parent profile is currently inactive."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={updateStatusHandler}
                  disabled={isUpdatingStatus}
                  className={`h-11 px-5 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    parent.isActive
                      ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : parent.isActive ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Deactivate Parent
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Activate Parent
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ==================================================
                Footer Actions
            ================================================== */}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Parent
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
              >
                Back to Parent List
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-5 text-white/40 text-xs">
          Parent profile details
          {(isFetching ||
            isChildrenFetching) &&
            " • Updating..."}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// Reusable information row
// ========================================================

const InfoRow = ({
  icon,
  label,
  value,
  valueClassName = "text-white",
}) => {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-wide">
        {icon}
        {label}
      </span>

      <span
        className={`text-sm font-medium break-words ${valueClassName}`}
      >
        {value || "Not provided"}
      </span>
    </div>
  );
};

export default ParentDetailsScreen;
