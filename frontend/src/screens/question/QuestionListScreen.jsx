import React, { useState } from "react";
import { useSelector } from "react-redux";

import {
  Search,
  RefreshCw,
  Filter,
  Eye,
  Edit3,
  Trash2,
  BookOpen,
  Layers3,
  ListTree,
  Settings2,
  FolderTree,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import MathText from '../../components/MathText';
import '../../css/questionText.css';
import { useNavigate } from "react-router-dom";

import { useGetQuestionsQuery, useDeleteQuestionMutation } from "../../slices/questionApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetChaptersQuery } from "../../slices/chapterApiSlice";
import { useGetTopicsQuery } from "../../slices/topicApiSlice";
import { useGetAnswerEditorConfigurationsQuery } from "../../slices/answerEditorConfigurationApiSlice";
import { useGetQuestionGroupsQuery } from "../../slices/questionGroupApiSlice";

const initialFilters = {
  subject: "",
  chapter: "",
  topic: "",
  answerEditorConfiguration: "",
  questionGroup: "",
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.subjects)) return data.subjects;
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (Array.isArray(data?.topics)) return data.topics;
  if (Array.isArray(data?.configurations)) return data.configurations;
  if (Array.isArray(data?.questionGroups)) return data.questionGroups;
  return [];
};

const getDisplayName = (item) =>
  item?.name ||
  item?.title ||
  item?.chapterName ||
  item?.topicName ||
  item?.questionGroupName ||
  item?.code ||
  "";

const SelectField = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && <Icon size={16} className="text-emerald-600" />}
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{placeholder}</option>

          {options.map((item) => (
            <option key={item._id} value={item._id}>
              {getDisplayName(item)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

const Badge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-slate-100 text-slate-700",
    easy: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-rose-50 text-rose-700",
    approved: "bg-emerald-50 text-emerald-700",
    draft: "bg-slate-100 text-slate-700",
    pending: "bg-blue-50 text-blue-700",
    rejected: "bg-rose-50 text-rose-700",
    archived: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[type] || styles.default
      }`}
    >
      {children}
    </span>
  );
};

const getDifficultyType = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "easy";
    case "MEDIUM":
      return "medium";
    case "HARD":
      return "hard";
    default:
      return "default";
  }
};

const getStatusType = (status) => {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "DRAFT":
      return "draft";
    case "PENDING_APPROVAL":
      return "pending";
    case "REJECTED":
      return "rejected";
    case "ARCHIVED":
      return "archived";
    default:
      return "default";
  }
};

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const QuestionListScreen = () => {
  const navigate = useNavigate();
const { userInfo } = useSelector((state) => state.auth);

const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";

  const [filters, setFilters] = useState(initialFilters);

  const {
    data: questionsData,
    isLoading: questionsLoading,
    isFetching: questionsFetching,
    isError: questionsError,
    refetch,
  } = useGetQuestionsQuery(filters);

  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetSubjectsQuery({ isActive: true });

  const { data: chaptersData, isLoading: chaptersLoading } =
    useGetChaptersQuery(
      {
        subject: filters.subject,
        isActive: true,
      },
      {
        skip: !filters.subject,
      }
    );

  const { data: topicsData, isLoading: topicsLoading } =
    useGetTopicsQuery(
      {
        chapter: filters.chapter,
        subject: filters.subject,
        isActive: true,
      },
      {
        skip: !filters.chapter,
      }
    );

  const {
    data: configurationsData,
    isLoading: configurationsLoading,
  } = useGetAnswerEditorConfigurationsQuery(
    {
      subject: filters.subject,
      isActive: true,
    },
    {
      skip: !filters.subject,
    }
  );

  const { data: questionGroupsData, isLoading: questionGroupsLoading } =
    useGetQuestionGroupsQuery(
      {
        subject: filters.subject,
        isActive: true,
      },
      {
        skip: !filters.subject,
      }
    );

  const [deleteQuestion, { isLoading: deleting }] =
    useDeleteQuestionMutation();

  const subjects = getList(subjectsData);
  const chapters = getList(chaptersData);
  const topics = getList(topicsData);
  const configurations = getList(configurationsData);
  const questionGroups = getList(questionGroupsData);
  const questions = getList(questionsData);

  const handleSubjectChange = (value) => {
    setFilters({
      subject: value,
      chapter: "",
      topic: "",
      answerEditorConfiguration: "",
      questionGroup: "",
    });
  };

  const handleChapterChange = (value) => {
    setFilters((previous) => ({
      ...previous,
      chapter: value,
      topic: "",
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleView = (id) => {
    navigate(`/questions/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/questions/${id}/edit`);
  };

  const handleDelete = async (question) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      await deleteQuestion(question._id).unwrap();
      refetch();
    } catch (error) {
      window.alert(
        error?.data?.message || "Unable to delete the question."
      );
    }
  };

  const isLoading =
    questionsLoading ||
    subjectsLoading ||
    (filters.subject && chaptersLoading) ||
    (filters.chapter && topicsLoading);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-emerald-100">
                  <BookOpen size={20} />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Question Bank
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Questions
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-emerald-50 sm:text-base">
                  Manage, review and organize questions by subject, chapter,
                  topic and answer configuration.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Filter size={17} />
                  Clear Filters
                </button>

                <button
                  type="button"
                  onClick={refetch}
                  disabled={questionsFetching}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={questionsFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Search size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Filter Questions
              </h2>
              <p className="text-sm text-slate-500">
                Narrow the question bank using the filters below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SelectField
              label="Subject"
              icon={BookOpen}
              value={filters.subject}
              onChange={handleSubjectChange}
              options={subjects}
              placeholder={
                subjectsLoading ? "Loading subjects..." : "All Subjects"
              }
            />

            <SelectField
              label="Chapter"
              icon={Layers3}
              value={filters.chapter}
              onChange={handleChapterChange}
              options={chapters}
              disabled={!filters.subject}
              placeholder={
                !filters.subject
                  ? "Select subject first"
                  : chaptersLoading
                  ? "Loading chapters..."
                  : "All Chapters"
              }
            />

            <SelectField
              label="Topic"
              icon={ListTree}
              value={filters.topic}
              onChange={(value) =>
                handleFilterChange("topic", value)
              }
              options={topics}
              disabled={!filters.chapter}
              placeholder={
                !filters.chapter
                  ? "Select chapter first"
                  : topicsLoading
                  ? "Loading topics..."
                  : "All Topics"
              }
            />

            <SelectField
              label="Answer Configuration"
              icon={Settings2}
              value={filters.answerEditorConfiguration}
              onChange={(value) =>
                handleFilterChange(
                  "answerEditorConfiguration",
                  value
                )
              }
              options={configurations}
              disabled={!filters.subject}
              placeholder={
                !filters.subject
                  ? "Select subject first"
                  : configurationsLoading
                  ? "Loading..."
                  : "All Configurations"
              }
            />

            <SelectField
              label="Question Group"
              icon={FolderTree}
              value={filters.questionGroup}
              onChange={(value) =>
                handleFilterChange("questionGroup", value)
              }
              options={questionGroups}
              disabled={!filters.subject}
              placeholder={
                !filters.subject
                  ? "Select subject first"
                  : questionGroupsLoading
                  ? "Loading..."
                  : "All Question Groups"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Question List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {questions.length} question
                  {questions.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {questionsFetching && (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <RefreshCw size={16} className="animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                <p className="text-sm font-medium text-slate-500">
                  Loading questions...
                </p>
              </div>
            </div>
          ) : questionsError ? (
            <div className="flex min-h-[300px] items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertCircle size={24} />
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  Unable to load questions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Please try refreshing the question list.
                </p>

                <button
                  type="button"
                  onClick={refetch}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BookOpen size={26} />
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  No questions found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing or clearing your filters.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Question
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subject
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Chapter / Topic
                      </th>
                      {/* <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Marks
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Difficulty
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th> */}
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {questions.map((question) => {
                      const subjectName = getDisplayName(question.subject);
                      const chapterName = getDisplayName(question.chapter);
                      const topicName = getDisplayName(question.topic);

                      return (
                        <tr
                          key={question._id}
                          className="transition hover:bg-emerald-50/40"
                        >
                          <td className="max-w-md px-5 py-4">
                            <div className="line-clamp-2 text-sm font-semibold leading-6 text-slate-800">
                              <MathText text={question.questionText} />
                            </div>

                            {question.questionGroup && (
                              <div className="mt-1 text-xs text-slate-400">
                                Group:{" "}
                                {getDisplayName(
                                  question.questionGroup
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-slate-700">
                              {subjectName || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="max-w-[180px]">
                              <div className="truncate text-sm font-medium text-slate-700">
                                {chapterName || "-"}
                              </div>

                              {topicName && (
                                <div className="mt-1 truncate text-xs text-slate-400">
                                  {topicName}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* <td className="px-4 py-4 text-center">
                            <Badge>
                              {formatLabel(question.questionType)}
                            </Badge>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-emerald-50 px-2 text-sm font-bold text-emerald-700">
                              {question.marks}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <Badge
                              type={getDifficultyType(
                                question.difficulty
                              )}
                            >
                              {formatLabel(question.difficulty)}
                            </Badge>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <Badge
                              type={getStatusType(question.status)}
                            >
                              {formatLabel(question.status)}
                            </Badge>
                          </td> */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
  {/* View: visible to all roles */}
  <button
    type="button"
    onClick={() => handleView(question._id)}
    title="View"
    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
  >
    <Eye size={17} />
  </button>

  {/* Edit and Delete: SUPER_ADMIN only */}
  {isSuperAdmin && (
    <>
      <button
        type="button"
        onClick={() => handleEdit(question._id)}
        title="Edit"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
      >
        <Edit3 size={17} />
      </button>

      <button
        type="button"
        onClick={() => handleDelete(question)}
        disabled={deleting}
        title="Delete"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={17} />
      </button>
    </>
  )}
</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {questions.map((question) => {
                  const subjectName = getDisplayName(question.subject);
                  const chapterName = getDisplayName(question.chapter);
                  const topicName = getDisplayName(question.topic);

                  return (
                    <div
                      key={question._id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge>
                              {formatLabel(question.questionType)}
                            </Badge>

                            <Badge
                              type={getDifficultyType(
                                question.difficulty
                              )}
                            >
                              {formatLabel(question.difficulty)}
                            </Badge>

                            <Badge
                              type={getStatusType(question.status)}
                            >
                              {formatLabel(question.status)}
                            </Badge>
                          </div>

                          <h3 className="text-sm font-semibold leading-6 text-slate-800">
                            {question.questionText}
                          </h3>
                        </div>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-50 px-2 text-sm font-bold text-emerald-700">
                          {question.marks}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <span className="text-xs text-slate-400">
                            Subject
                          </span>
                          <p className="font-medium text-slate-700">
                            {subjectName || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400">
                            Chapter
                          </span>
                          <p className="font-medium text-slate-700">
                            {chapterName || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400">
                            Topic
                          </span>
                          <p className="font-medium text-slate-700">
                            {topicName || "-"}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400">
                            Answer Configuration
                          </span>
                          <p className="font-medium text-slate-700">
                            {getDisplayName(
                              question.answerEditorConfiguration
                            ) || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
  {/* View: visible to all roles */}
  <button
    type="button"
    onClick={() => handleView(question._id)}
    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
  >
    <Eye size={16} />
    View
  </button>

  {/* Edit and Delete: SUPER_ADMIN only */}
  {isSuperAdmin && (
    <>
      <button
        type="button"
        onClick={() => handleEdit(question._id)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
      >
        <Edit3 size={16} />
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(question)}
        disabled={deleting}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </>
  )}
</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionListScreen;