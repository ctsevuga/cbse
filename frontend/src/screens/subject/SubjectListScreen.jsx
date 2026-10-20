import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

import {
  useGetSubjectsQuery,
  useDeleteSubjectMutation,
} from "../../slices/subjectApiSlice";

const SubjectListScreen = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    name: "",
    code: "",
    subjectType: "",
    isActive: "",
  });

  const [searchParams, setSearchParams] = useState({});

  const {
    data: subjects = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSubjectsQuery(searchParams);

  const [
    deleteSubject,
    { isLoading: isDeleting },
  ] = useDeleteSubjectMutation();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const params = {};

    if (filters.name.trim()) {
      params.name = filters.name.trim();
    }

    if (filters.code.trim()) {
      params.code = filters.code.trim();
    }

    if (filters.subjectType) {
      params.subjectType = filters.subjectType;
    }

    if (filters.isActive !== "") {
      params.isActive = filters.isActive;
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      code: "",
      subjectType: "",
      isActive: "",
    });

    setSearchParams({});
  };

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubject(subject._id).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to delete subject.",
      );
    }
  };

  const getSubjectTypeLabel = (type) => {
    const labels = {
      LANGUAGE: "Language",
      CORE: "Core",
      ELECTIVE: "Elective",
      OPTIONAL: "Optional",
      ADDITIONAL: "Additional",
    };

    return labels[type] || type;
  };

  const getSubjectTypeStyle = (type) => {
    const styles = {
      LANGUAGE:
        "bg-purple-50 text-purple-700 border-purple-200",
      CORE:
        "bg-blue-50 text-blue-700 border-blue-200",
      ELECTIVE:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      OPTIONAL:
        "bg-amber-50 text-amber-700 border-amber-200",
      ADDITIONAL:
        "bg-cyan-50 text-cyan-700 border-cyan-200",
    };

    return (
      styles[type] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-sm">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Subjects
              </h1>
              <p className="text-sm text-slate-500">
                Manage CBSE master subjects
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/subjects/create")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <Plus size={18} />
            Add Subject
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="lg:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Subject Name
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search subject name..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Code
              </label>

              <input
                id="code"
                name="code"
                type="text"
                value={filters.code}
                onChange={handleFilterChange}
                placeholder="Subject code"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="subjectType"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Type
              </label>

              <select
                id="subjectType"
                name="subjectType"
                value={filters.subjectType}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  All Types
                </option>
                <option value="LANGUAGE">
                  Language
                </option>
                <option value="CORE">
                  Core
                </option>
                <option value="ELECTIVE">
                  Elective
                </option>
                <option value="OPTIONAL">
                  Optional
                </option>
                <option value="ADDITIONAL">
                  Additional
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="isActive"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </label>

              <select
                id="isActive"
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  All Status
                </option>
                <option value="true">
                  Active
                </option>
                <option value="false">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 lg:col-span-5 lg:justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={17} />
                Clear
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Search size={17} />
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Subject List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {subjects.length} subject
                {subjects.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <Loader2
                  size={22}
                  className="animate-spin text-blue-600"
                />
                Loading subjects...
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <BookOpen size={25} />
              </div>

              <h3 className="font-semibold text-slate-900">
                Unable to load subjects
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {error?.data?.message ||
                  error?.error ||
                  "Something went wrong while loading subjects."}
              </p>

              <button
                type="button"
                onClick={refetch}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : subjects.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <BookOpen size={28} />
              </div>

              <h3 className="font-semibold text-slate-900">
                No subjects found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a subject or change your search
                filters.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/subjects/create")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Subject
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Code
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      CBSE Code
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {subjects.map((subject) => (
                    <tr
                      key={subject._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {subject.name}
                          </p>

                          {subject.shortName && (
                            <p className="mt-1 text-xs text-slate-500">
                              {subject.shortName}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-700">
                          {subject.code}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSubjectTypeStyle(
                            subject.subjectType,
                          )}`}
                        >
                          {getSubjectTypeLabel(
                            subject.subjectType,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {subject.cbseSubjectCode || (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            subject.isActive
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              subject.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {subject.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="View Subject"
                            onClick={() =>
                              navigate(
                                `/subjects/${subject._id}`,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit Subject"
                            onClick={() =>
                              navigate(
                                `/subjects/${subject._id}/edit`,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete Subject"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(subject)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectListScreen;