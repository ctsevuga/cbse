import {
  CheckCircle2,
  Code2,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_LANGUAGES = [
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "sql",
  "html",
  "css",
  "json",
  "typescript",
  "php",
];

const CodeAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
  languages = DEFAULT_LANGUAGES,
}) => {
  const textareaRef = useRef(null);
  const [language, setLanguage] = useState(
    answer?.language ||
      question?.programmingLanguage ||
      question?.language ||
      "javascript",
  );
  const [copied, setCopied] = useState(false);

  const code =
    typeof answer === "string"
      ? answer
      : answer?.answer?.code ??
        answer?.answer ??
        "";

  useEffect(() => {
    if (answer?.language) {
      setLanguage(answer.language);
    }
  }, [answer?.language]);

  const lineNumbers = useMemo(() => {
    const lineCount = Math.max(
      code.split("\n").length,
      1,
    );

    return Array.from(
      { length: lineCount },
      (_, index) => index + 1,
    );
  }, [code]);

  const hasAnswer = code.trim().length > 0;

  const updateAnswer = (nextCode, nextLanguage = language) => {
    onChange({
      answer: {
        code: nextCode,
        language: nextLanguage,
      },
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const handleChange = (event) => {
    updateAnswer(event.target.value);
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    setLanguage(nextLanguage);

    updateAnswer(code, nextLanguage);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "Tab") {
      event.preventDefault();

      const textarea = textareaRef.current;

      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const nextCode =
        code.substring(0, start) +
        "  " +
        code.substring(end);

      updateAnswer(nextCode);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + 2,
          start + 2,
        );
      });
    }
  };

  const copyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const clearCode = () => {
    if (disabled) return;

    updateAnswer("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Write your code
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter your solution using the selected
            programming language.
          </p>
        </div>

        {hasAnswer && (
          <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Code entered
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border bg-white ${
          disabled
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300"
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Code2 className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">
                Code Editor
              </p>

              <p className="text-xs text-gray-500">
                Tab inserts two spaces
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={disabled}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {languages.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!hasAnswer}
              onClick={copyCode}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>

            <button
              type="button"
              disabled={disabled || !hasAnswer}
              onClick={clearCode}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-auto bg-gray-950">
          <div className="flex min-h-[320px] min-w-max">
            <div className="select-none border-r border-gray-800 bg-gray-900 px-3 py-4 text-right font-mono text-sm leading-7 text-gray-500">
              {lineNumbers.map((number) => (
                <div key={number}>
                  {number}
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="min-h-[320px] min-w-[700px] flex-1 resize-none border-0 bg-gray-950 px-4 py-4 font-mono text-sm leading-7 text-gray-100 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={`// Write your ${language} solution here...`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            {lineNumbers.length} line
            {lineNumbers.length !== 1 ? "s" : ""} ·{" "}
            {code.length} character
            {code.length !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium uppercase text-gray-600">
              {language}
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
    </div>
  );
};

export default CodeAnswerEditor;