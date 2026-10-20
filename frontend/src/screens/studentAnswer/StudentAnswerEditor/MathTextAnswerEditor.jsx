import {
  Bold,
  CheckCircle2,
  Code,
  Divide,
  Italic,
  Minus,
  Plus,
  Sigma,
  Underline,
  X,
} from "lucide-react";
import { useRef } from "react";

const MathTextAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const editorRef = useRef(null);

  const value =
    typeof answer === "string"
      ? answer
      : answer?.answer ?? "";

  const hasAnswer =
    value.replace(/<[^>]*>/g, "").trim().length > 0;

  const updateAnswer = () => {
    if (!editorRef.current) return;

    onChange({
      answer: editorRef.current.innerHTML,
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const executeCommand = (
    command,
    commandValue = null,
  ) => {
    if (disabled) return;

    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      commandValue,
    );

    updateAnswer();
  };

  const insertMathSymbol = (symbol) => {
    if (disabled) return;

    editorRef.current?.focus();

    document.execCommand(
      "insertText",
      false,
      symbol,
    );

    updateAnswer();
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const text =
      event.clipboardData.getData(
        "text/plain",
      );

    document.execCommand(
      "insertText",
      false,
      text,
    );

    updateAnswer();
  };

  const initializeEditor = (element) => {
    if (!element) return;

    editorRef.current = element;

    if (
      element.innerHTML !== value &&
      document.activeElement !== element
    ) {
      element.innerHTML = value;
    }
  };

  const toolbarButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

  const mathButtons = [
    {
      label: "+",
      value: "+",
      icon: Plus,
    },
    {
      label: "−",
      value: "−",
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
      label: "√",
      value: "√",
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
      label: "π",
      value: "π",
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
            Enter your answer
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Write your explanation and include
            mathematical expressions where required.
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
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand("bold")
            }
            className={toolbarButtonClass}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand("italic")
            }
            className={toolbarButtonClass}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand("underline")
            }
            className={toolbarButtonClass}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand(
                "formatBlock",
                "pre",
              )
            }
            className={toolbarButtonClass}
            title="Mathematical Expression"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {mathButtons.map((button) => {
            const Icon = button.icon;

            return (
              <button
                key={button.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  insertMathSymbol(button.value)
                }
                title={button.label}
                className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-base font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  button.label
                )}
              </button>
            );
          })}
        </div>

        <div
          ref={initializeEditor}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={updateAnswer}
          onPaste={handlePaste}
          className={`min-h-[260px] w-full bg-white p-5 text-base leading-8 text-gray-800 outline-none ${
            disabled
              ? "cursor-not-allowed bg-gray-50"
              : "cursor-text"
          }`}
          data-placeholder="Explain your answer and enter mathematical expressions where required..."
        />

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            Text and mathematical symbols are supported.
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

export default MathTextAnswerEditor;