
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  School,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useDeleteAcademicYearMutation,
  useGetAcademicYearsQuery,
  useUpdateAcademicYearStatusMutation,
} from "../../slices/academicYearApiSlice";


const AcademicYearListScreen = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";

  /*
   * ======================================================
   * State
   * ======================================================
   */

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentFilter, setCurrentFilter] = useState("ALL");

  const [showFilters, setShowFilters] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const [expandedId, setExpandedId] = useState(null);


  /*
   * ======================================================
   * Query parameters
   * ======================================================
   */

  const queryParams = useMemo(() => {
    const params = {};

    if (statusFilter === "ACTIVE") {
      params.isActive = true;
    }

    if (statusFilter === "INACTIVE") {
      params.isActive = false;
    }

    if (currentFilter === "CURRENT") {
      params.isCurrent = true;
    }

    if (currentFilter === "NOT_CURRENT") {
      params.isCurrent = false;
    }

    return params;
  }, [statusFilter, currentFilter]);


  /*
   * ======================================================
   * API
   * ======================================================
   */

  const {
    data: academicYears = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAcademicYearsQuery(queryParams);


  const [
    updateAcademicYearStatus,
    {
      isLoading: isUpdatingStatus,
    },
  ] = useUpdateAcademicYearStatusMutation();


  const [
    deleteAcademicYear,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteAcademicYearMutation();


  /*
   * ======================================================
   * Search
   *
   * Server handles school/status/current filtering.
   * Search is handled locally because the controller does
   * not currently provide a search parameter.
   * ======================================================
   */

  const filteredAcademicYears = useMemo(() => {
    if (!searchTerm.trim()) {
      return academicYears;
    }

    const search = searchTerm.toLowerCase().trim();

    return academicYears.filter((academicYear) => {
      const name =
        academicYear.name?.toLowerCase() || "";

      const schoolName =
        academicYear.school?.name?.toLowerCase() || "";

      const schoolCode =
        academicYear.school?.code?.toLowerCase() || "";

      return (
        name.includes(search) ||
        schoolName.includes(search) ||
        schoolCode.includes(search)
      );
    });
  }, [academicYears, searchTerm]);


  /*
   * ======================================================
   * Statistics
   * ======================================================
   */

  const totalYears = academicYears.length;

  const currentYears = academicYears.filter(
    (item) => item.isCurrent,
  ).length;

  const activeYears = academicYears.filter(
    (item) => item.isActive,
  ).length;


  /*
   * ======================================================
   * Format date
   * ======================================================
   */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  /*
   * ======================================================
   * View
   * ======================================================
   */

  const handleView = (id) => {
    navigate(`/admin/academic-years/${id}`);
  };


  /*
   * ======================================================
   * Edit
   * ======================================================
   */

  const handleEdit = (id) => {
    navigate(`/admin/academic-years/${id}/edit`);
  };


  /*
   * ======================================================
   * Update Active Status
   * ======================================================
   *
   * This changes ONLY isActive.
   *
   * isCurrent is intentionally not changed here.
   * ======================================================
   */

  const handleStatusUpdate = async (academicYear) => {
    try {
      await updateAcademicYearStatus({
        id: academicYear._id,
        isActive: !academicYear.isActive,
      }).unwrap();

      toast.success(
        `Academic year ${!academicYear.isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update academic year status",
      );
    }
  };


  /*
   * ======================================================
   * Delete
   * ======================================================
   */

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await deleteAcademicYear(deleteId).unwrap();

      toast.success("Academic year deleted successfully");

      setDeleteId(null);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to delete academic year",
      );
    }
  };


  /*
   * ======================================================
   * Reset filters
   * ======================================================
   */

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCurrentFilter("ALL");
  };


  /*
   * ======================================================
   * Toggle mobile/expanded details
   * ======================================================
   */

  const toggleExpanded = (id) => {
    setExpandedId((prev) =>
      prev === id ? null : id,
    );
  };


  /*
   * ======================================================
   * Loading
   * ======================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading academic years...
            </p>
          </div>
        </div>
      </div>
    );
  }


  /*
   * ======================================================
   * Error
   * ======================================================
   */

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />

            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              Unable to load academic years
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading academic years."}
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <CalendarDays className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                Academic Years
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage academic years for your school.
              </p>
            </div>

          </div>


          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>


            <button
              type="button"
              onClick={() =>
                navigate("/admin/academic-years/create")
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />

              Add Academic Year
            </button>

          </div>

        </div>


        {/* ==================================================
            Statistics
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Academic Years
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {totalYears}
                </p>
              </div>

              <div className="rounded-lg bg-indigo-100 p-3">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
              </div>

            </div>
          </div>


          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Years
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {activeYears}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

            </div>
          </div>


          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Current Year
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-600">
                  {currentYears}
                </p>
              </div>

              <div className="rounded-lg bg-indigo-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              </div>

            </div>
          </div>

        </div>


        {/* ==================================================
            Search / Filters
        ================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">

            <div className="relative flex-1">

              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder={
                  isSuperAdmin
                    ? "Search academic year, school or school code..."
                    : "Search academic year..."
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>


            <button
              type="button"
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                showFilters
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" />

              Filters

              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

          </div>


          {showFilters && (
            <div className="border-t border-slate-200 bg-slate-50 p-4">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* Active Filter */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>


                {/* Current Filter */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Academic Year
                  </label>

                  <select
                    value={currentFilter}
                    onChange={(e) =>
                      setCurrentFilter(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="ALL">All Years</option>
                    <option value="CURRENT">Current</option>
                    <option value="NOT_CURRENT">
                      Previous / Not Current
                    </option>
                  </select>
                </div>


                {/* Reset */}

                <div className="flex items-end">

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear Filters
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>


        {/* ==================================================
            Results
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Results Header */}

          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-800">
                Academic Year List
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Showing {filteredAcademicYears.length} of{" "}
                {academicYears.length} academic years
              </p>
            </div>

          </div>


          {/* ==================================================
              Empty State
          ================================================== */}

          {filteredAcademicYears.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No academic years found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {searchTerm ||
                statusFilter !== "ALL" ||
                currentFilter !== "ALL"
                  ? "Try changing your search or filters."
                  : "Create your first academic year to get started."}
              </p>

              {!searchTerm &&
                statusFilter === "ALL" &&
                currentFilter === "ALL" && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/admin/academic-years/create",
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Academic Year
                  </button>
                )}

            </div>
          ) : (
            <>

              {/* ==================================================
                  Desktop Table
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">

                <table className="min-w-full divide-y divide-slate-200">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Academic Year
                      </th>

                      {isSuperAdmin && (
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          School
                        </th>
                      )}

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Period
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Current
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100 bg-white">

                    {filteredAcademicYears.map(
                      (academicYear) => (
                        <tr
                          key={academicYear._id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Academic Year */}

                          <td className="whitespace-nowrap px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                <CalendarDays className="h-5 w-5 text-indigo-600" />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">

                                  <span className="font-semibold text-slate-800">
                                    {academicYear.name}
                                  </span>

                                  {academicYear.isCurrent && (
                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                      Current
                                    </span>
                                  )}

                                </div>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Created{" "}
                                  {formatDate(
                                    academicYear.createdAt,
                                  )}
                                </p>
                              </div>

                            </div>

                          </td>


                          {/* School */}

                          {isSuperAdmin && (
                            <td className="whitespace-nowrap px-5 py-4">

                              <div className="flex items-center gap-2">

                                <School className="h-4 w-4 text-slate-400" />

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {academicYear.school?.name ||
                                      "-"}
                                  </p>

                                  {academicYear.school?.code && (
                                    <p className="text-xs text-slate-400">
                                      {academicYear.school.code}
                                    </p>
                                  )}
                                </div>

                              </div>

                            </td>
                          )}


                          {/* Period */}

                          <td className="whitespace-nowrap px-5 py-4">

                            <p className="text-sm font-medium text-slate-700">
                              {formatDate(
                                academicYear.startDate,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              to{" "}
                              {formatDate(
                                academicYear.endDate,
                              )}
                            </p>

                          </td>


                          {/* Status */}

                          <td className="px-5 py-4 text-center">

                            {academicYear.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Inactive
                              </span>
                            )}

                          </td>


                          {/* Current */}

                          <td className="px-5 py-4 text-center">

                            {academicYear.isCurrent ? (
                              <CheckCircle2 className="mx-auto h-5 w-5 text-indigo-600" />
                            ) : (
                              <span className="text-slate-300">
                                —
                              </span>
                            )}

                          </td>


                          {/* Actions */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-1">

                              {/* View */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    academicYear._id,
                                  )
                                }
                                title="View"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>


                              {/* Edit */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    academicYear._id,
                                  )
                                }
                                title="Edit"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>


                              {/* Status */}

                              <button
                                type="button"
                                disabled={
                                  isUpdatingStatus
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    academicYear,
                                  )
                                }
                                title={
                                  academicYear.isActive
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  academicYear.isActive
                                    ? "text-emerald-600 hover:bg-red-50 hover:text-red-600"
                                    : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                              >
                                {academicYear.isActive ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>


                              {/* Delete */}

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteId(
                                    academicYear._id,
                                  )
                                }
                                title="Delete"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>


              {/* ==================================================
                  Mobile Cards
              ================================================== */}

              <div className="divide-y divide-slate-200 md:hidden">

                {filteredAcademicYears.map(
                  (academicYear) => {

                    const isExpanded =
                      expandedId === academicYear._id;

                    return (
                      <div
                        key={academicYear._id}
                        className="p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                              <CalendarDays className="h-5 w-5 text-indigo-600" />
                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="font-semibold text-slate-800">
                                  {academicYear.name}
                                </p>

                                {academicYear.isCurrent && (
                                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                                    Current
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatDate(
                                  academicYear.startDate,
                                )}{" "}
                                -{" "}
                                {formatDate(
                                  academicYear.endDate,
                                )}
                              </p>

                            </div>

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(
                                academicYear._id,
                              )
                            }
                            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>

                        </div>


                        <div className="mt-3 flex items-center justify-between">

                          {academicYear.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}


                          <div className="flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  academicYear._id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  academicYear._id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                handleStatusUpdate(
                                  academicYear,
                                )
                              }
                              className={`rounded-lg p-2 ${
                                academicYear.isActive
                                  ? "text-emerald-600 hover:bg-red-50 hover:text-red-600"
                                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                            >
                              {academicYear.isActive ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteId(
                                  academicYear._id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        </div>


                        {/* Expanded Information */}

                        {isExpanded && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4">

                            {isSuperAdmin && (
                              <div className="mb-3 flex items-center gap-2">
                                <School className="h-4 w-4 text-slate-400" />

                                <div>
                                  <p className="text-xs text-slate-400">
                                    School
                                  </p>

                                  <p className="text-sm font-medium text-slate-700">
                                    {academicYear.school?.name ||
                                      "-"}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">

                              <div>
                                <p className="text-xs text-slate-400">
                                  Start Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-700">
                                  {formatDate(
                                    academicYear.startDate,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-400">
                                  End Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-700">
                                  {formatDate(
                                    academicYear.endDate,
                                  )}
                                </p>
                              </div>

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  },
                )}

              </div>

            </>
          )}

        </div>

      </div>


      {/* ======================================================
          Delete Confirmation Modal
      ====================================================== */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                Delete Academic Year?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This action will permanently delete the
                academic year. Any data depending on this
                academic year may be affected.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteId(null)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};


export default AcademicYearListScreen;

