import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetSubjectCombinationDetailsQuery,
  useUpdateSubjectCombinationMutation,
} from "../../slices/subjectCombinationApiSlice";

import {
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const EditSubjectCombinationScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: combination,
    isLoading: combinationLoading,
    isError: combinationError,
    error: combinationErrorData,
  } = useGetSubjectCombinationDetailsQuery(id);

  const {
    data: streamsData = [],
    isLoading: streamsLoading,
    isError: streamsError,
    error: streamsErrorData,
  } = useGetStreamsQuery();

  const {
    data: subjectsData = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrorData,
  } = useGetSubjectsQuery();

  const [
    updateSubjectCombination,
    {
      isLoading: isUpdating,
    },
  ] = useUpdateSubjectCombinationMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [stream, setStream] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [minimumSubjects, setMinimumSubjects] =
    useState("");
  const [maximumSubjects, setMaximumSubjects] =
    useState("");

  const streams = Array.isArray(streamsData)
    ? streamsData
    : streamsData?.streams || [];

  const subjectsList = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.subjects || [];

  useEffect(() => {
    if (!combination) {
      return;
    }

    setName(combination.name || "");
    setCode(combination.code || "");
    setStream(combination.stream?._id || combination.stream || "");

    setSubjects(
      combination.subjects?.map((subject) =>
        typeof subject === "object"
          ? subject._id
          : subject,
      ) || [],
    );

    setMinimumSubjects(
      combination.minimumSubjects?.toString() || "",
    );

    setMaximumSubjects(
      combination.maximumSubjects?.toString() || "",
    );
  }, [combination]);

  const handleSubjectChange = (subjectId) => {
    setSubjects((currentSubjects) => {
      if (currentSubjects.includes(subjectId)) {
        return currentSubjects.filter(
          (id) => id !== subjectId,
        );
      }

      return [...currentSubjects, subjectId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Subject combination name is required");
      return;
    }

    if (!code.trim()) {
      toast.error("Subject combination code is required");
      return;
    }

    if (!stream) {
      toast.error("Please select a stream");
      return;
    }

    if (subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (
      minimumSubjects === "" ||
      maximumSubjects === ""
    ) {
      toast.error(
        "Minimum subjects and maximum subjects are required",
      );
      return;
    }

    const minSubjects = Number(minimumSubjects);
    const maxSubjects = Number(maximumSubjects);

    if (
      !Number.isInteger(minSubjects) ||
      !Number.isInteger(maxSubjects)
    ) {
      toast.error(
        "Minimum subjects and maximum subjects must be integers",
      );
      return;
    }

    if (minSubjects < 1 || maxSubjects < 1) {
      toast.error(
        "Minimum subjects and maximum subjects must be at least 1",
      );
      return;
    }

    if (minSubjects > maxSubjects) {
      toast.error(
        "Minimum subjects cannot be greater than maximum subjects",
      );
      return;
    }

    if (subjects.length < minSubjects) {
      toast.error(
        "Number of selected subjects cannot be less than minimum subjects",
      );
      return;
    }

    if (subjects.length > maxSubjects) {
      toast.error(
        "Number of selected subjects cannot be greater than maximum subjects",
      );
      return;
    }

    try {
      await updateSubjectCombination({
        subjectCombinationId: id,
        stream,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        subjects,
        minimumSubjects: minSubjects,
        maximumSubjects: maxSubjects,
      }).unwrap();

      toast.success(
        "Subject combination updated successfully",
      );

      navigate(`/subject-combinations/${id}`);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update subject combination",
      );
    }
  };

  if (
    combinationLoading ||
    streamsLoading ||
    subjectsLoading
  ) {
    return <Loader />;
  }

  if (combinationError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <Message variant="danger">
            {combinationErrorData?.data?.message ||
              combinationErrorData?.error ||
              "Failed to load subject combination"}
          </Message>
        </div>
      </div>
    );
  }

  if (streamsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <Message variant="danger">
            {streamsErrorData?.data?.message ||
              streamsErrorData?.error ||
              "Failed to load streams"}
          </Message>
        </div>
      </div>
    );
  }

  if (subjectsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <Message variant="danger">
            {subjectsErrorData?.data?.message ||
              subjectsErrorData?.error ||
              "Failed to load subjects"}
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Edit Subject Combination
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update the stream, subjects and selection rules.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/subject-combinations/${id}`)
            }
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="bg-indigo-600 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-white">
              {combination.name}
            </h2>

            <p className="mt-1 text-sm text-indigo-100">
              Update subject combination configuration.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Combination Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Science PCM"
                  disabled={isUpdating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Combination Code
                  <span className="ml-1 text-red-500">*</span>
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
                  placeholder="e.g. SCI_PCM"
                  disabled={isUpdating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="stream"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stream
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="stream"
                value={stream}
                onChange={(e) =>
                  setStream(e.target.value)
                }
                disabled={isUpdating}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
              >
                <option value="">
                  Select Stream
                </option>

                {streams.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                    {item.code
                      ? ` (${item.code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Subjects
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <span className="text-sm text-gray-500">
                  {subjects.length} subject
                  {subjects.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </span>
              </div>

              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                {subjectsList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No subjects available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subjectsList.map((subject) => {
                      const isSelected =
                        subjects.includes(subject._id);

                      return (
                        <label
                          key={subject._id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                            isSelected
                              ? "border-indigo-400 bg-indigo-50"
                              : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                          } ${
                            isUpdating
                              ? "cursor-not-allowed opacity-70"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleSubjectChange(
                                subject._id,
                              )
                            }
                            disabled={isUpdating}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {subject.name}
                            </p>

                            {subject.code && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                {subject.code}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="minimumSubjects"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Minimum Subjects
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="minimumSubjects"
                  type="number"
                  min="1"
                  value={minimumSubjects}
                  onChange={(e) =>
                    setMinimumSubjects(
                      e.target.value,
                    )
                  }
                  disabled={isUpdating}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="maximumSubjects"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Maximum Subjects
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="maximumSubjects"
                  type="number"
                  min="1"
                  value={maximumSubjects}
                  onChange={(e) =>
                    setMaximumSubjects(
                      e.target.value,
                    )
                  }
                  disabled={isUpdating}
                  placeholder="e.g. 6"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-sm text-indigo-800">
                {subjects.length} subjects are currently
                selected. The selected count must remain
                between the minimum and maximum limits.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(`/subject-combinations/${id}`)
                }
                disabled={isUpdating}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {isUpdating
                  ? "Updating..."
                  : "Update Subject Combination"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectCombinationScreen;