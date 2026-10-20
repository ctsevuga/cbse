import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  FileEdit,
  Filter,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetAssessmentChoiceGroupsQuery,
  useDeactivateAssessmentChoiceGroupMutation,
} from "../../slices/assessmentChoiceGroupApiSlice";

import {
  useGetAssessmentsQuery,
} from "../../slices/assessmentApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const AssessmentChoiceGroupList = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    assessment: "",
    section: "",
    isActive: "true",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: assessmentsData,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
  } = useGetAssessmentsQuery();

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useGetSectionsQuery(
    {
      assessment: filters.assessment,
    },
    {
      skip: !filters.assessment,
    },
  );

  const {
    data: choiceGroupsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAssessmentChoiceGroupsQuery(
    {
      ...(filters.assessment && {
        assessment: filters.assessment,
      }),
      ...(filters.section && {
        section: filters.section,
      }),
      ...(filters.isActive && {
        isActive: filters.isActive,
      }),
    },
  );

  const [
    deactivateAssessmentChoiceGroup,
    {
      isLoading: isDeactivating,
    },
  ] =
    useDeactivateAssessmentChoiceGroupMutation();

  const assessments =
    assessmentsData?.assessments ||
    assessmentsData?.data ||
    assessmentsData ||
    [];

  const sections =
    sectionsData?.sections ||
    sectionsData?.data ||
    sectionsData ||
    [];

  const choiceGroups =
    choiceGroupsData?.choiceGroups ||
    choiceGroupsData?.data ||
    choiceGroupsData ||
    [];

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      section: "",
    }));
  }, [filters.assessment]);

  const getAssessmentId = (assessment) =>
    assessment?._id || assessment?.id;

  const getSectionId = (section) =>
    section?._id || section?.id;

  const getChoiceGroupId = (group) =>
    group?._id || group?.id;

  const getAssessmentName = (assessment) =>
    assessment?.name ||
    assessment?.title ||
    assessment?.assessmentName ||
    "Untitled Assessment";

  const getSectionName = (section) =>
    section?.name ||
    section?.title ||
    section?.sectionName ||
    "Untitled Section";

  const getGroupAssessment = (group) => {
    if (
      group?.assessment &&
      typeof group.assessment === "object"
    ) {
      return (
        group.assessment.name ||
        group.assessment.title ||
        group.assessment.assessmentName ||
        "Assessment"
      );
    }

    const assessment = assessments.find(
      (item) =>
        getAssessmentId(item) ===
        group?.assessment,
    );

    return assessment
      ? getAssessmentName(assessment)
      : "Assessment";
  };

  const getGroupSection = (group) => {
    if (
      group?.section &&
      typeof group.section === "object"
    ) {
      return (
        group.section.name ||
        group.section.title ||
        group.section.sectionName ||
        "Section"
      );
    }

    if (!group?.section) {
      return "Assessment-wide";
    }

    const section = sections.find(
      (item) =>
        getSectionId(item) === group.section,
    );

    return section
      ? getSectionName(section)
      : "Section";
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      assessment: "",
      section: "",
      isActive: "true",
    });
  };

  const handleView = (id) => {
    navigate(
      `/assessment-choice-groups/${id}`,
    );
  };

  const handleEdit = (id) => {
    navigate(
      `/assessment-choice-groups/${id}/edit`,
    );
  };

  const handleDelete = async (group) => {
    const id = getChoiceGroupId(group);

    if (!id) {
      toast.error(
        "Unable to identify the choice group.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${group.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deactivateAssessmentChoiceGroup(
        id,
      ).unwrap();

      toast.success(
        "Assessment choice group deactivated successfully.",
      );

      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Unable to deactivate the assessment choice group.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getSelectionLabel = (mode) => {
    switch (mode) {
      case "EXACT":
        return "Exactly";
      case "AT_LEAST":
        return "At least";
      case "AT_MOST":
        return "At most";
      case "ANY":
      default:
        return "Any";
    }
  };

  const getSelectionBadge = (mode) => {
    switch (mode) {
      case "EXACT":
        return "bg-purple-50 text-purple-700 ring-purple-600/10";
      case "AT_LEAST":
        return "bg-blue-50 text-blue-700 ring-blue-600/10";
      case "AT_MOST":
        return "bg-orange-50 text-orange-700 ring-orange-600/10";
      case "ANY":
      default:
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    }
  };

  const activeCount = choiceGroups.filter(
    (group) => group.isActive !== false,
  ).length;

  const inactiveCount = choiceGroups.filter(
    (group) => group.isActive === false,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <ListChecks className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Assessment Choice Groups
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage question selection rules across your assessments.
              </p>
            </div>
          </div>

          <Link
            to="/assessment-choice-groups/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Create Choice Group
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Groups
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {choiceGroups.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ListChecks className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-500">
                  {inactiveCount}
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Choice Groups
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Filter and manage your assessment choice groups.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (current) => !current,
                    )
                  }
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                    showFilters
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>

                <button
                  type="button"
                  onClick={refetch}
                  disabled={isFetching}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

          {showFilters && (
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="assessment"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Assessment
                  </label>

                  <div className="relative">
                    <select
                      id="assessment"
                      name="assessment"
                      value={filters.assessment}
                      onChange={handleFilterChange}
                      disabled={assessmentsLoading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100"
                    >
                      <option value="">
                        {assessmentsLoading
                          ? "Loading assessments..."
                          : "All assessments"}
                      </option>

                      {assessments.map(
                        (assessment) => (
                          <option
                            key={getAssessmentId(
                              assessment,
                            )}
                            value={getAssessmentId(
                              assessment,
                            )}
                          >
                            {getAssessmentName(
                              assessment,
                            )}
                          </option>
                        ),
                      )}
                    </select>

                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {assessmentsError && (
                    <p className="mt-1 text-xs text-red-500">
                      Unable to load assessments.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="section"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Section
                  </label>

                  <div className="relative">
                    <select
                      id="section"
                      name="section"
                      value={filters.section}
                      onChange={handleFilterChange}
                      disabled={
                        !filters.assessment ||
                        sectionsLoading
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100"
                    >
                      <option value="">
                        {!filters.assessment
                          ? "Select assessment first"
                          : sectionsLoading
                            ? "Loading sections..."
                            : "All sections"}
                      </option>

                      {sections.map((section) => (
                        <option
                          key={getSectionId(section)}
                          value={getSectionId(section)}
                        >
                          {getSectionName(section)}
                        </option>
                      ))}
                    </select>

                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {sectionsError && (
                    <p className="mt-1 text-xs text-red-500">
                      Unable to load sections.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="isActive"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </label>

                  <div className="relative">
                    <select
                      id="isActive"
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="true">
                        Active
                      </option>
                      <option value="false">
                        Inactive
                      </option>
                      <option value="">
                        All statuses
                      </option>
                    </select>

                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {(filters.assessment ||
                filters.section ||
                filters.isActive !== "true") && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500">
                    Filters are applied automatically.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading choice groups...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[350px] items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Unable to load choice groups
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {error?.data?.message ||
                    "Something went wrong while loading the data."}
                </p>

                <button
                  type="button"
                  onClick={refetch}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            </div>
          ) : choiceGroups.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center px-6">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <ListChecks className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  No choice groups found
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  There are no choice groups matching the current
                  filters. Create your first choice group to define
                  question selection rules.
                </p>

                <Link
                  to="/assessment-choice-groups/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Choice Group
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Choice Group
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Assessment
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Section
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Selection
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Marks
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {choiceGroups.map((group) => {
                      const id =
                        getChoiceGroupId(group);

                      return (
                        <tr
                          key={id}
                          className="group transition hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {group.name}
                                </p>

                                {group.isActive ===
                                  false && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    Inactive
                                  </span>
                                )}
                              </div>

                              {group.code && (
                                <p className="mt-1 font-mono text-xs text-slate-400">
                                  {group.code}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                              {getGroupAssessment(
                                group,
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                group.section
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {getGroupSection(
                                group,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getSelectionBadge(
                                  group.selectionMode,
                                )}`}
                              >
                                {getSelectionLabel(
                                  group.selectionMode,
                                )}{" "}
                                {group.requiredQuestions}
                              </span>

                              {group.maxQuestions && (
                                <span className="text-xs text-slate-400">
                                  Max{" "}
                                  {
                                    group.maxQuestions
                                  }
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {group.totalMarks ??
                                "—"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(id)
                                }
                                title="View"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(id)
                                }
                                title="Edit"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                              >
                                <FileEdit className="h-4 w-4" />
                              </button>

                              {group.isActive !==
                                false && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      group,
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                      id ||
                                    isDeactivating
                                  }
                                  title="Delete"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId ===
                                  id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {choiceGroups.map((group) => {
                  const id =
                    getChoiceGroupId(group);

                  return (
                    <div
                      key={id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {group.name}
                            </h3>

                            {group.isActive ===
                              false && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                                Inactive
                              </span>
                            )}
                          </div>

                          {group.code && (
                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {group.code}
                            </p>
                          )}
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getSelectionBadge(
                            group.selectionMode,
                          )}`}
                        >
                          {getSelectionLabel(
                            group.selectionMode,
                          )}{" "}
                          {group.requiredQuestions}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Assessment
                          </p>
                          <p className="mt-1 truncate text-xs font-medium text-slate-700">
                            {getGroupAssessment(
                              group,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Section
                          </p>
                          <p className="mt-1 truncate text-xs font-medium text-slate-700">
                            {getGroupSection(
                              group,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Maximum
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {group.maxQuestions ??
                              "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Marks
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {group.totalMarks ??
                              "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        >
                          <FileEdit className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        {group.isActive !==
                          false && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(group)
                            }
                            disabled={
                              deletingId === id ||
                              isDeactivating
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingId === id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {choiceGroups.length}
                  </span>{" "}
                  choice{" "}
                  {choiceGroups.length === 1
                    ? "group"
                    : "groups"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentChoiceGroupList;
