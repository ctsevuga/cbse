
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetAnswerEditorConfigurationDetailsQuery,
  useUpdateAnswerEditorConfigurationMutation,
} from "../../slices/answerEditorConfigurationApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";

const answerModes = [
  { value: "MCQ", label: "Multiple Choice (MCQ)" },
  { value: "TEXT", label: "Text" },
  { value: "RICH_TEXT", label: "Rich Text" },
  { value: "MATH", label: "Mathematics" },
  { value: "TABLE", label: "Table" },
  { value: "CODE", label: "Code" },
  { value: "IMAGE", label: "Image" },
  { value: "DRAWING", label: "Drawing" },
  { value: "MATH_TEXT", label: "Math + Text" },
  { value: "RICH_TEXT_IMAGE", label: "Rich Text + Image" },
  { value: "MATH_TABLE", label: "Math + Table" },
  { value: "COMBINED", label: "Combined" },
];

const EditAnswerEditorConfigurationScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [answerMode, setAnswerMode] = useState("");
  const [configuration, setConfiguration] = useState("{}");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: existingConfiguration,
    isLoading: configurationLoading,
    isError: configurationError,
    error: detailsError,
  } = useGetAnswerEditorConfigurationDetailsQuery(id);

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetSubjectsQuery();

  const [
    updateAnswerEditorConfiguration,
    { isLoading: updating },
  ] = useUpdateAnswerEditorConfigurationMutation();

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.subjects || subjectsData?.data || [];

  useEffect(() => {
    if (!existingConfiguration) {
      return;
    }

    setSubject(existingConfiguration.subject?._id || "");
    setName(existingConfiguration.name || "");
    setCode(existingConfiguration.code || "");
    setAnswerMode(existingConfiguration.answerMode || "");

    setConfiguration(
      JSON.stringify(
        existingConfiguration.configuration || {},
        null,
        2
      )
    );
  }, [existingConfiguration]);

  const submitHandler = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!subject) {
      setError("Please select a subject.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!code.trim()) {
      setError("Code is required.");
      return;
    }

    if (!answerMode) {
      setError("Please select an answer mode.");
      return;
    }

    let parsedConfiguration = {};

    try {
      parsedConfiguration = configuration.trim()
        ? JSON.parse(configuration)
        : {};
    } catch {
      setError("Configuration must contain valid JSON.");
      return;
    }

    try {
      await updateAnswerEditorConfiguration({
        id,
        subject,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        answerMode,
        configuration: parsedConfiguration,
      }).unwrap();

      setSuccess(
        "Answer editor configuration updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/admin/answer-editor-configurations/${id}`
        );
      }, 800);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Unable to update answer editor configuration."
      );
    }
  };

  const resetHandler = () => {
    if (!existingConfiguration) {
      return;
    }

    setSubject(existingConfiguration.subject?._id || "");
    setName(existingConfiguration.name || "");
    setCode(existingConfiguration.code || "");
    setAnswerMode(existingConfiguration.answerMode || "");

    setConfiguration(
      JSON.stringify(
        existingConfiguration.configuration || {},
        null,
        2
      )
    );

    setError("");
    setSuccess("");
  };

  if (configurationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center rounded-2xl bg-white shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-700" />
            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading configuration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (configurationError || !existingConfiguration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
            !
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-800">
            Configuration Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {detailsError?.data?.message ||
              detailsError?.error ||
              "Unable to load the answer editor configuration."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg bg-red-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-red-700 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                  ✎
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Edit Answer Editor Configuration
                  </h1>

                  <p className="mt-1 text-sm text-red-100">
                    Update the subject, editor mode, and configuration.
                  </p>
                </div>
              </div>

              <div
                className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${
                  existingConfiguration.isActive
                    ? "bg-green-500/20 text-green-100 ring-1 ring-green-300/40"
                    : "bg-white/15 text-white ring-1 ring-white/30"
                }`}
              >
                {existingConfiguration.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </div>
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="p-6 sm:p-8"
          >
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">
                Configuration Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Modify the configuration details below and save your
                changes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={subjectsLoading || updating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : "Select Subject"}
                  </option>

                  {subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                      {item.code ? ` (${item.code})` : ""}
                    </option>
                  ))}
                </select>

                {subjectsError && (
                  <p className="mt-2 text-sm text-red-600">
                    Unable to load subjects.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Configuration Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter configuration name"
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 shadow-sm placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Configuration Code
                </label>

                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter configuration code"
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-gray-800 shadow-sm placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Configuration codes are stored in uppercase.
                </p>
              </div>

              <div>
                <label
                  htmlFor="answerMode"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Answer Mode
                </label>

                <select
                  id="answerMode"
                  value={answerMode}
                  onChange={(e) =>
                    setAnswerMode(e.target.value)
                  }
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select Answer Mode</option>

                  {answerModes.map((mode) => (
                    <option
                      key={mode.value}
                      value={mode.value}
                    >
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="configuration"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Configuration JSON
                </label>

                <span className="font-mono text-xs text-gray-400">
                  JSON
                </span>
              </div>

              <textarea
                id="configuration"
                value={configuration}
                onChange={(e) =>
                  setConfiguration(e.target.value)
                }
                rows={12}
                disabled={updating}
                spellCheck={false}
                className="w-full rounded-xl border border-gray-300 bg-gray-950 px-4 py-4 font-mono text-sm leading-6 text-gray-100 shadow-inner placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter valid JSON for editor-specific configuration
                settings.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  i
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900">
                    Selected Answer Mode
                  </h3>

                  <p className="mt-1 text-sm text-blue-800">
                    {answerModes.find(
                      (mode) =>
                        mode.value === answerMode
                    )?.label || answerMode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={updating}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetHandler}
                  disabled={updating}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={
                    updating || subjectsLoading
                  }
                  className="rounded-lg bg-red-700 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAnswerEditorConfigurationScreen;
