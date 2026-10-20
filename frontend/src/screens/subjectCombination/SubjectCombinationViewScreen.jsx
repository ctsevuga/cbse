import { useNavigate, useParams } from "react-router-dom";
import {
ArrowLeft,
Edit,
Power,
BookOpen,
ListChecks,
} from "lucide-react";
import { toast } from "react-toastify";

import {
useGetSubjectCombinationDetailsQuery,
useUpdateSubjectCombinationStatusMutation,
} from "../../slices/subjectCombinationApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const SubjectCombinationViewScreen = () => {
const { id } = useParams();
const navigate = useNavigate();

const {
data: combination,
isLoading,
isError,
error,
} = useGetSubjectCombinationDetailsQuery(id);

const [
updateSubjectCombinationStatus,
{ isLoading: isUpdatingStatus },
] = useUpdateSubjectCombinationStatusMutation();

const handleStatusUpdate = async () => {
if (!combination) {
return;
}

const newStatus = !combination.isActive;

const confirmed = window.confirm(
  newStatus
    ? "Are you sure you want to activate this subject combination?"
    : "Are you sure you want to deactivate this subject combination?",
);

if (!confirmed) {
  return;
}

try {
  await updateSubjectCombinationStatus({
    subjectCombinationId: combination._id,
    isActive: newStatus,
  }).unwrap();

  toast.success(
    newStatus
      ? "Subject combination activated successfully"
      : "Subject combination deactivated successfully",
  );
} catch (error) {
  toast.error(
    error?.data?.message ||
      error?.message ||
      "Failed to update subject combination status",
  );
}

};

if (isLoading) {
return <Loader />;
}

if (isError) {
return (
<div className="min-h-screen bg-gray-100 p-4 sm:p-6">
<div className="mx-auto max-w-5xl">
<Message variant="danger">
{error?.data?.message ||
error?.error ||
"Failed to load subject combination"}
</Message>
</div>
</div>
);
}

if (!combination) {
return (
<div className="min-h-screen bg-gray-100 p-4 sm:p-6">
<div className="mx-auto max-w-5xl">
<Message variant="danger">
Subject combination not found
</Message>
</div>
</div>
);
}

const subjects = Array.isArray(combination.subjects)
? combination.subjects
: [];

const coreSubjects = subjects.filter(
(item) => item.type === "CORE",
);

const electiveSubjects = subjects.filter(
(item) => item.type === "ELECTIVE",
);

return (
<div className="min-h-screen bg-gray-100 p-4 sm:p-6">
<div className="mx-auto max-w-5xl">

    {/* Header */}
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Subject Combination
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage subject combination details.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          navigate("/subject-combinations")
        }
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        <ArrowLeft size={17} />
        Back
      </button>
    </div>

    <div className="overflow-hidden rounded-xl bg-white shadow-lg">

      {/* Combination Header */}
      <div className="bg-indigo-600 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {combination.name}
            </h2>

            <p className="mt-1 text-sm text-indigo-100">
              {combination.code}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${
              combination.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {combination.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">

        {/* Basic Information */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Combination Name
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {combination.name || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Combination Code
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {combination.code || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Stream
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {combination.stream?.name || "-"}
              </p>

              {combination.stream?.code && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {combination.stream.code}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Subjects
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {subjects.length}
              </p>
            </div>

          </div>
        </div>

        {/* Core Subjects */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen
                size={18}
                className="text-blue-600"
              />

              <h3 className="text-base font-semibold text-gray-800">
                Core Subjects
              </h3>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {coreSubjects.length}{" "}
              {coreSubjects.length === 1
                ? "Subject"
                : "Subjects"}
            </span>
          </div>

          {coreSubjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                No core subjects configured.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coreSubjects.map((item) => {
                const subject = item.subject || {};

                return (
                  <div
                    key={item._id || subject._id}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <BookOpen
                          size={17}
                          className="text-blue-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          {subject.name || "-"}
                        </p>

                        {subject.code && (
                          <p className="mt-1 text-xs text-gray-500">
                            {subject.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Elective Subjects */}
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ListChecks
                size={18}
                className="text-amber-600"
              />

              <h3 className="text-base font-semibold text-gray-800">
                Elective Subjects
              </h3>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {electiveSubjects.length}{" "}
              {electiveSubjects.length === 1
                ? "Subject"
                : "Subjects"}
            </span>
          </div>

          {electiveSubjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                No elective subjects configured.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {electiveSubjects.map((item) => {
                const subject = item.subject || {};

                return (
                  <div
                    key={item._id || subject._id}
                    className="rounded-lg border border-amber-100 bg-amber-50 p-4 transition hover:border-amber-200 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <ListChecks
                          size={17}
                          className="text-amber-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          {subject.name || "-"}
                        </p>

                        {subject.code && (
                          <p className="mt-1 text-xs text-gray-500">
                            {subject.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Elective Selection Rule */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-indigo-900">
                Elective Selection Rule
              </p>

              <p className="mt-1 text-sm text-indigo-700">
                Students can select between{" "}
                <span className="font-semibold">
                  {combination.minimumElectives ?? 0}
                </span>{" "}
                and{" "}
                <span className="font-semibold">
                  {combination.maximumElectives ?? 0}
                </span>{" "}
                elective{" "}
                {combination.maximumElectives === 1
                  ? "subject"
                  : "subjects"}.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">
                  Minimum
                </p>

                <p className="mt-1 text-xl font-bold text-indigo-700">
                  {combination.minimumElectives ?? 0}
                </p>
              </div>

              <div className="text-gray-400">
                -
              </div>

              <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">
                  Maximum
                </p>

                <p className="mt-1 text-xl font-bold text-indigo-700">
                  {combination.maximumElectives ?? 0}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Subjects
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-800">
              {subjects.length}
            </p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Core Subjects
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {coreSubjects.length}
            </p>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
              Elective Subjects
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-700">
              {electiveSubjects.length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/subject-combinations/${combination._id}/edit`,
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <Edit size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={isUpdatingStatus}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              combination.isActive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Power size={17} />

            {isUpdatingStatus
              ? "Updating..."
              : combination.isActive
                ? "Deactivate"
                : "Activate"}
          </button>

        </div>

      </div>
    </div>
  </div>
</div>

);
};

export default SubjectCombinationViewScreen;