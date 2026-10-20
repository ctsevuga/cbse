import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Quote,
  Underline,
} from "lucide-react";
import { useRef } from "react";

const RichTextAnswerEditor = ({
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

  const executeCommand = (command, commandValue = null) => {
    if (disabled) return;

    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);

    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;

    onChange({
      answer: editorRef.current.innerHTML,
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const text = event.clipboardData.getData("text/plain");

    document.execCommand(
      "insertText",
      false,
      text,
    );

    handleInput();
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

  const hasAnswer =
    value.replace(/<[^>]*>/g, "").trim().length > 0;

  const toolbarButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Enter your answer
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Format your answer using the available editing tools.
          </p>
        </div>

        {hasAnswer && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
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
            onClick={() => executeCommand("bold")}
            className={toolbarButtonClass}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("italic")}
            className={toolbarButtonClass}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => executeCommand("underline")}
            className={toolbarButtonClass}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand(
                "formatBlock",
                "blockquote",
              )
            }
            className={toolbarButtonClass}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand(
                "insertUnorderedList",
              )
            }
            className={toolbarButtonClass}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              executeCommand(
                "insertOrderedList",
              )
            }
            className={toolbarButtonClass}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
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
            title="Code"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={initializeEditor}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className={`min-h-[220px] w-full bg-white p-4 text-sm leading-7 text-gray-800 outline-none sm:text-base ${
            disabled
              ? "cursor-not-allowed bg-gray-50"
              : "cursor-text"
          }`}
          data-placeholder="Type your answer here..."
        />

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            Rich text formatting is supported
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

export default RichTextAnswerEditor;