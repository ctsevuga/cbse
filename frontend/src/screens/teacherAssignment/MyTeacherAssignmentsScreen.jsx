import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Layers3,
  RefreshCw,
  Search,
  Users,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import {
  useGetMyTeacherAssignmentsQuery,
} from "../../slices/teacherAssignmentApiSlice";

const MyTeacherAssignmentsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

const schoolSlug =
  userInfo?.school?.slug ||
  userInfo?.slug ||
  "";

  const [searchTerm, setSearchTerm] = useState("");

  const {
  data: assignments = [],
  isLoading,
  isFetching,
  error,
  refetch,
} = useGetMyTeacherAssignmentsQuery(
  { schoolSlug },
  {
    skip: !schoolSlug,
  },
);

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) {
      return assignments;
    }

    const search = searchTerm
      .toLowerCase()
      .trim();

    return assignments.filter((assignment) => {
      const academicYear =
        assignment.academicYear?.name || "";

      const className =
        assignment.class?.name || "";

      const classCode =
        assignment.class?.code || "";

      const section =
        assignment.section?.name || "";

      const subject =
        assignment.subject?.name || "";

      const subjectCode =
        assignment.subject?.code || "";

      const assignmentType =
        assignment.assignmentType || "";

      return [
        academicYear,
        className,
        classCode,
        section,
        subject,
        subjectCode,
        assignmentType,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(search),
      );
    });
  }, [assignments, searchTerm]);

  const classTeacherCount = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.assignmentType ===
          "CLASS_TEACHER",
      ).length,
    [assignments],
  );

  const subjectTeacherCount = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.assignmentType ===
          "SUBJECT_TEACHER",
      ).length,
    [assignments],
  );

  const uniqueSubjects = useMemo(() => {
    const subjectIds = new Set();

    assignments.forEach((assignment) => {
      if (assignment.subject?._id) {
        subjectIds.add(
          String(assignment.subject._id),
        );
      }
    });

    return subjectIds.size;
  }, [assignments]);

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

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-100">
                    Teacher Portal
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    My Teacher Assignments
                  </h1>

                  <p className="mt-1 text-sm text-blue-100 sm:text-base">
                    View your current classes, sections
                    and subject assignments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p>
                {error?.data?.message ||
                  "Failed to load your teacher assignments."}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Assignments
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {assignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-3">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Class Teacher
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {classTeacherCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-3">
                <BookOpen className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Subject Teaching
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {subjectTeacherCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Layers3 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Subjects
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {uniqueSubjects}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search academic year, class, section or subject..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Assignment Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredAssignments.length}{" "}
                assignment
                {filteredAssignments.length !==
                1
                  ? "s"
                  : ""}{" "}
                currently assigned to you
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-100 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-200" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-slate-200" />
                      <div className="h-3 w-64 rounded bg-slate-100" />
                    </div>

                    <div className="h-8 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAssignments.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                {searchTerm
                  ? "No matching assignments"
                  : "No assignments found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {searchTerm
                  ? "Try a different search term."
                  : "You currently have no active teacher assignments."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {filteredAssignments.map(
                (assignment) => {
                  const isClassTeacher =
                    assignment.assignmentType ===
                    "CLASS_TEACHER";

                  return (
                    <div
                      key={assignment._id}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              isClassTeacher
                                ? "bg-purple-50 text-purple-600"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {isClassTeacher ? (
                              <GraduationCap className="h-6 w-6" />
                            ) : (
                              <BookOpen className="h-6 w-6" />
                            )}
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isClassTeacher
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-cyan-50 text-cyan-700"
                              }`}
                            >
                              {getAssignmentTypeLabel(
                                assignment.assignmentType,
                              )}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-lg font-bold text-slate-800">
                          {assignment.class?.name ||
                            "Class"}
                          {" - "}
                          {assignment.section?.name ||
                            "Section"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {assignment.academicYear
                            ?.name ||
                            "Academic Year"}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays className="h-4 w-4" />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Academic Year
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm font-semibold text-slate-700">
                            {assignment.academicYear
                              ?.name || "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <GraduationCap className="h-4 w-4" />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Class
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm font-semibold text-slate-700">
                            {assignment.class
                              ?.name || "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4" />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Section
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm font-semibold text-slate-700">
                            {assignment.section
                              ?.name || "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <BookOpen className="h-4 w-4" />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Subject
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm font-semibold text-slate-700">
                            {isClassTeacher
                              ? "Class Teacher"
                              : assignment.subject
                                  ?.name ||
                                "-"}
                          </p>

                          {!isClassTeacher &&
                            assignment.subject
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
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Active assignment
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/teacher/teacher-assignments/${assignment._id}`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          View Details
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
    </div>
  );
};

export default MyTeacherAssignmentsScreen;