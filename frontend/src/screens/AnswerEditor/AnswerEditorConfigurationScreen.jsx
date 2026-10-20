
import { useState } from "react";
import {
  useCreateAnswerEditorConfigurationMutation,
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

const CreateAnswerEditorConfigurationScreen = () => {
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [answerMode, setAnswerMode] = useState("");
  const [configuration, setConfiguration] = useState("{}");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetSubjectsQuery();

  const [
    createAnswerEditorConfiguration,
    { isLoading: creating },
  ] = useCreateAnswerEditorConfigurationMutation();

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.subjects || subjectsData?.data || [];

  const submitHandler = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    let parsedConfiguration = {};

    try {
      parsedConfiguration = configuration.trim()
        ? JSON.parse(configuration)
        : {};
    } catch {
      setError("Configuration must contain valid JSON.");
      return;
    }

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

    try {
      await createAnswerEditorConfiguration({
        subject,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        answerMode,
        configuration: parsedConfiguration,
      }).unwrap();

      setSuccess("Answer editor configuration created successfully.");

      setSubject("");
      setName("");
      setCode("");
      setAnswerMode("");
      setConfiguration("{}");
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "Unable to create answer editor configuration."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-red-700 px-6 py-5 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                ✎
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Answer Editor Configuration
                </h1>
                <p className="mt-1 text-sm text-red-100 sm:text-base">
                  Configure how students enter answers for each subject.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submitHandler} className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">
                Configuration Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Define the subject, configuration name, code, and answer input
                mode.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={subjectsLoading || creating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Configuration Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics Descriptive Editor"
                  disabled={creating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Configuration Code
                </label>

                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MATH_TEXT"
                  disabled={creating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  The code is automatically converted to uppercase.
                </p>
              </div>

              <div>
                <label
                  htmlFor="answerMode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Answer Mode
                </label>

                <select
                  id="answerMode"
                  value={answerMode}
                  onChange={(e) => setAnswerMode(e.target.value)}
                  disabled={creating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select Answer Mode</option>

                  {answerModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="configuration"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Configuration JSON
              </label>

              <textarea
                id="configuration"
                value={configuration}
                onChange={(e) => setConfiguration(e.target.value)}
                rows={8}
                disabled={creating}
                placeholder='{"placeholder":"Enter your answer","maxLength":1000}'
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter optional editor-specific settings as valid JSON. Use
                <span className="font-semibold"> {}</span> when no additional
                configuration is required.
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  i
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900">
                    Answer Mode
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    The selected answer mode determines the type of editor
                    presented to students when answering questions configured
                    for this subject.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSubject("");
                  setName("");
                  setCode("");
                  setAnswerMode("");
                  setConfiguration("{}");
                  setError("");
                  setSuccess("");
                }}
                disabled={creating}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={creating || subjectsLoading}
                className="rounded-lg bg-red-700 px-7 py-2.5 font-semibold text-white shadow-md transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating
                  ? "Creating..."
                  : "Create Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAnswerEditorConfigurationScreen;
