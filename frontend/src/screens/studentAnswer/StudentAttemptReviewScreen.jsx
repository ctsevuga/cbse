import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Image as ImageIcon,
  ListChecks,
  XCircle,
} from "lucide-react";
import { useGetAnswersByAttemptQuery } from "../../slices/studentAnswerApiSlice";

const StudentAttemptReviewScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: answers = [],
    isLoading,
    isError,
    error,
  } = useGetAnswersByAttemptQuery(attemptId, {
    skip: !attemptId,
  });

  const currentAnswer = answers[currentIndex];

  const statistics = useMemo(() => {
    const answered = answers.filter(
      (item) =>
        item.status === "SAVED" ||
        item.status === "SUBMITTED" ||
        item.status === "IN_PROGRESS",
    ).length;

    const submitted = answers.filter(
      (item) => item.status === "SUBMITTED",
    ).length;

    const unanswered = answers.length - answered;

    return {
      total: answers.length,
      answered,
      unanswered,
      submitted,
    };
  }, [answers]);

  const getQuestionText = (answer) => {
    if (!answer?.question) return "Question";

    return (
      answer.question.questionText ||
      answer.question.text ||
      answer.question.question ||
      answer.assessmentQuestion?.questionText ||
      "Question"
    );
  };

  const getQuestionNumber = (answer, index) => {
    return (
      answer?.assessmentQuestion?.questionNumber ||
      answer?.assessmentQuestion?.order ||
      answer?.questionNumber ||
      index + 1
    );
  };

  const getAnswerDisplay = (item) => {
    if (!item) return null;

    if (
      item.answerMode === "MCQ" &&
      item.selectedOption
    ) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Selected Option
          </p>
          <p className="text-base font-semibold text-emerald-900">
            {item.selectedOption}
          </p>
        </div>
      );
    }

    if (item.answer === null || item.answer === undefined) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          No answer provided
        </div>
      );
    }

    if (typeof item.answer === "string") {
      if (!item.answer.trim()) {
        return (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            No answer provided
          </div>
        );
      }

      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {item.answer}
          </p>
        </div>
      );
    }

    if (
      item.answerMode === "IMAGE" ||
      item.answerMode === "DRAWING"
    ) {
      const dataUrl =
        item.answer?.dataUrl ||
        item.answer?.url ||
        item.answer?.imageUrl;

      if (dataUrl) {
        return (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
            <img
              src={dataUrl}
              alt="Student answer"
              className="max-h-[500px] w-full object-contain"
            />
          </div>
        );
      }
    }

    if (item.answerMode === "TABLE") {
      const rows = item.answer?.rows || [];

      if (!rows.length) {
        return (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            No table data provided
          </div>
        );
      }

      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-r border-slate-200 px-4 py-3 text-sm text-slate-700 last:border-r-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (item.answerMode === "CODE") {
      return (
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm leading-6 text-slate-100">
          <code>
            {item.answer?.code ||
              item.answer?.value ||
              ""}
          </code>
        </pre>
      );
    }

    if (item.answerMode === "MATH_TABLE") {
      const rows = item.answer?.rows || [];

      if (rows.length) {
        return (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-r border-slate-200 px-4 py-3 text-sm text-slate-700 last:border-r-0"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    if (
      item.answerMode === "COMBINED" &&
      item.answer?.sections
    ) {
      return (
        <div className="space-y-4">
          {Object.entries(item.answer.sections).map(
            ([mode, value]) => (
              <div
                key={mode}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
                  {mode.replaceAll("_", " ")}
                </p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700">
                  {typeof value === "string"
                    ? value
                    : JSON.stringify(
                        value,
                        null,
                        2,
                      )}
                </pre>
              </div>
            ),
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {typeof item.answer === "string"
            ? item.answer
            : JSON.stringify(
                item.answer,
                null,
                2,
              )}
        </pre>
      </div>
    );
  };

  const getStatus = (answer) => {
    if (!answer) {
      return {
        label: "Not Answered",
        className:
          "bg-slate-100 text-slate-600",
        icon: CircleAlert,
      };
    }

    if (answer.status === "SUBMITTED") {
      return {
        label: "Submitted",
        className:
          "bg-emerald-100 text-emerald-700",
        icon: CheckCircle2,
      };
    }

    if (
      answer.status === "SAVED" ||
      answer.status === "IN_PROGRESS"
    ) {
      return {
        label: "Answered",
        className:
          "bg-blue-100 text-blue-700",
        icon: CheckCircle2,
      };
    }

    return {
      label: "Not Answered",
      className:
        "bg-amber-100 text-amber-700",
      icon: CircleAlert,
    };
  };

  const goPrevious = () => {
    setCurrentIndex((value) =>
      Math.max(0, value - 1),
    );
  };

  const goNext = () => {
    setCurrentIndex((value) =>
      Math.min(answers.length - 1, value + 1),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="text-sm font-medium text-slate-600">
              Loading your attempt...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load attempt
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error?.data?.message ||
              "Something went wrong while loading your answers."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!answers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <ClipboardCheck className="h-7 w-7 text-indigo-600" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            No answers found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are no answers available for this
            attempt.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = getStatus(currentAnswer);
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl">
                  Attempt Review
                </h1>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Review your submitted answers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Dashboard
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <ListChecks className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Questions
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {statistics.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Answered
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {statistics.answered}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <CircleAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Unanswered
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {statistics.unanswered}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Submitted
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {statistics.submitted}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Questions
                </h2>
                <p className="text-xs text-slate-500">
                  Select to review
                </p>
              </div>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                {currentIndex + 1}/{answers.length}
              </span>
            </div>

            <div className="grid max-h-[calc(100vh-220px)] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 lg:grid-cols-4">
              {answers.map((item, index) => {
                const itemStatus = getStatus(item);
                const answered =
                  item.status === "SAVED" ||
                  item.status === "SUBMITTED" ||
                  item.status === "IN_PROGRESS";

                return (
                  <button
                    key={item._id || index}
                    type="button"
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                    className={`relative flex h-11 items-center justify-center rounded-xl border text-sm font-bold transition ${
                      currentIndex === index
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : answered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    {getQuestionNumber(item, index)}

                    {answered && (
                      <span className="absolute -right-1 -top-1">
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            currentIndex === index
                              ? "fill-indigo-600 text-white"
                              : "fill-emerald-50 text-emerald-500"
                          }`}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-3 w-3 rounded-full bg-indigo-600" />
                Current
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                Answered
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                Not answered
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white">
                      Q{getQuestionNumber(
                        currentAnswer,
                        currentIndex,
                      )}
                    </span>

                    {currentAnswer?.answerMode && (
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {currentAnswer.answerMode.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {status.label}
                  </div>
                </div>

                <h2 className="text-base font-semibold leading-7 text-slate-800 sm:text-lg">
                  {getQuestionText(currentAnswer)}
                </h2>

                {currentAnswer?.question?.marks && (
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Marks:{" "}
                    {currentAnswer.question.marks}
                  </p>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    {currentAnswer?.answerMode ===
                    "IMAGE" ? (
                      <ImageIcon className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Your Answer
                  </h3>
                </div>

                {getAnswerDisplay(
                  currentAnswer,
                )}

                {currentAnswer?.attachments?.length >
                  0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Attachments
                    </p>

                    <div className="space-y-2">
                      {currentAnswer.attachments.map(
                        (attachment, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
                          >
                            {attachment?.name ||
                              attachment?.fileName ||
                              `Attachment ${index + 1}`}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Previous
                  </span>
                </button>

                <span className="text-xs font-semibold text-slate-400">
                  {currentIndex + 1} of{" "}
                  {answers.length}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    currentIndex ===
                    answers.length - 1
                  }
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">
                    Next
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentAttemptReviewScreen;