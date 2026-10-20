import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Plus,
  RefreshCw,
  BookOpen,
  ListChecks,
} from "lucide-react";

import {
  useGetSubjectCombinationsQuery,
} from "../../slices/subjectCombinationApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";


const SubjectCombinationListScreen = () => {
  const navigate = useNavigate();

  const {
    data: subjectCombinations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSubjectCombinationsQuery();


  // ------------------------------------------------------
  // Normalize combinations
  // ------------------------------------------------------

  const combinations = Array.isArray(subjectCombinations)
    ? subjectCombinations
    : subjectCombinations?.subjectCombinations || [];


  // ------------------------------------------------------
  // Statistics
  // ------------------------------------------------------

  const activeCount = combinations.filter(
    (item) => item.isActive,
  ).length;

  const inactiveCount = combinations.filter(
    (item) => !item.isActive,
  ).length;


  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------

  if (isLoading) {
    return <Loader />;
  }


  // ------------------------------------------------------
  // Error
  // ------------------------------------------------------

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <Message variant="danger">
          {error?.data?.message ||
            error?.error ||
            "Failed to load subject combinations"}
        </Message>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Subject Combinations
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage core and elective subjects available
              for each stream.
            </p>
          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>


            <button
              type="button"
              onClick={() =>
                navigate("/subject-combinations/create")
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Create Combination
            </button>

          </div>

        </div>


        {/* ==================================================
            Statistics
        ================================================== */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Combinations
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {combinations.length}
            </p>
          </div>


          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </p>
          </div>


          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-500">
              {inactiveCount}
            </p>
          </div>

        </div>


        {/* ==================================================
            Combination List
        ================================================== */}

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">

          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Combination List
            </h2>
          </div>


          {/* ==================================================
              Empty State
          ================================================== */}

          {combinations.length === 0 ? (
            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                <Plus
                  size={26}
                  className="text-indigo-600"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No subject combinations found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create the first subject combination for
                a stream.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/subject-combinations/create",
                  )
                }
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Combination
              </button>

            </div>
          ) : (
            <>
              {/* ==================================================
                  Desktop Table
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50">
                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Name
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Code
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Stream
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Core Subjects
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Elective Subjects
                      </th>

                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Elective Selection
                      </th>

                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>

                    </tr>
                  </thead>


                  <tbody className="divide-y divide-gray-100 bg-white">

                    {combinations.map((combination) => {

                      const coreSubjects =
                        combination.coreSubjects || [];

                      const electiveSubjects =
                        combination.electiveSubjects || [];


                      return (
                        <tr
                          key={combination._id}
                          className="transition hover:bg-gray-50"
                        >

                          {/* Name */}

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="font-semibold text-gray-800">
                              {combination.name}
                            </div>
                          </td>


                          {/* Code */}

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                              {combination.code}
                            </span>
                          </td>


                          {/* Stream */}

                          <td className="whitespace-nowrap px-6 py-4">

                            <div className="text-sm font-medium text-gray-800">
                              {combination.stream?.name || "-"}
                            </div>

                            {combination.stream?.code && (
                              <div className="text-xs text-gray-500">
                                {combination.stream.code}
                              </div>
                            )}

                          </td>


                          {/* Core Subjects */}

                          <td className="px-6 py-4">

                            <div className="flex max-w-xs flex-wrap gap-1.5">

                              {coreSubjects.length === 0 ? (
                                <span className="text-xs text-gray-400">
                                  No core subjects
                                </span>
                              ) : (
                                coreSubjects.map((subject) => (
                                  <span
                                    key={subject._id}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                  >
                                    <BookOpen size={12} />

                                    {subject.name || "-"}
                                  </span>
                                ))
                              )}

                            </div>

                          </td>


                          {/* Elective Subjects */}

                          <td className="px-6 py-4">

                            <div className="flex max-w-xs flex-wrap gap-1.5">

                              {electiveSubjects.length === 0 ? (
                                <span className="text-xs text-gray-400">
                                  No elective subjects
                                </span>
                              ) : (
                                electiveSubjects.map((subject) => (
                                  <span
                                    key={subject._id}
                                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                                  >
                                    <ListChecks size={12} />

                                    {subject.name || "-"}
                                  </span>
                                ))
                              )}

                            </div>

                          </td>


                          {/* Elective Selection */}

                          <td className="whitespace-nowrap px-6 py-4 text-center">

                            <div className="flex flex-col items-center">

                              <span className="text-sm font-semibold text-gray-700">
                                {combination.minimumElectives}
                                {" - "}
                                {combination.maximumElectives}
                              </span>

                              <span className="mt-0.5 text-xs text-gray-400">
                                elective
                                {combination.maximumElectives !== 1
                                  ? "s"
                                  : ""}
                              </span>

                            </div>

                          </td>


                          {/* Status */}

                          <td className="whitespace-nowrap px-6 py-4 text-center">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                combination.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {combination.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>

                          </td>


                          {/* Actions */}

                          <td className="whitespace-nowrap px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/subject-combinations/${combination._id}`,
                                  )
                                }
                                title="View"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                <Eye size={16} />
                                View
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/subject-combinations/${combination._id}/edit`,
                                  )
                                }
                                title="Edit"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                <Edit size={16} />
                                Edit
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>


              {/* ==================================================
                  Mobile Cards
              ================================================== */}

              <div className="divide-y divide-gray-200 md:hidden">

                {combinations.map((combination) => {

                  const coreSubjects =
                    combination.coreSubjects || [];

                  const electiveSubjects =
                    combination.electiveSubjects || [];


                  return (
                    <div
                      key={combination._id}
                      className="p-5"
                    >

                      {/* Header */}

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {combination.name}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-gray-500">
                            {combination.code}
                          </p>
                        </div>


                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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


                      {/* Stream */}

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Stream
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {combination.stream?.name || "-"}
                        </p>

                        {combination.stream?.code && (
                          <p className="text-xs text-gray-500">
                            {combination.stream.code}
                          </p>
                        )}

                      </div>


                      {/* Core Subjects */}

                      <div className="mt-4">

                        <div className="mb-2 flex items-center gap-2">

                          <BookOpen
                            size={15}
                            className="text-blue-600"
                          />

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Core Subjects
                          </p>

                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {coreSubjects.length}
                          </span>

                        </div>


                        <div className="flex flex-wrap gap-1.5">

                          {coreSubjects.length === 0 ? (
                            <span className="text-xs text-gray-400">
                              No core subjects
                            </span>
                          ) : (
                            coreSubjects.map((subject) => (
                              <span
                                key={subject._id}
                                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                              >
                                {subject.name || "-"}
                              </span>
                            ))
                          )}

                        </div>

                      </div>


                      {/* Elective Subjects */}

                      <div className="mt-4">

                        <div className="mb-2 flex items-center gap-2">

                          <ListChecks
                            size={15}
                            className="text-amber-600"
                          />

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Elective Subjects
                          </p>

                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            {electiveSubjects.length}
                          </span>

                        </div>


                        <div className="flex flex-wrap gap-1.5">

                          {electiveSubjects.length === 0 ? (
                            <span className="text-xs text-gray-400">
                              No elective subjects
                            </span>
                          ) : (
                            electiveSubjects.map((subject) => (
                              <span
                                key={subject._id}
                                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                              >
                                {subject.name || "-"}
                              </span>
                            ))
                          )}

                        </div>

                      </div>


                      {/* Selection + Actions */}

                      <div className="mt-5 flex items-center justify-between gap-4">

                        <div>

                          <p className="text-xs text-gray-500">
                            Elective Selection
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {combination.minimumElectives}
                            {" - "}
                            {combination.maximumElectives}{" "}
                            elective
                            {combination.maximumElectives !== 1
                              ? "s"
                              : ""}
                          </p>

                        </div>


                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/subject-combinations/${combination._id}`,
                              )
                            }
                            title="View"
                            className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Eye size={17} />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/subject-combinations/${combination._id}/edit`,
                              )
                            }
                            title="Edit"
                            className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-700 transition hover:bg-amber-100"
                          >
                            <Edit size={17} />
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};


export default SubjectCombinationListScreen;
