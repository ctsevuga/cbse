
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetQuestionBlueprintDetailsQuery,
  useUpdateQuestionBlueprintStatusMutation,
} from "../../slices/questionBlueprintApiSlice";

const getName = (value) => {
  if (!value) return "-";

  if (typeof value === "string") return value;

  return (
    value.name ||
    value.title ||
    value.code ||
    "-"
  );
};

const getPopulatedName = (value) => {
  if (!value) return "-";

  if (typeof value === "string") return value;

  return value.name || value.title || value.code || "-";
};

const renderDistribution = (distribution) => {
  if (
    !distribution ||
    typeof distribution !== "object" ||
    Object.keys(distribution).length === 0
  ) {
    return (
      <div className="text-sm text-gray-500">
        No distribution configured
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(distribution).map(
        ([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-sm font-medium text-gray-500">
              {key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                  char.toUpperCase(),
                )}
            </div>

            <div className="mt-1 text-lg font-semibold text-gray-900">
              {value}
            </div>
          </div>
        ),
      )}
    </div>
  );
};

const QuestionBlueprintDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const {
    data: blueprint,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetQuestionBlueprintDetailsQuery(id);

  const [
    updateQuestionBlueprintStatus,
  ] = useUpdateQuestionBlueprintStatusMutation();

  const handleUpdateStatus = async () => {
    if (!blueprint) return;

    const newStatus = !blueprint.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } this question blueprint?`,
    );

    if (!confirmed) return;

    try {
      setIsUpdatingStatus(true);

      await updateQuestionBlueprintStatus({
        questionBlueprintId: blueprint._id,
        isActive: newStatus,
      }).unwrap();

      toast.success(
        `Question blueprint ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      );

      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Failed to update blueprint status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load question blueprint
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error?.data?.message ||
              error?.error ||
              "Unable to load question blueprint."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Question blueprint not found
          </h2>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const subject = getPopulatedName(
    blueprint.subject,
  );

  const stream = getPopulatedName(
    blueprint.stream,
  );

  const academicYear = getPopulatedName(
    blueprint.academicYear,
  );

  const className = getPopulatedName(
    blueprint.class,
  );

  const createdBy = getPopulatedName(
    blueprint.createdBy,
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Question Blueprint
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View question blueprint configuration
              and status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={isUpdatingStatus}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
              blueprint.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isUpdatingStatus
              ? "Updating..."
              : blueprint.isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Academic Structure
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Academic structure associated with this
                  blueprint.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Stream
                  </div>

                  <div className="mt-1 font-semibold text-gray-900">
                    {stream}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </div>

                  <div className="mt-1 font-semibold text-gray-900">
                    {subject}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Academic Year
                  </div>

                  <div className="mt-1 font-semibold text-gray-900">
                    {academicYear}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class
                  </div>

                  <div className="mt-1 font-semibold text-gray-900">
                    {className}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Blueprint Configuration
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Question and marks configuration.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-5">
                  <div className="text-sm font-medium text-blue-600">
                    Total Questions
                  </div>

                  <div className="mt-2 text-3xl font-bold text-blue-900">
                    {blueprint.totalQuestions}
                  </div>
                </div>

                <div className="rounded-xl bg-purple-50 p-5">
                  <div className="text-sm font-medium text-purple-600">
                    Total Marks
                  </div>

                  <div className="mt-2 text-3xl font-bold text-purple-900">
                    {blueprint.totalMarks}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Difficulty Distribution
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Distribution of questions by difficulty.
                </p>
              </div>

              {renderDistribution(
                blueprint.difficultyDistribution,
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question Type Distribution
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Distribution of questions by question
                  type.
                </p>
              </div>

              {renderDistribution(
                blueprint.questionTypeDistribution,
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Rules
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Additional blueprint rules.
                </p>
              </div>

              {renderDistribution(blueprint.rules)}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Status
              </h2>

              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    blueprint.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {blueprint.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                  blueprint.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isUpdatingStatus
                  ? "Updating..."
                  : blueprint.isActive
                    ? "Deactivate Blueprint"
                    : "Activate Blueprint"}
              </button>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Blueprint Information
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created By
                  </div>

                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {createdBy}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                  </div>

                  <div className="mt-1 text-sm text-gray-700">
                    {blueprint.createdAt
                      ? new Date(
                          blueprint.createdAt,
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last Updated
                  </div>

                  <div className="mt-1 text-sm text-gray-700">
                    {blueprint.updatedAt
                      ? new Date(
                          blueprint.updatedAt,
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Blueprint ID
                  </div>

                  <div className="mt-1 break-all text-xs text-gray-500">
                    {blueprint._id}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBlueprintDetailsScreen;
