import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetStudentsQuery,
  useDeleteStudentMutation,
} from "../../slices/studentApiSlice";

import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const StudentListScreen = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    data: students = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStudentsQuery({
    academicYear: academicYear || undefined,
    class: classFilter || undefined,
    section: sectionFilter || undefined,
    stream: streamFilter || undefined,
    isActive: statusFilter || undefined,
  });
const {
  data: academicYearsResponse = [],
  isLoading: loadingAcademicYears,
} = useGetAcademicYearsQuery();

const academicYears = Array.isArray(academicYearsResponse)
  ? academicYearsResponse
  : academicYearsResponse.academicYears || [];

const {
  data: classesResponse = [],
  isLoading: loadingClasses,
} = useGetClassesQuery(
  { academicYear },
  { skip: !academicYear },
);

const classes = Array.isArray(classesResponse)
  ? classesResponse
  : classesResponse.classes || [];

const {
  data: sectionsResponse = [],
  isLoading: loadingSections,
} = useGetSectionsQuery(
  { class: classFilter, academicYear },
  { skip: !academicYear || !classFilter },
);

const sections = Array.isArray(sectionsResponse)
  ? sectionsResponse
  : sectionsResponse.sections || [];
  const [deleteStudent, { isLoading: isDeleting }] =
    useDeleteStudentMutation();

  /*
   * Search is performed on the already retrieved student collection.
   * The backend filters are used for academic year, class, section,
   * stream and active status.
   */

  const handleAcademicYearChange = (e) => {
  setAcademicYear(e.target.value);
  setClassFilter("");
  setSectionFilter("");
};

const handleClassChange = (e) => {
  setClassFilter(e.target.value);
  setSectionFilter("");
};
  const filteredStudents = useMemo(() => {
    if (!search.trim()) {
      return students;
    }

    const searchText = search.trim().toLowerCase();

    return students.filter((student) => {
      const name = student.user?.name || "";
      const email = student.user?.email || "";
      const phone = student.user?.phone || "";
      const admissionNumber = student.admissionNumber || "";
      const section = student.section?.name || "";
      const className = student.class?.name || "";
      const stream =
  typeof student.stream === "object"
    ? student.stream?.name || student.stream?.code || ""
    : student.stream || "";

      return [
        name,
        email,
        phone,
        admissionNumber,
        section,
        className,
        stream,
      ].some((value) =>
        value.toLowerCase().includes(searchText),
      );
    });
  }, [students, search]);

  const activeCount = students.filter(
    (student) => student.isActive,
  ).length;

  const inactiveCount = students.length - activeCount;

  const handleView = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const handleEdit = (studentId) => {
    navigate(`/admin/students/${studentId}/edit`);
  };

  const handleDelete = async (student) => {
    const studentName =
      student.user?.name || student.admissionNumber;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStudent(student._id).unwrap();

      toast.success("Student deleted successfully");

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to delete student",
      );
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setAcademicYear("");
    setClassFilter("");
    setSectionFilter("");
    setStreamFilter("");
    setStatusFilter("");
  };

  const getStreamLabel = (stream) => {
  if (!stream) return "-";

  if (typeof stream === "object") {
    return stream.name || stream.code || "-";
  }

  switch (stream.toUpperCase()) {
    case "SCIENCE":
      return "Science";
    case "COMMERCE":
      return "Commerce";
    case "HUMANITIES":
      return "Humanities";
    default:
      return stream;
  }
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
        return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading students...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Unable to load students
            </h2>

            <p className="mt-2 text-gray-600">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading students."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  Students
                </h1>

                <p className="mt-1 text-sm text-gray-600 md:text-base">
                  Manage students and their academic information
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/students/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>

        {/* =====================================================
            Summary Cards
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {students.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Students
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Students
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {inactiveCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                <UserX className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            Filters
        ====================================================== */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Search & Filters
              </h2>

              <p className="text-sm text-gray-500">
                Find students using their academic or personal details
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search Student
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, admission number, phone or email..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Academic Year */}
            <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Academic Year
  </label>

  <select
    value={academicYear}
    onChange={handleAcademicYearChange}
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
  >
    <option value="">
      {loadingAcademicYears
        ? "Loading academic years..."
        : "Select Academic Year"}
    </option>

    {academicYears.map((year) => (
      <option key={year._id} value={year._id}>
        {year.name}
      </option>
    ))}
  </select>
</div>

            {/* Class */}
            <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Class
  </label>

  <select
    value={classFilter}
    onChange={handleClassChange}
    disabled={!academicYear || loadingClasses}
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm disabled:bg-gray-100"
  >
    <option value="">
      {!academicYear
        ? "Select academic year first"
        : loadingClasses
          ? "Loading classes..."
          : "Select Class"}
    </option>

    {classes.map((item) => (
      <option key={item._id} value={item._id}>
        {item.name}
      </option>
    ))}
  </select>
</div>

            {/* Section */}
            <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Section
  </label>

  <select
    value={sectionFilter}
    onChange={(e) => setSectionFilter(e.target.value)}
    disabled={!classFilter || loadingSections}
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm disabled:bg-gray-100"
  >
    <option value="">
      {!classFilter
        ? "Select class first"
        : loadingSections
          ? "Loading sections..."
          : "Select Section"}
    </option>

    {sections.map((item) => (
      <option key={item._id} value={item._id}>
        {item.name}
      </option>
    ))}
  </select>
</div>

            {/* Stream */}
<div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Stream
  </label>

  <select
    value={streamFilter}
    onChange={(e) => setStreamFilter(e.target.value)}
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
  >
    <option value="">All Streams</option>
    <option value="PCM">PCM - Science Stream</option>
    <option value="PCB">PCB - Science Stream</option>
    <option value="PCMB">PCMB - Science Stream</option>
    <option value="COMMERCE">Commerce Stream</option>
  </select>
</div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All Students</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* =====================================================
            Student Table
        ====================================================== */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Student List
                </h2>

                <p className="text-sm text-gray-500">
                  Showing {filteredStudents.length} of{" "}
                  {students.length} students
                </p>
              </div>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-7 w-7 text-gray-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No students found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search criteria or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Admission No.
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Class / Section
                      </th>

                      {/* <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Stream
                      </th> */}

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Gender
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Student */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                              {(
                                student.user?.name || "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {student.user?.name ||
                                  "Unnamed Student"}
                              </p>

                              <p className="text-xs text-gray-500">
                                {student.user?.phone ||
                                  student.user?.email ||
                                  "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Admission Number */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
                            {student.admissionNumber}
                          </span>
                        </td>

                        {/* Class / Section */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-medium text-gray-800">
                            {student.class?.name || "-"}
                          </p>

                          <p className="text-xs text-gray-500">
                            Section{" "}
                            {student.section?.name || "-"}
                          </p>
                        </td>

                        {/* Stream */}
                        {/* <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {getStreamLabel(student.stream)}
                          </span>
                        </td> */}

                        {/* Gender */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {getGenderLabel(student.gender)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-5 py-4">
                          {student.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="View Student"
                              onClick={() =>
                                handleView(student._id)
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title="Edit Student"
                              onClick={() =>
                                handleEdit(student._id)
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title="Delete Student"
                              disabled={isDeleting}
                              onClick={() =>
                                handleDelete(student)
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {(
                            student.user?.name || "S"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-800">
                            {student.user?.name ||
                              "Unnamed Student"}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {student.admissionNumber}
                          </p>
                        </div>
                      </div>

                      {student.isActive ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          Class
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {student.class?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Section
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {student.section?.name || "-"}
                        </p>
                      </div>

                      {/* <div>
                        <p className="text-xs text-gray-500">
                          Stream
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {getStreamLabel(student.stream)}
                        </p>
                      </div> */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Gender
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {getGenderLabel(student.gender)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleView(student._id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(student._id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDelete(student)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentListScreen;