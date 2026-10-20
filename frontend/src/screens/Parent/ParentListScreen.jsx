import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetParentsQuery,
  useDeleteParentMutation,
} from "../../slices/parentApiSlice";

const ParentListScreen = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const {
    data: parents = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetParentsQuery();

  const [deleteParent, { isLoading: isDeleting }] =
    useDeleteParentMutation();

  // ======================================================
  // Filter parents
  // ======================================================

  const filteredParents = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return parents.filter((parent) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          parent.isActive) ||
        (statusFilter === "inactive" &&
          !parent.isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const name =
        parent.user?.name?.toLowerCase() || "";

      const email =
        parent.user?.email?.toLowerCase() || "";

      const phone =
        parent.user?.phone?.toLowerCase() || "";

      const schoolName =
        parent.school?.name?.toLowerCase() || "";

      const schoolCode =
        parent.school?.code?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        schoolName.includes(normalizedSearch) ||
        schoolCode.includes(normalizedSearch)
      );
    });
  }, [parents, searchTerm, statusFilter]);

  // ======================================================
  // Statistics
  // ======================================================

  const activeCount = useMemo(
    () =>
      parents.filter(
        (parent) => parent.isActive,
      ).length,
    [parents],
  );

  const inactiveCount = useMemo(
    () =>
      parents.filter(
        (parent) => !parent.isActive,
      ).length,
    [parents],
  );

  // ======================================================
  // Delete handler
  // ======================================================

  const deleteHandler = async (parent) => {
    const parentName =
      parent.user?.name || "this parent";

    const confirmed = window.confirm(
      `Are you sure you want to delete the parent profile for "${parentName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(parent._id);

      await deleteParent(parent._id).unwrap();

      toast.success(
        "Parent profile deleted successfully",
      );

      /*
        Refetch explicitly so the list is immediately
        synchronized even if the mutation endpoint does
        not currently invalidate the parent list cache.
      */
      await refetch();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to delete parent profile";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // Navigation handlers
  // ======================================================

  const viewHandler = (parentId) => {
    navigate(`/parents/${parentId}`);
  };

  const editHandler = (parentId) => {
    navigate(`/parents/${parentId}/edit`);
  };

  // ======================================================
  // Error state
  // ======================================================

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">

        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-300/20 flex items-center justify-center">

            <svg
              className="w-8 h-8 text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v4m0 4h.01M10.29 3.86l-8.1 14a2 2 0 001.74 3h16.14a2 2 0 001.74-3l-8.1-14a2 2 0 00-3.42 0z"
              />
            </svg>

          </div>

          <h2 className="text-xl font-bold text-white mt-5">
            Unable to load parents
          </h2>

          <p className="text-sm text-white/60 mt-2">
            {error?.data?.message ||
              error?.error ||
              "Something went wrong while loading parent profiles."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 h-11 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 sm:py-8">

      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

          <div className="px-5 py-6 sm:px-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-300/20 flex items-center justify-center shrink-0">

                  <svg
                    className="w-6 h-6 text-cyan-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
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
                      d="M19 8v6m3-3h-6"
                    />
                  </svg>

                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Parents
                  </h1>

                  <p className="text-sm text-white/60 mt-1">
                    Manage parent profiles in your
                    school.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/parents/create")
                }
                className="h-11 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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

                Add Parent

              </button>

            </div>

          </div>

          {/* ==================================================
              Statistics
          ================================================== */}

          <div className="px-5 pb-6 sm:px-8">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

              {/* Total */}

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">

                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Total
                </p>

                <p className="text-2xl font-bold text-white mt-1">
                  {parents.length}
                </p>

              </div>

              {/* Active */}

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-300/10 p-4">

                <p className="text-xs text-emerald-100/60 uppercase tracking-wide">
                  Active
                </p>

                <p className="text-2xl font-bold text-emerald-100 mt-1">
                  {activeCount}
                </p>

              </div>

              {/* Inactive */}

              <div className="rounded-xl bg-red-500/10 border border-red-300/10 p-4 col-span-2 sm:col-span-1">

                <p className="text-xs text-red-100/60 uppercase tracking-wide">
                  Inactive
                </p>

                <p className="text-2xl font-bold text-red-100 mt-1">
                  {inactiveCount}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              Filters
          ================================================== */}

          <div className="px-5 pb-6 sm:px-8">

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">

              <div className="flex flex-col lg:flex-row gap-3">

                {/* Search */}

                <div className="relative flex-1">

                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search by name, phone, email or school..."
                    className="w-full h-11 pl-11 pr-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                  />

                </div>

                {/* Status */}

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-11 lg:w-48 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                >
                  <option value="all">
                    All Parents
                  </option>

                  <option value="active">
                    Active Only
                  </option>

                  <option value="inactive">
                    Inactive Only
                  </option>
                </select>

                {/* Refresh */}

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  title="Refresh"
                >

                  <svg
                    className={`w-5 h-5 ${
                      isFetching
                        ? "animate-spin"
                        : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 4v5h5M20 20v-5h-5M5.1 9A7 7 0 0117.9 6.1L20 9M19 15a7 7 0 01-12.9 2.9L4 15"
                    />
                  </svg>

                  <span className="hidden sm:inline">
                    Refresh
                  </span>

                </button>

              </div>

            </div>

          </div>

          {/* ==================================================
              Parent list
          ================================================== */}

          <div className="px-5 pb-6 sm:px-8">

            {isLoading ? (
              <div className="space-y-3">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-xl bg-white/5 border border-white/10 p-5"
                  >
                    <div className="flex gap-4">

                      <div className="w-12 h-12 rounded-xl bg-white/10" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                        <div className="h-3 bg-white/10 rounded w-1/4" />
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            ) : filteredParents.length === 0 ? (

              <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <svg
                    className="w-8 h-8 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                    />
                  </svg>

                </div>

                <h3 className="text-lg font-semibold text-white mt-4">
                  {parents.length === 0
                    ? "No parents found"
                    : "No matching parents"}
                </h3>

                <p className="text-sm text-white/50 mt-2">
                  {parents.length === 0
                    ? "Create a parent profile to get started."
                    : "Try changing your search or status filter."}
                </p>

                {parents.length === 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/parents/create")
                    }
                    className="mt-5 h-11 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
                  >
                    Create Parent
                  </button>
                )}

              </div>

            ) : (

              <div className="space-y-3">

                {filteredParents.map(
                  (parent) => {
                    const parentName =
                      parent.user?.name ||
                      "Unnamed Parent";

                    const initials =
                      parentName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) =>
                          part[0]?.toUpperCase(),
                        )
                        .join("") || "P";

                    const isCurrentlyDeleting =
                      deletingId === parent._id &&
                      isDeleting;

                    return (
                      <div
                        key={parent._id}
                        className="group rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 p-4 sm:p-5"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                          {/* Avatar */}

                          <div className="flex items-center gap-4 min-w-0 flex-1">

                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center shrink-0">

                              <span className="text-lg font-bold text-white">
                                {initials}
                              </span>

                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="font-semibold text-white truncate">
                                  {parentName}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    parent.isActive
                                      ? "bg-emerald-400/10 text-emerald-200 border border-emerald-300/20"
                                      : "bg-red-400/10 text-red-200 border border-red-300/20"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      parent.isActive
                                        ? "bg-emerald-300"
                                        : "bg-red-300"
                                    }`}
                                  />

                                  {parent.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>

                              </div>

                              <p className="text-sm text-white/60 mt-1 truncate">
                                {parent.user?.email ||
                                  "No email available"}
                              </p>

                              <p className="text-xs text-white/40 mt-1">
                                {parent.user?.phone ||
                                  "No phone available"}
                              </p>

                            </div>

                          </div>

                          {/* School */}

                          <div className="lg:w-56">

                            <p className="text-xs text-white/40 uppercase tracking-wide">
                              School
                            </p>

                            <p className="text-sm font-medium text-white/80 mt-1 truncate">
                              {parent.school?.name ||
                                "—"}
                            </p>

                            {parent.school?.code && (
                              <p className="text-xs text-white/40 mt-0.5">
                                {parent.school.code}
                              </p>
                            )}

                          </div>

                          {/* Actions */}

                          <div className="flex items-center gap-2 lg:ml-auto">

                            {/* View */}

                            <button
                              type="button"
                              onClick={() =>
                                viewHandler(
                                  parent._id,
                                )
                              }
                              className="h-10 px-3 rounded-lg bg-cyan-500/10 border border-cyan-300/20 text-cyan-100 hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"
                              title="View parent"
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
                                  strokeWidth={1.8}
                                  d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                                />

                                <circle
                                  cx="12"
                                  cy="12"
                                  r="2.5"
                                  strokeWidth={1.8}
                                />
                              </svg>

                              <span className="hidden sm:inline">
                                View
                              </span>

                            </button>

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                editHandler(
                                  parent._id,
                                )
                              }
                              className="h-10 px-3 rounded-lg bg-amber-500/10 border border-amber-300/20 text-amber-100 hover:bg-amber-500/20 transition flex items-center justify-center gap-2"
                              title="Edit parent"
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
                                  strokeWidth={1.8}
                                  d="M12 20h9"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
                                />
                              </svg>

                              <span className="hidden sm:inline">
                                Edit
                              </span>

                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() =>
                                deleteHandler(
                                  parent,
                                )
                              }
                              disabled={
                                isCurrentlyDeleting
                              }
                              className="h-10 px-3 rounded-lg bg-red-500/10 border border-red-300/20 text-red-100 hover:bg-red-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete parent"
                            >

                              {isCurrentlyDeleting ? (
                                <span className="w-4 h-4 border-2 border-red-200/30 border-t-red-200 rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"
                                  />
                                </svg>
                              )}

                              <span className="hidden sm:inline">
                                {isCurrentlyDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </span>

                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  },
                )}

              </div>

            )}

          </div>

          {/* ==================================================
              Footer
          ================================================== */}

          {!isLoading &&
            filteredParents.length > 0 && (
              <div className="px-5 py-4 sm:px-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <p className="text-xs text-white/40">
                  Showing{" "}
                  <span className="text-white/70 font-medium">
                    {filteredParents.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-white/70 font-medium">
                    {parents.length}
                  </span>{" "}
                  parents
                </p>

                {isFetching && (
                  <div className="flex items-center gap-2 text-xs text-white/40">

                    <span className="w-3 h-3 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />

                    Updating...

                  </div>
                )}

              </div>
            )}

        </div>

        <div className="text-center mt-5 text-white/40 text-xs">
          Parent profiles are managed within your
          school.
        </div>

      </div>

    </div>
  );
};

export default ParentListScreen;
