import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Edit3,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Pencil,
  Table2,
  XCircle,
} from "lucide-react";
import { useGetStudentAnswersQuery } from "../../slices/studentAnswerApiSlice";
import MathText from '../../components/MathText';
const StudentAnswersScreen = () => {
  console.log("StudentAnswersScreen mounted");
  const navigate = useNavigate();
  const { attemptId, assessmentQuestionId } = useParams();
  const [searchParams] = useSearchParams();

  const queryArgs = useMemo(() => {
    const args = {};

    if (attemptId) {
      args.attemptId = attemptId;
    }

    if (assessmentQuestionId) {
      args.assessmentQuestionId = assessmentQuestionId;
    }

    const studentId = searchParams.get("studentId");

    if (studentId) {
      args.studentId = studentId;
    }

    const status = searchParams.get("status");

    if (status) {
      args.status = status;
    }

    return args;
  }, [
    attemptId,
    assessmentQuestionId,
    searchParams,
  ]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStudentAnswersQuery(queryArgs);

  const answers = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.answers)) {
      return data.answers;
    }

    if (data) {
      return [data];
    }

    return [];
  }, [data]);

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

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return {
          className:
            "border-green-200 bg-green-50 text-green-700",
          icon: CheckCircle2,
          label: "Submitted",
        };

      case "SAVED":
        return {
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: CheckCircle2,
          label: "Saved",
        };

      case "IN_PROGRESS":
        return {
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
          icon: Pencil,
          label: "In Progress",
        };

      default:
        return {
          className:
            "border-gray-200 bg-gray-50 text-gray-600",
          icon: XCircle,
          label: "Not Started",
        };
    }
  };

  const getQuestion = (answer) => {
    return (
      answer?.assessmentQuestion?.question ||
      answer?.question ||
      answer?.assessmentQuestion ||
      null
    );
  };

  const getQuestionText = (answer) => {
    const question = getQuestion(answer);

    return (
      question?.questionText ||
      question?.text ||
      question?.content ||
      answer?.questionText ||
      "Question"
    );
  };

  const getQuestionNumber = (answer, index) => {
    return (
      answer?.assessmentQuestion?.order ||
      answer?.assessmentQuestion?.questionOrder ||
      answer?.order ||
      index + 1
    );
  };

  const getMarks = (answer) => {
    const question = getQuestion(answer);

    return (
      answer?.assessmentQuestion?.marks ??
      question?.marks ??
      answer?.marks ??
      0
    );
  };

  const getImageUrl = (value) => {
    if (!value) {
      return null;
    }

    if (value.url) {
      return value.url;
    }

    if (value.previewUrl) {
      return value.previewUrl;
    }

    if (value.dataUrl) {
      return value.dataUrl;
    }

    return null;
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
      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
        {String(value)}
      </div>
    );
  };

  const renderHtml = (value) => {
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
      <div
        className="prose prose-sm max-w-none break-words text-gray-700"
        dangerouslySetInnerHTML={{
          __html: String(value),
        }}
      />
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
                    {cell === null ||
                    cell === undefined ||
                    cell === ""
                      ? "—"
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderImage = (answer) => {
    const attachment = answer?.attachments?.find(
      (item) =>
        item?.type === "image" ||
        item?.mimeType?.startsWith("image/"),
    );

    const imageUrl =
      getImageUrl(answer?.answer) ||
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

  const renderDrawing = (answer) => {
    const attachment = answer?.attachments?.find(
      (item) => item?.type === "drawing",
    );

    const drawingUrl =
      answer?.answer?.dataUrl ||
      answer?.answer?.url ||
      attachment?.dataUrl ||
      attachment?.url;

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

  const renderMcq = (answer) => {
    const question = getQuestion(answer);

    const options =
      question?.options ||
      question?.mcqOptions ||
      [];

    const selected =
      answer?.selectedOption ??
      answer?.answer;

    if (!options.length) {
      return (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Selected Option
          </p>

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
              className={`flex items-start gap-3 rounded-xl border p-4 ${
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

  const renderCombinedSection = (
    mode,
    section,
  ) => {
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
          attachments:
            section?.attachments || [],
        });
        break;

      case "DRAWING":
        content = renderDrawing({
          answer: value,
          attachments:
            section?.attachments || [],
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
                  value?.text ||
                    value?.content,
                )}

            {renderImage({
              answer: value,
              attachments:
                section?.attachments || [],
            })}
          </div>
        );
        break;

      default:
        content = renderText(value);
        break;
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {getModeLabel(mode)}
          </span>
        </div>

        {content}
      </div>
    );
  };

  const renderCombined = (answer) => {
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

  const renderAnswer = (answer) => {
    const mode = answer?.answerMode;

    switch (mode) {
      case "MCQ":
        return renderMcq(answer);

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
        return renderCombined(answer);

      default:
        return renderText(answer?.answer);
    }
  };

  // const handleEdit = (answer) => {
  //   const currentAttemptId =
  //     answer?.attempt?._id ||
  //     answer?.attempt ||
  //     attemptId;

  //   const currentAssessmentQuestionId =
  //     answer?.assessmentQuestion?._id ||
  //     answer?.assessmentQuestion ||
  //     assessmentQuestionId;

  //   if (
  //     currentAttemptId &&
  //     currentAssessmentQuestionId
  //   ) {
  //     navigate(
  //       `/student/assessment/${currentAttemptId}/question/${currentAssessmentQuestionId}`,
  //     );
  //     return;
  //   }

  //   if (currentAttemptId) {
  //     navigate(
  //       `/student/assessment/${currentAttemptId}`,
  //     );
  //   }
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="animate-pulse space-y-6">
              <div className="h-10 w-72 rounded-xl bg-gray-200" />
              <div className="h-5 w-96 rounded bg-gray-200" />
              <div className="h-40 rounded-2xl bg-gray-200" />
              <div className="h-64 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/40 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-800">
              Unable to Load Answers
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error?.data?.message ||
                "The student answers could not be loaded."}
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
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-lg">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                  <FileText className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    Student Answer Details
                  </h1>

                  {/* <p className="mt-1 text-sm text-blue-100">
                    Review and edit your answer
                  </p> */}
                </div>
              </div>

              <div className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                {answers.length}{" "}
                {answers.length === 1
                  ? "Answer"
                  : "Answers"}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {answers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />

                <h2 className="mt-4 text-xl font-bold text-gray-700">
                  No Answers Found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  No student answers are available for the selected criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {answers.map((answer, index) => {
                  const statusInfo =
                    getStatusStyle(answer?.status);

                  const StatusIcon =
                    statusInfo.icon;

                  const questionText =
                    getQuestionText(answer);

                  const questionNumber =
                    getQuestionNumber(
                      answer,
                      index,
                    );

                  const marks =
                    getMarks(answer);

                  return (
                    <article
                      key={
                        answer?._id ||
                        `${questionNumber}-${index}`
                      }
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-5 md:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md">
                              {questionNumber}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {getModeLabel(
                                    answer?.answerMode,
                                  )}
                                </span>

                                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                                  {marks}{" "}
                                  {marks === 1
                                    ? "Mark"
                                    : "Marks"}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {statusInfo.label}
                                </span>
                              </div>

                              <h2 className="mt-3 text-lg font-bold leading-7 text-gray-800">
                                Question{" "}
                                {questionNumber}
                              </h2>
                            </div>
                          </div>

                          {/* <button
                            type="button"
                            onClick={() =>
                              handleEdit(answer)
                            }
                            disabled={
                              !(
                                answer?.attempt?._id ||
                                answer?.attempt ||
                                attemptId
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Answer
                          </button> */}
                        </div>
                      </div>

                      <div className="p-5 md:p-6">
                        <section className="rounded-2xl border border-gray-200 bg-gray-50/70">
                          <div className="border-b border-gray-200 bg-white px-5 py-4">
                            <div className="flex items-center gap-2">
                              <ListChecks className="h-5 w-5 text-blue-600" />

                              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                                Question
                              </h3>
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="text-base font-semibold leading-7 text-gray-800">
                              <MathText text={questionText} />
                            </div>
                          </div>
                        </section>

                        <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
                          <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              {answer?.answerMode ===
                                "TABLE" ||
                              answer?.answerMode ===
                                "MATH_TABLE" ? (
                                <Table2 className="h-5 w-5 text-blue-600" />
                              ) : answer?.answerMode ===
                                "CODE" ? (
                                <Code2 className="h-5 w-5 text-blue-600" />
                              ) : answer?.answerMode ===
                                  "IMAGE" ||
                                answer?.answerMode ===
                                  "DRAWING" ? (
                                <ImageIcon className="h-5 w-5 text-blue-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-600" />
                              )}

                              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                                Student Answer
                              </h3>
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

                          <div className="p-5">
                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 md:p-5">
                              {renderAnswer(
                                answer,
                              )}
                            </div>
                          </div>
                        </section>

                        {answer?.submittedAt && (
                          <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

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

                        {/* <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(answer)
                            }
                            disabled={
                              answer?.status ===
                              "SUBMITTED"
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit3 className="h-4 w-4" />
                            {answer?.status ===
                            "SUBMITTED"
                              ? "Submitted"
                              : "Edit Answer"}
                          </button>
                        </div> */}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-start">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnswersScreen;