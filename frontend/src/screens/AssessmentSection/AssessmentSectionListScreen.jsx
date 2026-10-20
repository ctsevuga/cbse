import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiRefreshCw,
  FiFileText,
  FiBookOpen,
  FiChevronDown,
} from "react-icons/fi";

import {
  useGetAssessmentSectionsQuery,
  useDeleteAssessmentSectionMutation,
} from "../../slices/assessmentSectionApiSlice";

import { useGetAssessmentsQuery } from "../../slices/assessmentApiSlice";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

const getAssessmentName = (assessment) => {
  if (!assessment) return "Unknown Assessment";

  if (typeof assessment === "string") {
    return assessment;
  }

  return assessment.title || "Untitled Assessment";
};

const getSubjectName = (assessment) => {
  if (!assessment?.subject) return "";

  if (typeof assessment.subject === "string") {
    return assessment.subject;
  }

  return (
    assessment.subject.name ||
    assessment.subject.shortName ||
    ""
  );
};

const getClassName = (assessment) => {
  if (!assessment?.class) return "";

  if (typeof assessment.class === "string") {
    return assessment.class;
  }

  return assessment.class.name || "";
};

const getSectionName = (assessment) => {
  if (!assessment?.section) return "";

  if (typeof assessment.section === "string") {
    return assessment.section;
  }

  return assessment.section.name || "";
};

const AssessmentSectionListScreen = () => {
  const navigate = useNavigate();

  const [assessmentFilter, setAssessmentFilter] =
    useState("");

  const [questionTypeFilter, setQuestionTypeFilter] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const {
    data: assessments = [],
    isLoading: assessmentsLoading,
  } = useGetAssessmentsQuery();

  const {
    data: sections = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAssessmentSectionsQuery({
    ...(assessmentFilter
      ? { assessment: assessmentFilter }
      : {}),
    ...(questionTypeFilter
      ? { questionType: questionTypeFilter }
      : {}),
  });

  const [
    deleteAssessmentSection,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteAssessmentSectionMutation();

  const filteredSections = useMemo(
    () => sections || [],
    [sections],
  );

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await deleteAssessmentSection(
        deleteTarget._id,
      ).unwrap();

      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteTarget(null);
    }
  };

  const handleClearFilters = () => {
    setAssessmentFilter("");
    setQuestionTypeFilter("");
  };

  const handleView = (id) => {
    navigate(
      `/assessment-sections/${id}`,
    );
  };

  const handleEdit = (id) => {
    navigate(
      `/assessment-sections/${id}/edit`,
    );
  };

  const hasFilters =
    assessmentFilter ||
    questionTypeFilter;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <FiFileText
                    size={22}
                  />
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                  Assessment Management
                </span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Assessment Sections
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                Manage question sections, marks,
                question types, and instructions
                for your assessments.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/assessment-sections/create",
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-[0.98]"
            >
              <span className="text-lg">
                +
              </span>
              Add Section
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FiFilter
                  className="text-indigo-600"
                  size={18}
                />

                <h2 className="text-base font-bold text-slate-800">
                  Filter Sections
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Narrow the list by assessment or
                question type.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="assessment-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Assessment
              </label>

              <div className="relative">
                <FiBookOpen
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <select
                  id="assessment-filter"
                  value={assessmentFilter}
                  onChange={(e) =>
                    setAssessmentFilter(
                      e.target.value,
                    )
                  }
                  disabled={
                    assessmentsLoading
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    All Assessments
                  </option>

                  {assessments.map(
                    (assessment) => (
                      <option
                        key={
                          assessment._id
                        }
                        value={
                          assessment._id
                        }
                      >
                        {getAssessmentName(
                          assessment,
                        )}
                      </option>
                    ),
                  )}
                </select>

                <FiChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="question-type-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Question Type
              </label>

              <div className="relative">
                <FiFileText
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <select
                  id="question-type-filter"
                  value={
                    questionTypeFilter
                  }
                  onChange={(e) =>
                    setQuestionTypeFilter(
                      e.target.value,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    All Question Types
                  </option>

                  {QUESTION_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {formatLabel(type)}
                      </option>
                    ),
                  )}
                </select>

                <FiChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error?.data?.message ||
              "Unable to load assessment sections. Please try again."}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Section List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {isLoading
                  ? "Loading sections..."
                  : `${filteredSections.length} section${
                      filteredSections.length !==
                      1
                        ? "s"
                        : ""
                    } found`}
              </p>
            </div>

            <button
              type="button"
              onClick={refetch}
              disabled={
                isFetching
              }
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <FiRefreshCw
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
                size={16}
              />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-200" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                        <div className="h-3 w-2/3 rounded bg-slate-200" />
                        <div className="h-3 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : filteredSections.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <FiFileText
                  size={28}
                />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No assessment sections found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {hasFilters
                  ? "Try changing or clearing your filters to see more sections."
                  : "Create your first assessment section to start organizing questions."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/assessment-sections/create",
                    )
                  }
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Create Section
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Section
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Assessment
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Question Type
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Questions
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Marks
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Order
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSections.map(
                      (item) => {
                        const assessment =
                          item.assessment;

                        return (
                          <tr
                            key={
                              item._id
                            }
                            className="transition hover:bg-indigo-50/40"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                                  {
                                    item.sectionCode
                                  }
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {
                                      item.title
                                    }
                                  </p>

                                  {item.instructions && (
                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                      {
                                        item.instructions
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
                                {getAssessmentName(
                                  assessment,
                                )}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-400">
                                {getSubjectName(
                                  assessment,
                                ) && (
                                  <span>
                                    {getSubjectName(
                                      assessment,
                                    )}
                                  </span>
                                )}

                                {getClassName(
                                  assessment,
                                ) && (
                                  <span>
                                    •{" "}
                                    {getClassName(
                                      assessment,
                                    )}
                                  </span>
                                )}

                                {getSectionName(
                                  assessment,
                                ) && (
                                  <span>
                                    •{" "}
                                    {getSectionName(
                                      assessment,
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                {formatLabel(
                                  item.questionType,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span className="font-semibold text-slate-700">
                                {
                                  item.numberOfQuestions
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <div>
                                <span className="font-bold text-slate-800">
                                  {
                                    item.totalMarks
                                  }
                                </span>

                                <p className="text-xs text-slate-400">
                                  {
                                    item.marksPerQuestion
                                  }{" "}
                                  / question
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                                {
                                  item.order
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  title="View"
                                  onClick={() =>
                                    handleView(
                                      item._id,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                >
                                  <FiEye
                                    size={17}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    handleEdit(
                                      item._id,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                                >
                                  <FiEdit2
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() =>
                                    setDeleteTarget(
                                      item,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                                >
                                  <FiTrash2
                                    size={16}
                                  />
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

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredSections.map(
                  (item) => {
                    const assessment =
                      item.assessment;

                    return (
                      <div
                        key={
                          item._id
                        }
                        className="p-4"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                            {
                              item.sectionCode
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-slate-800">
                                  {
                                    item.title
                                  }
                                </h3>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {getAssessmentName(
                                    assessment,
                                  )}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                                {formatLabel(
                                  item.questionType,
                                )}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <div className="rounded-lg bg-slate-50 p-2.5">
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                  Questions
                                </p>
                                <p className="mt-1 font-bold text-slate-700">
                                  {
                                    item.numberOfQuestions
                                  }
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-2.5">
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                  Total Marks
                                </p>
                                <p className="mt-1 font-bold text-slate-700">
                                  {
                                    item.totalMarks
                                  }
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-2.5">
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                  Order
                                </p>
                                <p className="mt-1 font-bold text-slate-700">
                                  {
                                    item.order
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs text-slate-400">
                                {
                                  item.marksPerQuestion
                                }{" "}
                                mark / question
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleView(
                                      item._id,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
                                >
                                  <FiEye
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      item._id,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
                                >
                                  <FiEdit2
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      item,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600"
                                >
                                  <FiTrash2
                                    size={16}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FiTrash2
                  size={24}
                />
              </div>

              <h2 className="text-center text-xl font-bold text-slate-800">
                Delete Assessment Section?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                You are about to delete{" "}
                <span className="font-semibold text-slate-700">
                  {deleteTarget.sectionCode}{" "}
                  —{" "}
                  {deleteTarget.title}
                </span>
                . This action cannot be
                undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(
                      null,
                    )
                  }
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {isDeleting
                    ? "Deleting..."
                    : "Delete Section"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentSectionListScreen;
