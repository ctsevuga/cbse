import React, { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useDeleteSectionMutation,
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const SectionListScreen = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const {
    data: sections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSectionsQuery();

  const [
    deleteSection,
    { isLoading: isDeleting },
  ] = useDeleteSectionMutation();

  const filteredSections = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return sections.filter((section) => {
      const matchesSearch =
        !search ||
        section.name
          ?.toLowerCase()
          .includes(search) ||
        section.class?.name
          ?.toLowerCase()
          .includes(search) ||
        section.class?.code
          ?.toLowerCase()
          .includes(search) ||
        section.academicYear?.name
          ?.toLowerCase()
          .includes(search) ||
        section.classTeacher?.user?.name
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          section.isActive) ||
        (statusFilter === "inactive" &&
          !section.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [
    sections,
    searchTerm,
    statusFilter,
  ]);

  const activeCount = sections.filter(
    (section) => section.isActive,
  ).length;

  const inactiveCount =
    sections.length - activeCount;

  const getTeacherName = (teacher) => {
    if (teacher?.user?.name) {
      return teacher.user.name;
    }

    if (teacher?.name) {
      return teacher.name;
    }

    if (
      teacher?.user?.firstName ||
      teacher?.user?.lastName
    ) {
      return [
        teacher.user.firstName,
        teacher.user.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return "Not assigned";
  };

  const getAcademicYearName = (academicYear) => {
    return (
      academicYear?.name ||
      academicYear?.academicYear ||
      "—"
    );
  };

  const getClassName = (classRecord) => {
    return (
      classRecord?.name ||
      classRecord?.code ||
      "—"
    );
  };

  const handleDelete = async (section) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete section "${section.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSection(section._id).unwrap();
      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to delete section. Please try again.",
      );
    }
  };

  const handleView = (id) => {
    navigate(`/sections/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/sections/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading sections...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <XCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load sections
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the sections."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <Users
                  size={24}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Sections
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage class sections and class teachers.
                </p>
              </div>
            </div>

            <Link
              to="/sections/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <Plus size={19} />
              Create Section
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Sections
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {sections.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <Users
                  size={21}
                  className="text-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2
                  size={21}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Inactive
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-500">
                  {inactiveCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <XCircle
                  size={21}
                  className="text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Section Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredSections.length} section
                  {filteredSections.length !== 1
                    ? "s"
                    : ""}{" "}
                  displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:min-w-[280px]">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search sections..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Users
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No sections found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Create your first section to get started."}
              </p>

              {!searchTerm &&
                statusFilter === "all" && (
                  <Link
                    to="/sections/create"
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Plus size={18} />
                    Create Section
                  </Link>
                )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Section
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Class
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Academic Year
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Class Teacher
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSections.map(
                      (section) => (
                        <tr
                          key={section._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                <Users
                                  size={18}
                                  className="text-indigo-600"
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  Section{" "}
                                  {section.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {section._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <BookOpen
                                size={17}
                                className="text-slate-400"
                              />

                              <span className="text-sm font-medium text-slate-700">
                                {getClassName(
                                  section.class,
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-medium text-slate-700">
                              {getAcademicYearName(
                                section.academicYear,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                                <UserRoundIcon />
                              </div>

                              <span className="text-sm text-slate-700">
                                {getTeacherName(
                                  section.classTeacher,
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            {section.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <CheckCircle2
                                  size={14}
                                />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                <XCircle
                                  size={14}
                                />
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    section._id,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                title="View"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    section._id,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    section,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredSections.map(
                  (section) => (
                    <div
                      key={section._id}
                      className="p-5 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <Users
                              size={20}
                              className="text-indigo-600"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">
                              Section{" "}
                              {section.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {getClassName(
                                section.class,
                              )}
                            </p>
                          </div>
                        </div>

                        {section.isActive ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2
                              size={13}
                            />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <XCircle
                              size={13}
                            />
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Academic Year
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {getAcademicYearName(
                              section.academicYear,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Class Teacher
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {getTeacherName(
                              section.classTeacher,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              section._id,
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={17} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              section._id,
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <Edit size={17} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              section,
                            )
                          }
                          disabled={isDeleting}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const UserRoundIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-violet-600"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle
      cx="12"
      cy="7"
      r="4"
    />
  </svg>
);

export default SectionListScreen;