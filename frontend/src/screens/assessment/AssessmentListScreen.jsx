import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import {
  useGetAssessmentsQuery,
  useDeleteAssessmentMutation,
} from "../../slices/assessmentApiSlice";

import { useGetStreamsQuery } from "../../slices/streamApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";
import { useGetSectionsQuery } from "../../slices/sectionApiSlice";

const ASSESSMENT_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "MIXED",
  "CHAPTER_TEST",
  "UNIT_TEST",
  "MONTHLY_TEST",
  "REVISION_TEST",
  "MOCK_EXAM",
  "PRE_BOARD",
  "BOARD_PRACTICE",
];

const AssessmentListScreen = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    academicYear: "",
    class: "",
    section: "",
    stream: "",
    subject: "",
    assessmentType: "",
  });

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: assessments = [],
    isLoading,
    isFetching,
    error,
  } = useGetAssessmentsQuery(
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "",
      ),
    ),
  );

  const { data: streams = [], isLoading: streamsLoading } =
    useGetStreamsQuery();

  const { data: subjects = [], isLoading: subjectsLoading } =
    useGetSubjectsQuery();

  const {
    data: academicYears = [],
    isLoading: academicYearsLoading,
  } = useGetAcademicYearsQuery();

  const { data: classes = [], isLoading: classesLoading } =
    useGetClassesQuery();

  const {
    data: sections = [],
    isLoading: sectionsLoading,
  } = useGetSectionsQuery(
    filters.class
      ? {
          class: filters.class,
          academicYear: filters.academicYear || undefined,
        }
      : undefined,
    {
      skip: !filters.class,
    },
  );

  const [deleteAssessment, { isLoading: isDeleting }] =
    useDeleteAssessmentMutation();

  const filteredAssessments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return assessments;
    }

    return assessments.filter((assessment) => {
      return [
        assessment.title,
        assessment.description,
        assessment.assessmentType,
        assessment.subject?.name,
        assessment.class?.name,
        assessment.section?.name,
        assessment.stream?.name,
        assessment.academicYear?.name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchValue),
        );
    });
  }, [assessments, search]);

  const updateFilter = (name, value) => {
    setFilters((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (name === "academicYear") {
        next.section = "";
      }

      if (name === "class") {
        next.section = "";
      }

      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      academicYear: "",
      class: "",
      section: "",
      stream: "",
      subject: "",
      assessmentType: "",
    });
    setSearch("");
  };

  const hasActiveFilters = Object.values(filters).some(
    Boolean,
  );

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAssessmentType = (type) => {
    if (!type) {
      return "—";
    }

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  };

  const getStatusClasses = (status) => {
    const classesByStatus = {
      DRAFT:
        "bg-slate-100 text-slate-700 ring-slate-200",
      SCHEDULED:
        "bg-blue-50 text-blue-700 ring-blue-200",
      ACTIVE:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",
      COMPLETED:
        "bg-violet-50 text-violet-700 ring-violet-200",
      CANCELLED:
        "bg-red-50 text-red-700 ring-red-200",
    };

    return (
      classesByStatus[status] ||
      "bg-slate-100 text-slate-700 ring-slate-200"
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      await deleteAssessment(
        deleteTarget._id,
      ).unwrap();

      toast.success(
        "Assessment deleted successfully",
      );

      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to delete assessment",
      );
    }
  };

  const handleView = (assessmentId) => {
    navigate(
      `/assessments/${assessmentId}`,
    );
  };

  const handleEdit = (assessmentId) => {
    navigate(
      `/assessments/${assessmentId}/edit`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Assessments
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor assessments for your school.
            </p>
          </div>

          <Link
            to="/assessments/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Assessment
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search assessments..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters((previous) => !previous)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  showFilters
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
                {hasActiveFilters && (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                    {
                      Object.values(filters).filter(
                        Boolean,
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-900">
                      Academic Structure
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Filter by academic year, class and section.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SelectField
                      label="Academic Year"
                      value={filters.academicYear}
                      onChange={(value) =>
                        updateFilter(
                          "academicYear",
                          value,
                        )
                      }
                      loading={academicYearsLoading}
                      options={academicYears}
                      getValue={(item) =>
                        item._id
                      }
                      getLabel={(item) =>
                        item.name
                      }
                      placeholder="All academic years"
                    />

                    <SelectField
                      label="Class"
                      value={filters.class}
                      onChange={(value) =>
                        updateFilter(
                          "class",
                          value,
                        )
                      }
                      loading={classesLoading}
                      options={classes}
                      getValue={(item) =>
                        item._id
                      }
                      getLabel={(item) =>
                        item.name
                      }
                      placeholder="All classes"
                    />

                    <SelectField
                      label="Section"
                      value={filters.section}
                      onChange={(value) =>
                        updateFilter(
                          "section",
                          value,
                        )
                      }
                      loading={sectionsLoading}
                      disabled={!filters.class}
                      options={sections}
                      getValue={(item) =>
                        item._id
                      }
                      getLabel={(item) =>
                        item.name
                      }
                      placeholder={
                        filters.class
                          ? "All sections"
                          : "Select class first"
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-900">
                      Stream & Subject
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Filter assessments by stream and global subject.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField
                      label="Stream"
                      value={filters.stream}
                      onChange={(value) =>
                        updateFilter(
                          "stream",
                          value,
                        )
                      }
                      loading={streamsLoading}
                      options={streams}
                      getValue={(item) =>
                        item._id
                      }
                      getLabel={(item) =>
                        item.name
                      }
                      placeholder="All streams"
                    />

                    <SelectField
                      label="Subject"
                      value={filters.subject}
                      onChange={(value) =>
                        updateFilter(
                          "subject",
                          value,
                        )
                      }
                      loading={subjectsLoading}
                      options={subjects}
                      getValue={(item) =>
                        item._id
                      }
                      getLabel={(item) =>
                        item.name
                      }
                      placeholder="All subjects"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <SelectField
                    label="Assessment Type"
                    value={filters.assessmentType}
                    onChange={(value) =>
                      updateFilter(
                        "assessmentType",
                        value,
                      )
                    }
                    options={ASSESSMENT_TYPES}
                    getValue={(item) =>
                      item
                    }
                    getLabel={(item) =>
                      formatAssessmentType(item)
                    }
                    placeholder="All assessment types"
                  />

                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters && !search}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {filteredAssessments.length}
              </span>{" "}
              assessment
              {filteredAssessments.length !== 1
                ? "s"
                : ""}
            </p>

            {isFetching && !isLoading && (
              <span className="text-xs font-medium text-indigo-600">
                Updating...
              </span>
            )}
          </div>

          {isLoading ? (
            <AssessmentTableSkeleton />
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <XMarkIcon className="h-7 w-7 text-red-500" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Unable to load assessments
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {error?.data?.message ||
                  "Something went wrong while loading assessments."}
              </p>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <FunnelIcon className="h-8 w-8 text-indigo-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                No assessments found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try changing your filters or create a new assessment.
              </p>

              <Link
                to="/assessments/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5" />
                Create Assessment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Assessment
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Academic Structure
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Stream / Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Schedule
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAssessments.map(
                    (assessment) => (
                      <tr
                        key={assessment._id}
                        className="group transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[230px]">
                            <p className="truncate font-semibold text-slate-900">
                              {assessment.title}
                            </p>

                            {assessment.description && (
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {assessment.description}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-slate-400">
                              {assessment.totalQuestions}{" "}
                              questions ·{" "}
                              {assessment.totalMarks} marks
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-700">
                            <p className="font-medium">
                              {assessment.academicYear
                                ?.name || "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {assessment.class
                                ?.name || "—"}
                              {assessment.section?.name
                                ? ` · Section ${assessment.section.name}`
                                : ""}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-slate-800">
                              {assessment.subject
                                ?.name || "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {assessment.stream
                                ?.name || "No stream"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {formatAssessmentType(
                              assessment.assessmentType,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-600">
                            <p>
                              {formatDate(
                                assessment.startDate,
                              )}
                            </p>
                            <p className="mt-1 text-slate-400">
                              to{" "}
                              {formatDate(
                                assessment.endDate,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusClasses(
                              assessment.status,
                            )}`}
                          >
                            {assessment.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  assessment._id,
                                )
                              }
                              title="View assessment"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  assessment._id,
                                )
                              }
                              title="Edit assessment"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  assessment,
                                )
                              }
                              disabled={[
                                "ACTIVE",
                                "COMPLETED",
                              ].includes(
                                assessment.status,
                              )}
                              title={
                                [
                                  "ACTIVE",
                                  "COMPLETED",
                                ].includes(
                                  assessment.status,
                                )
                                  ? `Cannot delete ${assessment.status.toLowerCase()} assessment`
                                  : "Delete assessment"
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete assessment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  getValue,
  getLabel,
  placeholder,
  loading = false,
  disabled = false,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled || loading}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">
          {loading
            ? "Loading..."
            : placeholder}
        </option>

        {options.map((option) => (
          <option
            key={getValue(option)}
            value={getValue(option)}
          >
            {getLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
};

const AssessmentTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-4 md:grid md:grid-cols-7 md:gap-4">
        {Array.from({ length: 7 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-3 rounded bg-slate-200"
            />
          ),
        )}
      </div>

      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="grid gap-4 border-b border-slate-100 px-5 py-5 md:grid-cols-7"
          >
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>

            <div className="h-7 w-24 rounded-lg bg-slate-100" />

            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>

            <div className="h-7 w-20 rounded-full bg-slate-100" />

            <div className="flex justify-end gap-2">
              <div className="h-9 w-9 rounded-lg bg-slate-100" />
              <div className="h-9 w-9 rounded-lg bg-slate-100" />
              <div className="h-9 w-9 rounded-lg bg-slate-100" />
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default AssessmentListScreen;
