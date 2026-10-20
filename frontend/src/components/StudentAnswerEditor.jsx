
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";

const StudentAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [blankAnswers, setBlankAnswers] = useState({});

  const answerMode = useMemo(() => {
    return (
      question?.answerMode ||
      question?.question?.answerMode ||
      answer?.answerMode ||
      ""
    ).toUpperCase();
  }, [question, answer]);

  const questionType = useMemo(() => {
    return (
      question?.questionType ||
      question?.type ||
      question?.question?.questionType ||
      ""
    ).toUpperCase();
  }, [question]);

  const options = useMemo(() => {
    const rawOptions =
      question?.options ||
      question?.questionOptions ||
      question?.choices ||
      [];

    if (!Array.isArray(rawOptions)) {
      return [];
    }

    return rawOptions.map((option, index) => {
      if (typeof option === "string") {
        return {
          value: option,
          label: option,
          key: option,
        };
      }

      const value =
        option?._id ??
        option?.value ??
        option?.key ??
        option?.optionText ??
        option?.text ??
        option?.label ??
        String(index);

      const label =
        option?.optionText ??
        option?.text ??
        option?.label ??
        option?.value ??
        option?.key ??
        String(value);

      return {
        value,
        label,
        key: option?._id ?? `${index}-${String(value)}`,
      };
    });
  }, [question]);

  const isMultiSelect =
    answerMode.includes("MULTI") ||
    questionType.includes("MULTI_SELECT") ||
    questionType.includes("MULTIPLE_SELECT") ||
    questionType.includes("MULTIPLE_ANSWER");

  const isBooleanQuestion =
    questionType.includes("TRUE_FALSE") ||
    questionType.includes("TRUEFALSE") ||
    answerMode === "BOOLEAN";

  const isSingleChoice =
    !isMultiSelect &&
    (
      questionType.includes("MCQ") ||
      questionType.includes("MULTIPLE_CHOICE") ||
      questionType.includes("SINGLE_CHOICE") ||
      questionType.includes("OBJECTIVE") ||
      answerMode.includes("OPTION") ||
      options.length > 0
    );

  const isFillBlank =
    questionType.includes("FILL") ||
    answerMode.includes("BLANK");

  const isFileAnswer =
    answerMode.includes("FILE") ||
    answerMode.includes("UPLOAD") ||
    answerMode.includes("ATTACHMENT") ||
    questionType.includes("FILE_UPLOAD");

  const isLongAnswer =
    questionType.includes("ESSAY") ||
    questionType.includes("LONG_ANSWER") ||
    answerMode.includes("LONG_TEXT") ||
    answerMode.includes("ESSAY");

  const isShortAnswer =
    questionType.includes("SHORT_ANSWER") ||
    questionType.includes("SHORT_TEXT") ||
    answerMode.includes("SHORT_TEXT");

  const isTextAnswer =
    isLongAnswer ||
    isShortAnswer ||
    answerMode.includes("TEXT") ||
    questionType.includes("DESCRIPTIVE") ||
    questionType.includes("SUBJECTIVE");

  const getOptionValue = (option) => {
    if (option && typeof option === "object") {
      return (
        option._id ??
        option.value ??
        option.key ??
        option.optionText ??
        option.text ??
        option.label
      );
    }

    return option;
  };

  useEffect(() => {
    const value = answer?.answer;

    setTextAnswer(
      typeof value === "string" || typeof value === "number"
        ? String(value)
        : ""
    );

    setSelectedOption(
      answer?.selectedOption ?? null
    );

    const existingAttachments = Array.isArray(
      answer?.attachments
    )
      ? answer.attachments
      : [];

    setAttachments(existingAttachments);

    if (Array.isArray(value)) {
      setSelectedOptions(value);
    } else if (Array.isArray(answer?.selectedOption)) {
      setSelectedOptions(answer.selectedOption);
    } else {
      setSelectedOptions([]);
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      setBlankAnswers(value);
    } else {
      setBlankAnswers({});
    }
  }, [answer, question?._id]);

  const emitChange = ({
    answer: answerValue,
    selectedOption: optionValue = selectedOption,
    attachments: attachmentValue = attachments,
  }) => {
    onChange({
      answer: answerValue,
      selectedOption: optionValue,
      attachments: attachmentValue,
    });
  };

  const handleTextChange = (value) => {
    setTextAnswer(value);

    emitChange({
      answer: value,
    });
  };

  const handleSingleChoice = (value) => {
    setSelectedOption(value);

    emitChange({
      answer: value,
      selectedOption: value,
    });
  };

  const handleMultiChoice = (value) => {
    const exists = selectedOptions.some(
      (item) => String(item) === String(value)
    );

    const updated = exists
      ? selectedOptions.filter(
          (item) => String(item) !== String(value)
        )
      : [...selectedOptions, value];

    setSelectedOptions(updated);

    emitChange({
      answer: updated,
      selectedOption: updated,
    });
  };

  const handleBlankChange = (key, value) => {
    const updated = {
      ...blankAnswers,
      [key]: value,
    };

    setBlankAnswers(updated);

    emitChange({
      answer: updated,
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const updated = [...attachments, ...files];

    setAttachments(updated);

    emitChange({
      answer: textAnswer,
      attachments: updated,
    });

    event.target.value = "";
  };

  const removeAttachment = (index) => {
    const updated = attachments.filter(
      (_, attachmentIndex) => attachmentIndex !== index
    );

    setAttachments(updated);

    emitChange({
      answer: textAnswer,
      attachments: updated,
    });
  };

  const renderOptions = () => {
    const displayedOptions = isBooleanQuestion
      ? [
          { value: true, label: "True", key: "true" },
          { value: false, label: "False", key: "false" },
        ]
      : options;

    if (!displayedOptions.length) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No answer options are available for this question.
          Please check the question configuration.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {displayedOptions.map((option, index) => {
          const value = getOptionValue(option);
          const label = option.label ?? String(value);

          const isSelected = isMultiSelect
            ? selectedOptions.some(
                (item) => String(item) === String(value)
              )
            : String(selectedOption) === String(value);

          return (
            <label
              key={option.key ?? index}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-80"
                  : ""
              }`}
            >
              <input
                type={isMultiSelect ? "checkbox" : "radio"}
                name={`answer-${question?._id ?? "question"}`}
                value={String(value)}
                checked={isSelected}
                disabled={disabled}
                onChange={() => {
                  if (isMultiSelect) {
                    handleMultiChoice(value);
                  } else {
                    handleSingleChoice(value);
                  }
                }}
                className="mt-1 h-4 w-4 accent-indigo-600"
              />

              <span className="flex-1 text-sm leading-6 text-gray-700">
                <span className="mr-2 font-semibold text-gray-500">
                  {String.fromCharCode(65 + index)}.
                </span>
                {label}
              </span>

              {isSelected && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
              )}
            </label>
          );
        })}
      </div>
    );
  };

  const renderFillBlanks = () => {
    const template =
      question?.questionText ||
      question?.text ||
      "";

    const blankCount = (
      template.match(/_{2,}|\{\{.*?\}\}/g) || []
    ).length;

    const count = Math.max(
      blankCount,
      question?.blankCount || 0,
      1
    );

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Enter your answer for each blank.
        </p>

        {Array.from({ length: count }, (_, index) => {
          const key = `blank${index + 1}`;

          return (
            <div key={key}>
              <label
                htmlFor={`${question?._id}-${key}`}
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Blank {index + 1}
              </label>

              <input
                id={`${question?._id}-${key}`}
                type="text"
                value={blankAnswers[key] ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  handleBlankChange(key, event.target.value)
                }
                placeholder={`Enter answer ${index + 1}`}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderFileUpload = () => (
    <div className="space-y-4">
      <label
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center transition ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-indigo-500" />

        <span className="text-sm font-semibold text-gray-700">
          Upload your answer
        </span>

        <span className="mt-1 text-xs text-gray-500">
          Select one or more files from your device.
        </span>

        <input
          type="file"
          multiple
          disabled={disabled}
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Attached files ({attachments.length})
          </h4>

          {attachments.map((file, index) => {
            const name =
              file?.name ||
              file?.originalName ||
              file?.filename ||
              `Attachment ${index + 1}`;

            return (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-indigo-500" />

                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                  {name}
                </span>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    aria-label={`Remove ${name}`}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTextAnswer = () => (
    <div className="space-y-2">
      <label
        htmlFor={`answer-text-${question?._id ?? "question"}`}
        className="block text-sm font-semibold text-gray-700"
      >
        Your answer
      </label>

      {isLongAnswer ? (
        <textarea
          id={`answer-text-${question?._id ?? "question"}`}
          rows={8}
          value={textAnswer}
          disabled={disabled}
          onChange={(event) =>
            handleTextChange(event.target.value)
          }
          placeholder="Write your answer here..."
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      ) : (
        <input
          id={`answer-text-${question?._id ?? "question"}`}
          type="text"
          value={textAnswer}
          disabled={disabled}
          onChange={(event) =>
            handleTextChange(event.target.value)
          }
          placeholder="Enter your answer here..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      )}

      {isLongAnswer && (
        <p className="text-right text-xs text-gray-400">
          {textAnswer.length} characters
        </p>
      )}
    </div>
  );

  const renderDefaultAnswer = () => (
    <div className="space-y-3">
      <label
        htmlFor={`answer-text-${question?._id ?? "question"}`}
        className="block text-sm font-semibold text-gray-700"
      >
        Your answer
      </label>

      <textarea
        id={`answer-text-${question?._id ?? "question"}`}
        rows={4}
        value={textAnswer}
        disabled={disabled}
        onChange={(event) =>
          handleTextChange(event.target.value)
        }
        placeholder="Enter your answer here..."
        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Answer
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {disabled
              ? "This answer has already been submitted."
              : isMultiSelect
                ? "Select all applicable options."
                : isSingleChoice || isBooleanQuestion
                  ? "Select one option."
                  : "Enter your response below."}
          </p>
        </div>

        {disabled && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Submitted
          </span>
        )}
      </div>

      {isFileAnswer ? (
        renderFileUpload()
      ) : isFillBlank ? (
        renderFillBlanks()
      ) : isSingleChoice || isBooleanQuestion || isMultiSelect ? (
        renderOptions()
      ) : isTextAnswer ? (
        renderTextAnswer()
      ) : (
        renderDefaultAnswer()
      )}

      {!disabled && !isFileAnswer && (
        <div className="flex items-center gap-2 border-t border-gray-200 pt-4 text-xs text-gray-500">
          <Paperclip className="h-4 w-4" />
          Remember to save your answer before moving to another question.
        </div>
      )}
    </div>
  );
};

export default StudentAnswerEditor;
