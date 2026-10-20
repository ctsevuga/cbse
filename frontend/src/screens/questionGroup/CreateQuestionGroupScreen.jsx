
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Layers3,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useCreateQuestionGroupMutation,
} from "../../slices/questionGroupApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import {
  useGetChaptersQuery,
} from "../../slices/chapterApiSlice";

const CreateQuestionGroupScreen = () => {
  const [formData, setFormData] = useState({
    subject: "",
    chapter: "",
    title: "",
    groupType: "",
    directions: "",
    sharedContent: "",
    selectionMode: "ALL",
  });

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetSubjectsQuery();

  const {
    data: chapters = [],
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useGetChaptersQuery(
    formData.subject
      ? { subject: formData.subject }
      : undefined,
    {
      skip: !formData.subject,
    },
  );

  const [
    createQuestionGroup,
    {
      isLoading: creating,
    },
  ] = useCreateQuestionGroupMutation();

  useEffect(() => {
    if (subjectsError) {
      toast.error("Unable to load subjects");
    }
  }, [subjectsError]);

  useEffect(() => {
    if (chaptersError) {
      toast.error("Unable to load chapters");
    }
  }, [chaptersError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubjectChange = (e) => {
    const subject = e.target.value;

    setFormData((current) => ({
      ...current,
      subject,
      chapter: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      toast.error("Please select a subject");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    if (!formData.groupType) {
      toast.error("Please select a group type");
      return;
    }

    try {
      await createQuestionGroup({
        subject: formData.subject,
        chapter: formData.chapter || undefined,
        title: formData.title.trim(),
        groupType: formData.groupType,
        directions: formData.directions.trim() || undefined,
        sharedContent:
          formData.sharedContent.trim() || undefined,
        selectionMode: formData.selectionMode,
      }).unwrap();

      toast.success(
        "Question group created successfully",
      );

      setFormData({
        subject: "",
        chapter: "",
        title: "",
        groupType: "",
        directions: "",
        sharedContent: "",
        selectionMode: "ALL",
      });
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Unable to create question group",
      );
    }
  };

  const groupTypes = [
    {
      value: "PASSAGE",
      label: "Passage",
      description:
        "Questions based on a common passage",
    },
    {
      value: "CASE_STUDY",
      label: "Case Study",
      description:
        "Questions based on a case or scenario",
    },
    {
      value: "DATA_INTERPRETATION",
      label: "Data Interpretation",
      description:
        "Questions based on shared data",
    },
    {
      value: "SOURCE_BASED",
      label: "Source Based",
      description:
        "Questions based on a common source",
    },
    {
      value: "COMMON_DIRECTIONS",
      label: "Common Directions",
      description:
        "Questions sharing common instructions",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Layers3 className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Create Question Group
                </h1>
                <p className="mt-1 text-sm text-indigo-100 sm:text-base">
                  Create a reusable group for passage,
                  case-study, data-based, or common-direction
                  questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Academic Context
                  </h2>
                  <p className="text-sm text-slate-500">
                    Select the subject and corresponding chapter.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:px-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleSubjectChange}
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
                        {subject.name}
                        {subject.code
                          ? ` (${subject.code})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {subjectsLoading ? (
                    <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-indigo-500" />
                  ) : (
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="chapter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter
                </label>

                <div className="relative">
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleChange}
                    disabled={
                      !formData.subject ||
                      chaptersLoading
                    }
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {!formData.subject
                        ? "Select subject first"
                        : chaptersLoading
                          ? "Loading chapters..."
                          : "Select chapter"}
                    </option>

                    {chapters.map((chapter) => (
                      <option
                        key={chapter._id}
                        value={chapter._id}
                      >
                        {chapter.chapterNumber
                          ? `Chapter ${chapter.chapterNumber} - `
                          : ""}
                        {chapter.title ||
                          chapter.name}
                      </option>
                    ))}
                  </select>

                  {chaptersLoading ? (
                    <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-indigo-500" />
                  ) : (
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Leave blank if the group applies to the
                  entire subject.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-6 sm:px-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Group Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Define how this question group will be used.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Group Title
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Case Study - Partnership Accounts"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Group Type
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupTypes.map((type) => {
                      const selected =
                        formData.groupType === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              groupType: type.value,
                            }))
                          }
                          className={`rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span
                              className={`text-sm font-semibold ${
                                selected
                                  ? "text-indigo-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {type.label}
                            </span>

                            <span
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
                                selected
                                  ? "border-indigo-600 bg-indigo-600"
                                  : "border-slate-300"
                              }`}
                            />
                          </div>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {type.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="selectionMode"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Selection Mode
                    </label>

                    <div className="relative">
                      <select
                        id="selectionMode"
                        name="selectionMode"
                        value={formData.selectionMode}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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

                      <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          Selection behavior
                        </p>
                        <p className="mt-1 text-xs leading-5 text-indigo-700">
                          Use All when every question belongs
                          to the group, Any when a subset can be
                          selected, or Random when questions
                          should be selected automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="directions"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Directions
                  </label>

                  <textarea
                    id="directions"
                    name="directions"
                    value={formData.directions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter instructions that should be shown before the questions..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
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
                    name="sharedContent"
                    value={formData.sharedContent}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Enter the common passage, case study, source, data, or other content shared by the questions..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    subject: "",
                    chapter: "",
                    title: "",
                    groupType: "",
                    directions: "",
                    sharedContent: "",
                    selectionMode: "ALL",
                  })
                }
                disabled={creating}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Create Question Group
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionGroupScreen;
