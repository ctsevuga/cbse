import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Layers3,
  ListChecks,
  MessageSquareText,
  Save,
  Settings2,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useCreateQuestionMutation,
} from "../../slices/questionApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import {
  useGetChaptersBySubjectQuery,
} from "../../slices/chapterApiSlice";

import {
  useGetTopicsQuery,
} from "../../slices/topicApiSlice";

import {
  useGetAnswerEditorConfigurationsQuery,
} from "../../slices/answerEditorConfigurationApiSlice";

import {
  useGetQuestionGroupsQuery,
} from "../../slices/questionGroupApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

const questionTypes = [
  { value: "MCQ", label: "Multiple Choice Question" },
  { value: "DESCRIPTIVE", label: "Descriptive" },
  { value: "ASSERTION_REASON", label: "Assertion & Reason" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "MATCHING", label: "Matching" },
  { value: "TRUE_FALSE", label: "True / False" },
];

const difficulties = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const initialForm = {
  class: "",
  subject: "",
  chapter: "",
  topic: "",
  questionType: "MCQ",
  marks: "",
  questionText: "",
  answerEditorConfiguration: "",
  options: ["", ""],
  correctAnswer: "",
  difficulty: "MEDIUM",
  negativeMarks: "0",
  questionGroup: "",
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.chapters)) return response.chapters;
  if (Array.isArray(response?.topics)) return response.topics;
  if (Array.isArray(response?.configurations))
    return response.configurations;
  if (Array.isArray(response?.questionGroups))
    return response.questionGroups;
  return [];
};

const getSubjectName = (item) =>
  item?.name ||
  item?.subjectName ||
  item?.shortName ||
  item?.code ||
  "";

const getChapterName = (item) =>
  item?.name ||
  item?.chapterName ||
  item?.title ||
  (item?.chapterNo ? `Chapter ${item.chapterNo}` : "");

const getTopicName = (item) =>
  item?.name ||
  item?.topicName ||
  item?.title ||
  "";

const getConfigurationName = (item) =>
  item?.name ||
  item?.code ||
  item?.title ||
  "";

const getQuestionGroupName = (item) =>
  item?.name ||
  item?.title ||
  item?.code ||
  "";

const getClassName = (item) =>
  item?.name ||
  item?.className ||
  item?.code ||
  "";

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.error ||
  "Something went wrong. Please try again.";

const CreateQuestionScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: subjectsResponse,
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery({ isActive: true });

  const {
    data: classesResponse,
    isLoading: classesLoading,
  } = useGetClassesQuery({ isActive: true });

  const {
    data: chaptersResponse,
    isLoading: chaptersLoading,
  } = useGetChaptersBySubjectQuery(formData.subject, {
    skip: !formData.subject,
  });

  const {
    data: topicsResponse,
    isLoading: topicsLoading,
  } = useGetTopicsQuery(
    {
      chapter: formData.chapter,
    },
    {
      skip: !formData.chapter,
    },
  );

  const {
    data: configurationsResponse,
    isLoading: configurationsLoading,
  } =
    useGetAnswerEditorConfigurationsQuery(
      {
        subject: formData.subject,
        isActive: true,
      },
      {
        skip: !formData.subject,
      },
    );

  const {
    data: questionGroupsResponse,
    isLoading: questionGroupsLoading,
  } = useGetQuestionGroupsQuery(
    {
      subject: formData.subject,
      isActive: true,
    },
    {
      skip: !formData.subject,
    },
  );

  const [
    createQuestion,
    {
      isLoading: creating,
    },
  ] = useCreateQuestionMutation();

  const subjects = useMemo(
    () => normalizeList(subjectsResponse),
    [subjectsResponse],
  );

  const classes = useMemo(
    () => normalizeList(classesResponse),
    [classesResponse],
  );

  const chapters = useMemo(
    () => normalizeList(chaptersResponse),
    [chaptersResponse],
  );

  const topics = useMemo(
    () => normalizeList(topicsResponse),
    [topicsResponse],
  );

  const configurations = useMemo(
    () => normalizeList(configurationsResponse),
    [configurationsResponse],
  );

  const questionGroups = useMemo(
    () => normalizeList(questionGroupsResponse),
    [questionGroupsResponse],
  );

  useEffect(() => {
    if (
      formData.answerEditorConfiguration &&
      configurations.length > 0 &&
      !configurations.some(
        (item) =>
          item?._id ===
          formData.answerEditorConfiguration,
      )
    ) {
      setFormData((previous) => ({
        ...previous,
        answerEditorConfiguration: "",
      }));
    }
  }, [
    configurations,
    formData.answerEditorConfiguration,
  ]);

  useEffect(() => {
    if (
      formData.questionGroup &&
      questionGroups.length > 0 &&
      !questionGroups.some(
        (item) =>
          item?._id === formData.questionGroup,
      )
    ) {
      setFormData((previous) => ({
        ...previous,
        questionGroup: "",
      }));
    }
  }, [
    questionGroups,
    formData.questionGroup,
  ]);

  const isOptionQuestion =
    formData.questionType === "MCQ" ||
    formData.questionType ===
      "ASSERTION_REASON";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    if (name === "subject") {
      setFormData((previous) => ({
        ...previous,
        subject: value,
        chapter: "",
        topic: "",
        answerEditorConfiguration: "",
        questionGroup: "",
      }));
      return;
    }

    if (name === "chapter") {
      setFormData((previous) => ({
        ...previous,
        chapter: value,
        topic: "",
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData((previous) => {
      const options = [...previous.options];
      options[index] = value;

      return {
        ...previous,
        options,
      };
    });
  };

  const addOption = () => {
    setFormData((previous) => ({
      ...previous,
      options: [...previous.options, ""],
    }));
  };

  const removeOption = (index) => {
    setFormData((previous) => ({
      ...previous,
      options: previous.options.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
      correctAnswer:
        previous.correctAnswer ===
        previous.options[index]
          ? ""
          : previous.correctAnswer,
    }));
  };

  const validateForm = () => {
    if (!formData.class) {
      return "Class is required.";
    }

    if (!formData.subject) {
      return "Subject is required.";
    }

    if (!formData.questionType) {
      return "Question type is required.";
    }

    if (!formData.marks) {
      return "Marks are required.";
    }

    if (
      Number.isNaN(Number(formData.marks)) ||
      Number(formData.marks) < 0
    ) {
      return "Marks must be a valid non-negative number.";
    }

    if (!formData.questionText.trim()) {
      return "Question text is required.";
    }

    if (!formData.answerEditorConfiguration) {
      return "Answer editor configuration is required.";
    }

    if (
      Number(formData.negativeMarks) < 0 ||
      Number.isNaN(
        Number(formData.negativeMarks),
      )
    ) {
      return "Negative marks must be a valid non-negative number.";
    }

    if (isOptionQuestion) {
      const validOptions = formData.options.filter(
        (option) => option.trim(),
      );

      if (validOptions.length < 2) {
        return "At least two options are required.";
      }

      if (!formData.correctAnswer) {
        return "Correct answer is required.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const cleanedOptions = formData.options
      .map((option) => option.trim())
      .filter(Boolean);

    const payload = {
      class: formData.class,
      subject: formData.subject,
      chapter:
        formData.chapter || undefined,
      topic:
        formData.topic || undefined,
      questionType: formData.questionType,
      marks: Number(formData.marks),
      questionText:
        formData.questionText.trim(),
      answerEditorConfiguration:
        formData.answerEditorConfiguration,
      options: isOptionQuestion
        ? cleanedOptions
        : [],
      correctAnswer: isOptionQuestion
        ? formData.correctAnswer
        : null,
      difficulty: formData.difficulty,
      negativeMarks: Number(
        formData.negativeMarks || 0,
      ),
      questionGroup:
        formData.questionGroup || undefined,
    };

    try {
      await createQuestion(payload).unwrap();

      setSuccessMessage(
        "Question created successfully.",
      );

      setFormData(initialForm);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg ring-1 ring-white/20 backdrop-blur">
                  <FileQuestion
                    size={30}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles
                      size={16}
                      className="text-cyan-100"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100">
                      Global Question Bank
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Create Question
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Create and configure a CBSE question
                    for the question bank.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-2xl bg-white/10 px-5 py-3 text-sm text-white ring-1 ring-white/20 backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <ListChecks size={18} />
                  <span>
                    Question Status:{" "}
                    <span className="font-semibold">
                      Draft
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8 p-6 sm:p-8">
              {successMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
                  <CheckCircle2
                    size={21}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold">
                      Success
                    </p>
                    <p className="text-sm">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
                  <XCircle
                    size={21}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold">
                      Unable to create question
                    </p>
                    <p className="text-sm">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Academic Context
                    </h2>
                    <p className="text-sm text-slate-500">
                      Select the academic location of the
                      question.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <SelectField
                    label="Class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    icon={<Layers3 size={17} />}
                    disabled={classesLoading}
                  >
                    <option value="">
                      {classesLoading
                        ? "Loading classes..."
                        : "Select class"}
                    </option>

                    {classes.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getClassName(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    icon={<BookOpen size={17} />}
                    disabled={subjectsLoading}
                  >
                    <option value="">
                      {subjectsLoading
                        ? "Loading subjects..."
                        : "Select subject"}
                    </option>

                    {subjects.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getSubjectName(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleChange}
                    icon={<Layers3 size={17} />}
                    disabled={
                      !formData.subject ||
                      chaptersLoading
                    }
                  >
                    <option value="">
                      {!formData.subject
                        ? "Select subject first"
                        : chaptersLoading
                          ? "Loading chapters..."
                          : "Select chapter"}
                    </option>

                    {chapters.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getChapterName(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    icon={<Target size={17} />}
                    disabled={
                      !formData.chapter ||
                      topicsLoading
                    }
                  >
                    <option value="">
                      {!formData.chapter
                        ? "Select chapter first"
                        : topicsLoading
                          ? "Loading topics..."
                          : "Select topic"}
                    </option>

                    {topics.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getTopicName(item)}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </section>

              <div className="border-t border-slate-200" />

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Settings2 size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Question Configuration
                    </h2>
                    <p className="text-sm text-slate-500">
                      Define the question type, marks and
                      answer configuration.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <SelectField
                    label="Question Type"
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleChange}
                    required
                    icon={
                      <FileQuestion size={17} />
                    }
                  >
                    {questionTypes.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    icon={<Target size={17} />}
                  >
                    {difficulties.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </SelectField>

                  <NumberField
                    label="Marks"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.5"
                    placeholder="Enter marks"
                  />

                  <NumberField
                    label="Negative Marks"
                    name="negativeMarks"
                    value={formData.negativeMarks}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />

                  <SelectField
                    label="Answer Editor Configuration"
                    name="answerEditorConfiguration"
                    value={
                      formData.answerEditorConfiguration
                    }
                    onChange={handleChange}
                    required
                    icon={
                      <MessageSquareText size={17} />
                    }
                    disabled={
                      !formData.subject ||
                      configurationsLoading
                    }
                  >
                    <option value="">
                      {!formData.subject
                        ? "Select subject first"
                        : configurationsLoading
                          ? "Loading configurations..."
                          : "Select configuration"}
                    </option>

                    {configurations.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getConfigurationName(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Question Group"
                    name="questionGroup"
                    value={formData.questionGroup}
                    onChange={handleChange}
                    icon={
                      <ListChecks size={17} />
                    }
                    disabled={
                      !formData.subject ||
                      questionGroupsLoading
                    }
                  >
                    <option value="">
                      {!formData.subject
                        ? "Select subject first"
                        : questionGroupsLoading
                          ? "Loading question groups..."
                          : "Select question group"}
                    </option>

                    {questionGroups.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getQuestionGroupName(item)}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </section>

              <div className="border-t border-slate-200" />

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                    <MessageSquareText size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Question Content
                    </h2>
                    <p className="text-sm text-slate-500">
                      Enter the question and configure its
                      answer options.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="questionText"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Question Text
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="questionText"
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Enter the question text..."
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <div className="mt-2 text-right text-xs text-slate-400">
                    {formData.questionText.length}{" "}
                    characters
                  </div>
                </div>
              </section>

              {isOptionQuestion && (
                <>
                  <div className="border-t border-slate-200" />

                  <section>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <ListChecks size={20} />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Answer Options
                          </h2>
                          <p className="text-sm text-slate-500">
                            Provide the available options and
                            select the correct answer.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addOption}
                        className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.options.map(
                        (option, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                              {String.fromCharCode(
                                65 + index,
                              )}
                            </div>

                            <input
                              type="text"
                              value={option}
                              onChange={(event) =>
                                handleOptionChange(
                                  index,
                                  event.target.value,
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + index,
                              )}`}
                              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />

                            {formData.options.length >
                              2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(index)
                                }
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-5 max-w-xl">
                      <SelectField
                        label="Correct Answer"
                        name="correctAnswer"
                        value={
                          formData.correctAnswer
                        }
                        onChange={handleChange}
                        required
                        icon={
                          <CheckCircle2 size={17} />
                        }
                      >
                        <option value="">
                          Select correct answer
                        </option>

                        {formData.options
                          .filter(
                            (option) =>
                              option.trim(),
                          )
                          .map(
                            (option, index) => (
                              <option
                                key={`${index}-${option}`}
                                value={option}
                              >
                                {String.fromCharCode(
                                  65 + index,
                                )}{" "}
                                - {option}
                              </option>
                            ),
                          )}
                      </SelectField>
                    </div>
                  </section>
                </>
              )}

              <div className="border-t border-slate-200" />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={creating}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />

                  {creating
                    ? "Creating Question..."
                    : "Create Question"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
  icon,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        <span className="flex items-center gap-2">
          {icon && (
            <span className="text-indigo-500">
              {icon}
            </span>
          )}

          {label}

          {required && (
            <span className="text-red-500">*</span>
          )}
        </span>
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {children}
      </select>
    </div>
  );
};

const NumberField = ({
  label,
  name,
  value,
  onChange,
  required,
  min,
  step,
  placeholder,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
};

export default CreateQuestionScreen;