import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

import { useCreateSubjectMutation } from "../../slices/subjectApiSlice";

const CreateSubjectScreen = () => {
  const navigate = useNavigate();

  const [createSubject, { isLoading }] =
    useCreateSubjectMutation();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    subjectType: "",
    cbseSubjectCode: "",
  });

  const [error, setError] = useState("");

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
      await createSubject({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        shortName: formData.shortName.trim()
          ? formData.shortName.trim().toUpperCase()
          : undefined,
        subjectType: formData.subjectType,
        cbseSubjectCode:
          formData.cbseSubjectCode.trim()
            ? formData.cbseSubjectCode.trim()
            : undefined,
      }).unwrap();

      navigate("/subjects");
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Failed to create subject.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Subjects
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Create Subject
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Add a new CBSE master subject
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
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

            <div className="mt-8 rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs leading-5 text-slate-500">
                Subjects are maintained as global CBSE master
                data. Once created, a subject can be included
                in school-specific subject combinations.
              </p>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/subjects")}
                disabled={isLoading}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Subject
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

export default CreateSubjectScreen;