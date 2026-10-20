import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Layers,
  Save,
  X,
} from "lucide-react";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";
import {
  
  useCreateTopicMutation,
} from "../../slices/topicApiSlice";

import { useGetChapterDetailsQuery } from "../../slices/chapterApiSlice";

const CreateTopicScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    chapter: "",
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

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
    createTopic,
    {
      isLoading: creatingTopic,
    },
  ] = useCreateTopicMutation();

  const {
    data: chapterDetailsData,
    isLoading: chapterLoading,
    isError: chapterError,
  } = useGetChapterDetailsQuery(
    formData.chapter,
    {
      skip: !formData.chapter,
    },
  );

  const subjects =
    subjectsData?.data ||
    subjectsData ||
    [];

  const classes =
    classesData?.data ||
    classesData ||
    [];

  const selectedChapter =
    chapterDetailsData?.data ||
    chapterDetailsData ||
    null;

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

  useEffect(() => {
    if (
      formData.chapter &&
      selectedChapter
    ) {
      const chapterSubject =
        selectedChapter.subject?._id ||
        selectedChapter.subject;

      if (
        chapterSubject &&
        chapterSubject !== formData.subject
      ) {
        setFormData((prev) => ({
          ...prev,
          chapter: "",
        }));
      }
    }
  }, [
    selectedChapter,
    formData.chapter,
    formData.subject,
  ]);

  const getSubjectName = (subject) =>
    subject.name ||
    subject.subjectName ||
    "";

  const getSubjectCode = (subject) =>
    subject.code ||
    subject.subjectCode ||
    subject.cbseSubjectCode ||
    "";

  const getChapterName = (chapter) =>
    chapter.title ||
    chapter.name ||
    chapter.chapterName ||
    "";

  const getChapterNumber = (chapter) =>
    chapter.chapterNumber ||
    chapter.chapterNo ||
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
      await createTopic({
        subject: formData.subject,
        chapter: formData.chapter,
        name: formData.name.trim(),
        description:
          formData.description.trim() || undefined,
      }).unwrap();

      navigate(
        `/chapters/${formData.chapter}`,
      );
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Unable to create topic.",
      );
    }
  };

  const cancelHandler = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <Layers
                className="h-6 w-6 text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Create Topic
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add a topic under a subject chapter
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
            <div className="flex items-center gap-3">
              <BookOpen
                className="h-5 w-5 text-indigo-600"
              />

              <div>
                <h2 className="font-semibold text-slate-800">
                  Topic Information
                </h2>

                <p className="text-sm text-slate-500">
                  Select the subject and chapter before
                  entering the topic details.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="space-y-6 p-6"
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
                    disabled={subjectsLoading}
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
                      classesLoading
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

                {formData.chapter &&
                  chapterLoading && (
                    <p className="mt-2 text-xs text-indigo-600">
                      Loading chapter details...
                    </p>
                  )}

                {formData.chapter &&
                  chapterError && (
                    <p className="mt-2 text-xs text-red-600">
                      Unable to load chapter details.
                    </p>
                  )}
              </div>
            </div>

            {selectedChapter && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white p-2 shadow-sm">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {getChapterName(
                        selectedChapter,
                      )}
                    </p>

                    {selectedChapter.description && (
                      <p className="mt-1 text-sm leading-6 text-indigo-700">
                        {selectedChapter.description}
                      </p>
                    )}
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
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                rows={4}
                maxLength={1000}
                placeholder="Enter a brief description of this topic"
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelHandler}
                disabled={creatingTopic}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={creatingTopic}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {creatingTopic
                  ? "Creating..."
                  : "Create Topic"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          Topics are organized under chapters and
          subjects to support structured learning
          analytics.
        </div>
      </div>
    </div>
  );
};

export default CreateTopicScreen;