
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  School,
  Save,
  X,
} from "lucide-react";

import { useCreateClassMutation } from "../../slices/classApiSlice";

const CreateClassScreen = () => {
  const navigate = useNavigate();

  const [createClass, { isLoading, isSuccess, error }] =
    useCreateClassMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isSuccess) {
      navigate("/classes");
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));

    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();

    if (!name || !code) {
      setValidationError("Class name and code are required.");
      return;
    }

    try {
      await createClass({
        name,
        code,
      }).unwrap();
    } catch (err) {
      // API error is displayed below.
    }
  };

  const handleCancel = () => {
    navigate("/classes");
  };

  const apiError =
    error?.data?.message ||
    error?.error ||
    "Unable to create the class. Please try again.";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/classes"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              title="Back to Classes"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <BookOpen
                  size={20}
                  className="text-indigo-600"
                />

                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Create Class
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Add a new class to your school.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Information Card */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <School size={25} />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Class Information
                </h2>

                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Create a class that can later be associated with sections,
                  teachers, students, subjects, and assessments.
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Unique class code
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The code must be unique within the school.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      School specific
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The class will be associated with the current school.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Ready for students
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Students and sections can be configured after the class
                      is created.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  Class Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the basic information for the new class.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="px-6 py-6 sm:px-8 sm:py-8"
              >
                {/* Error */}
                {(validationError || error) && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="flex gap-3">
                      <X
                        size={18}
                        className="mt-0.5 shrink-0 text-red-500"
                      />

                      <p className="text-sm font-medium text-red-700">
                        {validationError || apiError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Class Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Class Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Class XII"
                    maxLength={100}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter the display name that will be shown throughout the
                    application.
                  </p>
                </div>

                {/* Class Code */}
                <div className="mt-6">
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Class Code
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. XII"
                    maxLength={30}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    The code is automatically converted to uppercase and must
                    be unique within the school.
                  </p>
                </div>

                {/* Preview */}
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Preview
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                      <BookOpen size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {formData.name.trim() || "Class Name"}
                      </p>

                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {formData.code.trim() || "CLASS CODE"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                        Create Class
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateClassScreen;
