import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  Users,
  GraduationCap,
  BookOpen,
  Layers3,
  RefreshCw,
} from "lucide-react";

import {
  useGetTeacherAssignmentsQuery,
  useDeleteTeacherAssignmentMutation,
} from "../../slices/teacherAssignmentApiSlice";

import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

const TeacherAssignmentListScreen = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  const [filters, setFilters] = useState({
    academicYear: "",
    section: "",
    class: "",
    subject: "",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const {
  data: assignments = [],
  isLoading,
  isFetching,
  error,
  refetch,
} = useGetTeacherAssignmentsQuery(
  {
    ...(schoolSlug && { schoolSlug }),

    ...(filters.academicYear && {
      academicYear: filters.academicYear,
    }),

    ...(filters.section && {
      section: filters.section,
    }),

    ...(filters.class && {
      class: filters.class,
    }),

    ...(filters.subject && {
      subject: filters.subject,
    }),
  },
  {
    skip: !schoolSlug,
  }
);

  const {
    data: academicYears = [],
    isLoading: academicYearsLoading,
  } = useGetAcademicYearsQuery();

  const {
    data: sections = [],
    isLoading: sectionsLoading,
  } = useGetSectionsQuery();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery();

  const {
    data: classes = [],
    isLoading: classesLoading,
  } = useGetClassesQuery();

  const [deleteTeacherAssignment, { isLoading: isDeleting }] =
    useDeleteTeacherAssignmentMutation();

  const filteredSections = useMemo(() => {
    if (!filters.academicYear) {
      return [];
    }

    return sections.filter((section) => {
      const sectionAcademicYear =
        section.academicYear?._id ||
        section.academicYear;

      return (
        String(sectionAcademicYear) ===
        String(filters.academicYear)
      );
    });
  }, [sections, filters.academicYear]);

  const selectedSection = useMemo(() => {
    return sections.find(
      (section) =>
        String(section._id) ===
        String(filters.section),
    );
  }, [sections, filters.section]);

  const filteredClasses = useMemo(() => {
    if (!filters.section) {
      return [];
    }

    const sectionClassId =
      selectedSection?.class?._id ||
      selectedSection?.class;

    if (!sectionClassId) {
      return [];
    }

    return classes.filter(
      (item) =>
        String(item._id) ===
        String(sectionClassId),
    );
  }, [
    classes,
    selectedSection,
    filters.section,
  ]);

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) {
      return assignments;
    }

    const search = searchTerm
      .toLowerCase()
      .trim();

    return assignments.filter((assignment) => {
      const teacherName =
        assignment.teacher?.name || "";

      const teacherEmail =
        assignment.teacher?.email || "";

      const sectionName =
        assignment.section?.name || "";

      const className =
        assignment.class?.name || "";

      const subjectName =
        assignment.subject?.name || "";

      const academicYearName =
        assignment.academicYear?.name || "";

      const assignmentType =
        assignment.assignmentType || "";

      return [
        teacherName,
        teacherEmail,
        sectionName,
        className,
        subjectName,
        academicYearName,
        assignmentType,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(search),
      );
    });
  }, [assignments, searchTerm]);

  const handleFilterChange = (
    name,
    value,
  ) => {
    if (name === "academicYear") {
      setFilters((prev) => ({
        ...prev,
        academicYear: value,
        section: "",
        class: "",
      }));
      return;
    }

    if (name === "section") {
      setFilters((prev) => ({
        ...prev,
        section: value,
        class: "",
      }));
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      academicYear: "",
      section: "",
      class: "",
      subject: "",
    });
    setSearchTerm("");
  };

  const handleDelete = async (assignment) => {
    const teacherName =
      assignment.teacher?.name ||
      "this teacher";

    const confirmed = window.confirm(
      `Are you sure you want to delete the assignment for ${teacherName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacherAssignment(
        assignment._id,
      ).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          "Failed to delete teacher assignment",
      );
    }
  };

  const handleView = (id) => {
    navigate(
      `/admin/teacher-assignments/${id}`,
    );
  };

  const handleEdit = (id) => {
    navigate(
      `/admin/teacher-assignments/${id}/edit`,
    );
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

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const hasFilters =
    filters.academicYear ||
    filters.section ||
    filters.class ||
    filters.subject;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <Users className="h-6 w-6 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Teacher Assignments
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                  Manage class teachers and subject
                  teacher assignments for your school.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/teacher-assignments/create",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-blue-50"
              >
                <Users className="h-5 w-5" />
                Create Assignment
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search teacher, class, section, subject..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowFilters((prev) => !prev)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  showFilters
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasFilters && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs text-white">
                    {
                      [
                        filters.academicYear,
                        filters.section,
                        filters.class,
                        filters.subject,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={refetch}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Academic Year
                </label>

                <select
                  value={filters.academicYear}
                  onChange={(e) =>
                    handleFilterChange(
                      "academicYear",
                      e.target.value,
                    )
                  }
                  disabled={academicYearsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                >
                  <option value="">
                    All Academic Years
                  </option>

                  {academicYears.map((year) => (
                    <option
                      key={year._id}
                      value={year._id}
                    >
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Section
                </label>

                <select
                  value={filters.section}
                  onChange={(e) =>
                    handleFilterChange(
                      "section",
                      e.target.value,
                    )
                  }
                  disabled={
                    !filters.academicYear ||
                    sectionsLoading
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {filters.academicYear
                      ? "All Sections"
                      : "Select Academic Year First"}
                  </option>

                  {filteredSections.map(
                    (section) => (
                      <option
                        key={section._id}
                        value={section._id}
                      >
                        {section.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Class
                </label>

                <select
                  value={filters.class}
                  onChange={(e) =>
                    handleFilterChange(
                      "class",
                      e.target.value,
                    )
                  }
                  disabled={
                    !filters.section ||
                    classesLoading
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {filters.section
                      ? "All Classes"
                      : "Select Section First"}
                  </option>

                  {filteredClasses.map(
                    (item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <select
                  value={filters.subject}
                  onChange={(e) =>
                    handleFilterChange(
                      "subject",
                      e.target.value,
                    )
                  }
                  disabled={subjectsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                >
                  <option value="">
                    All Subjects
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.name}
                      {subject.code
                        ? ` (${subject.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <div className="md:col-span-2 xl:col-span-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Assignments
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {filteredAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Class Teachers
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {
                    filteredAssignments.filter(
                      (item) =>
                        item.assignmentType ===
                        "CLASS_TEACHER",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-3">
                <BookOpen className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Subject Teachers
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {
                    filteredAssignments.filter(
                      (item) =>
                        item.assignmentType ===
                        "SUBJECT_TEACHER",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Layers3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {
                    filteredAssignments.filter(
                      (item) =>
                        item.isActive !== false,
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error?.data?.message ||
              "Failed to load teacher assignments"}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Assignment List
                </h2>
                <p className="text-sm text-slate-500">
                  {filteredAssignments.length}{" "}
                  assignment
                  {filteredAssignments.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-slate-200" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="h-8 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAssignments.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                No teacher assignments found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try changing your filters or create
                a new teacher assignment.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/teacher-assignments/create",
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Users className="h-4 w-4" />
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Teacher
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Academic Year
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Class / Section
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Assignment Type
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map(
                    (assignment) => {
                      const teacherName =
                        assignment.teacher
                          ?.name || "Unknown Teacher";

                      const isClassTeacher =
                        assignment.assignmentType ===
                        "CLASS_TEACHER";

                      return (
                        <tr
                          key={assignment._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white">
                                {getInitials(
                                  teacherName,
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {teacherName}
                                </p>

                                {assignment.teacher
                                  ?.email && (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {
                                      assignment
                                        .teacher
                                        .email
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                              {
                                assignment
                                  .academicYear
                                  ?.name
                              }
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <p className="font-semibold text-slate-700">
                              {
                                assignment.class
                                  ?.name
                              }
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                assignment.section
                                  ?.name
                              }
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            {isClassTeacher ? (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            ) : (
                              <div>
                                <p className="font-medium text-slate-700">
                                  {
                                    assignment
                                      .subject
                                      ?.name
                                  }
                                </p>

                                {assignment.subject
                                  ?.code && (
                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {
                                      assignment
                                        .subject
                                        .code
                                    }
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isClassTeacher
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-cyan-50 text-cyan-700"
                              }`}
                            >
                              {getAssignmentTypeLabel(
                                assignment.assignmentType,
                              )}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                assignment.isActive !==
                                false
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {assignment.isActive !==
                              false
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    assignment._id,
                                  )
                                }
                                title="View"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    assignment._id,
                                  )
                                }
                                title="Edit"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600 transition hover:border-amber-200 hover:bg-amber-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    assignment,
                                  )
                                }
                                disabled={isDeleting}
                                title="Delete"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentListScreen;