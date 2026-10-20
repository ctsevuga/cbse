import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Search,
  CheckCircle2,
  BookOpen,
  ListChecks,
} from "lucide-react";

import {
  useGetSubjectCombinationByStreamQuery,
} from "../../slices/subjectCombinationApiSlice";

import {
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";


const SubjectCombinationByStreamScreen = () => {
  const navigate = useNavigate();

  const [streamId, setStreamId] = useState("");

  // ------------------------------------------------------
  // Get streams
  // ------------------------------------------------------

  const {
    data: streamsData = [],
    isLoading: streamsLoading,
    isError: streamsError,
    error: streamsErrorData,
  } = useGetStreamsQuery();

  // ------------------------------------------------------
  // Get subject combination by stream
  // ------------------------------------------------------

  const {
    data: combination,
    isLoading: combinationLoading,
    isFetching: combinationFetching,
    isError: combinationError,
    error: combinationErrorData,
  } = useGetSubjectCombinationByStreamQuery(streamId, {
    skip: !streamId,
  });

  // ------------------------------------------------------
  // Normalize streams
  // ------------------------------------------------------

  const streams = Array.isArray(streamsData)
    ? streamsData
    : streamsData?.streams || [];

  // ------------------------------------------------------
  // Handle stream change
  // ------------------------------------------------------

  const handleStreamChange = (e) => {
    setStreamId(e.target.value);
  };

  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------

  if (streamsLoading) {
    return <Loader />;
  }

  // ------------------------------------------------------
  // Stream error
  // ------------------------------------------------------

  if (streamsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <Message variant="danger">
            {streamsErrorData?.data?.message ||
              streamsErrorData?.error ||
              "Failed to load streams"}
          </Message>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // Subjects
  // ------------------------------------------------------

  const combinationSubjects = combination?.subjects || [];

  const coreSubjects = combinationSubjects.filter(
    (item) => item.type === "CORE",
  );

  const electiveSubjects = combinationSubjects.filter(
    (item) => item.type === "ELECTIVE",
  );

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Subject Combination by Stream
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View the core and elective subjects configured
              for a stream.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/subject-combinations")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>

        {/* Main card */}

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">

          {/* Card header */}

          <div className="bg-indigo-600 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-white">
              Find Subject Combination
            </h2>

            <p className="mt-1 text-sm text-indigo-100">
              Choose a stream to view its configured core and
              elective subjects.
            </p>
          </div>

          <div className="p-6 sm:p-8">

            {/* Stream selector */}

            <div className="mx-auto max-w-3xl">
              <label
                htmlFor="stream"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Stream
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  id="stream"
                  value={streamId}
                  onChange={handleStreamChange}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">
                    Select a stream
                  </option>

                  {streams.map((stream) => (
                    <option
                      key={stream._id}
                      value={stream._id}
                    >
                      {stream.name}
                      {stream.code
                        ? ` (${stream.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* No stream selected */}

            {!streamId && (
              <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                  <Search
                    size={25}
                    className="text-indigo-600"
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  Select a Stream
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Select a stream above to view its subject
                  combination.
                </p>
              </div>
            )}

            {/* Loading */}

            {streamId && combinationLoading && (
              <div className="mt-8">
                <Loader />
              </div>
            )}

            {/* Combination error */}

            {streamId &&
              !combinationLoading &&
              combinationError && (
                <div className="mt-8">
                  <Message variant="danger">
                    {combinationErrorData?.data?.message ||
                      combinationErrorData?.error ||
                      "Subject combination not found for this stream"}
                  </Message>
                </div>
              )}

            {/* Combination */}

            {streamId &&
              !combinationLoading &&
              !combinationError &&
              combination && (
                <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">

                  {/* Combination header */}

                  <div className="bg-gray-50 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-800">
                            {combination.name}
                          </h3>

                          <span className="rounded-md bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {combination.code}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {combination.stream?.name || "-"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            combination.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {combination.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/subject-combinations/${combination._id}/edit`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 sm:p-6">

                    {/* Overview */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      {/* Stream */}

                      <div className="rounded-lg bg-indigo-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                          Stream
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {combination.stream?.name || "-"}
                        </p>

                        {combination.stream?.code && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {combination.stream.code}
                          </p>
                        )}
                      </div>

                      {/* Core */}

                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                          Core Subjects
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-800">
                          {coreSubjects.length}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Required for every student
                        </p>
                      </div>

                      {/* Electives */}

                      <div className="rounded-lg bg-amber-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                          Elective Subjects
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-800">
                          {electiveSubjects.length}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Available for selection
                        </p>
                      </div>

                      {/* Total */}

                      <div className="rounded-lg bg-purple-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Total Subjects
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-800">
                          {combinationSubjects.length}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Core + elective
                        </p>
                      </div>
                    </div>

                    {/* Core subjects */}

                    <div>
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                            <BookOpen
                              size={18}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-gray-800">
                              Core Subjects
                            </h4>

                            <p className="text-xs text-gray-500">
                              All students must take these
                              subjects.
                            </p>
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {coreSubjects.length} Core
                        </span>
                      </div>

                      {coreSubjects.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                          No core subjects configured.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {coreSubjects.map((item) => {
                            const subject =
                              item.subject || {};

                            return (
                              <div
                                key={
                                  subject._id ||
                                  item._id
                                }
                                className="rounded-lg border border-blue-100 bg-blue-50/50 p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                    <CheckCircle2
                                      size={17}
                                      className="text-blue-600"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-800">
                                      {subject.name ||
                                        "Unknown Subject"}
                                    </p>

                                    {subject.code && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {subject.code}
                                      </p>
                                    )}

                                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                      Core
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Elective subjects */}

                    <div>
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                            <ListChecks
                              size={18}
                              className="text-amber-600"
                            />
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-gray-800">
                              Elective Subjects
                            </h4>

                            <p className="text-xs text-gray-500">
                              Students select from these
                              subjects.
                            </p>
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {electiveSubjects.length}{" "}
                          Elective
                          {electiveSubjects.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      {electiveSubjects.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                          No elective subjects configured.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {electiveSubjects.map((item) => {
                            const subject =
                              item.subject || {};

                            return (
                              <div
                                key={
                                  subject._id ||
                                  item._id
                                }
                                className="rounded-lg border border-amber-100 bg-amber-50/50 p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                    <ListChecks
                                      size={17}
                                      className="text-amber-600"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-800">
                                      {subject.name ||
                                        "Unknown Subject"}
                                    </p>

                                    {subject.code && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {subject.code}
                                      </p>
                                    )}

                                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                      Elective
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Student selection rules */}

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                          <ListChecks
                            size={20}
                            className="text-indigo-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-indigo-900">
                            Student Subject Selection
                          </p>

                          <p className="mt-1 text-sm leading-6 text-indigo-700">
                            Every student assigned to this
                            stream will automatically receive
                            all{" "}
                            <span className="font-bold">
                              {coreSubjects.length} core
                              subject
                              {coreSubjects.length !== 1
                                ? "s"
                                : ""}
                            </span>
                            . The student must then select
                            between{" "}
                            <span className="font-bold">
                              {
                                combination.minimumElectives
                              }
                            </span>{" "}
                            and{" "}
                            <span className="font-bold">
                              {
                                combination.maximumElectives
                              }
                            </span>{" "}
                            elective
                            {combination.maximumElectives !==
                            1
                              ? "s"
                              : ""}{" "}
                            from the available elective
                            subjects.
                          </p>
                        </div>
                      </div>

                      {/* Elective limits */}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">
                            Available Electives
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-800">
                            {electiveSubjects.length}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">
                            Minimum Selection
                          </p>

                          <p className="mt-1 text-xl font-bold text-indigo-600">
                            {combination.minimumElectives}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">
                            Maximum Selection
                          </p>

                          <p className="mt-1 text-xl font-bold text-indigo-600">
                            {combination.maximumElectives}
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

            {/* Refreshing */}

            {combinationFetching &&
              !combinationLoading &&
              combination && (
                <div className="mt-3 text-right text-xs text-gray-400">
                  Refreshing...
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectCombinationByStreamScreen;
