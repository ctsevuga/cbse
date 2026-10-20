
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Hash,
  Layers3,
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Building2,
} from "lucide-react";

import {
  useGetStreamDetailsQuery,
  useUpdateStreamMutation,
} from "../../slices/streamApiSlice";

const EditStreamScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: stream,
    isLoading: isLoadingStream,
    isError,
    error,
  } = useGetStreamDetailsQuery(id);

  const [
    updateStream,
    { isLoading: isUpdating },
  ] = useUpdateStreamMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (stream) {
      setFormData({
        name: stream.name || "",
        code: stream.code || "",
        description: stream.description || "",
        isActive: stream.isActive ?? true,
      });
    }
  }, [stream]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleStatusChange = () => {
    setFormData((previous) => ({
      ...previous,
      isActive: !previous.isActive,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const normalizedName = formData.name.trim();
    const normalizedCode = formData.code.trim();

    if (!normalizedName) {
      newErrors.name = "Stream name is required";
    }

    if (!normalizedCode) {
      newErrors.code = "Stream code is required";
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
      await updateStream({
        id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description:
          formData.description.trim() || undefined,
        isActive: formData.isActive,
      }).unwrap();

      navigate(`/streams/${id}`);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update stream. Please try again.";

      setErrors({
        submit: message,
      });
    }
  };

  if (isLoadingStream) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Loader2
                  size={28}
                  className="animate-spin text-indigo-600"
                />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Loading stream details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !stream) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/streams")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Streams
          </button>

          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={28} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Unable to load stream
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {error?.data?.message ||
                  error?.error ||
                  "The requested stream could not be loaded."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/streams")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <ArrowLeft size={17} />
                Return to Streams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/streams/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Stream
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-8 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <Edit3 size={30} />
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Stream Management
                </p>

                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Edit Stream
                </h1>

                <p className="mt-1 text-sm text-indigo-100">
                  Update the stream information and status.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8">
              {errors.submit && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{errors.submit}</span>
                </div>
              )}

              <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <Layers3 size={24} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Current Stream
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {stream.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Hash size={14} />
                        {stream.code}
                      </div>
                    </div>
                  </div>

                  {stream.school && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                      <Building2
                        size={17}
                        className="text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          School
                        </p>

                        <p className="text-sm font-semibold text-slate-700">
                          {stream.school.name ||
                            stream.school.code ||
                            "School"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Stream Name
                  </label>

                  <div className="relative">
                    <Layers3
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Science"
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
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
                    Stream Code
                  </label>

                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. SCIENCE"
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm font-semibold uppercase text-slate-800 outline-none transition placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:ring-4 ${
                        errors.code
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  {errors.code && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.code}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    The code will be stored in uppercase.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter a brief description of this stream..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Add any useful information about this stream.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        formData.isActive
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {formData.isActive ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Stream Status
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {formData.isActive
                          ? "This stream is currently active and available for use."
                          : "This stream is inactive and may not be available for normal use."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStatusChange}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                      formData.isActive
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <CheckCircle2 size={18} />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => navigate(`/streams/${id}`)}
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving Changes...
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

export default EditStreamScreen;
