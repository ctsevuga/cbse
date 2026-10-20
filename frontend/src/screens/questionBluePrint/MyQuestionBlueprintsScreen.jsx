
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetMyQuestionBlueprintsQuery,
} from "../../slices/questionBlueprintApiSlice";

import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";

const getName = (value) => {
  if (!value) return "-";

  if (typeof value === "string") return value;

  return value.name || value.title || value.code || "-";
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value._id || "";
};

const MyQuestionBlueprintsScreen = () => {
  const navigate = useNavigate();

  const [academicYear, setAcademicYear] = useState("");

  const {
    data: blueprints = [],
    isLoading,
    isError,
    error,
  } = useGetMyQuestionBlueprintsQuery(
    academicYear ? { academicYear } : undefined,
  );

  const {
    data: academicYears = [],
    isLoading: isLoadingAcademicYears,
  } = useGetAcademicYearsQuery();

  const handleAcademicYearChange = (event) => {
    setAcademicYear(event.target.value);
  };

  const handleCreate = () => {
    navigate("/question-blueprints/create");
  };

  const handleView = (id) => {
    navigate(`/question-blueprints/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/question-blueprints/${id}/edit`);
  };

  const handleClearFilter = () => {
    setAcademicYear("");
  };

  if (isLoading || isLoadingAcademicYears) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">
              Unable to load your question blueprints
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading your blueprints."}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                Question Blueprint
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Question Blueprints
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100">
                View and manage the question blueprints
                created by you.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              + Create Blueprint
            </button>
          </div>
        </div>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Academic Year
              </label>

              <select
                value={academicYear}
                onChange={handleAcademicYearChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  All Academic Years
                </option>

                {academicYears.map((year) => (
                  <option
                    key={year._id}
                    value={year._id}
                  >
                    {getName(year)}
                  </option>
                ))}
              </select>
            </div>

            {academicYear && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear Filter
              </button>
            )}

            <div className="rounded-xl bg-blue-50 px-5 py-3 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Blueprints
              </div>

              <div className="text-xl font-bold text-blue-800">
                {blueprints.length}
              </div>
            </div>
          </div>
        </section>

        {blueprints.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📘
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No question blueprints found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {academicYear
                ? "There are no blueprints matching the selected academic year."
                : "You have not created any question blueprints yet."}
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Create Your First Blueprint
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blueprints.map((blueprint) => {
              const subject = getName(blueprint.subject);
              const stream = getName(blueprint.stream);
              const year = getName(blueprint.academicYear);
              const className = getName(blueprint.class);
              const blueprintId = getId(blueprint);

              return (
                <article
                  key={blueprintId}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-gray-900">
                          {subject}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {stream}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
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
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs font-medium text-gray-500">
                          Academic Year
                        </div>

                        <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {year}
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs font-medium text-gray-500">
                          Class
                        </div>

                        <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {className}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-blue-50 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {blueprint.totalQuestions}
                        </div>

                        <div className="mt-1 text-xs font-medium text-blue-600">
                          Questions
                        </div>
                      </div>

                      <div className="rounded-xl bg-purple-50 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-700">
                          {blueprint.totalMarks}
                        </div>

                        <div className="mt-1 text-xs font-medium text-purple-600">
                          Marks
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleView(blueprintId)
                        }
                        className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(blueprintId)
                        }
                        className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuestionBlueprintsScreen;
