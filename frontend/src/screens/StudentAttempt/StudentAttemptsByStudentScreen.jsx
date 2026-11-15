import React, { useMemo, useState } from "react";

import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  History,
  Loader2,
  Pencil,
  RefreshCw,
  Target,
  Timer,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetTeacherStudentAttemptsQuery,
  useDeleteStudentAttemptMutation,
} from "../../slices/studentAttemptApiSlice";

import {
  useGetStudentsByTeacherAssignmentQuery,
} from "../../slices/studentApiSlice";

import {
  useGetMyTeacherAssignmentsQuery,
} from "../../slices/teacherAssignmentApiSlice";

const StudentAttemptsByStudentScreen = () => {
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // FILTER STATES
  // ---------------------------------------------------------

  const [selectedAssignmentType, setSelectedAssignmentType] =
    useState("");

  const [selectedSectionKey, setSelectedSectionKey] =
    useState("");

  const [studentId, setStudentId] = useState("");

  const [status, setStatus] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  // ---------------------------------------------------------
  // TEACHER ASSIGNMENTS
  // GET /api/teacher-assignments/my
  // ---------------------------------------------------------

 const { userInfo } = useSelector((state) => state.auth);

const schoolSlug = userInfo?.school?.slug;

const {
  data: teacherAssignments = [],
  isLoading: assignmentsLoading,
  error: assignmentsError,
} = useGetMyTeacherAssignmentsQuery(schoolSlug, {
  skip: !schoolSlug,
});

  // ---------------------------------------------------------
  // AVAILABLE ASSIGNMENT TYPES
  // ---------------------------------------------------------

  const assignmentTypes = useMemo(() => {
    return [
      ...new Set(
        teacherAssignments
          .filter((assignment) => assignment.isActive !== false)
          .map((assignment) => assignment.assignmentType)
          .filter(Boolean)
      ),
    ];
  }, [teacherAssignments]);

  // If the teacher has only one assignment type,
  // automatically select that type.
  //
  // If the teacher has both types, use the dropdown selection.

  const assignmentType =
    assignmentTypes.length === 1
      ? assignmentTypes[0]
      : selectedAssignmentType;

  // ---------------------------------------------------------
  // SECTION OPTIONS
  //
  // Multiple SUBJECT_TEACHER assignments can exist for
  // the same section because each subject has an assignment.
  //
  // Therefore, group assignments by:
  // academicYear + class + section.
  // ---------------------------------------------------------

  const getId = (value) => {
    if (!value) return "";

    return typeof value === "object"
      ? value._id || ""
      : value;
  };

  const sectionOptions = useMemo(() => {
    if (!assignmentType) return [];

    const filteredAssignments = teacherAssignments.filter(
      (assignment) =>
        assignment.isActive !== false &&
        assignment.assignmentType === assignmentType
    );

    const uniqueSections = new Map();

    filteredAssignments.forEach((assignment) => {
      const academicYearId = getId(assignment.academicYear);
      const classId = getId(assignment.class);
      const sectionId = getId(assignment.section);

      if (!academicYearId || !classId || !sectionId) {
        return;
      }

      const key = `${academicYearId}_${classId}_${sectionId}`;

      if (!uniqueSections.has(key)) {
        uniqueSections.set(key, {
          key,
          academicYearId,
          classId,
          sectionId,
          academicYear: assignment.academicYear,
          class: assignment.class,
          section: assignment.section,
        });
      }
    });

    return Array.from(uniqueSections.values()).sort((a, b) => {
      const yearA = a.academicYear?.name || "";
      const yearB = b.academicYear?.name || "";

      return yearA.localeCompare(yearB);
    });
  }, [teacherAssignments, assignmentType]);

  // ---------------------------------------------------------
  // SELECTED SECTION
  // ---------------------------------------------------------

  const selectedSection = useMemo(() => {
    return (
      sectionOptions.find(
        (section) => section.key === selectedSectionKey
      ) || null
    );
  }, [sectionOptions, selectedSectionKey]);

  // ---------------------------------------------------------
  // STUDENTS UNDER SELECTED TEACHER ASSIGNMENT
  //
  // GET /api/students/teacher-assignment
  //
  // Query parameters:
  // assignmentType
  // sectionId
  // academicYearId
  // ---------------------------------------------------------

  const {
    data: students = [],
    isLoading: studentsLoading,
    isFetching: studentsFetching,
    error: studentsError,
  } = useGetStudentsByTeacherAssignmentQuery(
    {
      assignmentType,
      sectionId: selectedSection?.sectionId,
      academicYearId: selectedSection?.academicYearId,
    },
    {
      skip:
        !assignmentType ||
        !selectedSection?.sectionId ||
        !selectedSection?.academicYearId,
    }
  );

  // ---------------------------------------------------------
  // SELECTED STUDENT ASSESSMENT ATTEMPTS
  //
  // GET /api/student-attempts/teacher/student/:studentId
  //
  // Returns attempts across all subjects.
  // ---------------------------------------------------------

  const {
    data: attempts = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherStudentAttemptsQuery(
    {
      studentId,
      ...(status ? { status } : {}),
    },
    {
      skip: !studentId,
    }
  );

  // ---------------------------------------------------------
  // DELETE ATTEMPT
  // ---------------------------------------------------------

  const [deleteStudentAttempt, { isLoading: isDeleting }] =
    useDeleteStudentAttemptMutation();
      // ---------------------------------------------------------
  // STUDENT NAME
  // ---------------------------------------------------------

  const getStudentName = (student) => {
    if (!student) return "Student";

    if (student.name) return student.name;

    const fullName = [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      fullName ||
      student.studentName ||
      student.user?.name ||
      "Student"
    );
  };

  // ---------------------------------------------------------
  // ASSESSMENT NAME
  // ---------------------------------------------------------

  const getAssessmentName = (assessment) => {
    if (!assessment) return "Assessment";

    return (
      assessment.title ||
      assessment.name ||
      assessment.assessmentName ||
      "Assessment"
    );
  };

  // ---------------------------------------------------------
  // STATUS CONFIGURATION
  // ---------------------------------------------------------

  const getStatusConfig = (value) => {
    const configs = {
      IN_PROGRESS: {
        label: "In Progress",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      },

      SUBMITTED: {
        label: "Submitted",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
        icon: CheckCircle2,
      },

      EVALUATING: {
        label: "Evaluating",
        className:
          "border-purple-200 bg-purple-50 text-purple-700",
        icon: Loader2,
      },

      EVALUATED: {
        label: "Evaluated",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: Award,
      },

      ABANDONED: {
        label: "Abandoned",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
        icon: XCircle,
      },

      EXPIRED: {
        label: "Expired",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
      },
    };

    return (
      configs[value] || {
        label: value || "Unknown",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
        icon: FileText,
      }
    );
  };

  // ---------------------------------------------------------
  // DATE AND TIME FORMATTING
  // ---------------------------------------------------------

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0 min";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours && remainingMinutes) {
      return `${hours}h ${remainingMinutes}m`;
    }

    if (hours) {
      return `${hours}h`;
    }

    return `${remainingMinutes}m`;
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0m";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (!minutes) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  // ---------------------------------------------------------
  // SCORE PERCENTAGE
  // ---------------------------------------------------------

  const getPercentage = (attempt) => {
    if (
      !attempt.totalMarks ||
      attempt.obtainedMarks === undefined ||
      attempt.obtainedMarks === null
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (attempt.obtainedMarks / attempt.totalMarks) * 100
      )
    );
  };
    // ---------------------------------------------------------
  // ASSIGNMENT TYPE CHANGE
  // ---------------------------------------------------------

  const handleAssignmentTypeChange = (event) => {
    setSelectedAssignmentType(event.target.value);

    setSelectedSectionKey("");
    setStudentId("");
    setStatus("");
  };

  // ---------------------------------------------------------
  // SECTION CHANGE
  // ---------------------------------------------------------

  const handleSectionChange = (event) => {
    setSelectedSectionKey(event.target.value);

    setStudentId("");
    setStatus("");
  };

  // ---------------------------------------------------------
  // STUDENT CHANGE
  // ---------------------------------------------------------

  const handleStudentChange = (event) => {
    setStudentId(event.target.value);
    setStatus("");
  };

  // ---------------------------------------------------------
  // STATUS CHANGE
  // ---------------------------------------------------------

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  // ---------------------------------------------------------
  // CLEAR FILTERS
  //
  // Retain assignment type and section.
  // Clear only student and status.
  // ---------------------------------------------------------

  const clearFilters = () => {
    setStudentId("");
    setStatus("");
  };

  // ---------------------------------------------------------
  // VIEW ATTEMPT
  // ---------------------------------------------------------

  const handleView = (attempt) => {
    navigate(`/student-attempts/${attempt._id}`);
  };

  // ---------------------------------------------------------
  // EDIT ATTEMPT
  // ---------------------------------------------------------

  const handleEdit = (attempt) => {
    navigate(`/student-attempts/${attempt._id}/edit`);
  };

  // ---------------------------------------------------------
  // DELETE ATTEMPT
  // ---------------------------------------------------------

  const handleDelete = async (attempt) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete attempt #${attempt.attemptNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleteId(attempt._id);

      await deleteStudentAttempt(attempt._id).unwrap();

      await refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          "Unable to delete the student attempt."
      );
    } finally {
      setDeleteId(null);
    }
  };
    return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={!studentId || isFetching}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* =====================================================
            MAIN CONTAINER
        ===================================================== */}

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">

          {/* ===================================================
              TITLE
          =================================================== */}

          <div className="border-b border-white/10 px-5 py-7 sm:px-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg">
                  <History size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Student Attempts
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    View and manage assessment attempts for students
                    under your teaching assignments
                  </p>
                </div>
              </div>

              {studentId && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-white">

                  <Users size={21} />

                  <div>
                    <p className="text-xs text-white/60">
                      Attempts
                    </p>

                    <p className="text-xl font-bold">
                      {attempts.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              FILTER SECTION
          =================================================== */}

          <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-8">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              {/* -----------------------------------------------
                  ASSIGNMENT TYPE

                  Display only when both assignment types exist.
              ------------------------------------------------ */}

              {assignmentTypes.length > 1 && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Users size={17} />
                    Assignment Type
                  </label>

                  <select
                    value={selectedAssignmentType}
                    onChange={handleAssignmentTypeChange}
                    disabled={assignmentsLoading}
                    className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Assignment Type
                    </option>

                    <option value="CLASS_TEACHER">
                      Class Teacher
                    </option>

                    <option value="SUBJECT_TEACHER">
                      Subject Teacher
                    </option>
                  </select>
                </div>
              )}

              {/* -----------------------------------------------
                  SECTION
              ------------------------------------------------ */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Filter size={17} />
                  Section
                </label>

                <select
                  value={selectedSectionKey}
                  onChange={handleSectionChange}
                  disabled={
                    assignmentsLoading ||
                    !assignmentType ||
                    sectionOptions.length === 0
                  }
                  className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {assignmentsLoading
                      ? "Loading assignments..."
                      : !assignmentType
                      ? "Select Assignment Type First"
                      : sectionOptions.length === 0
                      ? "No Assigned Sections"
                      : "Select Section"}
                  </option>

                  {sectionOptions.map((section) => (
                    <option
                      key={section.key}
                      value={section.key}
                    >
                      {section.class?.name || "Class"} -{" "}
                      {section.section?.name || "Section"}{" "}
                      ({section.academicYear?.name || "Academic Year"})
                    </option>
                  ))}
                </select>
              </div>

              {/* -----------------------------------------------
                  STUDENT
              ------------------------------------------------ */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <UserRound size={17} />
                  Student
                </label>

                <select
                  value={studentId}
                  onChange={handleStudentChange}
                  disabled={
                    !selectedSection ||
                    studentsLoading ||
                    studentsFetching ||
                    students.length === 0
                  }
                  className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {!selectedSection
                      ? "Select Section First"
                      : studentsLoading || studentsFetching
                      ? "Loading Students..."
                      : students.length === 0
                      ? "No Students Found"
                      : "Select Student"}
                  </option>

                  {students.map((student) => (
                    <option
                      key={student._id}
                      value={student._id}
                    >
                      {getStudentName(student)}
                    </option>
                  ))}
                </select>
              </div>

              {/* -----------------------------------------------
                  STATUS
              ------------------------------------------------ */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Filter size={17} />
                  Status
                </label>

                <select
                  value={status}
                  onChange={handleStatusChange}
                  disabled={!studentId}
                  className="h-12 w-full rounded-xl border border-white/30 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    All Statuses
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="SUBMITTED">
                    Submitted
                  </option>

                  <option value="EVALUATING">
                    Evaluating
                  </option>

                  <option value="EVALUATED">
                    Evaluated
                  </option>

                  <option value="ABANDONED">
                    Abandoned
                  </option>

                  <option value="EXPIRED">
                    Expired
                  </option>
                </select>
              </div>
            </div>

            {/* -----------------------------------------------
                SELECTED ASSIGNMENT INFORMATION
            ------------------------------------------------ */}

            {assignmentType && (
              <div className="mt-4 flex flex-wrap items-center gap-2">

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                  {assignmentType === "CLASS_TEACHER"
                    ? "Class Teacher"
                    : "Subject Teacher"}
                </span>

                {selectedSection && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                    {selectedSection.class?.name} -{" "}
                    {selectedSection.section?.name}
                  </span>
                )}

                {selectedSection?.academicYear?.name && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                    {selectedSection.academicYear.name}
                  </span>
                )}
              </div>
            )}

            {/* -----------------------------------------------
                CLEAR STUDENT AND STATUS FILTERS
            ------------------------------------------------ */}

            {(studentId || status) && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ===================================================
              CONTENT AREA
          =================================================== */}

          {/* -----------------------------------------------
              ASSIGNMENTS LOADING
          ------------------------------------------------ */}

          {assignmentsLoading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-white">

                <Loader2
                  size={38}
                  className="animate-spin"
                />

                <p className="text-sm text-white/70">
                  Loading teacher assignments...
                </p>
              </div>
            </div>

          ) : assignmentsError ? (

            /* -----------------------------------------------
               ASSIGNMENTS ERROR
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <XCircle
                size={36}
                className="mx-auto text-red-200"
              />

              <h2 className="mt-5 text-xl font-bold text-white">
                Unable to Load Teacher Assignments
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                {assignmentsError?.data?.message ||
                  "An error occurred while loading teacher assignments."}
              </p>
            </div>

          ) : assignmentTypes.length === 0 ? (

            /* -----------------------------------------------
               NO ASSIGNMENTS
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <Users
                size={38}
                className="mx-auto text-white/80"
              />

              <h2 className="mt-6 text-xl font-bold text-white">
                No Active Teacher Assignments
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                You do not have any active class teacher or
                subject teacher assignments for the current
                account.
              </p>
            </div>

          ) : assignmentTypes.length > 1 && !assignmentType ? (

            /* -----------------------------------------------
               SELECT ASSIGNMENT TYPE
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <Users
                size={38}
                className="mx-auto text-white/80"
              />

              <h2 className="mt-6 text-xl font-bold text-white">
                Select Assignment Type
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                You have both Class Teacher and Subject Teacher
                assignments. Select an assignment type to view
                the corresponding sections and students.
              </p>
            </div>

          ) : !selectedSection ? (

            /* -----------------------------------------------
               SELECT SECTION
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <Users
                size={38}
                className="mx-auto text-white/80"
              />

              <h2 className="mt-6 text-xl font-bold text-white">
                Select a Section
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                Select a section assigned to you to load its
                students.
              </p>
            </div>

          ) : studentsLoading || studentsFetching ? (

            /* -----------------------------------------------
               STUDENTS LOADING
            ------------------------------------------------ */

            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-white">

                <Loader2
                  size={38}
                  className="animate-spin"
                />

                <p className="text-sm text-white/70">
                  Loading assigned students...
                </p>
              </div>
            </div>

          ) : studentsError ? (

            /* -----------------------------------------------
               STUDENTS ERROR
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <XCircle
                size={36}
                className="mx-auto text-red-200"
              />

              <h2 className="mt-5 text-xl font-bold text-white">
                Unable to Load Students
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                {studentsError?.data?.message ||
                  "An error occurred while loading assigned students."}
              </p>
            </div>

          ) : students.length === 0 ? (

            /* -----------------------------------------------
               NO STUDENTS
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <UserRound
                size={38}
                className="mx-auto text-white/80"
              />

              <h2 className="mt-6 text-xl font-bold text-white">
                No Students Found
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                No active students were found in the selected
                section.
              </p>
            </div>

          ) : !studentId ? (

            /* -----------------------------------------------
               SELECT STUDENT
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white">
                <UserRound size={34} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                Select a Student
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                Select a student from the dropdown above to view
                all of their assessment attempts across subjects.
              </p>
            </div>

          ) : isLoading ? (

            /* -----------------------------------------------
               ATTEMPTS LOADING
            ------------------------------------------------ */

            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-white">

                <Loader2
                  size={38}
                  className="animate-spin"
                />

                <p className="text-sm text-white/70">
                  Loading student attempts...
                </p>
              </div>
            </div>

          ) : error ? (

            /* -----------------------------------------------
               ATTEMPTS ERROR
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-100">
                <XCircle size={32} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Unable to Load Attempts
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                {error?.data?.message ||
                  "An error occurred while loading student attempts."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Try Again
              </button>
            </div>

          ) : attempts.length === 0 ? (

            /* -----------------------------------------------
               NO ATTEMPTS
            ------------------------------------------------ */

            <div className="px-5 py-20 text-center sm:px-8">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white">
                <FileText size={34} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                No Attempts Found
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/65">
                No assessment attempts were found for the selected
                student and status.
              </p>
            </div>

          ) : (

            /* -----------------------------------------------
               ATTEMPT CARDS
            ------------------------------------------------ */

            
<div className="grid grid-cols-1 gap-3 p-3 sm:p-4 xl:grid-cols-2">
  {attempts.map((attempt) => {
    const statusConfig = getStatusConfig(attempt.status);
    const StatusIcon = statusConfig.icon;
    const percentage = getPercentage(attempt);

    return (
      <div
        key={attempt._id}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition hover:shadow-lg"
      >
        {/* COMPACT HEADER */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                <FileText size={12} />
                Assessment Attempt #{attempt.attemptNumber}
              </div>

              <h2 className="mt-1 truncate text-sm font-bold text-gray-800">
                {getAssessmentName(attempt.assessment)}
              </h2>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                <UserRound size={12} />
                <span className="truncate">
                  {getStudentName(attempt.student)}
                </span>
              </div>
            </div>

            <div
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusConfig.className}`}
            >
              <StatusIcon
                size={12}
                className={
                  attempt.status === "EVALUATING"
                    ? "animate-spin"
                    : ""
                }
              />
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* COMPACT ATTEMPT DETAILS */}
        <div className="p-3">

          {/* STATISTICS */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg bg-indigo-50 px-2 py-2">
              <div className="flex items-center gap-1 text-indigo-500">
                <Target size={12} />
                <span className="text-[10px] font-medium">
                  Attempt
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-800">
                #{attempt.attemptNumber}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 px-2 py-2">
              <div className="flex items-center gap-1 text-purple-500">
                <FileText size={12} />
                <span className="text-[10px] font-medium">
                  Questions
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-800">
                {attempt.attemptedQuestions || 0}/
                {attempt.totalQuestions || 0}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 px-2 py-2">
              <div className="flex items-center gap-1 text-emerald-500">
                <Award size={12} />
                <span className="text-[10px] font-medium">
                  Marks
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-800">
                {attempt.obtainedMarks || 0}/
                {attempt.totalMarks || 0}
              </p>
            </div>

            <div className="rounded-lg bg-sky-50 px-2 py-2">
              <div className="flex items-center gap-1 text-sky-500">
                <Timer size={12} />
                <span className="text-[10px] font-medium">
                  Duration
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-800">
                {formatDuration(attempt.durationMinutes)}
              </p>
            </div>
          </div>

          {/* EVALUATED SCORE - COMPACT */}
          {attempt.status === "EVALUATED" && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Award size={15} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  Score
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-700">
                  {attempt.obtainedMarks || 0}/
                  {attempt.totalMarks || 0}
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {percentage}%
                </span>
              </div>
            </div>
          )}

          {/* DATE AND TIME INFORMATION */}
          <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500">
                <CalendarDays size={13} />
                Started
              </span>

              <span className="text-right font-medium text-gray-700">
                {formatDateTime(attempt.startedAt)}
              </span>
            </div>

            {attempt.submittedAt && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <CheckCircle2 size={13} />
                  Submitted
                </span>

                <span className="text-right font-medium text-gray-700">
                  {formatDateTime(attempt.submittedAt)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock3 size={13} />
                Time Spent
              </span>

              <span className="font-medium text-gray-700">
                {formatTimeSpent(attempt.timeSpent)}
              </span>
            </div>
          </div>

          {/* COMPACT ACTION BUTTONS */}
          <div className="mt-3 grid grid-cols-3 gap-2">

            <button
              type="button"
              onClick={() => handleView(attempt)}
              className="flex h-9 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-2 text-xs font-semibold text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700"
            >
              <Eye size={14} />
              View
            </button>

            <button
              type="button"
              onClick={() => handleEdit(attempt)}
              className="flex h-9 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-2 text-xs font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-purple-700"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(attempt)}
              disabled={isDeleting && deleteId === attempt._id}
              className="flex h-9 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-2 text-xs font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting && deleteId === attempt._id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>

          </div>
        </div>
      </div>
    );
  })}
</div>

          )}
        </div>
      </div>
    </div>
  );
};
export default StudentAttemptsByStudentScreen;