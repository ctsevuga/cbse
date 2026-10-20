import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Edit,
  GraduationCap,
  Mail,
  Phone,
  School,
  UserCheck,
  UserX,
  Users,
  Plus,
  Trash2,
  UserRound,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetStudentDetailsQuery,
  useUpdateStudentStatusMutation,
} from "../../slices/studentApiSlice";

import {
  useGetParentsByStudentQuery,
  useUpdateStudentParentStatusMutation,
  useDeleteStudentParentMutation,
} from "../../slices/studentParentApiSlice";

const StudentDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
    ============================================================
    STUDENT DETAILS
    ============================================================

    Backend:

    GET /students/:id

    Response contains:

    {
      _id,
      admissionNumber,
      dateOfBirth,
      gender,
      stream,
      isActive,
      user,
      school,
      academicYear,
      class,
      section,
      subjects: [
        {
          subject: {
            _id,
            name,
            code
          }
        }
      ],
      createdAt,
      updatedAt
    }
  */

  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useGetStudentDetailsQuery(id, {
    skip: !id,
  });

  /*
    ============================================================
    PARENT RELATIONSHIPS
    ============================================================
  */

  const {
    data: parentRelationships = [],
    isLoading: isLoadingParents,
    isError: isParentsError,
    error: parentsError,
  } = useGetParentsByStudentQuery(id, {
    skip: !id,
  });

  /*
    ============================================================
    MUTATIONS
    ============================================================
  */

  const [
    updateStudentStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateStudentStatusMutation();

  const [
    updateStudentParentStatus,
    { isLoading: isUpdatingParentStatus },
  ] = useUpdateStudentParentStatusMutation();

  const [
    deleteStudentParent,
    { isLoading: isDeletingParent },
  ] = useDeleteStudentParentMutation();

  /*
    ============================================================
    STUDENT STATUS
    ============================================================
  */

  const handleUpdateStatus = async () => {
    if (!student) return;

    const newStatus = !student.isActive;

    const action = newStatus
      ? "activate"
      : "deactivate";

    const studentName =
      student.user?.name || "this student";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${studentName}?`,
    );

    if (!confirmed) return;

    try {
      await updateStudentStatus({
        id: student._id,
        isActive: newStatus,
      }).unwrap();

      toast.success(
        `Student ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully`,
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update student status",
      );
    }
  };

  /*
    ============================================================
    NAVIGATION
    ============================================================
  */

  const handleEdit = () => {
    if (!student?._id) return;

    navigate(
      `/admin/students/${student._id}/edit`,
    );
  };

  const handleBack = () => {
    navigate("/admin/students");
  };

  /*
    ============================================================
    ADD PARENT
    ============================================================
  */

  const handleAddParent = () => {
    if (!student?._id) return;

    navigate(
      `/admin/students/${student._id}/parents/add`,
    );
  };

  /*
    ============================================================
    VIEW PARENT RELATIONSHIP
    ============================================================
  */

  const handleViewParentRelationship = (
    relationshipId,
  ) => {
    if (!relationshipId) return;

    navigate(
      `/admin/student-parents/${relationshipId}`,
    );
  };

  /*
    ============================================================
    EDIT PARENT RELATIONSHIP
    ============================================================
  */

  const handleEditParentRelationship = (
    relationshipId,
  ) => {
    if (!relationshipId) return;

    navigate(
      `/admin/student-parents/${relationshipId}/edit`,
    );
  };

  /*
    ============================================================
    UPDATE PARENT RELATIONSHIP STATUS
    ============================================================
  */

  const handleUpdateParentRelationshipStatus =
    async (relationship) => {
      if (!relationship?._id) return;

      const newStatus =
        !relationship.isActive;

      const parentName =
        relationship.parent?.user?.name ||
        "this parent";

      const action = newStatus
        ? "activate"
        : "deactivate";

      const confirmed = window.confirm(
        `Are you sure you want to ${action} the relationship with ${parentName}?`,
      );

      if (!confirmed) return;

      try {
        await updateStudentParentStatus({
          studentParentId:
            relationship._id,
          isActive: newStatus,
        }).unwrap();

        toast.success(
          `Parent relationship ${
            newStatus
              ? "activated"
              : "deactivated"
          } successfully`,
        );
      } catch (err) {
        toast.error(
          err?.data?.message ||
            err?.error ||
            "Failed to update parent relationship",
        );
      }
    };

  /*
    ============================================================
    DELETE PARENT RELATIONSHIP
    ============================================================
  */

  const handleDeleteParentRelationship =
    async (relationship) => {
      if (!relationship?._id) return;

      const parentName =
        relationship.parent?.user?.name ||
        "this parent";

      const confirmed = window.confirm(
        `Are you sure you want to permanently remove ${parentName} from this student's parent/guardian relationships?`,
      );

      if (!confirmed) return;

      try {
        await deleteStudentParent(
          relationship._id,
        ).unwrap();

        toast.success(
          "Parent relationship removed successfully",
        );
      } catch (err) {
        toast.error(
          err?.data?.message ||
            err?.error ||
            "Failed to remove parent relationship",
        );
      }
    };

  /*
    ============================================================
    HELPERS
    ============================================================
  */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const getStreamLabel = (stream) => {
  if (!stream) return "-";

  const streamName =
    typeof stream === "object"
      ? stream.name || stream.code
      : stream;

  if (!streamName) return "-";

  switch (streamName.toUpperCase()) {
    case "SCIENCE":
      return "Science";

    case "COMMERCE":
      return "Commerce";

    case "HUMANITIES":
      return "Humanities";

    default:
      return streamName;
  }
};

  const getGenderLabel = (gender) => {
    if (!gender) return "-";

    switch (gender.toUpperCase()) {
      case "MALE":
        return "Male";

      case "FEMALE":
        return "Female";

      case "OTHER":
        return "Other";

      default:
        return gender;
    }
  };

  const getRelationshipLabel = (
    relationship,
  ) => {
    if (!relationship) return "-";

    switch (
      relationship.toUpperCase()
    ) {
      case "FATHER":
        return "Father";

      case "MOTHER":
        return "Mother";

      case "GUARDIAN":
        return "Guardian";

      case "GRANDFATHER":
        return "Grandfather";

      case "GRANDMOTHER":
        return "Grandmother";

      case "UNCLE":
        return "Uncle";

      case "AUNT":
        return "Aunt";

      case "OTHER":
        return "Other";

      default:
        return relationship;
    }
  };

  /*
    ============================================================
    LOADING
    ============================================================
  */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading student details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
    ============================================================
    ERROR
    ============================================================
  */

  if (isError || !student) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Unable to load student
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {error?.data?.message ||
                error?.error ||
                "Student details could not be loaded."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
    ============================================================
    NORMALIZE STUDENT SUBJECTS
    ============================================================

    IMPORTANT:

    Old frontend expected:

    student.subjectCombination

    New controller returns:

    student.subjects = [
      {
        subject: {
          _id,
          name,
          code
        }
      }
    ]

    Normalize here so the UI remains simple.
  */

  const subjects = Array.isArray(student.subjects)
    ? student.subjects
        .map((item) => item?.subject)
        .filter(Boolean)
    : [];

  /*
    ============================================================
    PAGE
    ============================================================
  */

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  Student Details
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  View student profile, academic information,
                  and parent relationships
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Edit className="h-4 w-4" />
                Edit Student
              </button>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  student.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {student.isActive ? (
                  <>
                    <UserX className="h-4 w-4" />

                    {isUpdatingStatus
                      ? "Deactivating..."
                      : "Deactivate Student"}
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />

                    {isUpdatingStatus
                      ? "Activating..."
                      : "Activate Student"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* STUDENT SUMMARY */}

        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="bg-indigo-600 px-6 py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-indigo-600 shadow">
                  {(student.user?.name || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white md:text-2xl">
                    {student.user?.name ||
                      "Unnamed Student"}
                  </h2>

                  <p className="mt-1 text-sm text-indigo-100">
                    Admission No:{" "}
                    <span className="font-semibold text-white">
                      {student.admissionNumber}
                    </span>
                  </p>
                </div>
              </div>

              {student.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm">
                  <UserX className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={<School className="h-4 w-4" />}
              label="School"
              value={student.school?.name}
            />

            <InfoItem
              icon={<GraduationCap className="h-4 w-4" />}
              label="Academic Year"
              value={student.academicYear?.name}
            />

            <InfoItem
              icon={<GraduationCap className="h-4 w-4" />}
              label="Class"
              value={student.class?.name}
            />

            <InfoItem
              icon={<UsersIcon />}
              label="Section"
              value={student.section?.name}
            />
          </div>
        </div>

        {/* PERSONAL INFORMATION */}

        <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <SectionHeader
            icon={<CircleUserRound className="h-5 w-5" />}
            title="Personal Information"
          />

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Full Name"
              value={student.user?.name}
            />

            <DetailItem
              label="Admission Number"
              value={student.admissionNumber}
            />

            <DetailItem
              label="Gender"
              value={getGenderLabel(student.gender)}
            />

            <DetailItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date of Birth"
              value={formatDate(student.dateOfBirth)}
            />

            <DetailItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={student.user?.email}
            />

            <DetailItem
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={student.user?.phone}
            />
          </div>
        </div>

        {/* ACADEMIC INFORMATION */}

        <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <SectionHeader
            icon={<GraduationCap className="h-5 w-5" />}
            title="Academic Information"
          />

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Academic Year"
              value={student.academicYear?.name}
            />

            <DetailItem
              label="Class"
              value={
                student.class?.code
                  ? `${student.class.name || ""} (${student.class.code})`
                  : student.class?.name
              }
            />

            <DetailItem
              label="Section"
              value={student.section?.name}
            />

            <DetailItem
              label="Stream"
              value={getStreamLabel(student.stream)}
            />
          </div>
        </div>

        {/* SUBJECTS */}

        <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <SectionHeader
            icon={<GraduationCap className="h-5 w-5" />}
            title="Subject Combination"
          />

          <div className="p-6">
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-indigo-800">
                      {subject.name || "Subject"}
                    </p>

                    {subject.code && (
                      <p className="mt-0.5 text-xs text-indigo-500">
                        {subject.code}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No subjects have been assigned to this student.
              </p>
            )}
          </div>
        </div>

        {/* PARENTS / GUARDIANS */}

        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Parents / Guardians
                </h2>

                <p className="text-xs text-gray-500">
                  Manage people associated with this student
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddParent}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Parent
            </button>
          </div>

          <div className="p-6">
            {isLoadingParents ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading parents and guardians...
                  </p>
                </div>
              </div>
            ) : isParentsError ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-center">
                <UserX className="mx-auto h-7 w-7 text-red-500" />

                <p className="mt-2 text-sm font-medium text-red-700">
                  Unable to load parent relationships
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {parentsError?.data?.message ||
                    parentsError?.error ||
                    "Please try again later."}
                </p>
              </div>
            ) : parentRelationships.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                  <HeartHandshake className="h-7 w-7 text-indigo-600" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-800">
                  No parents or guardians assigned
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  Add a parent or guardian relationship to
                  connect this student with their family account.
                </p>

                <button
                  type="button"
                  onClick={handleAddParent}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Parent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {parentRelationships.map(
                  (relationship) => {
                    const parent =
                      relationship.parent;

                    const parentUser =
                      parent?.user;

                    const parentName =
                      parentUser?.name ||
                      "Unnamed Parent";

                    return (
                      <div
                        key={relationship._id}
                        className={`overflow-hidden rounded-xl border transition ${
                          relationship.isActive
                            ? "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                                relationship.isActive
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {parentUser?.name ? (
                                <span className="text-lg font-bold">
                                  {parentUser.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              ) : (
                                <UserRound className="h-6 w-6" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-gray-800">
                                {parentName}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                  {getRelationshipLabel(
                                    relationship.relationship,
                                  )}
                                </span>

                                {relationship.isPrimary && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {relationship.isActive ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600">
                              <UserX className="h-3.5 w-3.5" />
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                          <ParentInfo
                            icon={<Phone className="h-4 w-4" />}
                            label="Phone"
                            value={parentUser?.phone}
                          />

                          <ParentInfo
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={parentUser?.email}
                          />

                          <ParentInfo
                            icon={<UserCheck className="h-4 w-4" />}
                            label="Account Role"
                            value={parentUser?.role}
                          />

                          <ParentInfo
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            label="Relationship Status"
                            value={
                              relationship.isActive
                                ? "Active"
                                : "Inactive"
                            }
                          />
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewParentRelationship(
                                relationship._id,
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 sm:flex-none"
                          >
                            <UserRound className="h-4 w-4" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEditParentRelationship(
                                relationship._id,
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:flex-none"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Relationship
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateParentRelationshipStatus(
                                relationship,
                              )
                            }
                            disabled={isUpdatingParentStatus}
                            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
                              relationship.isActive
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {relationship.isActive ? (
                              <>
                                <UserX className="h-4 w-4" />
                                {isUpdatingParentStatus
                                  ? "Deactivating..."
                                  : "Deactivate"}
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4" />
                                {isUpdatingParentStatus
                                  ? "Activating..."
                                  : "Activate"}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteParentRelationship(
                                relationship,
                              )
                            }
                            disabled={isDeletingParent}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                          >
                            <Trash2 className="h-4 w-4" />

                            {isDeletingParent
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <SectionHeader
            icon={<UserCheck className="h-5 w-5" />}
            title="Account Information"
          />

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Account Role"
              value={student.user?.role}
            />

            <DetailItem
              label="Account Status"
              value={
                student.user?.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <DetailItem
              label="Student Created"
              value={formatDate(student.createdAt)}
            />

            <DetailItem
              label="Last Updated"
              value={formatDate(student.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   SECTION HEADER
============================================================= */

const SectionHeader = ({
  icon,
  title,
}) => {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>
    </div>
  );
};

/* =============================================================
   DETAIL ITEM
============================================================= */

const DetailItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        {icon}
        <span>{label}</span>
      </div>

      <p className="break-words text-sm font-semibold text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
};

/* =============================================================
   INFO ITEM
============================================================= */

const InfoItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className="text-indigo-600">
          {icon}
        </span>

        {label}
      </div>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
};

/* =============================================================
   PARENT INFO
============================================================= */

const ParentInfo = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <span className="text-indigo-500">
          {icon}
        </span>

        {label}
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-gray-700">
        {value || "-"}
      </p>
    </div>
  );
};

/* =============================================================
   USERS ICON
============================================================= */

const UsersIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
};

export default StudentDetailsScreen;
