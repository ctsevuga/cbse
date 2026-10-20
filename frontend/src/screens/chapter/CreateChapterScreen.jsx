import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronDown, Hash, FileText, Save } from "lucide-react";

import { useCreateChapterMutation } from "../../slices/chapterApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";

const CreateChapterScreen = () => {
  const navigate = useNavigate();

  const [createChapter, { isLoading }] =
    useCreateChapterMutation();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetSubjectsQuery({
    isActive: true,
  });

  const [formData, setFormData] = useState({
    subject: "",
    chapterNumber: "",
    title: "",
    description: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (subjectsError) {
      setError("Failed to load subjects.");
    }
  }, [subjectsError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.chapterNumber) {
      setError("Chapter number is required.");
      return;
    }

    if (
      !Number.isInteger(Number(formData.chapterNumber)) ||
      Number(formData.chapterNumber) < 1
    ) {
      setError("Chapter number must be a positive integer.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Chapter title is required.");
      return;
    }

    try {
      await createChapter({
        subject: formData.subject,
        chapterNumber: Number(formData.chapterNumber),
        title: formData.title.trim(),
        description: formData.description.trim()
          ? formData.description.trim()
          : undefined,
      }).unwrap();

      navigate("/chapters");
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Failed to create chapter.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-8 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <BookOpen className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Create Chapter
                </h1>
                <p className="mt-1 text-sm text-blue-100 sm:text-base">
                  Add a new chapter to the CBSE subject master.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={subjectsLoading || isLoading}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Select the CBSE subject to which this chapter belongs.
                </p>
              </div>

              <div>
                <label
                  htmlFor="chapterNumber"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter Number
                </label>

                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="chapterNumber"
                    name="chapterNumber"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.chapterNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter Title
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Relations and Functions"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                  <span className="ml-2 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter a brief description of the chapter..."
                    className="w-full resize-none rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/chapters")}
                disabled={isLoading}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || subjectsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-5 w-5" />

                {isLoading
                  ? "Creating..."
                  : "Create Chapter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChapterScreen;