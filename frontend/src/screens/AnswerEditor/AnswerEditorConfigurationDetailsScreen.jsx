
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetAnswerEditorConfigurationDetailsQuery,
  useUpdateAnswerEditorConfigurationStatusMutation,
} from "../../slices/answerEditorConfigurationApiSlice";

const answerModeLabels = {
  MCQ: "Multiple Choice (MCQ)",
  TEXT: "Text",
  RICH_TEXT: "Rich Text",
  MATH: "Mathematics",
  TABLE: "Table",
  CODE: "Code",
  IMAGE: "Image",
  DRAWING: "Drawing",
  MATH_TEXT: "Math + Text",
  RICH_TEXT_IMAGE: "Rich Text + Image",
  MATH_TABLE: "Math + Table",
  COMBINED: "Combined",
};

const AnswerEditorConfigurationDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: configuration,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswerEditorConfigurationDetailsQuery(id);

  const [
    updateAnswerEditorConfigurationStatus,
    { isLoading: updatingStatus },
  ] = useUpdateAnswerEditorConfigurationStatusMutation();

  const updateStatusHandler = async () => {
    if (!configuration) {
      return;
    }

    const newStatus = !configuration.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } "${configuration.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateAnswerEditorConfigurationStatus({
        id: configuration._id,
        isActive: newStatus,
      }).unwrap();

      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to update configuration status."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-800">
            Configuration Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error?.data?.message ||
              error?.error ||
              "Unable to load the answer editor configuration."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!configuration) {
    return null;
  }

  const modeLabel =
    answerModeLabels[configuration.answerMode] ||
    configuration.answerMode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-red-700 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                  ✎
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Answer Editor Configuration
                  </h1>
                  <p className="mt-1 text-sm text-red-100">
                    View configuration details and manage its status.
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-bold ${
                  configuration.isActive
                    ? "bg-green-500/20 text-green-100 ring-1 ring-green-300/40"
                    : "bg-white/15 text-white ring-1 ring-white/30"
                }`}
              >
                <span
                  className={`mr-2 h-2.5 w-2.5 rounded-full ${
                    configuration.isActive
                      ? "bg-green-300"
                      : "bg-gray-300"
                  }`}
                />
                {configuration.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Subject
                </p>

                <p className="mt-2 text-lg font-bold text-gray-800">
                  {configuration.subject?.name || "-"}
                </p>

                {configuration.subject?.code && (
                  <p className="mt-1 font-mono text-sm text-gray-500">
                    {configuration.subject.code}
                  </p>
                )}

                {configuration.subject?.shortName && (
                  <p className="mt-1 text-sm text-gray-500">
                    {configuration.subject.shortName}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Configuration Name
                </p>

                <p className="mt-2 text-lg font-bold text-gray-800">
                  {configuration.name}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Configuration Code
                </p>

                <p className="mt-2">
                  <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-gray-800 shadow-sm ring-1 ring-gray-200">
                    {configuration.code}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Answer Mode
                </p>

                <p className="mt-2 text-lg font-bold text-blue-900">
                  {modeLabel}
                </p>

                <p className="mt-1 font-mono text-xs text-blue-600">
                  {configuration.answerMode}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-bold text-gray-800">
                  Editor Configuration
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Additional settings associated with this answer editor.
                </p>
              </div>

              <div className="bg-gray-900 p-5">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-100">
                  {JSON.stringify(
                    configuration.configuration || {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Created
                </p>

                <p className="mt-2 text-sm font-medium text-gray-700">
                  {formatDate(configuration.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-medium text-gray-700">
                  {formatDate(configuration.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Back
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/answer-editor-configurations/${configuration._id}/edit`
                    )
                  }
                  className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  Edit Configuration
                </button>

                <button
                  type="button"
                  onClick={updateStatusHandler}
                  disabled={updatingStatus}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    configuration.isActive
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-200"
                  }`}
                >
                  {updatingStatus
                    ? "Updating..."
                    : configuration.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerEditorConfigurationDetailsScreen;
