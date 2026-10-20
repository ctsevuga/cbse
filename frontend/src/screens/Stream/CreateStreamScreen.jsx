
import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Radio,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useCreateStreamMutation,
} from "../../slices/streamApiSlice";

const CreateStreamScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    createStream,
    { isLoading },
  ] = useCreateStreamMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();
    const description =
      formData.description.trim();

    if (!name) {
      setErrorMessage(
        "Please enter a stream name.",
      );
      return;
    }

    if (!code) {
      setErrorMessage(
        "Please enter a stream code.",
      );
      return;
    }

    try {
      await createStream({
        name,
        code,
        description: description || undefined,
      }).unwrap();

      navigate("/streams");
    } catch (err) {
      setErrorMessage(
        err?.data?.message ||
          err?.error ||
          "Unable to create stream. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/streams")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              title="Back to Streams"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
              <Radio
                size={24}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Create Stream
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add a new academic stream for your school.
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
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-white px-6 py-7 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Plus
                      size={21}
                      className="text-indigo-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Stream Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter the basic details for the new stream.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {errorMessage && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <XCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium leading-6 text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <Radio
                        size={17}
                        className="text-indigo-500"
                      />
                      Stream Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Example: Science"
                      maxLength={100}
                      autoComplete="off"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Enter the full name of the academic stream.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="code"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-indigo-500"
                      />
                      Stream Code
                    </label>

                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Example: SCIENCE"
                      maxLength={30}
                      autoComplete="off"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      The code is automatically converted to uppercase.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <FileText
                        size={17}
                        className="text-indigo-500"
                      />
                      Description
                      <span className="font-normal text-slate-400">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter a short description of this stream..."
                      rows={5}
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />

                    <div className="mt-2 flex justify-end">
                      <span className="text-xs text-slate-400">
                        {formData.description.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/streams")}
                    disabled={isLoading}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
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
                        Creating Stream...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Create Stream
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                <Radio
                  size={21}
                  className="text-indigo-600"
                />
              </div>

              <h2 className="mt-5 text-base font-bold text-indigo-950">
                New Academic Stream
              </h2>

              <p className="mt-2 text-sm leading-6 text-indigo-700">
                Create a stream such as Science, Commerce,
                or Humanities for your school's Class XI and
                XII academic structure.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Stream Preview
              </h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                    <Radio
                      size={20}
                      className="text-indigo-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">
                      {formData.name.trim() ||
                        "Stream Name"}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {formData.code.trim()
                        ? formData.code.trim().toUpperCase()
                        : "STREAM CODE"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {formData.description.trim() ||
                      "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    School Context
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    This stream will automatically be created
                    under your school. The school identifier is
                    securely determined by your authenticated
                    account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateStreamScreen;
