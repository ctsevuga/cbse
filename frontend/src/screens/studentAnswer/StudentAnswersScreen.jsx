import { useMemo, useState } from "react";
import Swal from "sweetalert2";

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
  ClipboardCheck,
  Save,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { useGetAnswersByAttemptQuery } from "../../slices/studentAnswerApiSlice";

import {
  useSaveAnswerEvaluationMutation,
  useCompleteAttemptEvaluationMutation,
} from "../../slices/answerEvaluationApiSlice";

import MathText from "../../components/MathText";

const getQuestion = (answer) => {
  const assessmentQuestion = answer?.assessmentQuestion;

  return (
    assessmentQuestion?.question ||
    answer?.question ||
    assessmentQuestion ||
    null
  );
};

// Determine the actual question mode consistently.
const getAnswerMode = (answer) => {
  const question = getQuestion(answer);

  return (
    answer?.answerMode ||
    question?.answerMode ||
    question?.questionType ||
    ""
  ).toUpperCase();
};

const StudentAnswersScreen = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams();

  // Evaluation states
  const [marksByAnswer, setMarksByAnswer] = useState({});
  const [feedbackByAnswer, setFeedbackByAnswer] = useState({});

  const [saveError, setSaveError] = useState({});
  const [saveSuccess, setSaveSuccess] = useState({});
  const [evaluatedByAnswer, setEvaluatedByAnswer] = useState({});
  const [savingByAnswer, setSavingByAnswer] = useState({});

  const [completeError, setCompleteError] = useState("");
  const [completeSuccess, setCompleteSuccess] = useState("");
  // Section-wise navigation
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const [saveAnswerEvaluation, { isLoading: isSavingEvaluation }] =
    useSaveAnswerEvaluationMutation();

  const [completeAttemptEvaluation, { isLoading: isCompleting }] =
    useCompleteAttemptEvaluationMutation();

  const handleMarksChange = (answerId, value) => {
    setMarksByAnswer((prev) => ({
      ...prev,
      [answerId]: value,
    }));

    setSaveSuccess((prev) => ({
      ...prev,
      [answerId]: false,
    }));

    setSaveError((prev) => ({
      ...prev,
      [answerId]: "",
    }));
  };

  const handleFeedbackChange = (answerId, value) => {
    setFeedbackByAnswer((prev) => ({
      ...prev,
      [answerId]: value,
    }));

    setSaveSuccess((prev) => ({
      ...prev,
      [answerId]: false,
    }));

    setSaveError((prev) => ({
      ...prev,
      [answerId]: "",
    }));
  };

  // Check whether an answer has already been evaluated.

  const handleSaveEvaluation = async (answer, maxMarks) => {
    const answerId = answer?._id;

    if (!answerId) {
      setSaveError((prev) => ({
        ...prev,
        unknown: "Student answer ID is missing.",
      }));
      return;
    }

    // Prevent duplicate evaluation.
    if (isAnswerEvaluated(answer) || savingByAnswer[answerId]) {
      return;
    }

    const enteredMarks = marksByAnswer[answerId];

    if (
      enteredMarks === undefined ||
      enteredMarks === "" ||
      !Number.isFinite(Number(enteredMarks))
    ) {
      setSaveError((prev) => ({
        ...prev,
        [answerId]: "Please enter the marks awarded.",
      }));
      return;
    }

    const awardedMarks = Number(enteredMarks);

    if (awardedMarks < 0 || awardedMarks > maxMarks) {
      setSaveError((prev) => ({
        ...prev,
        [answerId]: `Marks must be between 0 and ${maxMarks}.`,
      }));
      return;
    }

    setSaveError((prev) => ({
      ...prev,
      [answerId]: "",
    }));

    setSaveSuccess((prev) => ({
      ...prev,
      [answerId]: false,
    }));

    setSavingByAnswer((prev) => ({
      ...prev,
      [answerId]: true,
    }));

    try {
      await saveAnswerEvaluation({
        studentAnswerId: answerId,
        marksAwarded: awardedMarks,
        feedback: feedbackByAnswer[answerId] ?? "",
      }).unwrap();

      // Mark this answer as evaluated immediately.
      setEvaluatedByAnswer((prev) => ({
        ...prev,
        [answerId]: true,
      }));

      setSaveSuccess((prev) => ({
        ...prev,
        [answerId]: true,
      }));
    } catch (err) {
      const message = err?.data?.message || "Unable to save the evaluation.";

      setSaveError((prev) => ({
        ...prev,
        [answerId]: message,
      }));

      // Handle already evaluated response.
      if (
        err?.status === 409 &&
        (err?.data?.alreadyEvaluated === true ||
          message.toLowerCase().includes("already been evaluated"))
      ) {
        setEvaluatedByAnswer((prev) => ({
          ...prev,
          [answerId]: true,
        }));
      }
    } finally {
      setSavingByAnswer((prev) => ({
        ...prev,
        [answerId]: false,
      }));
    }
  };

  const handleCompleteEvaluation = async () => {
    if (!attemptId) {
      await Swal.fire({
        icon: "error",
        title: "Missing Attempt ID",
        text: "Student attempt ID is missing.",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      const result = await completeAttemptEvaluation(attemptId).unwrap();

      const message =
        result?.message || "Attempt evaluation completed successfully.";

      await Swal.fire({
        icon: "success",
        title: "Evaluation Completed",
        text: message,
        confirmButtonText: "OK",
      });

      setCompleteError("");
      setCompleteSuccess(message);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Failed to complete attempt evaluation.";

      await Swal.fire({
        icon: "error",
        title: "Unable to Complete Evaluation",
        text: message,
        confirmButtonText: "OK",
        confirmButtonColor: "#4f46e5",
      });

      setCompleteError(message);
      setCompleteSuccess("");
    }
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAnswersByAttemptQuery(attemptId, {
      skip: !attemptId,
    });

  const answers = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.answers)) {
      return data.answers;
    }

    if (Array.isArray(data?.studentAnswers)) {
      return data.studentAnswers;
    }

    if (Array.isArray(data?.attempt?.answers)) {
      return data.attempt.answers;
    }

    if (Array.isArray(data?.attempt?.studentAnswers)) {
      return data.attempt.studentAnswers;
    }

    return [];
  }, [data]);

  console.log("ATTEMPT ID:", attemptId);

  console.log("API RESPONSE:", data);

  console.log("ANSWERS:", answers);

  // Identify automatically evaluated MCQs and teacher-evaluated answers.
  const isMCQAnswer = (answer) => {
    const question = getQuestion(answer);

    const modes = [
      answer?.answerMode,
      question?.answerMode,
      question?.questionType,
    ].map((mode) => String(mode || "").toUpperCase());

    return (
      modes.some((mode) => ["MCQ", "MULTIPLE_CHOICE"].includes(mode)) ||
      !!answer?.mcqEvaluation
    );
  };

  const isAnswerEvaluated = (answer) => {
    if (isMCQAnswer(answer)) {
      return (
        answer?.mcqEvaluation?.isCorrect !== undefined ||
        answer?.evaluation?.evaluationStatus === "EVALUATED" ||
        answer?.evaluation?.status === "EVALUATED"
      );
    }

    return (
      answer?.evaluationStatus === "EVALUATED" ||
      answer?.evaluation?.evaluationStatus === "EVALUATED" ||
      answer?.evaluation?.status === "EVALUATED" ||
      answer?.answerEvaluation?.evaluationStatus === "EVALUATED" ||
      answer?.answerEvaluation?.status === "EVALUATED" ||
      evaluatedByAnswer[answer?._id] === true
    );
  };

  const getMarks = (answer) => {
    const question = getQuestion(answer);

    if (isMCQAnswer(answer)) {
      return (
        answer?.mcqEvaluation?.marks ?? answer?.evaluation?.maximumMarks ?? 1
      );
    }

    return (
      answer?.assessmentQuestion?.marks ?? question?.marks ?? answer?.marks ?? 0
    );
  };

  const getSection = (answer) => {
    return (
      answer?.assessmentQuestion?.section ||
      answer?.assessmentQuestion?.assessmentSection ||
      answer?.question?.section ||
      answer?.section ||
      null
    );
  };

  const getSectionId = (answer) => {
    const section = getSection(answer);

    if (section && typeof section === "object") {
      return String(section._id || section.id || section.name || "default");
    }

    return String(section || "default");
  };

  const getSectionName = (answer) => {
    const section = getSection(answer);

    if (section && typeof section === "object") {
      return (
        section.sectionName ||
        section.name ||
        section.title ||
        "General Questions"
      );
    }

    return section || "General Questions";
  };

  const getSectionOrder = (answer) => {
    const section = getSection(answer);

    return Number(
      section?.order ??
        section?.sectionOrder ??
        answer?.assessmentQuestion?.sectionOrder ??
        answer?.sectionOrder ??
        0,
    );
  };
  const getQuestionOrder = (answer) => {
    return Number(
      answer?.assessmentQuestion?.order ??
        answer?.assessmentQuestion?.questionOrder ??
        answer?.assessmentQuestion?.question?.order ??
        answer?.question?.order ??
        answer?.order ??
        answer?.questionOrder ??
        0,
    );
  };

  const groupedAnswers = useMemo(() => {
    const groups = new Map();

    answers.forEach((answer) => {
      const sectionId = getSectionId(answer);

      if (!groups.has(sectionId)) {
        groups.set(sectionId, {
          id: sectionId,
          name: getSectionName(answer),
          order: getSectionOrder(answer),
          answers: [],
        });
      }

      groups.get(sectionId).answers.push(answer);
    });

    return Array.from(groups.values())
      .map((section) => ({
        ...section,
        answers: [...section.answers].sort(
          (a, b) => getQuestionOrder(a) - getQuestionOrder(b),
        ),
      }))
      .sort((a, b) => a.order - b.order);
  }, [answers]);

  // Section-wise navigation component
  const renderSectionNavigation = () => {
    if (groupedAnswers.length <= 1) {
      return null;
    }

    const currentIndex = Math.min(
      activeSectionIndex,
      groupedAnswers.length - 1,
    );

    const currentSection = groupedAnswers[currentIndex];

    return (
      <div className="sticky top-0 z-20 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Previous Section */}
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() =>
              setActiveSectionIndex((prev) => Math.max(0, prev - 1))
            }
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {/* Section Tabs */}
          <div className="flex flex-1 flex-wrap justify-center gap-1.5">
            {groupedAnswers.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionIndex(index)}
                aria-current={currentIndex === index ? "step" : undefined}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                  currentIndex === index
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {section.name}
                <span className="ml-1 opacity-75">
                  ({section.answers.length})
                </span>
              </button>
            ))}
          </div>

          {/* Next Section */}
          <button
            type="button"
            disabled={currentIndex === groupedAnswers.length - 1}
            onClick={() =>
              setActiveSectionIndex((prev) =>
                Math.min(groupedAnswers.length - 1, prev + 1),
              )
            }
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <span>→</span>
          </button>
        </div>

        {/* Current Section Information */}
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
          <span>{currentSection.name}</span>

          <span>
            Section {currentIndex + 1} of {groupedAnswers.length}
          </span>
        </div>
      </div>
    );
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
      MATH_TABLE: "Mathematical Table",
      COMBINED: "Combined Answer",
    };

    return labels[mode] || mode || "Answer";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return {
          className: "border-green-200 bg-green-50 text-green-700",
          icon: CheckCircle2,
          label: "Submitted",
        };

      case "SAVED":
        return {
          className: "border-blue-200 bg-blue-50 text-blue-700",
          icon: CheckCircle2,
          label: "Saved",
        };

      case "IN_PROGRESS":
        return {
          className: "border-amber-200 bg-amber-50 text-amber-700",
          icon: Pencil,
          label: "In Progress",
        };

      default:
        return {
          className: "border-gray-200 bg-gray-50 text-gray-600",
          icon: XCircle,
          label: "Not Started",
        };
    }
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

  const getImageUrl = (value) => {
    if (!value) return null;

    return value.url || value.previewUrl || value.dataUrl || null;
  };

  const renderText = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return (
        <span className="text-sm italic text-gray-400">No answer provided</span>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
        {String(value)}
      </div>
    );
  };

  const renderHtml = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return (
        <span className="text-sm italic text-gray-400">No answer provided</span>
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
        <span className="text-sm italic text-gray-400">No code provided</span>
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
                    {cell === null || cell === undefined || cell === ""
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
      (item) => item?.type === "image" || item?.mimeType?.startsWith("image/"),
    );

    const imageUrl = getImageUrl(answer?.answer) || getImageUrl(attachment);

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

    const options = question?.options || [];

    const mcq = answer?.mcqEvaluation || {};

    const normalize = (value) => {
      if (value === null || value === undefined) return "";

      if (typeof value === "object") {
        return String(value.value ?? value.label ?? value.text ?? "")
          .trim()
          .toLowerCase();
      }

      return String(value).trim().toLowerCase();
    };

    const getOptionValue = (option) => {
      if (typeof option === "string") return option;

      return option?.value ?? option?.label ?? option?.text ?? "";
    };

    const getOptionLabel = (option, index) => {
      if (typeof option === "string") {
        return String.fromCharCode(65 + index);
      }

      return option?.label || String.fromCharCode(65 + index);
    };

    // Answers returned by the backend.
    const studentAnswer =
      mcq.studentAnswer ?? answer?.selectedOption ?? answer?.answer ?? null;

    const correctAnswer = mcq.correctAnswer ?? question?.correctAnswer ?? null;

    // Match options using their actual values.
    const findOption = (value) => {
      const normalized = normalize(value);

      if (!normalized) return null;

      return (
        options.find((option, index) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option, index);

          return (
            normalized === normalize(optionValue) ||
            normalized === normalize(optionLabel)
          );
        }) ?? null
      );
    };

    const selectedOption = findOption(studentAnswer);
    const correctOption = findOption(correctAnswer);

    const isAnswered = mcq.isAnswered ?? normalize(studentAnswer) !== "";

    const isCorrect =
      mcq.isCorrect ??
      (isAnswered &&
        selectedOption !== null &&
        correctOption !== null &&
        normalize(getOptionValue(selectedOption)) ===
          normalize(getOptionValue(correctOption)));

    const awardedMarks = mcq.awardedMarks ?? (isCorrect ? 1 : 0);

    const maximumMarks = mcq.marks ?? 1;

    return (
      <div className="space-y-2">
        {/* Available options */}
        <div className="space-y-1.5">
          {options.map((option, index) => {
            const label = getOptionLabel(option, index);
            const value = getOptionValue(option);

            const isSelected =
              selectedOption !== null &&
              normalize(value) === normalize(getOptionValue(selectedOption));

            const isCorrectOption =
              correctOption !== null &&
              normalize(value) === normalize(getOptionValue(correctOption));

            let style = "border-gray-200 bg-white";

            if (isCorrectOption) {
              style = "border-green-400 bg-green-50";
            } else if (isSelected) {
              style = "border-red-400 bg-red-50";
            }

            return (
              <div
                key={index}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${style}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold">
                  {label}
                </div>

                <div className="flex-1">
                  <MathText text={String(value)} />

                  {isSelected && (
                    <p className="mt-2 text-xs font-bold text-blue-700">
                      STUDENT'S SELECTED ANSWER
                    </p>
                  )}

                  {isCorrectOption && (
                    <p className="mt-2 text-xs font-bold text-green-700">
                      CORRECT ANSWER
                    </p>
                  )}
                </div>

                {isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}

                {isSelected && !isCorrectOption && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Answer summary */}
        <div className="grid gap-4 rounded-xl border bg-gray-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-gray-700">
              Student's Selected Answer
            </p>

            <div className="mt-2 text-sm text-blue-700">
              {selectedOption ? (
                <div className="flex items-start gap-2">
                  <span className="shrink-0 font-bold">
                    {getOptionLabel(
                      selectedOption,
                      options.indexOf(selectedOption),
                    )}
                    .
                  </span>

                  <div className="min-w-0">
                    <MathText text={String(getOptionValue(selectedOption))} />
                  </div>
                </div>
              ) : isAnswered ? (
                <MathText text={String(studentAnswer)} />
              ) : (
                "Not Answered"
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700">Correct Answer</p>

            <div className="mt-2 text-sm font-bold text-green-700">
              {correctOption ? (
                <div className="flex items-start gap-2">
                  <span className="shrink-0">
                    {getOptionLabel(
                      correctOption,
                      options.indexOf(correctOption),
                    )}
                    .
                  </span>

                  <div className="min-w-0">
                    <MathText text={String(getOptionValue(correctOption))} />
                  </div>
                </div>
              ) : correctAnswer ? (
                <MathText text={String(correctAnswer)} />
              ) : (
                "Not Available"
              )}
            </div>
          </div>
        </div>

        {/* Automated result */}
        <div
          className={`rounded-xl border p-4 ${
            isCorrect
              ? "border-green-300 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}

              <span className="font-bold text-gray-800">
                {!isAnswered
                  ? "Not Answered"
                  : isCorrect
                    ? "Correct Answer"
                    : "Incorrect Answer"}
              </span>
            </div>

            <span className="font-bold text-gray-800">
              {awardedMarks} / {maximumMarks} Marks
            </span>
          </div>
        </div>
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
              : renderHtml(value?.text || value?.content)}

            {renderImage({
              answer: value,
              attachments: section?.attachments || [],
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
        {Object.entries(sections).map(([mode, section]) => (
          <div key={mode}>{renderCombinedSection(mode, section)}</div>
        ))}
      </div>
    );
  };

  const getSubmittedAt = (answer) => {
    return (
      answer?.submittedAt || answer?.updatedAt || answer?.createdAt || null
    );
  };

  const getAnswerStatusLabel = (answer) => {
    if (isAnswerEvaluated(answer)) {
      return "Evaluated";
    }

    return getStatusStyle(answer?.status).label;
  };

  const renderStudentAnswerSection = (answer) => {
    return (
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />

            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">
              Student Answer
            </h3>
          </div>
        </div>

        <div className="p-3">{renderAnswer(answer)}</div>
      </section>
    );
  };

  const renderSubmittedInformation = (answer) => {
    const submittedAt = getSubmittedAt(answer);
    const statusInfo = getStatusStyle(answer?.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
        {/* Submission Status */}
        <div className="flex items-center gap-2">
          <StatusIcon className="h-4 w-4 text-indigo-600" />

          <span className="text-xs font-semibold text-gray-600">Status:</span>

          <span className="text-xs font-bold text-gray-800">
            {getAnswerStatusLabel(answer)}
          </span>
        </div>

        {/* Submitted Date */}
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="h-4 w-4 text-gray-400" />

          <span className="text-xs text-gray-500">Submitted:</span>

          <span className="text-xs font-semibold text-gray-700">
            {submittedAt
              ? new Date(submittedAt).toLocaleString()
              : "Not available"}
          </span>
        </div>
      </div>
    );
  };

  const renderTeacherEvaluation = (answer, maxMarks) => {
    const answerId = answer?._id;

    const evaluated = isAnswerEvaluated(answer);

    const saving = savingByAnswer[answerId];

    const errorMessage = saveError[answerId];

    const successMessage = saveSuccess[answerId];

    const evaluation = answer?.evaluation || answer?.answerEvaluation || null;

    const existingMarks = evaluation?.marksAwarded ?? evaluation?.marks ?? "";

    const existingFeedback = evaluation?.feedback ?? "";

    return (
      <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/40">
        <div className="border-b border-indigo-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-indigo-600" />

            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
              {isMCQAnswer(answer)
                ? "AUTOMATED EVALUATION"
                : "TEACHER EVALUATION"}
            </h3>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Marks */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Awarded Marks
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={maxMarks}
                step="any"
                value={
                  evaluated ? existingMarks : (marksByAnswer[answerId] ?? "")
                }
                onChange={(e) => handleMarksChange(answerId, e.target.value)}
                disabled={evaluated || saving}
                placeholder="Enter awarded marks"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
              />

              <span className="shrink-0 text-sm font-bold text-gray-600">
                / {maxMarks}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Teacher Feedback
            </label>

            <textarea
              rows={4}
              value={
                evaluated
                  ? existingFeedback
                  : (feedbackByAnswer[answerId] ?? "")
              }
              onChange={(e) => handleFeedbackChange(answerId, e.target.value)}
              disabled={evaluated || saving}
              placeholder="Enter feedback for the student..."
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
            />
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-semibold text-green-700"
            >
              Evaluation saved successfully.
            </div>
          )}

          {/* Evaluated */}
          {evaluated ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              This answer has already been evaluated.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSaveEvaluation(answer, maxMarks)}
              disabled={saving || !answerId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Evaluation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Save Evaluation
                </>
              )}
            </button>
          )}
        </div>
      </section>
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
              : renderHtml(answer?.answer?.text || answer?.answer?.content)}

            {renderImage(answer)}
          </div>
        );

      case "COMBINED":
        return renderCombined(answer);

      default:
        return renderText(answer?.answer);
    }
  };

  const renderFormattedOption = (option) => {
    if (!option) {
      return <span className="text-gray-400">Not available</span>;
    }

    return (
      <div className="flex items-start gap-2">
        <span className="shrink-0 font-bold">{option.label}.</span>

        <div className="min-w-0">
          <MathText text={option.value} />
        </div>
      </div>
    );
  };

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
          {/* Header */}
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
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                  {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
                </div>

                <button
                  type="button"
                  onClick={handleCompleteEvaluation}
                  disabled={isCompleting || answers.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />

                  {isCompleting ? "Completing..." : "COMPLETED"}
                </button>
              </div>
            </div>
          </div>

          {/* Answers container */}
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
              <div className="space-y-3">
                {/* Top Section Navigation */}
                {renderSectionNavigation()}

                {/* Display only the selected section */}
                {groupedAnswers.map((section, sectionIndex) =>
                  sectionIndex ===
                  Math.min(activeSectionIndex, groupedAnswers.length - 1) ? (
                    <section key={section.id} className="space-y-2">
                      {/* Section Header */}
                      <div className="overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                              Assessment Section
                            </p>

                            <h2 className="text-sm font-bold text-indigo-900">
                              {section.name}
                            </h2>
                          </div>

                          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-700">
                            {section.answers.length} Questions
                          </span>
                        </div>
                      </div>

                      {/* Questions inside this section */}
                      <div className="space-y-3">
                        {section.answers.map((answer, index) => {
                          const statusInfo = getStatusStyle(answer?.status);

                          const StatusIcon = statusInfo.icon;

                          const questionText = getQuestionText(answer);

                          // Question numbering restarts inside each section.
                          const questionNumber =
                            getQuestionOrder(answer) || index + 1;

                          const marks = getMarks(answer);

                          const answerId = answer?._id;

                          const evaluated = isAnswerEvaluated(answer);

                          return (
                            <article
                              key={answerId || `${section.id}-${index}`}
                              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                            >
                              {/* Question header */}
                              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                                      {questionNumber}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-bold text-gray-800">
                                        Question {questionNumber}
                                      </span>

                                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                        {getModeLabel(answer?.answerMode)}
                                      </span>

                                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                                        {marks} {marks === 1 ? "Mark" : "Marks"}
                                      </span>

                                      <span
                                        className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.className}`}
                                      >
                                        {statusInfo.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* IMPORTANT:
                  Keep your existing question, student answer,
                  submitted information and teacher evaluation JSX here.
              */}

                              <div className="space-y-2 p-2 md:p-3">
                                {/* Question */}
                                <section className="rounded-lg border border-gray-200 bg-gray-50">
                                  <div className="border-b border-gray-200 bg-white px-3 py-1.5">
                                    <h3 className="text-xs font-bold text-gray-600">
                                      Question
                                    </h3>
                                  </div>

                                  <div className="px-3 py-2">
                                    <div className="text-sm font-medium leading-6 text-gray-800">
                                      <MathText text={questionText} />
                                    </div>
                                  </div>
                                </section>

                                <div className="space-y-3">
                                  {/* Descriptive Questions */}
                                  {!isMCQAnswer(answer) && (
                                    <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
                                      {/* Student Answer and Submission Information */}
                                      <div className="min-w-0 space-y-2">
                                        {renderStudentAnswerSection(answer)}

                                        {renderSubmittedInformation(answer)}
                                      </div>

                                      {/* Sticky Teacher Evaluation */}
                                      <div className="min-w-0 xl:sticky xl:top-20">
                                        {renderTeacherEvaluation(answer, marks)}
                                      </div>
                                    </div>
                                  )}

                                  {/* MCQ: Automated Evaluation Only */}
                                  {isMCQAnswer(answer) && (
                                    <section className="overflow-hidden rounded-lg border border-blue-200 bg-white">
                                      <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-3 py-2">
                                        <h3 className="text-xs font-bold uppercase text-blue-700">
                                          Automated Evaluation
                                        </h3>

                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                      </div>

                                      <div className="p-3">
                                        {renderMcq(answer)}
                                      </div>
                                    </section>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ) : null,
                )}

                {/* Bottom Section Navigation */}
                {renderSectionNavigation()}
              </div>
            )}

            {/* Completion messages */}
            <div className="mt-8 space-y-4">
              {completeError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />

                    <div>
                      <p className="font-bold">Unable to complete evaluation</p>

                      <p className="mt-1">{completeError}</p>
                    </div>
                  </div>
                </div>
              )}

              {completeSuccess && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-4 rounded-xl border border-green-300 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />

                    <span>{completeSuccess}</span>
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div className="flex flex-col-reverse justify-between gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleCompleteEvaluation}
                  disabled={isCompleting || answers.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />

                  {isCompleting ? "Completing..." : "COMPLETED"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnswersScreen;
