import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Layers,
  Save,
  X,
} from "lucide-react";

import {
  useGetTopicDetailsQuery,
  useUpdateTopicMutation,
} from "../../slices/topicApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";

const EditTopicScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    subject: "",
    chapter: "",
    name: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [initialized, setInitialized] =
    useState(false);

  const {
    data: topicData,
    isLoading: topicLoading,
    isError: topicError,
    error: topicErrorData,
  } = useGetTopicDetailsQuery(id);

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetSubjectsQuery();

  const {
    data: classesData,
    isLoading: classesLoading,
  } = useGetClassesQuery();

  const [
    updateTopic,
    {
      isLoading: updatingTopic,
    },
  ] = useUpdateTopicMutation();

  const topic =
    topicData?.data ||
    topicData ||
    null;

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.data || [];

  const classes = Array.isArray(classesData)
    ? classesData
    : classesData?.data || [];

  useEffect(() => {
    if (topic && !initialized) {
      setFormData({
        subject:
          topic.subject?._id ||
          topic.subject ||
          "",
        chapter:
          topic.chapter?._id ||
          topic.chapter ||
          "",
        name: topic.name || "",
        description:
          topic.description || "",
      });

      setInitialized(true);
    }
  }, [topic, initialized]);

  const chapters = classes
    .flatMap((item) => item.chapters || [])
    .filter((chapter) => {
      const chapterSubject =
        chapter.subject?._id ||
        chapter.subject;

      return (
        chapterSubject === formData.subject
      );
    });

  const getSubjectName = (subject) =>
    subject?.name ||
    subject?.subjectName ||
    "";

  const getSubjectCode = (subject) =>
    subject?.code ||
    subject?.subjectCode ||
    subject?.cbseSubjectCode ||
    "";

  const getChapterName = (chapter) =>
    chapter?.title ||
    chapter?.name ||
    "";

  const getChapterNumber = (chapter) =>
    chapter?.chapterNumber ||
    chapter?.chapterNo ||
    "";

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setError("");

    if (name === "subject") {
      setFormData((prev) => ({
        ...prev,
        subject: value,
        chapter: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.chapter) {
      setError("Please select a chapter.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Topic name is required.");
      return;
    }

    try {
      await updateTopic({
        id,
        subject: formData.subject,
        chapter: formData.chapter,
        name: formData.name.trim(),
        description:
          formData.description.trim(),
      }).unwrap();

      navigate(`/admin/topics/${id}`);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Unable to update topic.",
      );
    }
  };

  const cancelHandler = () => {
    navigate(`/admin/topics/${id}`);
  };

  if (
    topicLoading ||
    !initialized
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-sm text-slate-500">
                Loading topic details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <X className="mx-auto h-12 w-12 text-red-400" />

            <h2 className="mt-4 text-lg font-semibold text-red-800">
              Unable to load topic
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {topicErrorData?.data?.message ||
                "Topic not found or could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <Layers className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Topic
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update topic information
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <span className="text-sm font-medium text-slate-600">
              {topic.isActive !== false
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <BookOpen className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Topic
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  {topic.name}
                </h2>
              </div>
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="space-y-6 p-6 sm:p-8"
          >
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {subjectsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Unable to load subjects.
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={changeHandler}
                    disabled={
                      subjectsLoading ||
                      updatingTopic
                    }
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {subjectsLoading
                        ? "Loading subjects..."
                        : "Select subject"}
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject._id}
                        value={subject._id}
                      >
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
                  htmlFor="chapter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={changeHandler}
                    disabled={
                      !formData.subject ||
                      classesLoading ||
                      updatingTopic
                    }
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {!formData.subject
                        ? "Select subject first"
                        : classesLoading
                          ? "Loading chapters..."
                          : chapters.length === 0
                            ? "No chapters available"
                            : "Select chapter"}
                    </option>

                    {chapters.map((chapter) => (
                      <option
                        key={chapter._id}
                        value={chapter._id}
                      >
                        {getChapterNumber(chapter)
                          ? `Chapter ${getChapterNumber(
                              chapter,
                            )} - `
                          : ""}
                        {getChapterName(chapter)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {formData.chapter && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Selected Chapter
                    </p>

                    <p className="mt-1 text-sm text-indigo-700">
                      {chapters.find(
                        (chapter) =>
                          chapter._id ===
                          formData.chapter,
                      )?.title ||
                        chapters.find(
                          (chapter) =>
                            chapter._id ===
                            formData.chapter,
                        )?.name ||
                        topic.chapter?.title ||
                        ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Topic Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={changeHandler}
                  placeholder="Enter topic name"
                  maxLength={200}
                  disabled={updatingTopic}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">
                  {formData.name.length}/200
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={changeHandler}
                rows={5}
                maxLength={1000}
                placeholder="Enter a brief description of this topic"
                disabled={updatingTopic}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Topic hierarchy
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Subject → Chapter → Topic
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Changing the subject will require
                    selecting a chapter belonging to
                    that subject.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelHandler}
                disabled={updatingTopic}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={updatingTopic}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {updatingTopic
                  ? "Updating..."
                  : "Update Topic"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          Changes to the topic are validated against
          the selected subject and chapter.
        </div>
      </div>
    </div>
  );
};

export default EditTopicScreen;