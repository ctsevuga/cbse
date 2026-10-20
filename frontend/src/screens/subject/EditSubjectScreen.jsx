import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Save,
} from "lucide-react";

import {
  useGetSubjectDetailsQuery,
  useUpdateSubjectMutation,
} from "../../slices/subjectApiSlice";

const EditSubjectScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: subject,
    isLoading: isLoadingSubject,
    error: subjectError,
  } = useGetSubjectDetailsQuery(id);

  const [
    updateSubject,
    { isLoading: isUpdating },
  ] = useUpdateSubjectMutation();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    subjectType: "",
    cbseSubjectCode: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (subject) {
      setFormData({
        code: subject.code || "",
        name: subject.name || "",
        shortName: subject.shortName || "",
        subjectType: subject.subjectType || "",
        cbseSubjectCode:
          subject.cbseSubjectCode || "",
      });
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.subjectType
    ) {
      setError(
        "Please fill in all required fields.",
      );
      return;
    }

    try {
      await updateSubject({
        subjectId: id,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        shortName: formData.shortName.trim()
          ? formData.shortName.trim().toUpperCase()
          : "",
        subjectType: formData.subjectType,
        cbseSubjectCode:
          formData.cbseSubjectCode.trim()
            ? formData.cbseSubjectCode.trim()
            : "",
      }).unwrap();

      navigate(`/subjects/${id}`);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Failed to update subject.",
      );
    }
  };

  if (isLoadingSubject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2
            size={24}
            className="animate-spin text-blue-600"
          />
          Loading subject...
        </div>
      </div>
    );
  }

  if (subjectError || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <BookOpen size={28} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Unable to load subject
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {subjectError?.data?.message ||
                subjectError?.error ||
                "Subject not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/subjects")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Back to Subjects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/subjects/${id}`)
            }
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Subject
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen size={25} />
              </div>

              <div>
                <p className="text-sm text-blue-100">
                  CBSE Master Subject
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Edit Subject
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Update {subject.name}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject Code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Example: MATH"
                  maxLength={30}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="shortName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Short Name
                </label>

                <input
                  id="shortName"
                  name="shortName"
                  type="text"
                  value={formData.shortName}
                  onChange={handleChange}
                  placeholder="Example: Maths"
                  maxLength={20}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Mathematics"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="subjectType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject Type
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="subjectType"
                  name="subjectType"
                  value={formData.subjectType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select subject type
                  </option>
                  <option value="LANGUAGE">
                    Language
                  </option>
                  <option value="CORE">
                    Core
                  </option>
                  <option value="ELECTIVE">
                    Elective
                  </option>
                  <option value="OPTIONAL">
                    Optional
                  </option>
                  <option value="ADDITIONAL">
                    Additional
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cbseSubjectCode"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  CBSE Subject Code
                </label>

                <input
                  id="cbseSubjectCode"
                  name="cbseSubjectCode"
                  type="text"
                  value={formData.cbseSubjectCode}
                  onChange={handleChange}
                  placeholder="Example: 041"
                  maxLength={20}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
              <p className="text-xs leading-5 text-blue-800">
                Changes to this subject will apply to the
                global CBSE master subject. Schools using
                this subject in their subject combinations
                will see the updated information.
              </p>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(`/subjects/${id}`)
                }
                disabled={isUpdating}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectScreen;