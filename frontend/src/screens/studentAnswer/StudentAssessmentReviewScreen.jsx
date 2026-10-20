import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Image as ImageIcon,
  Pencil,
  Send,
  Table2,
  XCircle,
} from "lucide-react";
import {
  useGetAnswersByAttemptQuery,
  useSubmitAllStudentAnswersMutation,
} from "../../slices/studentAnswerApiSlice";

const StudentAssessmentReviewScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const {
    data: answers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswersByAttemptQuery(attemptId, {
    skip: !attemptId,
  });

  const [submitAllStudentAnswers, { isLoading: isSubmitting }] =
    useSubmitAllStudentAnswersMutation();

  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => {
      const aOrder =
        a?.assessmentQuestion?.order ??
        a?.assessmentQuestion?.questionOrder ??
        a?.order ??
        0;

      const bOrder =
        b?.assessmentQuestion?.order ??
        b?.assessmentQuestion?.questionOrder ??
        b?.order ??
        0;

      return aOrder - bOrder;
    });
  }, [answers]);

  const answeredCount = useMemo(() => {
    return sortedAnswers.filter(
      (item) =>
        item.status !== "NOT_STARTED" &&
        item.answer !== null &&
        item.answer !== undefined &&
        item.answer !== "",
    ).length;
  }, [sortedAnswers]);

  const unansweredCount = sortedAnswers.length - answeredCount;

  const handleSubmit = async () => {
    try {
      await submitAllStudentAnswers(attemptId).unwrap();
      navigate(`/student/assessment/${attemptId}/result`);
    } catch (err) {
      setShowSubmitDialog(false);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const goToPrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentQuestion((prev) =>
      Math.min(prev + 1, sortedAnswers.length - 1),
    );
  };

  const isAnswered = (item) => {
    if (!item) {
      return false;
    }

    if (
      item.status === "NOT_STARTED" ||
      item.answer === null ||
      item.answer === undefined
    ) {
      return false;
    }

    if (typeof item.answer === "string") {
      return item.answer.trim().length > 0;
    }

    if (typeof item.answer === "object") {
      if (item.answer?.code !== undefined) {
        return item.answer.code.trim().length > 0;
      }

      if (item.answer?.dataUrl) {
        return true;
      }

      if (item.answer?.rows) {
        return item.answer.rows.some((row) =>
          row.some((cell) => String(cell || "").trim()),
        );
      }

      if (item.answer?.sections) {
        return Object.values(item.answer.sections).some((section) => {
          if (!section) {
            return false;
          }

          if (typeof section === "string") {
            return section.trim().length > 0;
          }

          if (section?.answer !== undefined) {
            if (typeof section.answer === "string") {
              return section.answer.trim().length > 0;
            }

            return section.answer !== null;
          }

          return true;
        });
      }

      return Object.keys(item.answer).length > 0;
    }

    return true;
  };

  const getQuestionText = (item) => {
    return (
      item?.assessmentQuestion?.question?.questionText ||
      item?.question?.questionText ||
      item?.assessmentQuestion?.questionText ||
      item?.questionText ||
      "Question"
    );
  };

  const getQuestionNumber = (item, index) => {
    return (
      item?.assessmentQuestion?.order ||
      item?.assessmentQuestion?.questionOrder ||
      item?.order ||
      index + 1
    );
  };

  const getMarks = (item) => {
    return (
      item?.assessmentQuestion?.marks ??
      item?.question?.marks ??
      item?.marks ??
      0
    );
  };

  const getAnswerMode = (item) => {
    return item?.answerMode || "TEXT";
  };

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
      MATH_TABLE: "Math Table",
      COMBINED: "Combined Answer",
    };

    return labels[mode] || mode;
  };

  const renderSimpleValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-sm italic text-gray-400">
          No answer provided
        </span>
      );
    }

    if (typeof value === "string") {
      return (
        <div
          className="whitespace-pre-wrap break-words text-gray-700"
          dangerouslySetInnerHTML={{
            __html: value,
          }}
        />
      );
    }

    return (
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  };

  const renderTable = (value) => {
    if (!value?.rows?.length) {
      return (
        <span className="text-sm italic text-gray-400">
          No table data provided
        </span>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse">
          <tbody>
            {value.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-r px-4 py-3 text-sm text-gray-700 last:border-r-0"
                  >
                    {cell || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCode = (value) => {
    if (!value?.code) {
      return (
        <span className="text-sm italic text-gray-400">
          No code provided
        </span>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-700 px-4 py-2 text-xs font-medium text-gray-300">
          {value.language || "Code"}
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-6 text-gray-200">
          {value.code}
        </pre>
      </div>
    );
  };

  const renderImage = (item) => {
    const attachment = item?.attachments?.find(
      (attachmentItem) =>
        attachmentItem?.type === "image" ||
        attachmentItem?.mimeType?.startsWith("image/"),
    );

    const imageUrl =
      attachment?.url ||
      attachment?.previewUrl ||
      item?.answer?.url ||
      item?.answer?.previewUrl ||
      item?.answer?.dataUrl;

    if (!imageUrl) {
      return (
        <div className="flex items-center gap-2 text-sm italic text-gray-400">
          <ImageIcon className="h-4 w-4" />
          No image available
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
        <img
          src={imageUrl}
          alt="Student answer"
          className="max-h-80 max-w-full rounded-lg object-contain"
        />
      </div>
    );
  };

  const renderDrawing = (item) => {
    const dataUrl =
      item?.answer?.dataUrl ||
      item?.attachments?.find(
        (attachmentItem) => attachmentItem?.type === "drawing",
      )?.dataUrl;

    if (!dataUrl) {
      return (
        <span className="text-sm italic text-gray-400">
          No drawing provided
        </span>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <img
          src={dataUrl}
          alt="Student drawing"
          className="max-h-80 max-w-full rounded-lg object-contain"
        />
      </div>
    );
  };

  const renderCombined = (item) => {
    const sections = item?.answer?.sections;

    if (!sections) {
      return (
        <span className="text-sm italic text-gray-400">
          No combined answer provided
        </span>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(sections).map(([mode, section], index) => (
          <div
            key={mode}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {getModeLabel(mode)}
              </span>
            </div>

            {mode === "TABLE" || mode === "MATH_TABLE"
              ? renderTable(section?.answer || section)
              : mode === "CODE"
                ? renderCode(section?.answer || section)
                : mode === "IMAGE"
                  ? renderImage({
                      answer: section?.answer || section,
                      attachments: section?.attachments || [],
                    })
                  : mode === "DRAWING"
                    ? renderDrawing({
                        answer: section?.answer || section,
                        attachments: section?.attachments || [],
                      })
                    : renderSimpleValue(section?.answer ?? section)}
          </div>
        ))}
      </div>
    );
  };

  const renderAnswer = (item) => {
    const mode = getAnswerMode(item);

    switch (mode) {
      case "TABLE":
      case "MATH_TABLE":
        return renderTable(item.answer);

      case "CODE":
        return renderCode(item.answer);

      case "IMAGE":
      case "RICH_TEXT_IMAGE":
        return (
          <div className="space-y-4">
            {item.answer?.text && renderSimpleValue(item.answer.text)}
            {renderImage(item)}
          </div>
        );

      case "DRAWING":
        return renderDrawing(item);

      case "COMBINED":
        return renderCombined(item);

      case "MCQ":
        return (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <span className="text-sm font-medium text-blue-700">
              Selected Option
            </span>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {item.selectedOption || item.answer || "No option selected"}
            </p>
          </div>
        );

      default:
        return renderSimpleValue(item.answer);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/30 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-64 rounded bg-gray-200" />
              <div className="h-4 w-96 rounded bg-gray-200" />
              <div className="h-32 rounded-2xl bg-gray-200" />
              <div className="h-32 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-white/30 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-lg">
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">
              Unable to Load Review
            </h1>
            <p className="mt-2 text-gray-500">
              {error?.data?.message ||
                "We could not load your assessment answers."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentAnswer = sortedAnswers[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/80 shadow-2xl backdrop-blur-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2">
                    <FileCheck2 className="h-7 w-7" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                      Assessment Review
                    </h1>
                    <p className="mt-1 text-sm text-blue-100">
                      Review your answers carefully before final submission.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-100">Questions</div>
                  <div className="text-xl font-bold">
                    {sortedAnswers.length}
                  </div>
                </div>

                <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-100">Answered</div>
                  <div className="text-xl font-bold">{answeredCount}</div>
                </div>

                <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-100">Unanswered</div>
                  <div className="text-xl font-bold">{unansweredCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-gray-200 bg-white/70 p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">
                  Question Navigator
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {answeredCount}/{sortedAnswers.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {sortedAnswers.map((item, index) => {
                  const answered = isAnswered(item);
                  const active = index === currentQuestion;

                  return (
                    <button
                      key={item._id || index}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition ${
                        active
                          ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-100"
                          : answered
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {getQuestionNumber(item, index)}

                      {answered && !active && (
                        <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Answered
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-3 w-3 rounded-full bg-gray-300" />
                  Not answered
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  Current question
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Back to Assessment
              </button>
            </aside>

            <main className="min-w-0 p-5 md:p-8">
              {currentAnswer ? (
                <>
                  <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          Question {getQuestionNumber(currentAnswer, currentQuestion)}
                        </span>

                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          {getModeLabel(getAnswerMode(currentAnswer))}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          {getMarks(currentAnswer)}{" "}
                          {getMarks(currentAnswer) === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isAnswered(currentAnswer) ? (
                        <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Answered
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                          <Clock3 className="h-4 w-4" />
                          Not Answered
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold leading-7 text-gray-800 md:text-xl">
                        {getQuestionText(currentAnswer)}
                      </h2>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <span>Your Answer</span>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 md:p-5">
                        {renderAnswer(currentAnswer)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={goToPrevious}
                      disabled={currentQuestion === 0}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous
                    </button>

                    <span className="text-center text-sm font-medium text-gray-500">
                      {currentQuestion + 1} of {sortedAnswers.length}
                    </span>

                    <button
                      type="button"
                      onClick={goToNext}
                      disabled={
                        currentQuestion === sortedAnswers.length - 1
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                  <FileCheck2 className="mx-auto h-12 w-12 text-gray-300" />
                  <h2 className="mt-4 text-xl font-bold text-gray-800">
                    No Questions Found
                  </h2>
                  <p className="mt-2 text-gray-500">
                    There are no answers available for this assessment attempt.
                  </p>
                </div>
              )}
            </main>
          </div>

          <div className="border-t border-gray-200 bg-white/80 p-5 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  Ready to submit?
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Once submitted, you may not be able to change your answers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting || sortedAnswers.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-bold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Send className="h-7 w-7 text-amber-600" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                Submit Assessment?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                You have answered {answeredCount} out of{" "}
                {sortedAnswers.length} questions.
                {unansweredCount > 0 &&
                  ` ${unansweredCount} question${
                    unansweredCount > 1 ? "s are" : " is"
                  } unanswered.`}
              </p>

              <p className="mt-3 text-sm font-medium text-gray-700">
                Are you sure you want to submit your assessment?
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitDialog(false)}
                disabled={isSubmitting}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Review Again
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssessmentReviewScreen;