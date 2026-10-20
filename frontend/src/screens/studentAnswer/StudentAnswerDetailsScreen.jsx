import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Pencil,
  Table2,
  XCircle,
} from "lucide-react";
import {
  useGetAnswerByAssessmentQuestionQuery,
  useGetStudentAnswerDetailsQuery,
} from "../../slices/studentAnswerApiSlice";

const StudentAnswerDetailsScreen = () => {
  const navigate = useNavigate();
  const {
    attemptId,
    assessmentQuestionId,
    id,
  } = useParams();

  const useQuestionLookup =
    Boolean(attemptId && assessmentQuestionId);

  const {
    data: questionAnswer,
    isLoading: questionLoading,
    isError: questionError,
    error: questionErrorData,
    refetch: refetchQuestionAnswer,
  } = useGetAnswerByAssessmentQuestionQuery(
    {
      attemptId,
      assessmentQuestionId,
    },
    {
      skip: !useQuestionLookup,
    },
  );

  const {
    data: answerDetails,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsErrorData,
    refetch: refetchAnswerDetails,
  } = useGetStudentAnswerDetailsQuery(id, {
    skip: useQuestionLookup || !id,
  });

  const answer = useQuestionLookup
    ? questionAnswer
    : answerDetails;

  const isLoading = useQuestionLookup
    ? questionLoading
    : detailsLoading;

  const isError = useQuestionLookup
    ? questionError
    : detailsError;

  const error = useQuestionLookup
    ? questionErrorData
    : detailsErrorData;

  const refetch = useQuestionLookup
    ? refetchQuestionAnswer
    : refetchAnswerDetails;

  const answerMode = answer?.answerMode || "TEXT";

  const question = useMemo(() => {
    return (
      answer?.assessmentQuestion?.question ||
      answer?.question ||
      answer?.assessmentQuestion ||
      null
    );
  }, [answer]);

  const questionText =
    question?.questionText ||
    question?.text ||
    answer?.questionText ||
    "Question";

  const questionNumber =
    answer?.assessmentQuestion?.order ||
    answer?.assessmentQuestion?.questionOrder ||
    answer?.order ||
    null;

  const marks =
    answer?.assessmentQuestion?.marks ??
    question?.marks ??
    answer?.marks ??
    0;

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

    return labels[mode] || mode;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return {
          className:
            "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle2,
          label: "Submitted",
        };

      case "SAVED":
        return {
          className:
            "bg-blue-100 text-blue-700 border-blue-200",
          icon: CheckCircle2,
          label: "Saved",
        };

      case "IN_PROGRESS":
        return {
          className:
            "bg-amber-100 text-amber-700 border-amber-200",
          icon: Pencil,
          label: "In Progress",
        };

      default:
        return {
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
          icon: XCircle,
          label: "Not Started",
        };
    }
  };

  const statusInfo = getStatusStyle(answer?.status);
  const StatusIcon = statusInfo.icon;

  const renderHtml = (value) => {
    if (!value) {
      return (
        <span className="text-sm italic text-gray-400">
          No answer provided
        </span>
      );
    }

    return (
      <div
        className="prose prose-sm max-w-none break-words text-gray-700"
        dangerouslySetInnerHTML={{
          __html: value,
        }}
      />
    );
  };

  const renderText = (value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return (
        <span className="text-sm italic text-gray-400">
          No answer provided
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words text-gray-700">
        {String(value)}
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
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
        <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-900 px-4 py-2">
          <Code2 className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-gray-300">
            {value.language || "Code"}
          </span>
        </div>

        <pre className="overflow-x-auto p-5 text-sm leading-6 text-gray-200">
          {value.code}
        </pre>
      </div>
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
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full border-collapse">
          <tbody>
            {value.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-r border-gray-200 px-4 py-3 text-sm text-gray-700 last:border-r-0"
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

  const getImageUrl = (answerData) => {
    if (!answerData) {
      return null;
    }

    if (answerData.url) {
      return answerData.url;
    }

    if (answerData.previewUrl) {
      return answerData.previewUrl;
    }

    if (answerData.dataUrl) {
      return answerData.dataUrl;
    }

    return null;
  };

  const renderImage = (item) => {
    const attachment = item?.attachments?.find(
      (attachmentItem) =>
        attachmentItem?.type === "image" ||
        attachmentItem?.mimeType?.startsWith("image/"),
    );

    const imageUrl =
      getImageUrl(item?.answer) ||
      getImageUrl(attachment);

    if (!imageUrl) {
      return (
        <div className="flex items-center gap-2 text-sm italic text-gray-400">
          <ImageIcon className="h-5 w-5" />
          No image available
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
        <img
          src={imageUrl}
          alt="Student answer"
          className="max-h-[600px] max-w-full rounded-lg object-contain"
        />
      </div>
    );
  };

  const renderDrawing = (item) => {
    const drawingAttachment =
      item?.attachments?.find(
        (attachmentItem) =>
          attachmentItem?.type === "drawing",
      );

    const drawingUrl =
      item?.answer?.dataUrl ||
      item?.answer?.url ||
      drawingAttachment?.dataUrl ||
      drawingAttachment?.url;

    if (!drawingUrl) {
      return (
        <span className="text-sm italic text-gray-400">
          No drawing provided
        </span>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
        <img
          src={drawingUrl}
          alt="Student drawing"
          className="max-h-[600px] max-w-full rounded-lg object-contain"
        />
      </div>
    );
  };

  const renderMcq = () => {
    const options =
      question?.options ||
      question?.mcqOptions ||
      [];

    const selected =
      answer?.selectedOption ||
      answer?.answer;

    if (!options.length) {
      return (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-sm font-semibold text-blue-700">
            Selected Option
          </span>

          <p className="mt-2 text-lg font-bold text-gray-800">
            {selected || "No option selected"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionValue =
            typeof option === "string"
              ? option
              : option?.value ??
                option?.text ??
                option?.label ??
                "";

          const optionLabel =
            typeof option === "string"
              ? String.fromCharCode(65 + index)
              : option?.label ||
                String.fromCharCode(65 + index);

          const isSelected =
            String(selected) ===
              String(optionValue) ||
            String(selected) ===
              String(optionLabel);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                isSelected
                  ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {optionLabel}
              </div>

              <div className="flex-1 pt-1">
                <span className="text-sm text-gray-700">
                  {optionValue}
                </span>
              </div>

              {isSelected && (
                <CheckCircle2 className="mt-1 h-5 w-5 text-blue-600" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

    const renderCombinedSection = (mode, section) => {
    const value = section?.answer ?? section;

    let content;

    switch (mode) {
      case "TABLE":
      case "MATH_TABLE":
        content = renderTable(value);
        break;

      case "CODE":
        content = renderCode(value);
        break;

      case "IMAGE":
        content = renderImage({
          answer: value,
          attachments: section?.attachments || [],
        });
        break;

      case "DRAWING":
        content = renderDrawing({
          answer: value,
          attachments: section?.attachments || [],
        });
        break;

      case "RICH_TEXT":
        content = renderHtml(value);
        break;

      case "RICH_TEXT_IMAGE":
        content = (
          <div className="space-y-4">
            {typeof value === "string"
              ? renderHtml(value)
              : renderHtml(
                  value?.text || value?.content,
                )}

            {renderImage({
              answer: value,
              attachments: section?.attachments || [],
            })}
          </div>
        );
        break;

      case "MCQ":
        content = renderText(value);
        break;

      default:
        content = renderText(value);
        break;
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {getModeLabel(mode)}
          </span>
        </div>

        {content}
      </div>
    );
  };

  const renderCombined = () => {
    const sections = answer?.answer?.sections;

    if (!sections) {
      return (
        <span className="text-sm italic text-gray-400">
          No combined answer provided
        </span>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(sections).map(
          ([mode, section]) => (
            <div key={mode}>
              {renderCombinedSection(
                mode,
                section,
              )}
            </div>
          ),
        )}
      </div>
    );
  };

  const renderAnswer = () => {
    switch (answerMode) {
      case "MCQ":
        return renderMcq();

      case "TEXT":
      case "MATH":
      case "MATH_TEXT":
        return renderText(answer?.answer);

      case "RICH_TEXT":
        return renderHtml(answer?.answer);

      case "TABLE":
      case "MATH_TABLE":
        return renderTable(answer?.answer);

      case "CODE":
        return renderCode(answer?.answer);

      case "IMAGE":
        return renderImage(answer);

      case "DRAWING":
        return renderDrawing(answer);

      case "RICH_TEXT_IMAGE":
        return (
          <div className="space-y-5">
            {typeof answer?.answer === "string"
              ? renderHtml(answer.answer)
              : renderHtml(
                  answer?.answer?.text ||
                    answer?.answer?.content,
                )}

            {renderImage(answer)}
          </div>
        );

      case "COMBINED":
        return renderCombined();

      default:
        return renderText(answer?.answer);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 rounded-lg bg-gray-200" />
              <div className="h-5 w-96 rounded bg-gray-200" />
              <div className="h-40 rounded-2xl bg-gray-200" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                  <FileText className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Answer Details
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Review the submitted answer
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold sm:self-auto ${statusInfo.className}`}
              >
                <StatusIcon className="h-4 w-4" />
                {statusInfo.label}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Question
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {questionNumber || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Pencil className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Answer Mode
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {getModeLabel(answerMode)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Marks
                  </span>
                </div>

                <p className="font-bold text-gray-800">
                  {marks}
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
                  {typeof questionText === "string"
                    ? questionText
                    : JSON.stringify(questionText)}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <div className="flex items-center gap-3">
                  {answerMode === "TABLE" ||
                  answerMode === "MATH_TABLE" ? (
                    <Table2 className="h-5 w-5 text-blue-600" />
                  ) : answerMode === "CODE" ? (
                    <Code2 className="h-5 w-5 text-blue-600" />
                  ) : answerMode === "IMAGE" ||
                    answerMode === "DRAWING" ? (
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600" />
                  )}

                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Student Answer
                  </h2>
                </div>

                {answer?.lastSavedAt && (
                  <span className="text-xs text-gray-400">
                    Last saved{" "}
                    {new Date(
                      answer.lastSavedAt,
                    ).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="p-5 md:p-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 md:p-5">
                  {renderAnswer()}
                </div>
              </div>
            </section>

            {answer?.submittedAt && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Answer submitted
                  </p>

                  <p className="mt-1 text-green-600">
                    {new Date(
                      answer.submittedAt,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>

              {attemptId &&
                assessmentQuestionId && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/assessment/${attemptId}/review`,
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
                  >
                    <FileText className="h-5 w-5" />
                    Back to Review
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
  
};

export default StudentAnswerDetailsScreen;