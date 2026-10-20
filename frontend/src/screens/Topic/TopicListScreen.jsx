import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  ChevronDown,
  Edit3,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useGetTopicsQuery,
  useDeleteTopicMutation,
} from "../../slices/topicApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";

const TopicListScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";

  const [subjectFilter, setSubjectFilter] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: topicsData,
    isLoading: topicsLoading,
    isError: topicsError,
    error: topicsErrorData,
    refetch,
  } = useGetTopicsQuery();

  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetSubjectsQuery();

  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();

  const [deleteTopic, { isLoading: deletingTopic }] = useDeleteTopicMutation();

  const topics = Array.isArray(topicsData)
    ? topicsData
    : topicsData?.data || [];

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.data || [];

  const classes = Array.isArray(classesData)
    ? classesData
    : classesData?.data || [];

  const chapters = useMemo(() => {
    const allChapters = classes.flatMap((item) => item.chapters || []);

    const uniqueChapters = new Map();

    allChapters.forEach((chapter) => {
      if (!chapter?._id) {
        return;
      }

      const chapterSubject = chapter.subject?._id || chapter.subject;

      if (!subjectFilter || chapterSubject === subjectFilter) {
        uniqueChapters.set(chapter._id, chapter);
      }
    });

    return Array.from(uniqueChapters.values());
  }, [classes, subjectFilter]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const topicSubject = topic.subject?._id || topic.subject;

      const topicChapter = topic.chapter?._id || topic.chapter;

      const matchesSubject = !subjectFilter || topicSubject === subjectFilter;

      const matchesChapter = !chapterFilter || topicChapter === chapterFilter;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        topic.name?.toLowerCase().includes(search) ||
        topic.chapter?.title?.toLowerCase().includes(search) ||
        topic.subject?.name?.toLowerCase().includes(search);

      return matchesSubject && matchesChapter && matchesSearch;
    });
  }, [topics, subjectFilter, chapterFilter, searchTerm]);

  const getSubjectName = (subject) =>
    subject?.name || subject?.subjectName || "";

  const getSubjectCode = (subject) =>
    subject?.code || subject?.subjectCode || subject?.cbseSubjectCode || "";

  const getChapterName = (chapter) => chapter?.title || chapter?.name || "";

  const getChapterNumber = (chapter) =>
    chapter?.chapterNumber || chapter?.chapterNo || "";

  const getTopicStatus = (topic) => topic.isActive !== false;

  const clearFilters = () => {
    setSubjectFilter("");
    setChapterFilter("");
    setSearchTerm("");
  };

  const subjectChangeHandler = (e) => {
    setSubjectFilter(e.target.value);
    setChapterFilter("");
  };

  const viewHandler = (id) => {
    navigate(`/admin/topics/${id}`);
  };

  const editHandler = (id) => {
    navigate(`/admin/topics/${id}/edit`);
  };

  const deleteHandler = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the topic "${name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTopic(id).unwrap();
      await refetch();
    } catch (err) {
      window.alert(err?.data?.message || "Unable to delete topic.");
    }
  };

  const errorMessage =
    topicsErrorData?.data?.message ||
    topicsErrorData?.error ||
    "Unable to load topics.";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <BookOpen className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Topics</h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage topics across subjects and chapters
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin/topics/create")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              <Plus className="h-4 w-4" />
              Create Topic
            </button>
          )}
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-5 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />

              <div>
                <h2 className="font-semibold text-slate-800">Filter Topics</h2>

                <p className="text-xs text-slate-500">
                  Filter topics by subject and chapter
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="subjectFilter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subject
              </label>

              <div className="relative">
                <select
                  id="subjectFilter"
                  value={subjectFilter}
                  onChange={subjectChangeHandler}
                  disabled={subjectsLoading}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {subjectsLoading ? "Loading subjects..." : "All Subjects"}
                  </option>

                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {getSubjectName(subject)}
                      {getSubjectCode(subject)
                        ? ` (${getSubjectCode(subject)})`
                        : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="chapterFilter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Chapter
              </label>

              <div className="relative">
                <select
                  id="chapterFilter"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  disabled={!subjectFilter || classesLoading}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {!subjectFilter
                      ? "Select subject first"
                      : classesLoading
                        ? "Loading chapters..."
                        : "All Chapters"}
                  </option>

                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {getChapterNumber(chapter)
                        ? `Chapter ${getChapterNumber(chapter)} - `
                        : ""}
                      {getChapterName(chapter)}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="searchTerm"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="searchTerm"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search topic..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {(subjectFilter || chapterFilter || searchTerm) && (
            <div className="flex justify-end border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {topicsError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Topic List</h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredTopics.length}{" "}
                {filteredTopics.length === 1 ? "topic" : "topics"} found
              </p>
            </div>

            <button
              type="button"
              onClick={refetch}
              disabled={topicsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${topicsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {topicsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="text-sm text-slate-500">Loading topics...</p>
              </div>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <BookOpen className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No topics found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are no topics matching the selected filters.
              </p>

              {(subjectFilter || chapterFilter || searchTerm) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Topic
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Chapter
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTopics.map((topic) => (
                      <tr
                        key={topic._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">
                            {topic.name}
                          </div>

                          {topic.description && (
                            <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {topic.description}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {getSubjectName(topic.subject)}
                          </div>

                          {getSubjectCode(topic.subject) && (
                            <div className="mt-1 text-xs text-slate-400">
                              {getSubjectCode(topic.subject)}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {getChapterNumber(topic.chapter)
                              ? `Chapter ${getChapterNumber(topic.chapter)}`
                              : ""}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {getChapterName(topic.chapter)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              getTopicStatus(topic)
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {getTopicStatus(topic) ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
  <div className="flex justify-end gap-2">
    {/* View: visible to all user roles */}
    <button
      type="button"
      title="View"
      onClick={() => viewHandler(topic._id)}
      className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Eye className="h-4 w-4" />
    </button>

    {/* Edit and Delete: SUPER_ADMIN only */}
    {isSuperAdmin && (
      <>
        <button
          type="button"
          title="Edit"
          onClick={() => editHandler(topic._id)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
        >
          <Edit3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Delete"
          disabled={deletingTopic}
          onClick={() =>
            deleteHandler(topic._id, topic.name)
          }
          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="divide-y divide-slate-200 md:hidden">
                {filteredTopics.map((topic) => (
                  <div key={topic._id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-800">
                          {topic.name}
                        </h3>

                        {topic.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {topic.description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          getTopicStatus(topic)
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {getTopicStatus(topic) ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-xs text-slate-400">Subject</span>

                        <p className="font-medium text-slate-700">
                          {getSubjectName(topic.subject)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-xs text-slate-400">Chapter</span>

                        <p className="font-medium text-slate-700">
                          {getChapterNumber(topic.chapter)
                            ? `Chapter ${getChapterNumber(topic.chapter)} - `
                            : ""}
                          {getChapterName(topic.chapter)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {/* View: visible to all roles */}
                      <button
                        type="button"
                        title="View"
                        onClick={() => viewHandler(topic._id)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit: SUPER_ADMIN only */}
                      {isSuperAdmin && (
  <>
    <button
      type="button"
      title="Edit"
      onClick={() => editHandler(topic._id)}
      className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
    >
      <Edit3 className="h-4 w-4" />
    </button>

    <button
      type="button"
      title="Delete"
      disabled={deletingTopic}
      onClick={() => deleteHandler(topic._id, topic.name)}
      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
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

export default TopicListScreen;
