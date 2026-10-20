import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  useGetTeachersQuery,
  useDeleteTeacherMutation,
} from "../../slices/teacherApiSlice";

import {
  useGetActiveSchoolsQuery,
} from "../../slices/schoolApiSlice";

// ----------------------------------------------------
// Change these routes if your application uses
// different paths.
// ----------------------------------------------------
const TEACHER_CREATE_ROUTE = "/teachers/create";

const teacherViewRoute = (id) =>
  `/teachers/${id}`;

const teacherEditRoute = (id) =>
  `/teachers/${id}/edit`;

const TeacherListScreen = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector(
    (state) => state.auth,
  );

  const isSuperAdmin =
    userInfo?.role === "SUPER_ADMIN";

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  const [selectedSchool, setSelectedSchool] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("true");

  const [employeeCode, setEmployeeCode] =
    useState("");

  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  // --------------------------------------------------
  // Active schools
  // --------------------------------------------------

  const {
    data: schoolsData,
    isLoading: isSchoolsLoading,
    isError: isSchoolsError,
  } = useGetActiveSchoolsQuery();

  const schools = useMemo(() => {
    if (Array.isArray(schoolsData)) {
      return schoolsData;
    }

    return (
      schoolsData?.schools ||
      schoolsData?.data ||
      []
    );
  }, [schoolsData]);

  // --------------------------------------------------
  // Automatically select user's school for
  // non-super-admin users.
  // --------------------------------------------------

  useEffect(() => {
    if (
      !isSuperAdmin &&
      userInfo?.school
    ) {
      const schoolId =
        typeof userInfo.school === "object"
          ? userInfo.school._id
          : userInfo.school;

      if (schoolId) {
        setSelectedSchool(
          String(schoolId),
        );
      }
    }
  }, [
    isSuperAdmin,
    userInfo,
  ]);

  // --------------------------------------------------
  // Teachers
  // --------------------------------------------------

  const teacherQuery = {
    isActive: statusFilter,
  };

  /*
   * SUPER_ADMIN can filter by school.
   *
   * Other users don't need to send school because
   * the backend automatically uses req.schoolId.
   */
  if (
    isSuperAdmin &&
    selectedSchool
  ) {
    teacherQuery.school =
      selectedSchool;
  }

  if (employeeCode.trim()) {
    teacherQuery.employeeCode =
      employeeCode.trim();
  }

  const {
    data: teachersData,
    isLoading: isTeachersLoading,
    isFetching: isTeachersFetching,
    isError: isTeachersError,
    error: teachersError,
    refetch,
  } = useGetTeachersQuery(
    teacherQuery,
  );

  const [
    deleteTeacher,
    {
      isLoading: isDeleteLoading,
    },
  ] = useDeleteTeacherMutation();

  const teachers = useMemo(() => {
    if (Array.isArray(teachersData)) {
      return teachersData;
    }

    return (
      teachersData?.teachers ||
      teachersData?.data ||
      []
    );
  }, [teachersData]);

  // --------------------------------------------------
  // Client-side search
  // --------------------------------------------------

  const filteredTeachers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const teacherUser =
        teacher?.user || {};

      const teacherSchool =
        teacher?.school || {};

      const values = [
        teacher?.employeeCode,
        teacher?.qualification,

        teacherUser?.name,
        teacherUser?.email,
        teacherUser?.phone,

        teacherSchool?.name,
        teacherSchool?.code,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(
            normalizedSearch,
          ),
      );
    });
  }, [
    teachers,
    search,
  ]);

  // --------------------------------------------------
  // Delete handler
  // --------------------------------------------------

  const deleteHandler = async (
    teacher,
  ) => {
    const teacherName =
      teacher?.user?.name ||
      teacher?.employeeCode ||
      "this teacher";

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${teacherName}?\n\nThis will remove the teacher profile.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacher(
        teacher._id,
      ).unwrap();

      toast.success(
        "Teacher deleted successfully",
      );

      /*
       * RTK Query invalidation should normally
       * update the list automatically.
       *
       * Refetch also ensures the list is fresh
       * if your API slice does not use tags.
       */
      refetch();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to delete teacher";

      toast.error(message);
    }
  };

  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setEmployeeCode("");
    setStatusFilter("true");

    if (isSuperAdmin) {
      setSelectedSchool("");
    } else if (userInfo?.school) {
      const schoolId =
        typeof userInfo.school === "object"
          ? userInfo.school._id
          : userInfo.school;

      setSelectedSchool(
        String(schoolId || ""),
      );
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getInitial = (name) => {
    if (!name) {
      return "T";
    }

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const getErrorMessage = () => {
    return (
      teachersError?.data?.message ||
      teachersError?.error ||
      "Unable to load teachers"
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-8">

      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 sm:p-6 mb-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg shrink-0">

                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
                    d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  />
                </svg>

              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Teachers
                </h1>

                <p className="text-white/70 text-sm sm:text-base mt-1">
                  Manage your school teachers
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  TEACHER_CREATE_ROUTE,
                )
              }
              className="w-full lg:w-auto h-11 sm:h-12 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>

              Add Teacher

            </button>

          </div>

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sm:p-5 mb-5">

          {/* Search + filter button */}

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">

              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"
                />
              </svg>

              <input
                type="search"
                placeholder="Search by name, employee code, phone or email..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
              />

            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (prev) => !prev,
                )
              }
              className="h-11 sm:h-12 px-5 rounded-xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition flex items-center justify-center gap-2"
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
                  d="M3 4h18M6 10h12M10 16h4"
                />
              </svg>

              Filters

            </button>

          </div>

          {/* Advanced filters */}

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* School */}

                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-indigo-100">
                    School
                  </label>

                  <select
                    value={
                      selectedSchool
                    }
                    onChange={(e) =>
                      setSelectedSchool(
                        e.target.value,
                      )
                    }
                    disabled={
                      !isSuperAdmin ||
                      isSchoolsLoading
                    }
                    className="w-full h-11 px-3 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >

                    <option value="">
                      {isSchoolsLoading
                        ? "Loading schools..."
                        : isSuperAdmin
                        ? "All schools"
                        : "Your school"}
                    </option>

                    {schools.map(
                      (school) => (
                        <option
                          key={
                            school._id
                          }
                          value={
                            school._id
                          }
                        >
                          {school.name}
                          {school.code
                            ? ` (${school.code})`
                            : ""}
                        </option>
                      ),
                    )}

                  </select>

                  {isSchoolsError && (
                    <p className="text-xs text-red-200">
                      Unable to load schools.
                    </p>
                  )}

                </div>

                {/* Status */}

                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-indigo-100">
                    Status
                  </label>

                  <select
                    value={
                      statusFilter
                    }
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value,
                      )
                    }
                    className="w-full h-11 px-3 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                  >

                    <option value="true">
                      Active Teachers
                    </option>

                    <option value="false">
                      Inactive Teachers
                    </option>

                  </select>

                </div>

                {/* Employee code */}

                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-indigo-100">
                    Employee Code
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. TCH001"
                    value={
                      employeeCode
                    }
                    onChange={(e) =>
                      setEmployeeCode(
                        e.target.value.toUpperCase(),
                      )
                    }
                    className="w-full h-11 px-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none uppercase"
                  />

                </div>

              </div>

              <div className="flex justify-end mt-4">

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                  Reset Filters
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ==================================================
            RESULTS SUMMARY
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 mb-3">

          <p className="text-white/80 text-sm">
            Showing{" "}
            <span className="font-bold text-white">
              {filteredTeachers.length}
            </span>{" "}
            teacher
            {filteredTeachers.length !==
            1
              ? "s"
              : ""}
          </p>

          {isTeachersFetching && (
            <span className="text-xs text-white/60 animate-pulse">
              Updating...
            </span>
          )}

        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {isTeachersLoading && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 text-center">

            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />

            <p className="text-white font-medium">
              Loading teachers...
            </p>

          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {isTeachersError &&
          !isTeachersLoading && (
            <div className="bg-white/10 backdrop-blur-xl border border-red-300/20 rounded-2xl p-8 text-center">

              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">

                <svg
                  className="w-6 h-6 text-red-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  />
                </svg>

              </div>

              <p className="text-white font-semibold">
                {getErrorMessage()}
              </p>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="mt-4 px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
              >
                Try Again
              </button>

            </div>
          )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!isTeachersLoading &&
          !isTeachersError &&
          filteredTeachers.length ===
            0 && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 sm:p-14 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">

                <svg
                  className="w-8 h-8 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  />

                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    strokeWidth={1.7}
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M16 11h6m-3-3v6"
                  />
                </svg>

              </div>

              <h3 className="text-xl font-bold text-white">
                No teachers found
              </h3>

              <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
                {search ||
                employeeCode
                  ? "Try changing your search or filters."
                  : "There are no teachers matching the selected filters."}
              </p>

              {!search &&
                !employeeCode && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        TEACHER_CREATE_ROUTE,
                      )
                    }
                    className="mt-5 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
                  >
                    Add Your First Teacher
                  </button>
                )}

            </div>
          )}

        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        {!isTeachersLoading &&
          !isTeachersError &&
          filteredTeachers.length >
            0 && (
            <div className="hidden lg:block bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="bg-white/10 border-b border-white/10">

                      <th className="text-left px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        Teacher
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        Employee Code
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        School
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        Qualification
                      </th>

                      <th className="text-center px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        Status
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">

                    {filteredTeachers.map(
                      (teacher) => {
                        const teacherUser =
                          teacher.user ||
                          {};

                        const teacherSchool =
                          teacher.school ||
                          {};

                        return (
                          <tr
                            key={
                              teacher._id
                            }
                            className="hover:bg-white/5 transition"
                          >

                            {/* Teacher */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow">

                                  {getInitial(
                                    teacherUser.name,
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="font-semibold text-white truncate max-w-[190px]">
                                    {teacherUser.name ||
                                      "Unnamed Teacher"}
                                  </p>

                                  <p className="text-xs text-white/50 truncate max-w-[190px]">
                                    {teacherUser.email ||
                                      teacherUser.phone ||
                                      "No contact information"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* Employee Code */}

                            <td className="px-5 py-4">

                              <span className="inline-flex px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-sm font-semibold text-white">
                                {teacher.employeeCode}
                              </span>

                            </td>

                            {/* School */}

                            <td className="px-5 py-4">

                              <p className="text-sm text-white font-medium">
                                {teacherSchool.name ||
                                  "-"}
                              </p>

                              {teacherSchool.code && (
                                <p className="text-xs text-white/50 mt-1">
                                  {
                                    teacherSchool.code
                                  }
                                </p>
                              )}

                            </td>

                            {/* Qualification */}

                            <td className="px-5 py-4">

                              <span className="text-sm text-white/80">
                                {teacher.qualification ||
                                  "Not specified"}
                              </span>

                            </td>

                            {/* Status */}

                            <td className="px-5 py-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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

                            </td>

                            {/* Actions */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-2">

                                {/* View */}

                                <button
                                  type="button"
                                  title="View teacher"
                                  onClick={() =>
                                    navigate(
                                      teacherViewRoute(
                                        teacher._id,
                                      ),
                                    )
                                  }
                                  className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-300/20 text-cyan-200 hover:bg-cyan-500 hover:text-white transition flex items-center justify-center"
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
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="3"
                                      strokeWidth={2}
                                    />
                                  </svg>
                                </button>

                                {/* Edit */}

                                <button
                                  type="button"
                                  title="Edit teacher"
                                  onClick={() =>
                                    navigate(
                                      teacherEditRoute(
                                        teacher._id,
                                      ),
                                    )
                                  }
                                  className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-300/20 text-amber-200 hover:bg-amber-500 hover:text-white transition flex items-center justify-center"
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
                                </button>

                                {/* Delete */}

                                <button
                                  type="button"
                                  title="Delete teacher"
                                  onClick={() =>
                                    deleteHandler(
                                      teacher,
                                    )
                                  }
                                  disabled={
                                    isDeleteLoading
                                  }
                                  className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-300/20 text-red-200 hover:bg-red-500 hover:text-white transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        {/* ==================================================
            MOBILE / TABLET CARDS
        ================================================== */}

        {!isTeachersLoading &&
          !isTeachersError &&
          filteredTeachers.length >
            0 && (
            <div className="lg:hidden space-y-3">

              {filteredTeachers.map(
                (teacher) => {
                  const teacherUser =
                    teacher.user ||
                    {};

                  const teacherSchool =
                    teacher.school ||
                    {};

                  return (
                    <div
                      key={
                        teacher._id
                      }
                      className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sm:p-5"
                    >

                      {/* Card Header */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow shrink-0">
                            {getInitial(
                              teacherUser.name,
                            )}
                          </div>

                          <div className="min-w-0">

                            <h3 className="font-semibold text-white truncate">
                              {teacherUser.name ||
                                "Unnamed Teacher"}
                            </h3>

                            <p className="text-xs text-white/50 truncate">
                              {teacherUser.email ||
                                teacherUser.phone ||
                                "No contact information"}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
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

                      {/* Details */}

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[11px] uppercase tracking-wide text-white/40">
                            Employee Code
                          </p>

                          <p className="text-sm font-semibold text-white mt-1">
                            {
                              teacher.employeeCode
                            }
                          </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[11px] uppercase tracking-wide text-white/40">
                            Qualification
                          </p>

                          <p className="text-sm font-semibold text-white mt-1 truncate">
                            {teacher.qualification ||
                              "Not specified"}
                          </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 col-span-2">
                          <p className="text-[11px] uppercase tracking-wide text-white/40">
                            School
                          </p>

                          <p className="text-sm font-semibold text-white mt-1">
                            {teacherSchool.name ||
                              "-"}
                          </p>

                          {teacherSchool.code && (
                            <p className="text-xs text-white/50">
                              {
                                teacherSchool.code
                              }
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Actions */}

                      <div className="grid grid-cols-3 gap-2 mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              teacherViewRoute(
                                teacher._id,
                              ),
                            )
                          }
                          className="h-10 rounded-lg bg-cyan-500/15 border border-cyan-300/20 text-cyan-100 hover:bg-cyan-500 hover:text-white transition flex items-center justify-center gap-1.5 text-sm font-medium"
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
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeWidth={2}
                            />
                          </svg>

                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              teacherEditRoute(
                                teacher._id,
                              ),
                            )
                          }
                          className="h-10 rounded-lg bg-amber-500/15 border border-amber-300/20 text-amber-100 hover:bg-amber-500 hover:text-white transition flex items-center justify-center gap-1.5 text-sm font-medium"
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

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteHandler(
                              teacher,
                            )
                          }
                          disabled={
                            isDeleteLoading
                          }
                          className="h-10 rounded-lg bg-red-500/15 border border-red-300/20 text-red-100 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>

                          Delete
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
  );
};

export default TeacherListScreen;
