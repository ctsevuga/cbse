import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Hash,
  Save,
  Sparkles,
} from "lucide-react";

import {
  useGetChapterDetailsQuery,
  useUpdateChapterMutation,
} from "../../slices/chapterApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";

const EditChapterScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: chapter,
    isLoading: isChapterLoading,
    error: chapterError,
  } = useGetChapterDetailsQuery(id);

  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
  } = useGetSubjectsQuery({
    isActive: true,
  });

  const [updateChapter, { isLoading: isUpdating }] =
    useUpdateChapterMutation();

  const [formData, setFormData] = useState({
    subject: "",
    chapterNumber: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (chapter) {
      setFormData({
        subject: chapter.subject?._id || chapter.subject || "",
        chapterNumber: chapter.chapterNumber || "",
        title: chapter.title || "",
        description: chapter.description || "",
      });
    }
  }, [chapter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      window.alert("Please select a subject.");
      return;
    }

    if (!formData.chapterNumber) {
      window.alert("Please enter the chapter number.");
      return;
    }

    if (!formData.title.trim()) {
      window.alert("Please enter the chapter title.");
      return;
    }

    try {
      await updateChapter({
        chapterId: id,
        subject: formData.subject,
        chapterNumber: Number(formData.chapterNumber),
        title: formData.title.trim(),
        description: formData.description.trim()
          ? formData.description.trim()
          : "",
      }).unwrap();

      navigate(`/chapters/${id}`);
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Failed to update chapter.",
      );
    }
  };

  if (isChapterLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading chapter...
          </p>
        </div>
      </div>
    );
  }

  if (chapterError || !chapter) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-slate-200">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <BookOpen className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Chapter Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The requested chapter could not be loaded.
          </p>

          <Link
            to="/chapters"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chapters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to={`/chapters/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chapter
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-8 sm:px-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <BookOpen className="h-7 w-7 text-white" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2 text-indigo-100">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Chapter Management
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Edit Chapter
                </h1>

                <p className="mt-1 text-sm text-indigo-100">
                  Update the chapter details and subject information.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubjectsLoading || isUpdating}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {isSubjectsLoading
                        ? "Loading subjects..."
                        : "Select Subject"}
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject._id}
                        value={subject._id}
                      >
                        {subject.code
                          ? `${subject.code} - ${subject.name}`
                          : subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="chapterNumber"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Chapter Number
                </label>

                <div className="relative">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="chapterNumber"
                    name="chapterNumber"
                    type="number"
                    min="1"
                    value={formData.chapterNumber}
                    onChange={handleChange}
                    disabled={isUpdating}
                    placeholder="Enter chapter number"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                  <FileText className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isUpdating}
                    placeholder="Enter chapter title"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isUpdating}
                  placeholder="Enter a brief description of the chapter..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Chapter Information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    Chapter numbers must be unique within the selected
                    subject.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to={`/chapters/${id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isUpdating || isSubjectsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditChapterScreen;