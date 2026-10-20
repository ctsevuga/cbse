import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FileText,
  Save,
  XCircle,
} from "lucide-react";
import {
  useGetStudentAnswerDetailsQuery,
  useUpdateStudentAnswerMutation,
} from "../../slices/studentAnswerApiSlice";

import MCQAnswerEditor from "./StudentAnswerEditor/MCQAnswerEditor";
import TextAnswerEditor from "./StudentAnswerEditor/TextAnswerEditor";
import RichTextAnswerEditor from "./StudentAnswerEditor/RichTextAnswerEditor";
import MathAnswerEditor from "./StudentAnswerEditor/MathAnswerEditor";
import MathTextAnswerEditor from "./StudentAnswerEditor/MathTextAnswerEditor";
import TableAnswerEditor from "./StudentAnswerEditor/TableAnswerEditor";
import MathTableAnswerEditor from "./StudentAnswerEditor/MathTableAnswerEditor";
import CodeAnswerEditor from "./StudentAnswerEditor/CodeAnswerEditor";
import ImageAnswerEditor from "./StudentAnswerEditor/ImageAnswerEditor";
import DrawingAnswerEditor from "./StudentAnswerEditor/DrawingAnswerEditor";
import CombinedAnswerEditor from "./StudentAnswerEditor/CombinedAnswerEditor";

const StudentAnswerEvaluationScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: answerData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStudentAnswerDetailsQuery(id, {
    skip: !id,
  });

  const [
    updateStudentAnswer,
    {
      isLoading: isUpdating,
    },
  ] = useUpdateStudentAnswerMutation();

  const [answerState, setAnswerState] =
    useState({
      answer: null,
      selectedOption: null,
      attachments: [],
    });

  const answer = answerData;

  const question =
    answer?.assessmentQuestion?.question ||
    answer?.question ||
    null;

  const isSubmitted =
    answer?.status === "SUBMITTED";

  const isEditable =
    !isSubmitted && !!answer;

  useEffect(() => {
    if (!answer) {
      return;
    }

    setAnswerState({
      answer:
        answer.answer !== undefined
          ? answer.answer
          : null,
      selectedOption:
        answer.selectedOption ?? null,
      attachments:
        answer.attachments || [],
    });
  }, [answer]);

  const getModeLabel = (mode) => {
    const labels = {
      MCQ: "Multiple Choice",
      TEXT: "Text Answer",
      RICH_TEXT: "Rich Text",
      MATH: "Mathematics",
      TABLE: "Table",
      CODE: "Code",
      IMAGE: "Image",
      DRAWING: "Drawing",
      MATH_TEXT: "Math + Text",
      RICH_TEXT_IMAGE: "Rich Text + Image",
      MATH_TABLE: "Mathematical Table",
      COMBINED: "Combined Answer",
    };

    return labels[mode] || mode || "Answer";
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: "Submitted",
          className:
            "border-green-200 bg-green-50 text-green-700",
        };

      case "SAVED":
        return {
          label: "Saved",
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };

      case "IN_PROGRESS":
        return {
          label: "In Progress",
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };

      default:
        return {
          label: "Not Started",
          className:
            "border-gray-200 bg-gray-50 text-gray-600",
        };
    }
  };

  const getQuestionText = () => {
    return (
      question?.questionText ||
      question?.text ||
      question?.content ||
      "Question"
    );
  };

  const getQuestionNumber = () => {
    return (
      answer?.assessmentQuestion?.order ||
      answer?.assessmentQuestion?.questionOrder ||
      answer?.order ||
      "—"
    );
  };

  const getMarks = () => {
    return (
      answer?.assessmentQuestion?.marks ??
      question?.marks ??
      answer?.marks ??
      0
    );
  };

  const handleAnswerChange = (value) => {
    setAnswerState({
      answer:
        value?.answer !== undefined
          ? value.answer
          : null,
      selectedOption:
        value?.selectedOption ?? null,
      attachments:
        value?.attachments || [],
    });
  };

  const renderEditor = () => {
    if (!answer || !question) {
      return null;
    }

    const editorProps = {
      question,
      answer: answerState,
      onChange: handleAnswerChange,
      disabled:
        !isEditable || isUpdating,
    };

    switch (answer.answerMode) {
      case "MCQ":
        return (
          <MCQAnswerEditor
            {...editorProps}
          />
        );

      case "TEXT":
        return (
          <TextAnswerEditor
            {...editorProps}
          />
        );

      case "RICH_TEXT":
        return (
          <RichTextAnswerEditor
            {...editorProps}
          />
        );

      case "MATH":
        return (
          <MathAnswerEditor
            {...editorProps}
          />
        );

      case "MATH_TEXT":
        return (
          <MathTextAnswerEditor
            {...editorProps}
          />
        );

      case "TABLE":
        return (
          <TableAnswerEditor
            {...editorProps}
          />
        );

      case "MATH_TABLE":
        return (
          <MathTableAnswerEditor
            {...editorProps}
          />
        );

      case "CODE":
        return (
          <CodeAnswerEditor
            {...editorProps}
          />
        );

      case "IMAGE":
        return (
          <ImageAnswerEditor
            {...editorProps}
          />
        );

      case "DRAWING":
        return (
          <DrawingAnswerEditor
            {...editorProps}
          />
        );

      case "RICH_TEXT_IMAGE":
        return (
          <RichTextAnswerEditor
            {...editorProps}
          />
        );

      case "COMBINED":
        return (
          <CombinedAnswerEditor
            {...editorProps}
          />
        );

      default:
        return (
          <TextAnswerEditor
            {...editorProps}
          />
        );
    }
  };

  const handleSave = async () => {
    if (!answer?._id || !isEditable) {
      return;
    }

    try {
      await updateStudentAnswer({
        id: answer._id,
        data: {
          answerMode: answer.answerMode,
          answer: answerState.answer,
          selectedOption:
            answerState.selectedOption,
          attachments:
            answerState.attachments,
        },
      }).unwrap();

      await refetch();
    } catch (err) {
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="animate-pulse space-y-6">
              <div className="h-10 w-72 rounded-xl bg-gray-200" />
              <div className="h-5 w-96 rounded bg-gray-200" />
              <div className="h-32 rounded-2xl bg-gray-200" />
              <div className="h-64 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !answer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/40 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-800">
              Answer Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error?.data?.message ||
                "The requested student answer could not be loaded."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={refetch}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(
    answer.status,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-lg">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                  <Edit3 className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Answer Evaluation
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Review and update your answer
                  </p>
                </div>
              </div>

              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusInfo.className}`}
              >
                {statusInfo.label}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <FileText className="h-4 w-4" />

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Question
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {getQuestionNumber()}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Edit3 className="h-4 w-4" />

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Answer Mode
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {getModeLabel(
                    answer.answerMode,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="h-4 w-4" />

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Maximum Marks
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {getMarks()}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 md:px-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Question
                </h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="text-base font-semibold leading-7 text-gray-800 md:text-lg">
                  {typeof getQuestionText() ===
                  "string"
                    ? getQuestionText()
                    : JSON.stringify(
                        getQuestionText(),
                      )}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Your Answer
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {getModeLabel(
                      answer.answerMode,
                    )}
                  </p>
                </div>

                {answer.lastSavedAt && (
                  <span className="text-xs text-gray-400">
                    Last saved{" "}
                    {new Date(
                      answer.lastSavedAt,
                    ).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="p-5 md:p-6">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 md:p-6">
                  {renderEditor()}
                </div>
              </div>
            </section>

            {isSubmitted && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    This answer has been submitted
                  </p>

                  <p className="mt-1 text-green-600">
                    Submitted answers cannot be modified.
                  </p>

                  {answer.submittedAt && (
                    <p className="mt-1 text-xs text-green-600">
                      {new Date(
                        answer.submittedAt,
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isSubmitted && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-5 w-5" />

                  {isUpdating
                    ? "Saving..."
                    : "Save Answer"}
                </button>
              </div>
            )}

            {isSubmitted && (
              <div className="mt-8 flex justify-start">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnswerEvaluationScreen;