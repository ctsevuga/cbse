import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Layers3,
  Save,
  Sparkles,
} from "lucide-react";
import {
  useGetQuestionGroupDetailsQuery,
  useUpdateQuestionGroupMutation,
} from "../../slices/questionGroupApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetChaptersQuery } from "../../slices/chapterApiSlice";

const QuestionGroupEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: group,
    isLoading: isGroupLoading,
    isError: isGroupError,
    error: groupError,
  } = useGetQuestionGroupDetailsQuery(id);

  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useGetSubjectsQuery();

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [groupType, setGroupType] = useState("");
  const [directions, setDirections] = useState("");
  const [sharedContent, setSharedContent] = useState("");
  const [selectionMode, setSelectionMode] = useState("ALL");
  const [formError, setFormError] = useState("");

  const {
    data: chapters = [],
    isLoading: isChaptersLoading,
  } = useGetChaptersQuery(
    subject
      ? {
          subject,
        }
      : undefined,
  );

  const [
    updateQuestionGroup,
    { isLoading: isUpdating },
  ] = useUpdateQuestionGroupMutation();

  useEffect(() => {
    if (!group) {
      return;
    }

    const subjectId =
      typeof group.subject === "object"
        ? group.subject?._id
        : group.subject;

    const chapterId =
      typeof group.chapter === "object"
        ? group.chapter?._id
        : group.chapter;

    setSubject(subjectId || "");
    setChapter(chapterId || "");
    setTitle(group.title || "");
    setGroupType(group.groupType || "");
    setDirections(group.directions || "");
    setSharedContent(group.sharedContent || "");
    setSelectionMode(group.selectionMode || "ALL");
  }, [group]);

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
    setChapter("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!subject) {
      setFormError("Please select a subject.");
      return;
    }

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!groupType) {
      setFormError("Please select a group type.");
      return;
    }

    if (!selectionMode) {
      setFormError("Please select a selection mode.");
      return;
    }

    try {
      await updateQuestionGroup({
        id,
        subject,
        chapter: chapter || undefined,
        title: title.trim(),
        groupType,
        directions: directions.trim(),
        sharedContent: sharedContent.trim(),
        selectionMode,
      }).unwrap();

      navigate(`/question-groups/${id}`);
    } catch (error) {
      setFormError(
        error?.data?.message ||
          "Failed to update question group. Please try again.",
      );
    }
  };

  const getSubjectName = () => {
    if (!group?.subject) {
      return "";
    }

    if (typeof group.subject === "object") {
      return (
        group.subject.name ||
        group.subject.title ||
        group.subject.subjectName ||
        ""
      );
    }

    return "";
  };

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-12 w-48 rounded-xl bg-slate-200" />
          <div className="mt-6 h-48 rounded-3xl bg-slate-200" />
          <div className="mt-6 h-[600px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (isGroupError || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <FileText className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load question group
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {groupError?.data?.message ||
              "The requested question group could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-100">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Layers3 className="h-7 w-7 text-white" />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-200" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                      Edit Question Group
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {group.title}
                  </h1>

                  <p className="mt-1 text-sm text-indigo-100">
                    Update the group information and shared content.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:block">
                <p className="text-xs text-indigo-100">
                  Current Subject
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {getSubjectName() || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Basic Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure the subject, chapter and group type.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject <span className="text-red-500">*</span>
                </label>

                <select
                  id="subject"
                  value={subject}
                  onChange={handleSubjectChange}
                  disabled={isSubjectsLoading || isUpdating}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select Subject</option>

                  {subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name ||
                        item.title ||
                        item.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="chapter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter
                </label>

                <select
                  id="chapter"
                  value={chapter}
                  onChange={(event) =>
                    setChapter(event.target.value)
                  }
                  disabled={
                    !subject ||
                    isChaptersLoading ||
                    isUpdating
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {!subject
                      ? "Select subject first"
                      : isChaptersLoading
                        ? "Loading chapters..."
                        : "No specific chapter"}
                  </option>

                  {chapters.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name ||
                        item.title ||
                        item.chapterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Group Title{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  disabled={isUpdating}
                  placeholder="Enter a descriptive group title"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="groupType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Group Type{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  id="groupType"
                  value={groupType}
                  onChange={(event) =>
                    setGroupType(event.target.value)
                  }
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select Group Type</option>
                  <option value="PASSAGE">Passage</option>
                  <option value="CASE_STUDY">Case Study</option>
                  <option value="DATA_INTERPRETATION">
                    Data Interpretation
                  </option>
                  <option value="SOURCE_BASED">
                    Source Based
                  </option>
                  <option value="COMMON_DIRECTIONS">
                    Common Directions
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="selectionMode"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Selection Mode{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  id="selectionMode"
                  value={selectionMode}
                  onChange={(event) =>
                    setSelectionMode(event.target.value)
                  }
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="ALL">
                    All Questions
                  </option>
                  <option value="ANY">
                    Any Questions
                  </option>
                  <option value="RANDOM">
                    Random Questions
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Group Content
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add common directions and content shared by
                    the questions.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <label
                  htmlFor="directions"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Directions
                </label>

                <textarea
                  id="directions"
                  rows={5}
                  value={directions}
                  onChange={(event) =>
                    setDirections(event.target.value)
                  }
                  disabled={isUpdating}
                  placeholder="Enter instructions that should be displayed before the questions..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-slate-400">
                  These directions can be shared across all
                  questions in this group.
                </p>
              </div>

              <div>
                <label
                  htmlFor="sharedContent"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Shared Content
                </label>

                <textarea
                  id="sharedContent"
                  rows={9}
                  value={sharedContent}
                  onChange={(event) =>
                    setSharedContent(event.target.value)
                  }
                  disabled={isUpdating}
                  placeholder="Enter the passage, case study, source, data or other content shared by the questions..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-slate-400">
                  This content will be associated with the
                  question group.
                </p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <span className="text-sm font-bold text-red-600">
                  !
                </span>
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  Unable to update question group
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {formError}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/question-groups/${id}`)
              }
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionGroupEditScreen;
