import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Edit3,
  FileQuestion,
  Layers3,
  ListTree,
  RefreshCw,
  Save,
  Settings2,
  Tag,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import '../../css/questionText.css';
import MathText from '../../components/MathText';

import {
  useGetQuestionDetailsQuery,
  useUpdateQuestionStatusMutation,
} from "../../slices/questionApiSlice";

const STATUS_OPTIONS = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
];

const formatLabel = (value) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getName = (value) => {
  if (!value) return "-";

  if (typeof value === "string") return value;

  return (
    value.name ||
    value.title ||
    value.chapterName ||
    value.topicName ||
    value.code ||
    "-"
  );
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value._id || "";
};

const getStatusStyle = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING_APPROVAL":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "ARCHIVED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const DetailItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={15} className="text-emerald-600" />
        {label}
      </div>

      <div className="text-sm font-semibold text-slate-700">
        {value || "-"}
      </div>
    </div>
  );
};

const QuestionDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: question,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetQuestionDetailsQuery(id);

  const [updateQuestionStatus, { isLoading: updatingStatus }] =
    useUpdateQuestionStatusMutation();

  const [selectedStatus, setSelectedStatus] = useState("");

  React.useEffect(() => {
    if (question?.status) {
      setSelectedStatus(question.status);
    }
  }, [question?.status]);

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!question?._id || !selectedStatus) return;

    if (selectedStatus === question.status) {
      return;
    }

    try {
      await updateQuestionStatus({
        id: question._id,
        status: selectedStatus,
      }).unwrap();

      await refetch();
    } catch (error) {
      window.alert(
        error?.data?.message ||
          error?.message ||
          "Unable to update question status."
      );
    }
  };

  const handleEdit = () => {
    navigate(`/questions/${question._id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="text-sm font-medium text-slate-500">
              Loading question...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <CircleAlert size={28} />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Question not found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The requested question could not be loaded.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subject = getName(question.subject);
  const chapter = getName(question.chapter);
  const topic = getName(question.topic);
  const answerConfiguration = getName(
    question.answerEditorConfiguration
  );
  const questionGroup = getName(question.questionGroup);
  const createdBy = getName(question.createdBy);
  const approvedBy = getName(question.approvedBy);

  const className = getName(question.class);

  const options = Array.isArray(question.options)
    ? question.options
    : [];

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
                      Question Details
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    View Question
                  </h1>

                  <p className="mt-2 text-sm text-emerald-50 sm:text-base">
                    Review the complete question information and manage
                    its status.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                >
                  <Edit3 size={17} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={refetch}
                  disabled={isFetching}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={isFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FileQuestion size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Question
                    </h2>
                    <p className="text-sm text-slate-500">
                      Question content and answer information
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Text
                  </div>

                  <div className="whitespace-pre-wrap text-base font-medium leading-7 text-slate-800">
                    <MathText text={question.questionText} />
                  </div>
                </div>

                {options.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 text-sm font-bold text-slate-700">
                      Options
                    </div>

                    <div className="space-y-3">
                      {options.map((option, index) => {
                        const optionText =
                          typeof option === "object"
                            ? option.text ||
                              option.label ||
                              option.value ||
                              JSON.stringify(option)
                            : option;

                        const optionValue =
                          typeof option === "object"
                            ? option.value ||
                              option.id ||
                              option.key ||
                              option.text
                            : option;

                        const correct =
                          question.correctAnswer ===
                            optionValue ||
                          question.correctAnswer ===
                            optionText;

                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-3 rounded-xl border p-4 ${
                              correct
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                correct
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>

                            <div className="flex-1 pt-1 text-sm font-medium text-slate-700">
                              {optionText}
                            </div>

                            {correct && (
                              <CheckCircle2
                                size={19}
                                className="mt-1 shrink-0 text-emerald-600"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {question.correctAnswer !== null &&
                  question.correctAnswer !== undefined && (
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Correct Answer
                      </div>

                      <div className="text-sm font-semibold text-emerald-800">
                        {typeof question.correctAnswer === "object"
                          ? JSON.stringify(
                              question.correctAnswer
                            )
                          : String(question.correctAnswer)}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Academic Information
                    </h2>
                    <p className="text-sm text-slate-500">
                      Classification of this question
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                <DetailItem
                  icon={BookOpen}
                  label="Class"
                  value={className}
                />

                <DetailItem
                  icon={BookOpen}
                  label="Subject"
                  value={subject}
                />

                <DetailItem
                  icon={Layers3}
                  label="Chapter"
                  value={chapter}
                />

                <DetailItem
                  icon={ListTree}
                  label="Topic"
                  value={topic}
                />

                <DetailItem
                  icon={Tag}
                  label="Question Type"
                  value={formatLabel(question.questionType)}
                />

                <DetailItem
                  icon={Tag}
                  label="Marks"
                  value={question.marks}
                />

                <DetailItem
                  icon={Tag}
                  label="Negative Marks"
                  value={question.negativeMarks}
                />

                <DetailItem
                  icon={Settings2}
                  label="Answer Configuration"
                  value={answerConfiguration}
                />

                <DetailItem
                  icon={Layers3}
                  label="Question Group"
                  value={questionGroup}
                />

                <DetailItem
                  icon={Tag}
                  label="Difficulty"
                  value={formatLabel(question.difficulty)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Settings2 size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Update Status
                    </h2>
                    <p className="text-sm text-slate-500">
                      Change the current question status
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Status
                  </span>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
                        question.status
                      )}`}
                    >
                      {formatLabel(question.status)}
                    </span>
                  </div>
                </div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={
                    updatingStatus ||
                    !selectedStatus ||
                    selectedStatus === question.status
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {updatingStatus ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-800">
                  Question Metadata
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Created By
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <User size={16} className="text-emerald-600" />
                    {createdBy}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Approved By
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <User size={16} className="text-emerald-600" />
                    {approvedBy}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Question ID
                  </div>

                  <div className="break-all text-xs font-medium text-slate-500">
                    {question._id}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active
                  </div>

                  <div
                    className={`text-sm font-semibold ${
                      question.isActive
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {question.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {question.createdAt && (
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Created At
                    </div>

                    <div className="text-sm font-medium text-slate-700">
                      {new Date(
                        question.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                {question.updatedAt && (
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Updated At
                    </div>

                    <div className="text-sm font-medium text-slate-700">
                      {new Date(
                        question.updatedAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Back to Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailsScreen;