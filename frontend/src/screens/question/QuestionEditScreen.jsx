import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Layers3,
  ListTree,
  Loader2,
  Save,
  Settings2,
  Tag,
  FolderTree,
  Plus,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetQuestionDetailsQuery,
  useUpdateQuestionMutation,
} from "../../slices/questionApiSlice";

import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetChaptersQuery } from "../../slices/chapterApiSlice";
import { useGetTopicsQuery } from "../../slices/topicApiSlice";
import { useGetAnswerEditorConfigurationsQuery } from "../../slices/answerEditorConfigurationApiSlice";
import { useGetQuestionGroupsQuery } from "../../slices/questionGroupApiSlice";

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.subjects)) return data.subjects;
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (Array.isArray(data?.topics)) return data.topics;
  if (Array.isArray(data?.configurations)) return data.configurations;
  if (Array.isArray(data?.questionGroups)) return data.questionGroups;
  return [];
};

const getName = (item) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  return (
    item.name ||
    item.title ||
    item.chapterName ||
    item.topicName ||
    item.questionGroupName ||
    item.code ||
    ""
  );
};

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  return item._id || "";
};

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const InputField = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      {Icon && <Icon size={16} className="text-emerald-600" />}
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      step={step}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    />
  </div>
);

const SelectField = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      {Icon && <Icon size={16} className="text-emerald-600" />}
      {label}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    >
      <option value="">{placeholder}</option>

      {options.map((item) => (
        <option key={item._id} value={item._id}>
          {getName(item)}
        </option>
      ))}
    </select>
  </div>
);

const QuestionEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: question,
    isLoading: questionLoading,
    isError: questionError,
  } = useGetQuestionDetailsQuery(id);

  const [updateQuestion, { isLoading: updating }] =
    useUpdateQuestionMutation();

  const [formData, setFormData] = useState({
    class: "",
    subject: "",
    chapter: "",
    topic: "",
    questionType: "",
    marks: "",
    questionText: "",
    answerEditorConfiguration: "",
    options: [],
    correctAnswer: "",
    difficulty: "MEDIUM",
    negativeMarks: "0",
    questionGroup: "",
  });

  const [newOption, setNewOption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetSubjectsQuery({ isActive: true });

  const { data: chaptersData, isLoading: chaptersLoading } =
    useGetChaptersQuery(
      {
        subject: formData.subject,
        isActive: true,
      },
      {
        skip: !formData.subject,
      }
    );

  const { data: topicsData, isLoading: topicsLoading } =
    useGetTopicsQuery(
      {
        chapter: formData.chapter,
        subject: formData.subject,
        isActive: true,
      },
      {
        skip: !formData.chapter,
      }
    );

  const {
    data: configurationsData,
    isLoading: configurationsLoading,
  } = useGetAnswerEditorConfigurationsQuery(
    {
      subject: formData.subject,
      isActive: true,
    },
    {
      skip: !formData.subject,
    }
  );

  const { data: questionGroupsData, isLoading: questionGroupsLoading } =
    useGetQuestionGroupsQuery(
      {
        subject: formData.subject,
        isActive: true,
      },
      {
        skip: !formData.subject,
      }
    );

  const subjects = getList(subjectsData);
  const chapters = getList(chaptersData);
  const topics = getList(topicsData);
  const configurations = getList(configurationsData);
  const questionGroups = getList(questionGroupsData);

  useEffect(() => {
    if (!question) return;

    setFormData({
      class: getId(question.class),
      subject: getId(question.subject),
      chapter: getId(question.chapter),
      topic: getId(question.topic),
      questionType: question.questionType || "",
      marks:
        question.marks !== undefined && question.marks !== null
          ? String(question.marks)
          : "",
      questionText: question.questionText || "",
      answerEditorConfiguration: getId(
        question.answerEditorConfiguration
      ),
      options: Array.isArray(question.options)
        ? question.options
        : [],
      correctAnswer:
        question.correctAnswer !== null &&
        question.correctAnswer !== undefined
          ? typeof question.correctAnswer === "object"
            ? JSON.stringify(question.correctAnswer)
            : String(question.correctAnswer)
          : "",
      difficulty: question.difficulty || "MEDIUM",
      negativeMarks:
        question.negativeMarks !== undefined &&
        question.negativeMarks !== null
          ? String(question.negativeMarks)
          : "0",
      questionGroup: getId(question.questionGroup),
    });
  }, [question]);

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubjectChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      subject: value,
      chapter: "",
      topic: "",
      answerEditorConfiguration: "",
      questionGroup: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleChapterChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      chapter: value,
      topic: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleAddOption = () => {
    const value = newOption.trim();

    if (!value) return;

    setFormData((previous) => ({
      ...previous,
      options: [...previous.options, value],
    }));

    setNewOption("");
  };

  const handleRemoveOption = (index) => {
    setFormData((previous) => {
      const options = previous.options.filter(
        (_, optionIndex) => optionIndex !== index
      );

      return {
        ...previous,
        options,
      };
    });
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.questionType) {
      setError("Please select a question type.");
      return;
    }

    if (!formData.marks && formData.marks !== "0") {
      setError("Please enter marks.");
      return;
    }

    if (!formData.questionText.trim()) {
      setError("Question text cannot be empty.");
      return;
    }

    if (!formData.answerEditorConfiguration) {
      setError("Please select an answer editor configuration.");
      return;
    }

    if (
      (formData.questionType === "MCQ" ||
        formData.questionType === "ASSERTION_REASON") &&
      formData.options.length < 2
    ) {
      setError("At least two options are required.");
      return;
    }

    try {
      const payload = {
        class: formData.class,
        subject: formData.subject,
        chapter: formData.chapter || undefined,
        topic: formData.topic || undefined,
        questionType: formData.questionType,
        marks: Number(formData.marks),
        questionText: formData.questionText.trim(),
        answerEditorConfiguration:
          formData.answerEditorConfiguration,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        difficulty: formData.difficulty,
        negativeMarks: Number(formData.negativeMarks || 0),
        questionGroup: formData.questionGroup || undefined,
      };

      await updateQuestion({
        id,
        data: payload,
      }).unwrap();

      setSuccess("Question updated successfully.");

      setTimeout(() => {
        navigate(`/questions/${id}`);
      }, 700);
    } catch (updateError) {
      setError(
        updateError?.data?.message ||
          updateError?.error ||
          "Unable to update question."
      );
    }
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              size={42}
              className="animate-spin text-emerald-600"
            />
            <p className="text-sm font-medium text-slate-500">
              Loading question...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (questionError || !question) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto flex min-h-[500px] max-w-4xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <FileQuestion size={28} />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Question not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The requested question could not be loaded.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <ArrowLeft size={17} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showOptions =
    formData.questionType === "MCQ" ||
    formData.questionType === "ASSERTION_REASON";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ArrowLeft size={20} />
                </button>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-emerald-100">
                    <FileQuestion size={19} />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      Question Bank
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Edit Question
                  </h1>

                  <p className="mt-2 text-sm text-emerald-50 sm:text-base">
                    Update question content, academic classification and
                    answer configuration.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur">
                  {formatLabel(question.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <span className="mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Academic Classification
                  </h2>
                  <p className="text-sm text-slate-500">
                    Select the subject, chapter and topic.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="Subject"
                icon={BookOpen}
                value={formData.subject}
                onChange={handleSubjectChange}
                options={subjects}
                placeholder={
                  subjectsLoading
                    ? "Loading subjects..."
                    : "Select Subject"
                }
              />

              <SelectField
                label="Chapter"
                icon={Layers3}
                value={formData.chapter}
                onChange={handleChapterChange}
                options={chapters}
                disabled={!formData.subject}
                placeholder={
                  !formData.subject
                    ? "Select subject first"
                    : chaptersLoading
                    ? "Loading chapters..."
                    : "Select Chapter"
                }
              />

              <SelectField
                label="Topic"
                icon={ListTree}
                value={formData.topic}
                onChange={(value) =>
                  handleChange("topic", value)
                }
                options={topics}
                disabled={!formData.chapter}
                placeholder={
                  !formData.chapter
                    ? "Select chapter first"
                    : topicsLoading
                    ? "Loading topics..."
                    : "Select Topic"
                }
              />

              <InputField
                label="Class"
                icon={BookOpen}
                value={formData.class}
                onChange={(value) =>
                  handleChange("class", value)
                }
                placeholder="Class ID"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileQuestion size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Question Content
                  </h2>
                  <p className="text-sm text-slate-500">
                    Configure the question and its evaluation settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <SelectField
                  label="Question Type"
                  icon={FileQuestion}
                  value={formData.questionType}
                  onChange={(value) =>
                    handleChange("questionType", value)
                  }
                  options={QUESTION_TYPES.map((type) => ({
                    _id: type,
                    name: formatLabel(type),
                  }))}
                  placeholder="Select Question Type"
                />

                <InputField
                  label="Marks"
                  icon={Tag}
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.marks}
                  onChange={(value) =>
                    handleChange("marks", value)
                  }
                  placeholder="Enter marks"
                />

                <SelectField
                  label="Difficulty"
                  icon={Tag}
                  value={formData.difficulty}
                  onChange={(value) =>
                    handleChange("difficulty", value)
                  }
                  options={DIFFICULTIES.map((difficulty) => ({
                    _id: difficulty,
                    name: formatLabel(difficulty),
                  }))}
                  placeholder="Select Difficulty"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileQuestion
                    size={16}
                    className="text-emerald-600"
                  />
                  Question Text
                </label>

                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    handleChange(
                      "questionText",
                      e.target.value
                    )
                  }
                  rows={7}
                  placeholder="Enter the question text..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          {showOptions && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <ListTree size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Answer Options
                    </h2>
                    <p className="text-sm text-slate-500">
                      Manage the available options and correct answer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                      {String.fromCharCode(65 + index)}
                    </div>

                    <input
                      type="text"
                      value={
                        typeof option === "object"
                          ? option.text ||
                            option.label ||
                            option.value ||
                            ""
                          : option
                      }
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveOption(index)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) =>
                      setNewOption(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Enter a new option"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Plus size={17} />
                    Add Option
                  </button>
                </div>

                <div className="pt-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Correct Answer
                  </label>

                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      handleChange(
                        "correctAnswer",
                        e.target.value
                      )
                    }
                    placeholder="Enter the correct answer"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Settings2 size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Answer & Group Configuration
                  </h2>
                  <p className="text-sm text-slate-500">
                    Configure how the answer is entered and grouped.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <SelectField
                label="Answer Editor Configuration"
                icon={Settings2}
                value={formData.answerEditorConfiguration}
                onChange={(value) =>
                  handleChange(
                    "answerEditorConfiguration",
                    value
                  )
                }
                options={configurations}
                disabled={!formData.subject}
                placeholder={
                  !formData.subject
                    ? "Select subject first"
                    : configurationsLoading
                    ? "Loading configurations..."
                    : "Select Configuration"
                }
              />

              <SelectField
                label="Question Group"
                icon={FolderTree}
                value={formData.questionGroup}
                onChange={(value) =>
                  handleChange("questionGroup", value)
                }
                options={questionGroups}
                disabled={!formData.subject}
                placeholder={
                  !formData.subject
                    ? "Select subject first"
                    : questionGroupsLoading
                    ? "Loading question groups..."
                    : "Select Question Group"
                }
              />

              <InputField
                label="Negative Marks"
                icon={Tag}
                type="number"
                min="0"
                step="0.25"
                value={formData.negativeMarks}
                onChange={(value) =>
                  handleChange("negativeMarks", value)
                }
                placeholder="Enter negative marks"
              />
            </div>
          </div>

          <div className="sticky bottom-4 z-10">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {updating ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Question
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionEditScreen;