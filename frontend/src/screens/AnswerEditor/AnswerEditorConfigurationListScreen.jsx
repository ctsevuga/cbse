
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetAnswerEditorConfigurationsQuery,
  useDeleteAnswerEditorConfigurationMutation,
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

const AnswerEditorConfigurationListScreen = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [answerMode, setAnswerMode] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState("");

  const {
    data: configurations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswerEditorConfigurationsQuery({
    subject: subject || undefined,
    answerMode: answerMode || undefined,
    code: code.trim() || undefined,
    isActive: isActive || undefined,
  });

  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetSubjectsQuery();

  const [
    deleteAnswerEditorConfiguration,
    { isLoading: deleting },
  ] = useDeleteAnswerEditorConfigurationMutation();

  const subjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.subjects || subjectsData?.data || [];

  const deleteHandler = async (id) => {
    const configuration = configurations.find(
      (item) => item._id === id
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${configuration?.name || "this configuration"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAnswerEditorConfiguration(id).unwrap();
      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to delete answer editor configuration."
      );
    }
  };

  const clearFilters = () => {
    setSubject("");
    setAnswerMode("");
    setCode("");
    setIsActive("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-red-700 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                  ✎
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Answer Editor Configurations
                  </h1>
                  <p className="mt-1 text-sm text-red-100">
                    Manage answer input configurations for subjects.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/answer-editor-configurations/create"
                  )
                }
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-md transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                + Create Configuration
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-gray-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Filters
                </h2>
                <p className="text-sm text-gray-500">
                  Filter configurations by subject, mode, code, or status.
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={subjectsLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : "All Subjects"}
                  </option>

                  {subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                      {item.code ? ` (${item.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="answerMode"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Answer Mode
                </label>

                <select
                  id="answerMode"
                  value={answerMode}
                  onChange={(e) => setAnswerMode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Modes</option>

                  {answerModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
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
                  placeholder="Search code"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="isActive"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="isActive"
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {isLoading && (
              <div className="flex min-h-48 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-700" />
                  <p className="mt-3 text-sm text-gray-500">
                    Loading configurations...
                  </p>
                </div>
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-semibold text-red-700">
                  Unable to load answer editor configurations.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {error?.data?.message ||
                    error?.error ||
                    "Please try again."}
                </p>

                <button
                  type="button"
                  onClick={refetch}
                  className="mt-4 rounded-lg bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              configurations.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                    ✎
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-gray-800">
                    No configurations found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    No answer editor configurations match the selected
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/admin/answer-editor-configurations/create"
                      )
                    }
                    className="mt-5 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    Create Configuration
                  </button>
                </div>
              )}

            {!isLoading &&
              !isError &&
              configurations.length > 0 && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Configuration List
                      </h2>
                      <p className="text-sm text-gray-500">
                        {configurations.length} configuration
                        {configurations.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                            Subject
                          </th>

                          <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                            Configuration
                          </th>

                          <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                            Code
                          </th>

                          <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                            Answer Mode
                          </th>

                          <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                            Status
                          </th>

                          <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {configurations.map((item) => {
                          const mode = answerModes.find(
                            (entry) =>
                              entry.value === item.answerMode
                          );

                          return (
                            <tr
                              key={item._id}
                              className="transition hover:bg-blue-50/40"
                            >
                              <td className="px-5 py-4">
                                <div className="font-semibold text-gray-800">
                                  {item.subject?.name || "-"}
                                </div>

                                {item.subject?.code && (
                                  <div className="mt-0.5 text-xs text-gray-500">
                                    {item.subject.code}
                                  </div>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="font-semibold text-gray-800">
                                  {item.name}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                                  {item.code}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {mode?.label || item.answerMode}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                {item.isActive ? (
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    Active
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    Inactive
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    title="View"
                                    onClick={() =>
                                      navigate(
                                        `/admin/answer-editor-configurations/${item._id}`
                                      )
                                    }
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                  >
                                    View
                                  </button>

                                  <button
                                    type="button"
                                    title="Edit"
                                    onClick={() =>
                                      navigate(
                                        `/admin/answer-editor-configurations/${item._id}/edit`
                                      )
                                    }
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete"
                                    disabled={deleting}
                                    onClick={() =>
                                      deleteHandler(item._id)
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerEditorConfigurationListScreen;
