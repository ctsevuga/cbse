import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useCreateSubjectCombinationMutation,
} from "../../slices/subjectCombinationApiSlice";

import {
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";


const CreateSubjectCombinationScreen = () => {
  const navigate = useNavigate();

  // ------------------------------------------------------
  // Form State
  // ------------------------------------------------------

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [stream, setStream] = useState("");

  /*
    subjects structure:

    [
      {
        subject: "subjectId",
        type: "CORE",
      },
      {
        subject: "subjectId",
        type: "ELECTIVE",
      },
    ]
  */
  const [subjects, setSubjects] = useState([]);

  const [minimumElectives, setMinimumElectives] =
    useState("");

  const [maximumElectives, setMaximumElectives] =
    useState("");


  // ------------------------------------------------------
  // Queries
  // ------------------------------------------------------

  const {
    data: streams = [],
    isLoading: streamsLoading,
    isError: streamsError,
    error: streamsErrorData,
  } = useGetStreamsQuery();

  const {
    data: subjectData = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrorData,
  } = useGetSubjectsQuery();


  // ------------------------------------------------------
  // Mutation
  // ------------------------------------------------------

  const [
    createSubjectCombination,
    {
      isLoading: isCreating,
    },
  ] = useCreateSubjectCombinationMutation();


  // ------------------------------------------------------
  // Normalize API Data
  // ------------------------------------------------------

  const subjectsList = Array.isArray(subjectData)
    ? subjectData
    : subjectData?.subjects || [];

  const streamsList = Array.isArray(streams)
    ? streams
    : streams?.streams || [];


  // ------------------------------------------------------
  // Check Whether Subject Is Selected
  // ------------------------------------------------------

  const isSubjectSelected = (subjectId) => {
    return subjects.some(
      (item) =>
        item.subject === subjectId,
    );
  };


  // ------------------------------------------------------
  // Get Subject Type
  // ------------------------------------------------------

  const getSubjectType = (subjectId) => {
    const selectedSubject = subjects.find(
      (item) =>
        item.subject === subjectId,
    );

    return selectedSubject?.type || null;
  };


  // ------------------------------------------------------
  // Add / Remove Subject
  // ------------------------------------------------------

  const handleSubjectToggle = (subjectId) => {
    setSubjects((currentSubjects) => {
      const exists = currentSubjects.some(
        (item) =>
          item.subject === subjectId,
      );

      if (exists) {
        return currentSubjects.filter(
          (item) =>
            item.subject !== subjectId,
        );
      }

      // Default newly selected subject to CORE.
      return [
        ...currentSubjects,
        {
          subject: subjectId,
          type: "CORE",
        },
      ];
    });
  };


  // ------------------------------------------------------
  // Change Subject Type
  // ------------------------------------------------------

  const handleSubjectTypeChange = (
    subjectId,
    type,
  ) => {
    setSubjects((currentSubjects) =>
      currentSubjects.map((item) =>
        item.subject === subjectId
          ? {
              ...item,
              type,
            }
          : item,
      ),
    );
  };


  // ------------------------------------------------------
  // Subject Counts
  // ------------------------------------------------------

  const coreSubjects = subjects.filter(
    (item) =>
      item.type === "CORE",
  );

  const electiveSubjects = subjects.filter(
    (item) =>
      item.type === "ELECTIVE",
  );


  // ------------------------------------------------------
  // Submit
  // ------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------------
    // Basic validation
    // ----------------------------------------------------

    if (!name.trim()) {
      toast.error(
        "Subject combination name is required",
      );
      return;
    }

    if (!code.trim()) {
      toast.error(
        "Subject combination code is required",
      );
      return;
    }

    if (!stream) {
      toast.error(
        "Please select a stream",
      );
      return;
    }

    if (subjects.length === 0) {
      toast.error(
        "Please select at least one subject",
      );
      return;
    }

    // ----------------------------------------------------
    // Core subject validation
    // ----------------------------------------------------

    if (coreSubjects.length === 0) {
      toast.error(
        "At least one core subject is required",
      );
      return;
    }

    // ----------------------------------------------------
    // Elective limits required
    // ----------------------------------------------------

    if (
      minimumElectives === "" ||
      maximumElectives === ""
    ) {
      toast.error(
        "Minimum electives and maximum electives are required",
      );
      return;
    }

    const minElectives =
      Number(minimumElectives);

    const maxElectives =
      Number(maximumElectives);

    // ----------------------------------------------------
    // Validate integers
    // ----------------------------------------------------

    if (
      !Number.isInteger(minElectives) ||
      !Number.isInteger(maxElectives)
    ) {
      toast.error(
        "Minimum electives and maximum electives must be integers",
      );
      return;
    }

    // ----------------------------------------------------
    // Validate non-negative values
    // ----------------------------------------------------

    if (
      minElectives < 0 ||
      maxElectives < 0
    ) {
      toast.error(
        "Minimum electives and maximum electives cannot be negative",
      );
      return;
    }

    // ----------------------------------------------------
    // Validate min <= max
    // ----------------------------------------------------

    if (
      minElectives > maxElectives
    ) {
      toast.error(
        "Minimum electives cannot be greater than maximum electives",
      );
      return;
    }

    // ----------------------------------------------------
    // Validate available electives
    // ----------------------------------------------------

    if (
      minElectives >
      electiveSubjects.length
    ) {
      toast.error(
        "Minimum electives cannot be greater than the number of selected elective subjects",
      );
      return;
    }

    if (
      maxElectives >
      electiveSubjects.length
    ) {
      toast.error(
        "Maximum electives cannot be greater than the number of selected elective subjects",
      );
      return;
    }

    // ----------------------------------------------------
    // Validate subject types
    // ----------------------------------------------------

    const invalidSubject =
      subjects.find(
        (item) =>
          !["CORE", "ELECTIVE"].includes(
            item.type,
          ),
      );

    if (invalidSubject) {
      toast.error(
        "Every selected subject must be either Core or Elective",
      );
      return;
    }

    // ----------------------------------------------------
    // Create
    // ----------------------------------------------------

    try {
      await createSubjectCombination({
        stream,

        name: name.trim(),

        code: code
          .trim()
          .toUpperCase(),

        subjects,

        minimumElectives:
          minElectives,

        maximumElectives:
          maxElectives,
      }).unwrap();

      toast.success(
        "Subject combination created successfully",
      );

      navigate(
        "/subject-combinations",
      );
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to create subject combination",
      );
    }
  };


  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------

  if (
    streamsLoading ||
    subjectsLoading
  ) {
    return <Loader />;
  }


  // ------------------------------------------------------
  // Stream Error
  // ------------------------------------------------------

  if (streamsError) {
    return (
      <Message variant="danger">
        {streamsErrorData?.data?.message ||
          streamsErrorData?.error ||
          "Failed to load streams"}
      </Message>
    );
  }


  // ------------------------------------------------------
  // Subject Error
  // ------------------------------------------------------

  if (subjectsError) {
    return (
      <Message variant="danger">
        {subjectsErrorData?.data?.message ||
          subjectsErrorData?.error ||
          "Failed to load subjects"}
      </Message>
    );
  }


  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Create Subject Combination
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Define the core and elective subjects available
              for a stream.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/subject-combinations",
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Back
          </button>
        </div>


        {/* ==================================================
            Form Card
        ================================================== */}

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">

          {/* ------------------------------------------------
              Card Header
          ------------------------------------------------ */}

          <div className="bg-indigo-600 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">
              Subject Combination Details
            </h2>

            <p className="mt-1 text-sm text-indigo-100">
              Configure the stream, subjects and elective
              selection rules.
            </p>
          </div>


          {/* ------------------------------------------------
              Form
          ------------------------------------------------ */}

          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-6 sm:p-8"
          >

            {/* =================================================
                Basic Information
            ================================================= */}

            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-800">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Combination Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. PCM Science"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>


                {/* Code */}

                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Combination Code
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.toUpperCase(),
                      )
                    }
                    placeholder="e.g. PCM-SCIENCE"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

              </div>
            </div>


            {/* =================================================
                Stream
            ================================================= */}

            <div>
              <label
                htmlFor="stream"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stream
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="stream"
                value={stream}
                onChange={(e) =>
                  setStream(
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  Select Stream
                </option>

                {streamsList.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                      {item.code
                        ? ` (${item.code})`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>


            {/* =================================================
                Subjects
            ================================================= */}

            <div>

              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subjects
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <p className="mt-1 text-xs text-gray-500">
                    Select each subject and classify it as
                    Core or Elective.
                  </p>
                </div>


                {/* Counters */}

                <div className="flex flex-wrap gap-2 text-xs">

                  <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                    Core:{" "}
                    {coreSubjects.length}
                  </span>

                  <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                    Elective:{" "}
                    {electiveSubjects.length}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    Total:{" "}
                    {subjects.length}
                  </span>

                </div>

              </div>


              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">

                {subjectsList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No subjects available.
                  </div>
                ) : (
                  <div className="space-y-3">

                    {subjectsList.map(
                      (subject) => {
                        const selected =
                          isSubjectSelected(
                            subject._id,
                          );

                        const selectedType =
                          getSubjectType(
                            subject._id,
                          );

                        return (
                          <div
                            key={
                              subject._id
                            }
                            className={`rounded-lg border bg-white p-4 transition ${
                              selected
                                ? "border-indigo-300 shadow-sm"
                                : "border-gray-200"
                            }`}
                          >

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              {/* Subject */}

                              <label className="flex cursor-pointer items-center gap-3">

                                <input
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  onChange={() =>
                                    handleSubjectToggle(
                                      subject._id,
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div className="min-w-0">

                                  <p className="text-sm font-medium text-gray-800">
                                    {
                                      subject.name
                                    }
                                  </p>

                                  {subject.code && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                      {
                                        subject.code
                                      }
                                    </p>
                                  )}

                                </div>

                              </label>


                              {/* Subject Type */}

                              {selected && (
                                <div className="flex items-center gap-2">

                                  <span className="text-xs font-medium text-gray-500">
                                    Type:
                                  </span>

                                  <select
                                    value={
                                      selectedType ||
                                      "CORE"
                                    }
                                    onChange={(
                                      e,
                                    ) =>
                                      handleSubjectTypeChange(
                                        subject._id,
                                        e.target.value,
                                      )
                                    }
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 ${
                                      selectedType ===
                                      "ELECTIVE"
                                        ? "border-amber-300 bg-amber-50 text-amber-700 focus:border-amber-500 focus:ring-amber-200"
                                        : "border-blue-300 bg-blue-50 text-blue-700 focus:border-blue-500 focus:ring-blue-200"
                                    }`}
                                  >
                                    <option value="CORE">
                                      Core
                                    </option>

                                    <option value="ELECTIVE">
                                      Elective
                                    </option>
                                  </select>

                                </div>
                              )}

                            </div>

                          </div>
                        );
                      },
                    )}

                  </div>
                )}

              </div>

            </div>


            {/* =================================================
                Elective Rules
            ================================================= */}

            <div>

              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Elective Selection Rules
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Define how many elective subjects a student
                  must or may select.
                </p>
              </div>


              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {/* Minimum Electives */}

                <div>
                  <label
                    htmlFor="minimumElectives"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Minimum Electives
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="minimumElectives"
                    type="number"
                    min="0"
                    value={
                      minimumElectives
                    }
                    onChange={(e) =>
                      setMinimumElectives(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Minimum number of electives each
                    student must select.
                  </p>
                </div>


                {/* Maximum Electives */}

                <div>
                  <label
                    htmlFor="maximumElectives"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Maximum Electives
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="maximumElectives"
                    type="number"
                    min="0"
                    value={
                      maximumElectives
                    }
                    onChange={(e) =>
                      setMaximumElectives(
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 2"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of electives each
                    student may select.
                  </p>
                </div>

              </div>

            </div>


            {/* =================================================
                Summary
            ================================================= */}

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">

              <h3 className="text-sm font-semibold text-indigo-900">
                Combination Summary
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Core Subjects
                  </p>

                  <p className="mt-1 text-lg font-semibold text-blue-700">
                    {coreSubjects.length}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Elective Subjects
                  </p>

                  <p className="mt-1 text-lg font-semibold text-amber-700">
                    {electiveSubjects.length}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Minimum Electives
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {minimumElectives === ""
                      ? "-"
                      : minimumElectives}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Maximum Electives
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {maximumElectives === ""
                      ? "-"
                      : maximumElectives}
                  </p>
                </div>

              </div>

            </div>


            {/* =================================================
                Actions
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/subject-combinations",
                  )
                }
                disabled={isCreating}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreating}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating
                  ? "Creating..."
                  : "Create Subject Combination"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};


export default CreateSubjectCombinationScreen;
