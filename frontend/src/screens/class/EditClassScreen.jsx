
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  Save,
  School,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useGetClassDetailsQuery,
  useUpdateClassMutation,
} from "../../slices/classApiSlice";

const EditClassScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: classRecord,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClassDetailsQuery(id);

  const [
    updateClass,
    { isLoading: isUpdating },
  ] = useUpdateClassMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classRecord) {
      setFormData({
        name: classRecord.name || "",
        code: classRecord.code || "",
        isActive: classRecord.isActive ?? true,
      });
    }
  }, [classRecord]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Class name is required.";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Class code is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateClass({
        id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        isActive: formData.isActive,
      }).unwrap();

      navigate(`/classes/${id}`);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update class. Please try again.";

      setErrors({
        submit: message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading class details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 sm:px-6">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle
                size={30}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load class
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the class details."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                Try Again
              </button>

              <Link
                to="/classes"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Classes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classRecord) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to={`/classes/${id}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              title="Back to Class Details"
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
                  Edit Class
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Update class information and status.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-7 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <BookOpen size={28} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Class Information
                    </h2>

                    <p className="mt-1 text-sm text-indigo-100">
                      Keep the class details accurate and up to date.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-6 sm:p-8">
                {errors.submit && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium leading-6 text-red-700">
                      {errors.submit}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Class Name
                  </label>

                  <div className="relative">
                    <BookOpen
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="For example, Class XII"
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                      }`}
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Class Code
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-50">
                      <span className="text-xs font-bold text-violet-600">
                        #
                      </span>
                    </div>

                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="For example, XII"
                      className={`h-12 w-full rounded-xl border bg-white pl-13 pr-4 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:ring-4 ${
                        errors.code
                          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                      }`}
                    />
                  </div>

                  {errors.code ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.code}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      The code must be unique within the school.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-7">
                  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          formData.isActive
                            ? "bg-emerald-100"
                            : "bg-slate-200"
                        }`}
                      >
                        {formData.isActive ? (
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="text-slate-500"
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Class Status
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {formData.isActive
                            ? "This class is active and available for academic operations."
                            : "This class is inactive and may not be available for new academic operations."}
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {formData.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only"
                      />

                      <span className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-100 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:justify-end">
                  <Link
                    to={`/classes/${id}`}
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={19} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <School
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    School
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {classRecord.school?.name || "—"}
                  </p>
                </div>
              </div>

              {classRecord.school?.code && (
                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    School Code
                  </p>

                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-700">
                    {classRecord.school.code}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <BookOpen
                    size={19}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    Class Configuration
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-indigo-900/70">
                    After updating this class, you can configure
                    sections, teachers, students, subjects, and
                    assessments from their respective management
                    screens.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Status
              </p>

              <div className="mt-3 flex items-center gap-2">
                {formData.isActive ? (
                  <>
                    <CheckCircle2
                      size={19}
                      className="text-emerald-500"
                    />
                    <span className="text-sm font-semibold text-emerald-700">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle
                      size={19}
                      className="text-slate-400"
                    />
                    <span className="text-sm font-semibold text-slate-600">
                      Inactive
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditClassScreen;
