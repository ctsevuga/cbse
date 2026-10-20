import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Edit3,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useGetChaptersQuery,
  useDeleteChapterMutation,
} from "../../slices/chapterApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";

const ChapterListScreen = () => {
  const navigate = useNavigate();
const { userInfo } = useSelector((state) => state.auth);

const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: chapters = [],
    isLoading,
    isError,
    error,
  } = useGetChaptersQuery();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery({
    isActive: true,
  });

  const [
    deleteChapter,
    { isLoading: isDeleting },
  ] = useDeleteChapterMutation();

  const filteredChapters = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return chapters.filter((chapter) => {
      const matchesSearch =
        !searchText ||
        chapter.title?.toLowerCase().includes(searchText) ||
        chapter.subject?.name
          ?.toLowerCase()
          .includes(searchText) ||
        chapter.subject?.code
          ?.toLowerCase()
          .includes(searchText) ||
        String(chapter.chapterNumber).includes(
          searchText,
        );

      const matchesSubject =
        !subjectFilter ||
        chapter.subject?._id === subjectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          chapter.isActive) ||
        (statusFilter === "inactive" &&
          !chapter.isActive);

      return (
        matchesSearch &&
        matchesSubject &&
        matchesStatus
      );
    });
  }, [
    chapters,
    search,
    subjectFilter,
    statusFilter,
  ]);

  const handleDelete = async (chapter) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Chapter ${chapter.chapterNumber} - "${chapter.title}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteChapter(chapter._id).unwrap();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to delete chapter.",
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSubjectFilter("");
    setStatusFilter("all");
  };

  const hasFilters =
    search ||
    subjectFilter ||
    statusFilter !== "all";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <BookOpen className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Chapters
                  </h1>
                  <p className="mt-1 text-sm text-blue-100 sm:text-base">
                    Manage CBSE subject chapters.
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
  <button
    type="button"
    onClick={() => navigate("/chapters/create")}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
  >
    <Plus className="h-5 w-5" />
    Create Chapter
  </button>
)}
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/80 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search chapter, subject, code or number..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="relative lg:col-span-3">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <select
                  value={subjectFilter}
                  onChange={(e) =>
                    setSubjectFilter(e.target.value)
                  }
                  disabled={subjectsLoading}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : "All Subjects"}
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.name}
                      {subject.code
                        ? ` (${subject.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sm:px-8">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {filteredChapters.length}{" "}
                {filteredChapters.length === 1
                  ? "chapter"
                  : "chapters"}
              </p>

              <p className="text-xs text-slate-400">
                Showing matching chapters
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading chapters...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="p-8">
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error?.data?.message ||
                  error?.error ||
                  "Failed to load chapters."}
              </div>
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-800">
                No chapters found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {hasFilters
                  ? "Try changing your search or filter criteria."
                  : "Create your first chapter to get started."}
              </p>

              {isSuperAdmin && !hasFilters && (
  <button
    type="button"
    onClick={() => navigate("/chapters/create")}
    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
  >
    <Plus className="h-5 w-5" />
    Create Chapter
  </button>
)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-8">
                      #
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Chapter
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-8">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredChapters.map(
                    (chapter) => (
                      <tr
                        key={chapter._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 sm:px-8">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                            {chapter.chapterNumber}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {chapter.subject?.name ||
                                "—"}
                            </p>

                            {chapter.subject?.code && (
                              <p className="mt-0.5 text-xs font-medium text-slate-400">
                                {chapter.subject.code}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-xs text-sm font-semibold text-slate-800">
                            {chapter.title}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-sm truncate text-sm text-slate-500">
                            {chapter.description ||
                              "No description"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              chapter.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {chapter.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 sm:px-8">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/chapters/${chapter._id}`,
                                )
                              }
                              title="View Chapter"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {isSuperAdmin && (
  <>
    <button
      type="button"
      onClick={() => navigate(`/chapters/${chapter._id}/edit`)}
      title="Edit Chapter"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
    >
      <Edit3 className="h-4 w-4" />
    </button>

    <button
      type="button"
      onClick={() => handleDelete(chapter)}
      disabled={isDeleting}
      title="Delete Chapter"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </>
)}
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
    </div>
  );
};

export default ChapterListScreen;