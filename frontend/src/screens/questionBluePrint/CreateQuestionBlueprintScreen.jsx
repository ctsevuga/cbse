
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateQuestionBlueprintMutation,
} from "../../slices/questionBlueprintApiSlice";
import {
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";
import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";
import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";
import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";
import { toast } from "react-toastify";

const CreateQuestionBlueprintScreen = () => {
  const navigate = useNavigate();

  const [stream, setStream] = useState("");
  const [subject, setSubject] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classId, setClassId] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const [difficultyDistribution, setDifficultyDistribution] =
    useState({
      easy: 0,
      medium: 0,
      hard: 0,
    });

  const [questionTypeDistribution, setQuestionTypeDistribution] =
    useState({
      MCQ: 0,
      DESCRIPTIVE: 0,
      ASSERTION_REASON: 0,
      CASE_STUDY: 0,
      FILL_BLANK: 0,
      MATCHING: 0,
      TRUE_FALSE: 0,
    });

  const [rules, setRules] = useState({});

  const {
    data: streams = [],
    isLoading: streamsLoading,
    error: streamsError,
  } = useGetStreamsQuery();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useGetSubjectsQuery();

  const {
    data: academicYears = [],
    isLoading: academicYearsLoading,
    error: academicYearsError,
  } = useGetAcademicYearsQuery();

  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useGetClassesQuery();

  const [
    createQuestionBlueprint,
    {
      isLoading: isCreating,
    },
  ] = useCreateQuestionBlueprintMutation();

  useEffect(() => {
    if (streamsError) {
      toast.error(
        streamsError?.data?.message ||
          streamsError?.error ||
          "Failed to load streams",
      );
    }

    if (subjectsError) {
      toast.error(
        subjectsError?.data?.message ||
          subjectsError?.error ||
          "Failed to load subjects",
      );
    }

    if (academicYearsError) {
      toast.error(
        academicYearsError?.data?.message ||
          academicYearsError?.error ||
          "Failed to load academic years",
      );
    }

    if (classesError) {
      toast.error(
        classesError?.data?.message ||
          classesError?.error ||
          "Failed to load classes",
      );
    }
  }, [
    streamsError,
    subjectsError,
    academicYearsError,
    classesError,
  ]);

  const handleDifficultyChange = (key, value) => {
    setDifficultyDistribution((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  };

  const handleQuestionTypeChange = (key, value) => {
    setQuestionTypeDistribution((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stream) {
      toast.error("Please select a stream");
      return;
    }

    if (!subject) {
      toast.error("Please select a subject");
      return;
    }

    if (!academicYear) {
      toast.error("Please select an academic year");
      return;
    }

    if (!classId) {
      toast.error("Please select a class");
      return;
    }

    if (!totalQuestions || Number(totalQuestions) < 1) {
      toast.error("Total questions must be at least 1");
      return;
    }

    if (!totalMarks || Number(totalMarks) < 1) {
      toast.error("Total marks must be at least 1");
      return;
    }

    try {
      await createQuestionBlueprint({
        academicYear,
        class: classId,
        subject,
        stream,
        totalQuestions: Number(totalQuestions),
        totalMarks: Number(totalMarks),
        rules,
        difficultyDistribution,
        questionTypeDistribution,
      }).unwrap();

      toast.success(
        "Question blueprint created successfully",
      );

      navigate("/question-blueprints");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          "Failed to create question blueprint",
      );
    }
  };

  const isLoading =
    streamsLoading ||
    subjectsLoading ||
    academicYearsLoading ||
    classesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Question Blueprint
          </h1>
          <p className="mt-2 text-gray-600">
            Define the academic structure and question
            distribution for an assessment.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Stream & Subject
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select the stream and subject for this
                blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
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
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                >
                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Academic Year & Class
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select the academic context for this
                blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                >
                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name ||
                        item.year ||
                        item.title}
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
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
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
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Blueprint Configuration
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Define the overall question and mark
                requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="totalQuestions"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Total Questions
                </label>

                <input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  value={totalQuestions}
                  onChange={(e) =>
                    setTotalQuestions(e.target.value)
                  }
                  placeholder="Enter total questions"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label
                  htmlFor="totalMarks"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Total Marks
                </label>

                <input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={totalMarks}
                  onChange={(e) =>
                    setTotalMarks(e.target.value)
                  }
                  placeholder="Enter total marks"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Difficulty Distribution
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Specify the number of questions for each
                difficulty level.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                ["easy", "Easy"],
                ["medium", "Medium"],
                ["hard", "Hard"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={`difficulty-${key}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {label}
                  </label>

                  <input
                    id={`difficulty-${key}`}
                    type="number"
                    min="0"
                    value={difficultyDistribution[key]}
                    onChange={(e) =>
                      handleDifficultyChange(
                        key,
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Question Type Distribution
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Specify the number of questions for each
                question type.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["MCQ", "MCQ"],
                ["DESCRIPTIVE", "Descriptive"],
                [
                  "ASSERTION_REASON",
                  "Assertion & Reason",
                ],
                ["CASE_STUDY", "Case Study"],
                ["FILL_BLANK", "Fill in the Blank"],
                ["MATCHING", "Matching"],
                ["TRUE_FALSE", "True / False"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={`question-type-${key}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {label}
                  </label>

                  <input
                    id={`question-type-${key}`}
                    type="number"
                    min="0"
                    value={
                      questionTypeDistribution[key]
                    }
                    onChange={(e) =>
                      handleQuestionTypeChange(
                        key,
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate("/question-blueprints")
              }
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCreating || isLoading}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating
                ? "Creating..."
                : "Create Blueprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionBlueprintScreen;


