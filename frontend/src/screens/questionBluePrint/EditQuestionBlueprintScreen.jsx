import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetQuestionBlueprintDetailsQuery,
  useUpdateQuestionBlueprintMutation,
} from "../../slices/questionBlueprintApiSlice";

import { useGetStreamsQuery } from "../../slices/streamApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const questionTypeOptions = [
  { value: "MCQ", label: "MCQ" },
  { value: "DESCRIPTIVE", label: "Descriptive" },
  {
    value: "ASSERTION_REASON",
    label: "Assertion & Reason",
  },
  {
    value: "CASE_STUDY",
    label: "Case Study",
  },
  {
    value: "FILL_BLANK",
    label: "Fill in the Blank",
  },
  {
    value: "MATCHING",
    label: "Matching",
  },
  {
    value: "TRUE_FALSE",
    label: "True / False",
  },
];

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value._id || "";
};

const EditQuestionBlueprintScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: blueprint,
    isLoading: isLoadingBlueprint,
    isError,
    error,
  } = useGetQuestionBlueprintDetailsQuery(id);

  const [
    updateQuestionBlueprint,
    { isLoading: isUpdating },
  ] = useUpdateQuestionBlueprintMutation();

  const {
    data: streams = [],
    isLoading: isLoadingStreams,
  } = useGetStreamsQuery();

  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
  } = useGetSubjectsQuery();

  const {
    data: academicYears = [],
    isLoading: isLoadingAcademicYears,
  } = useGetAcademicYearsQuery();

  const {
    data: classes = [],
    isLoading: isLoadingClasses,
  } = useGetClassesQuery();

  const [formData, setFormData] = useState({
    stream: "",
    subject: "",
    academicYear: "",
    class: "",
    totalQuestions: "",
    totalMarks: "",
    difficultyDistribution: {
      easy: "",
      medium: "",
      hard: "",
    },
    questionTypeDistribution: {
      MCQ: "",
      DESCRIPTIVE: "",
      ASSERTION_REASON: "",
      CASE_STUDY: "",
      FILL_BLANK: "",
      MATCHING: "",
      TRUE_FALSE: "",
    },
    rules: {},
  });

  useEffect(() => {
    if (!blueprint) return;

    setFormData({
      stream: getId(blueprint.stream),
      subject: getId(blueprint.subject),
      academicYear: getId(
        blueprint.academicYear,
      ),
      class: getId(blueprint.class),
      totalQuestions:
        blueprint.totalQuestions ?? "",
      totalMarks: blueprint.totalMarks ?? "",
      difficultyDistribution: {
        easy:
          blueprint.difficultyDistribution?.easy ??
          "",
        medium:
          blueprint.difficultyDistribution?.medium ??
          "",
        hard:
          blueprint.difficultyDistribution?.hard ??
          "",
      },
      questionTypeDistribution: {
        MCQ:
          blueprint.questionTypeDistribution?.MCQ ??
          "",
        DESCRIPTIVE:
          blueprint.questionTypeDistribution
            ?.DESCRIPTIVE ?? "",
        ASSERTION_REASON:
          blueprint.questionTypeDistribution
            ?.ASSERTION_REASON ?? "",
        CASE_STUDY:
          blueprint.questionTypeDistribution
            ?.CASE_STUDY ?? "",
        FILL_BLANK:
          blueprint.questionTypeDistribution
            ?.FILL_BLANK ?? "",
        MATCHING:
          blueprint.questionTypeDistribution
            ?.MATCHING ?? "",
        TRUE_FALSE:
          blueprint.questionTypeDistribution
            ?.TRUE_FALSE ?? "",
      },
      rules: blueprint.rules || {},
    });
  }, [blueprint]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDistributionChange = (
    section,
    name,
    value,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.stream) {
      toast.error("Please select a stream");
      return;
    }

    if (!formData.subject) {
      toast.error("Please select a subject");
      return;
    }

    if (!formData.academicYear) {
      toast.error("Please select an academic year");
      return;
    }

    if (!formData.class) {
      toast.error("Please select a class");
      return;
    }

    if (
      !formData.totalQuestions ||
      Number(formData.totalQuestions) < 1
    ) {
      toast.error(
        "Total questions must be at least 1",
      );
      return;
    }

    if (
      !formData.totalMarks ||
      Number(formData.totalMarks) < 1
    ) {
      toast.error("Total marks must be at least 1");
      return;
    }

    try {
      await updateQuestionBlueprint({
        questionBlueprintId: id,
        academicYear: formData.academicYear,
        class: formData.class,
        subject: formData.subject,
        stream: formData.stream,
        totalQuestions: Number(
          formData.totalQuestions,
        ),
        totalMarks: Number(formData.totalMarks),
        rules: formData.rules,
        difficultyDistribution:
          formData.difficultyDistribution,
        questionTypeDistribution:
          formData.questionTypeDistribution,
      }).unwrap();

      toast.success(
        "Question blueprint updated successfully",
      );

      navigate(`/question-blueprints/${id}`);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Failed to update question blueprint",
      );
    }
  };

  if (
    isLoadingBlueprint ||
    isLoadingStreams ||
    isLoadingSubjects ||
    isLoadingAcademicYears ||
    isLoadingClasses
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load question blueprint
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error?.data?.message ||
              error?.error ||
              "Something went wrong while loading the blueprint."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              ← Back to Blueprint
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Edit Question Blueprint
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update the academic structure and
              question distribution.
            </p>
          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Blueprint
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Stream & Subject
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the stream and subject for this
                blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Stream
                </label>

                <select
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Stream
                  </option>

                  {streams.map((stream) => (
                    <option
                      key={stream._id}
                      value={stream._id}
                    >
                      {stream.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Subject
                </label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Academic Structure
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the academic year and class.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Academic Year
                </label>

                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears.map((year) => (
                    <option
                      key={year._id}
                      value={year._id}
                    >
                      {year.name ||
                        year.year ||
                        year.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Class
                </label>

                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">
                    Select Class
                  </option>

                  {classes.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name ||
                        item.className ||
                        item.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Configuration
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Define the overall size of the blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Total Questions
                </label>

                <input
                  type="number"
                  min="1"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  placeholder="Enter total questions"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Total Marks
                </label>

                <input
                  type="number"
                  min="1"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  placeholder="Enter total marks"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Difficulty Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Specify the number of questions at each
                difficulty level.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {difficultyOptions.map((option) => (
                <div key={option.value}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {option.label}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData
                        .difficultyDistribution[
                        option.value
                      ]
                    }
                    onChange={(event) =>
                      handleDistributionChange(
                        "difficultyDistribution",
                        option.value,
                        event.target.value,
                      )
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Type Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Specify how many questions should be
                selected for each question type.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {questionTypeOptions.map((option) => (
                <div key={option.value}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {option.label}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData
                        .questionTypeDistribution[
                        option.value
                      ]
                    }
                    onChange={(event) =>
                      handleDistributionChange(
                        "questionTypeDistribution",
                        option.value,
                        event.target.value,
                      )
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Rules
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Additional blueprint rules can be
                configured here.
              </p>
            </div>

            <textarea
              value={JSON.stringify(
                formData.rules,
                null,
                2,
              )}
              onChange={(event) => {
                try {
                  const value = JSON.parse(
                    event.target.value,
                  );

                  setFormData((previous) => ({
                    ...previous,
                    rules: value,
                  }));
                } catch {
                  setFormData((previous) => ({
                    ...previous,
                    rules: {},
                  }));
                }
              }}
              rows={6}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          <div className="flex flex-col-reverse gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isUpdating}
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "Updating Blueprint..."
                : "Update Blueprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionBlueprintScreen;