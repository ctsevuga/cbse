
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useGetClassesQuery,
  useDeleteClassMutation,
} from "../../slices/classApiSlice";

const ClassListScreen = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const {
    data: classes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClassesQuery();

  const [deleteClass, { isLoading: isDeleting }] =
    useDeleteClassMutation();

  const filteredClasses = classes.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      item.name?.toLowerCase().includes(search) ||
      item.code?.toLowerCase().includes(search) ||
      item.school?.name?.toLowerCase().includes(search)
    );
  });

  const handleView = (id) => {
    navigate(`/classes/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/classes/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const selectedClass = classes.find(
      (item) => item._id === id,
    );

    if (!selectedClass) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedClass.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteId(id);

      await deleteClass(id).unwrap();

      setDeleteId(null);
    } catch (err) {
      setDeleteId(null);

      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to delete the class. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2
              size={38}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading classes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load classes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the classes."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={17} />
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                <BookOpen
                  size={23}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Classes
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage classes configured for your school.
                </p>
              </div>
            </div>

            <Link
              to="/classes/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <Plus size={18} />
              Create Class
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Classes
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {classes.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <BookOpen
                  size={21}
                  className="text-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Classes
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    classes.filter(
                      (item) => item.isActive,
                    ).length
                  }
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
                <p className="text-sm font-medium text-slate-500">
                  Inactive Classes
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    classes.filter(
                      (item) => !item.isActive,
                    ).length
                  }
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Class List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredClasses.length}{" "}
                  {filteredClasses.length === 1
                    ? "class"
                    : "classes"}{" "}
                  displayed
                </p>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search classes..."
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <BookOpen
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {searchTerm
                  ? "No classes found"
                  : "No classes created yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm
                  ? "Try changing your search term."
                  : "Create your first class to start configuring your school's academic structure."}
              </p>

              {!searchTerm && (
                <Link
                  to="/classes/create"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create Class
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        #
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Class
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Code
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        School
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredClasses.map(
                      (item, index) => (
                        <tr
                          key={item._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                <BookOpen
                                  size={18}
                                  className="text-indigo-600"
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {item.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  Class
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-700">
                              {item.code}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {item.school?.name ||
                                  "—"}
                              </p>

                              {item.school?.code && (
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {item.school.code}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            {item.isActive ? (
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

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(item._id)
                                }
                                title="View Class"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(item._id)
                                }
                                title="Edit Class"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(item._id)
                                }
                                disabled={
                                  isDeleting &&
                                  deleteId ===
                                    item._id
                                }
                                title="Delete Class"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting &&
                                deleteId ===
                                  item._id ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={17}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredClasses.map(
                  (item, index) => (
                    <div
                      key={item._id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <BookOpen
                              size={20}
                              className="text-indigo-600"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              #{index + 1} ·{" "}
                              {item.code}
                            </p>
                          </div>
                        </div>

                        {item.isActive ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-400">
                          School
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.school?.name ||
                            "—"}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(item._id)
                          }
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item._id)
                          }
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item._id)
                          }
                          disabled={
                            isDeleting &&
                            deleteId === item._id
                          }
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting &&
                          deleteId === item._id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}

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

export default ClassListScreen;
