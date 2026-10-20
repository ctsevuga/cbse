import { useId } from "react";
import MathText from "./MathText";
import MathTextAnswerEditor from "./MathTextAnswerEditor";

const inputClassName = [
  "block w-full min-w-0",
  "rounded-2xl border border-slate-300",
  "bg-white px-5 py-4",
  "text-base leading-7 text-slate-900",
  "placeholder:text-slate-400",
  "outline-none",
  "transition-colors duration-150",
  "focus:border-indigo-500",
  "focus:ring-4 focus:ring-indigo-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");
const getAnswerMode = (configuration) =>
  configuration?.answerMode || "TEXT";

const normalizeAnswer = (answer) =>
  typeof answer === "string" ? answer : "";

const StudentAnswerRenderer = ({
  question,
  answerEditorConfiguration,
  value = "",
  onChange,
  disabled = false,
}) => {
  const generatedId = useId();

  const configuration =
    answerEditorConfiguration ||
    question?.answerEditorConfiguration ||
    {};

  const answerMode = getAnswerMode(configuration);

  const editorOptions =
    configuration.configuration || {};

  const answer = normalizeAnswer(value);

  const handleChange = (nextValue) => {
    if (!disabled) {
      onChange?.(nextValue);
    }
  };

  const label =
    editorOptions.label || "Your Answer";

  const placeholder =
    editorOptions.placeholder ||
    "Type your answer here...";

  const rows = Number(editorOptions.rows) || 8;

  

const renderTextArea = ({
  placeholder: inputPlaceholder = placeholder,
  minRows = rows,
} = {}) => (
  <textarea
    id={`student-answer-${generatedId}`}
    name={`student-answer-${generatedId}`}
    value={answer}
    onChange={(event) => {
      handleChange(event.target.value);
    }}
    disabled={disabled}
    placeholder={inputPlaceholder}
    rows={Math.max(Number(minRows) || 10, 10)}
    wrap="soft"
    className={`${inputClassName} min-h-[300px] resize-y whitespace-pre-wrap`}
    style={{
      display: "block",
      width: "100%",
      minHeight: "300px",
      whiteSpace: "pre-wrap",
    }}
  />
);



  const renderEditor = () => {
    switch (answerMode) {
      case "MCQ": {
        const options = Array.isArray(question?.options)
          ? question.options
          : [];

        return (
          <fieldset
            disabled={disabled}
            className="space-y-3"
          >
            <legend className="mb-3 text-sm text-slate-500">
              Select your answer
            </legend>

            {options.length === 0 ? (
              <p className="text-sm text-amber-700">
                No answer options are available for this question.
              </p>
            ) : (
              options.map((option, index) => {
                const optionValue =
                  option?._id ||
                  option?.value ||
                  option?.text ||
                  option?.optionText ||
                  String(index);

                const optionText =
                  option?.optionText ||
                  option?.text ||
                  option?.value ||
                  option?.label ||
                  "";

                return (
                  <label
                    key={option?._id || `${generatedId}-${index}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      answer === String(optionValue)
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                        : "border-slate-200 hover:bg-slate-50"
                    } ${
                      disabled
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`answer-${generatedId}`}
                      value={String(optionValue)}
                      checked={answer === String(optionValue)}
                      onChange={(event) =>
                        handleChange(event.target.value)
                      }
                      className="mt-1 accent-indigo-600"
                    />

                    <span className="text-sm leading-6 text-slate-800">
                      <span className="mr-2 font-semibold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <MathText text={String(optionText)} />
                    </span>
                  </label>
                );
              })
            )}
          </fieldset>
        );
      }

      
      case "MATH":
      case "MATH_TEXT":
        return (
          <div className="space-y-3">
            <MathTextAnswerEditor
              value={answer}
              onChange={handleChange}
              disabled={disabled}
              multiline
              minRows={Math.max(rows, 10)}
              placeholder={
                editorOptions?.placeholder ||
                (answerMode === "MATH"
                  ? "Enter your mathematical answer..."
                  : "Show your working and enter mathematical expressions...")
              }
            />

            <p className="text-xs leading-5 text-slate-500">
              {answerMode === "MATH"
                ? "Enter equations, matrices, fractions, roots, and other mathematical expressions. Press Enter to start a new line."
                : "Show your working across multiple lines and include mathematical expressions."}
            </p>
          </div>
        );

      case "RICH_TEXT":
      case "RICH_TEXT_IMAGE":
      case "COMBINED":
        return (
          <div className="space-y-3">
            {renderTextArea({
              placeholder:
                "Write your answer and explanation here...",
              minRows: Math.max(rows, 10),
            })}

            <p className="text-xs text-slate-500">
              This basic version stores plain text. Rich-text
              formatting and image insertion require their
              corresponding editor integrations.
            </p>
          </div>
        );

      case "CODE":
        return (
          <div className="space-y-2">
            <label
              htmlFor={`student-answer-${generatedId}`}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Code editor
            </label>

            <textarea
              id={`student-answer-${generatedId}`}
              value={answer}
              onChange={(event) =>
                handleChange(event.target.value)
              }
              disabled={disabled}
              placeholder={
                editorOptions.placeholder ||
                "// Write your code here"
              }
              rows={Math.max(rows, 12)}
              spellCheck={false}
              className={`${inputClassName} resize-y font-mono text-sm`}
            />
          </div>
        );

      case "TABLE":
      case "MATH_TABLE":
        return (
          <div className="space-y-3">
            {renderTextArea({
              placeholder:
                "Enter your answer, using rows and columns where appropriate...",
              minRows: Math.max(rows, 8),
            })}

            <p className="text-xs text-slate-500">
              A structured table editor can replace this input
              when the table schema and editing controls are defined.
              {answerMode === "MATH_TABLE"
                ? " Mathematical notation can be entered in the cells of that editor."
                : ""}
            </p>
          </div>
        );

      case "IMAGE":
        return (
          <div className="space-y-3">
            <label
              htmlFor={`student-answer-${generatedId}`}
              className="block text-sm font-medium text-slate-700"
            >
              Image URL or answer description
            </label>

            {renderTextArea({
              placeholder:
                "Enter an uploaded image URL or describe your answer...",
              minRows: 4,
            })}

            <p className="text-xs text-slate-500">
              Image uploads require a configured upload endpoint.
              This input does not upload image files.
            </p>
          </div>
        );

      case "DRAWING":
        return (
          <div className="space-y-3">
            {renderTextArea({
              placeholder:
                "Describe your drawing or enter its saved representation...",
              minRows: 6,
            })}

            <p className="text-xs text-slate-500">
              A drawing canvas with save and restore support can
              be integrated here.
            </p>
          </div>
        );


case "TEXT":
default:
  return (
    <textarea
      id={`student-answer-${generatedId}`}
      name={`student-answer-${generatedId}`}
      value={answer}
      onChange={(event) =>
        handleChange(event.target.value)
      }
      disabled={disabled}
      placeholder={
        editorOptions.placeholder ||
        "Write your answer here..."
      }
      rows={12}
      wrap="soft"
      className="block w-full min-h-[300px] resize-y rounded-2xl border border-slate-300 bg-white p-5 text-base leading-7 text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
    />
  );

    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={`student-answer-${generatedId}`}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      {renderEditor()}

      {editorOptions.helpText && (
        <p className="text-xs leading-5 text-slate-500">
          {editorOptions.helpText}
        </p>
      )}
    </div>
  );
};

export default StudentAnswerRenderer;