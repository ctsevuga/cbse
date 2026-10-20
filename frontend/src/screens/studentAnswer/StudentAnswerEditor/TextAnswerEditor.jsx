import { CheckCircle2, FileText } from "lucide-react";

const TextAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const value =
    typeof answer === "string"
      ? answer
      : answer?.answer ?? "";

  const handleChange = (event) => {
    const text = event.target.value;

    onChange({
      answer: text,
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const hasAnswer = value.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Enter your answer
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Type your answer in the space provided below.
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
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Your Answer
          </span>
        </div>

        <textarea
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Type your answer here..."
          rows={8}
          className="w-full resize-y border-0 bg-white p-4 text-sm leading-7 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 sm:text-base"
        />

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            {value.length} characters
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

export default TextAnswerEditor;