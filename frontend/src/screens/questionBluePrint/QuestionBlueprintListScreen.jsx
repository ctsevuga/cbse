
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetQuestionBlueprintsQuery,
  useDeleteQuestionBlueprintMutation,
} from "../../slices/questionBlueprintApiSlice";
import { useGetStreamsQuery } from "../../slices/streamApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";

const QuestionBlueprintListScreen = () => {
  const navigate = useNavigate();

  const [stream, setStream] = useState("");
  const [subject, setSubject] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState("");

  const {
    data: streams = [],
    isLoading: streamsLoading,
  } = useGetStreamsQuery();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery();

  const {
    data: academicYears = [],
    isLoading: academicYearsLoading,
  } = useGetAcademicYearsQuery();

  const {
    data: classes = [],
    isLoading: classesLoading,
  } = useGetClassesQuery();

  const queryParams = useMemo(() => {
    const params = {};

    if (academicYear) {
      params.academicYear = academicYear;
    }

    if (classId) {
      params.class = classId;
    }

    if (subject) {
      params.subject = subject;
    }

    if (stream) {
      params.stream = stream;
    }

    if (isActive !== "") {
      params.isActive = isActive === "true";
    }

    return params;
  }, [
    academicYear,
    classId,
    subject,
    stream,
    isActive,
  ]);

  const {
    data: blueprints = [],
    isLoading,
    isFetching,
    error,
  } = useGetQuestionBlueprintsQuery(queryParams);

  const [
    deleteQuestionBlueprint,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteQuestionBlueprintMutation();

  const selectedStream = streams.find(
    (item) => item._id === stream,
  );

  const selectedSubject = subjects.find(
    (item) => item._id === subject,
  );

  const selectedAcademicYear =
    academicYears.find(
      (item) => item._id === academicYear,
    );

  const selectedClass = classes.find(
    (item) => item._id === classId,
  );

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question blueprint?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestionBlueprint(id).unwrap();

      toast.success(
        "Question blueprint deleted successfully",
      );
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Failed to delete question blueprint",
      );
    }
  };

  const clearFilters = () => {
    setStream("");
    setSubject("");
    setAcademicYear("");
    setClassId("");
    setIsActive("");
  };

  const getName = (item, fields = []) => {
    for (const field of fields) {
      if (item?.[field]) {
        return item[field];
      }
    }

    return "-";
  };

  const getPopulatedName = (value, fields = []) => {
    if (!value) {
      return "-";
    }

    if (typeof value === "string") {
      return value;
    }

    return getName(value, fields);
  };

  const totalQuestions = blueprints.reduce(
    (total, blueprint) =>
      total + Number(blueprint.totalQuestions || 0),
    0,
  );

  const totalMarks = blueprints.reduce(
    (total, blueprint) =>
      total + Number(blueprint.totalMarks || 0),
    0,
  );

  const loading =
    streamsLoading ||
    subjectsLoading ||
    academicYearsLoading ||
    classesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Question Blueprints
            </h1>
            <p className="mt-2 text-gray-600">
              Manage question blueprints for your academic
              structure.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/question-blueprints/create")
            }
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-700"
          >
            + Create Blueprint
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur-lg">
            <p className="text-sm font-medium text-gray-500">
              Total Blueprints
            </p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">
              {blueprints.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur-lg">
            <p className="text-sm font-medium text-gray-500">
              Total Questions
            </p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {totalQuestions}
            </p>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur-lg">
            <p className="text-sm font-medium text-gray-500">
              Total Marks
            </p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {totalMarks}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Filter Blueprints
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Narrow the list using the academic structure.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Clear Filters
            </button>
          </div>

          <div className="mb-6 rounded-2xl bg-indigo-50/70 p-5">
            <h3 className="mb-4 text-base font-bold text-indigo-900">
              Stream & Subject
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="stream"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Stream
                </label>

                <select
                  id="stream"
                  value={stream}
                  onChange={(e) =>
                    setStream(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">
                    All Streams
                  </option>

                  {streams.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getName(item, [
                        "name",
                        "streamName",
                        "title",
                      ])}
                    </option>
                  ))}
                </select>
              </div>

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
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">
                    All Subjects
                  </option>

                  {subjects.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getName(item, [
                        "name",
                        "subjectName",
                        "title",
                      ])}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/70 p-5">
            <h3 className="mb-4 text-base font-bold text-blue-900">
              Academic Year & Class
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="academicYear"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Academic Year
                </label>

                <select
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) =>
                    setAcademicYear(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">
                    All Academic Years
                  </option>

                  {academicYears.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getName(item, [
                        "name",
                        "year",
                        "academicYear",
                        "title",
                      ])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="class"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Class
                </label>

                <select
                  id="class"
                  value={classId}
                  onChange={(e) =>
                    setClassId(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">
                    All Classes
                  </option>

                  {classes.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getName(item, [
                        "name",
                        "className",
                        "title",
                      ])}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={isActive}
              onChange={(e) =>
                setIsActive(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:w-64"
            >
              <option value="">
                All Statuses
              </option>
              <option value="true">
                Active
              </option>
              <option value="false">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {(selectedStream ||
          selectedSubject ||
          selectedAcademicYear ||
          selectedClass) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedStream && (
              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
                Stream:{" "}
                {getName(selectedStream, [
                  "name",
                  "streamName",
                  "title",
                ])}
              </span>
            )}

            {selectedSubject && (
              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                Subject:{" "}
                {getName(selectedSubject, [
                  "name",
                  "subjectName",
                  "title",
                ])}
              </span>
            )}

            {selectedAcademicYear && (
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                Academic Year:{" "}
                {getName(selectedAcademicYear, [
                  "name",
                  "year",
                  "academicYear",
                  "title",
                ])}
              </span>
            )}

            {selectedClass && (
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
                Class:{" "}
                {getName(selectedClass, [
                  "name",
                  "className",
                  "title",
                ])}
              </span>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Blueprint List
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isFetching
                  ? "Refreshing blueprints..."
                  : `${blueprints.length} blueprint${
                      blueprints.length === 1
                        ? ""
                        : "s"
                    } found`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600">
              {error?.data?.message ||
                error?.error ||
                "Failed to load question blueprints"}
            </div>
          ) : blueprints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl text-indigo-600">
                ?
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                No Question Blueprints Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing the filters or create a new
                question blueprint.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/question-blueprints/create",
                  )
                }
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Blueprint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {blueprints.map((blueprint) => (
                <div
                  key={blueprint._id}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {getPopulatedName(
                          blueprint.subject,
                          [
                            "name",
                            "subjectName",
                            "title",
                          ],
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {getPopulatedName(
                          blueprint.stream,
                          [
                            "name",
                            "streamName",
                            "title",
                          ],
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        blueprint.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {blueprint.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3">
                      <p className="text-xs font-medium text-indigo-600">
                        Academic Year
                      </p>
                      <p className="mt-1 truncate font-semibold text-gray-800">
                        {getPopulatedName(
                          blueprint.academicYear,
                          [
                            "name",
                            "year",
                            "academicYear",
                            "title",
                          ],
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-600">
                        Class
                      </p>
                      <p className="mt-1 truncate font-semibold text-gray-800">
                        {getPopulatedName(
                          blueprint.class,
                          [
                            "name",
                            "className",
                            "title",
                          ],
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-3">
                      <p className="text-xs font-medium text-purple-600">
                        Questions
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {blueprint.totalQuestions}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-600">
                        Marks
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {blueprint.totalMarks}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-400">
                      {blueprint.createdAt
                        ? new Date(
                            blueprint.createdAt,
                          ).toLocaleDateString()
                        : ""}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          blueprint._id,
                        )
                      }
                      disabled={isDeleting}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBlueprintListScreen;


