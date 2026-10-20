import {
  CheckCircle2,
  Delete,
  Divide,
  Equal,
  Minus,
  Plus,
  Sigma,
  X,
} from "lucide-react";

const MathAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const value =
    typeof answer === "string"
      ? answer
      : answer?.answer ?? "";

  const insertValue = (text) => {
    if (disabled) return;

    const textarea = document.getElementById(
      "math-answer-editor",
    );

    if (!textarea) {
      onChange({
        answer: `${value}${text}`,
        selectedOption: null,
        attachments: answer?.attachments || [],
      });

      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue =
      value.slice(0, start) +
      text +
      value.slice(end);

    onChange({
      answer: newValue,
      selectedOption: null,
      attachments: answer?.attachments || [],
    });

    requestAnimationFrame(() => {
      textarea.focus();

      const cursorPosition =
        start + text.length;

      textarea.setSelectionRange(
        cursorPosition,
        cursorPosition,
      );
    });
  };

  const handleChange = (event) => {
    onChange({
      answer: event.target.value,
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const clearAnswer = () => {
    if (disabled) return;

    onChange({
      answer: "",
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const hasAnswer = value.trim().length > 0;

  const buttons = [
    {
      label: "+",
      value: "+",
      icon: Plus,
    },
    {
      label: "−",
      value: "-",
      icon: Minus,
    },
    {
      label: "×",
      value: "×",
      icon: X,
    },
    {
      label: "÷",
      value: "÷",
      icon: Divide,
    },
    {
      label: "=",
      value: "=",
      icon: Equal,
    },
    {
      label: "√",
      value: "√",
    },
    {
      label: "π",
      value: "π",
    },
    {
      label: "²",
      value: "²",
    },
    {
      label: "³",
      value: "³",
    },
    {
      label: "∑",
      value: "∑",
      icon: Sigma,
    },
    {
      label: "∞",
      value: "∞",
    },
    {
      label: "≤",
      value: "≤",
    },
    {
      label: "≥",
      value: "≥",
    },
    {
      label: "≠",
      value: "≠",
    },
    {
      label: "±",
      value: "±",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Enter your mathematical answer
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter your expression or use the mathematical
            symbols below.
          </p>
        </div>

        {hasAnswer && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Answer entered
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border bg-white transition-all ${
          disabled
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <Sigma className="h-5 w-5 text-blue-600" />

          <span className="text-sm font-semibold text-gray-700">
            Mathematical Expression
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 p-3">
          {buttons.map((button) => {
            const Icon = button.icon;

            return (
              <button
                key={button.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  insertValue(button.value)
                }
                title={button.label}
                className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-lg font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  button.label
                )}
              </button>
            );
          })}

          <button
            type="button"
            disabled={disabled || !hasAnswer}
            onClick={clearAnswer}
            title="Clear answer"
            className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Delete className="h-4 w-4" />
            Clear
          </button>
        </div>

        <textarea
          id="math-answer-editor"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          rows={7}
          placeholder="Example: 2x² + 5x - 3 = 0"
          className="w-full resize-y border-0 bg-white p-5 font-mono text-lg leading-8 text-gray-800 outline-none placeholder:font-sans placeholder:text-base placeholder:text-gray-400 focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            Use mathematical symbols to construct your answer.
          </span>

          {question?.marks && (
            <span className="text-xs font-medium text-gray-500">
              {question.marks} mark
              {question.marks > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathAnswerEditor;