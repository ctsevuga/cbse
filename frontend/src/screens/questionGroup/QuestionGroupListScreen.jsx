import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Eye,
  Pencil,
  Trash2,
  Filter,
  BookOpen,
  Layers3,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useGetQuestionGroupsQuery, useDeleteQuestionGroupMutation } from "../../slices/questionGroupApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetChaptersQuery } from "../../slices/chapterApiSlice";

const QuestionGroupListScreen = () => {
  const navigate = useNavigate();
const { userInfo } = useSelector((state) => state.auth);

const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [search, setSearch] = useState("");

  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: groupsError,
    refetch,
  } = useGetQuestionGroupsQuery({
    ...(subject && { subject }),
    ...(chapter && { chapter }),
  });

  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useGetSubjectsQuery();

  const { data: chapters = [], isLoading: isChaptersLoading } =
    useGetChaptersQuery(
      subject
        ? {
            subject,
          }
        : undefined,
    );

  const [deleteQuestionGroup, { isLoading: isDeleting }] =
    useDeleteQuestionGroupMutation();

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return groups;
    }

    const searchValue = search.toLowerCase().trim();

    return groups.filter((group) => {
      return (
        group.title?.toLowerCase().includes(searchValue) ||
        group.groupType?.toLowerCase().includes(searchValue) ||
        group.directions?.toLowerCase().includes(searchValue)
      );
    });
  }, [groups, search]);

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setChapter("");
  };

  const handleDelete = async (group) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${group.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestionGroup(group._id).unwrap();
      refetch();
    } catch (error) {
      window.alert(
        error?.data?.message || "Failed to delete question group.",
      );
    }
  };

  const handleView = (id) => {
    navigate(`/question-groups/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/question-groups/${id}/edit`);
  };

  const clearFilters = () => {
    setSubject("");
    setChapter("");
    setSearch("");
  };

  const getSubjectName = (group) => {
    if (typeof group.subject === "object") {
      return (
        group.subject.name ||
        group.subject.title ||
        group.subject.subjectName ||
        "Unknown Subject"
      );
    }

    return "Unknown Subject";
  };

  const getChapterName = (group) => {
    if (typeof group.chapter === "object") {
      return (
        group.chapter.name ||
        group.chapter.title ||
        group.chapter.chapterName ||
        "No Chapter"
      );
    }

    return "No Chapter";
  };

  const getGroupTypeLabel = (type) => {
    if (!type) {
      return "—";
    }

    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getTypeStyle = (type) => {
    const styles = {
      PASSAGE: "bg-blue-50 text-blue-700 ring-blue-600/20",
      CASE_STUDY: "bg-purple-50 text-purple-700 ring-purple-600/20",
      DATA_INTERPRETATION:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      SOURCE_BASED: "bg-orange-50 text-orange-700 ring-orange-600/20",
      COMMON_DIRECTIONS: "bg-pink-50 text-pink-700 ring-pink-600/20",
    };

    return (
      styles[type] ||
      "bg-slate-50 text-slate-700 ring-slate-600/20"
    );
  };

  const isLoading =
    isGroupsLoading || isSubjectsLoading || isChaptersLoading;

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 shadow-xl shadow-indigo-100 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Layers3 className="h-6 w-6 text-white" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Question Groups
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Manage passages, case studies, source-based questions and
                other grouped questions from one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <BookOpen className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-xs font-medium text-indigo-100">
                  Total Groups
                </p>
                <p className="text-xl font-bold text-white">
                  {filteredGroups.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Filter className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Filter Question Groups
                </h2>
                <p className="text-xs text-slate-500">
                  Narrow down groups by subject or chapter
                </p>
              </div>
            </div>

            {(subject || chapter || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Subject
              </label>

              <select
                id="subject"
                value={subject}
                onChange={handleSubjectChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All Subjects</option>

                {subjects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name || item.title || item.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="chapter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Chapter
              </label>

              <select
                id="chapter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                disabled={!subject || isChaptersLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {!subject
                    ? "Select subject first"
                    : isChaptersLoading
                      ? "Loading chapters..."
                      : "All Chapters"}
                </option>

                {chapters.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name || item.title || item.chapterName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search question groups..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>
        </div>

        {isGroupsError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load question groups
              </h3>
              <p className="mt-1 text-sm text-red-600">
                {groupsError?.data?.message ||
                  "Something went wrong while loading the question groups."}
              </p>
            </div>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Available Groups
                </h2>
                <p className="text-sm text-slate-500">
                  {filteredGroups.length} group
                  {filteredGroups.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <button
                type="button"
                onClick={refetch}
                disabled={isGroupsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isGroupsLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse p-5 sm:p-6">
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-4 h-8 w-1/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Layers3 className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                No question groups found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try changing your subject, chapter, or search criteria.
              </p>

              {(subject || chapter || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Group
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Chapter
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Questions
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Marks
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredGroups.map((group) => (
                      <tr
                        key={group._id}
                        className="transition hover:bg-indigo-50/30"
                      >
                        <td className="px-6 py-5">
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900">
                              {group.title}
                            </p>

                            {group.directions && (
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {group.directions}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {getSubjectName(group)}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {getChapterName(group)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getTypeStyle(
                              group.groupType,
                            )}`}
                          >
                            {getGroupTypeLabel(group.groupType)}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-semibold text-slate-800">
                            {group.questionCount ?? 0}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-semibold text-slate-800">
                            {group.totalMarks ?? 0}
                          </span>
                        </td>

                        <td className="px-6 py-5">
  <div className="flex justify-end gap-2">
    {/* View: all roles */}
    <button
      type="button"
      onClick={() => handleView(group._id)}
      title="View"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Eye className="h-4 w-4" />
    </button>

    {/* Edit and Delete: SUPER_ADMIN only */}
    {isSuperAdmin && (
      <>
        <button
          type="button"
          onClick={() => handleEdit(group._id)}
          title="Edit"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => handleDelete(group)}
          disabled={isDeleting}
          title="Delete"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    )}
  </div>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredGroups.map((group) => (
                  <div key={group._id} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {group.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {getSubjectName(group)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getTypeStyle(
                          group.groupType,
                        )}`}
                      >
                        {getGroupTypeLabel(group.groupType)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Chapter</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {getChapterName(group)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Questions</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {group.questionCount ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Total Marks</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {group.totalMarks ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Status</p>
                        <p
                          className={`mt-1 text-sm font-semibold ${
                            group.isActive
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
  {/* View: all roles */}
  <button
    type="button"
    onClick={() => handleView(group._id)}
    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
  >
    <Eye className="h-4 w-4" />
    View
  </button>

  {/* Edit and Delete: SUPER_ADMIN only */}
  {isSuperAdmin && (
    <>
      <button
        type="button"
        onClick={() => handleEdit(group._id)}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(group)}
        disabled={isDeleting}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </>
  )}
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

export default QuestionGroupListScreen;
