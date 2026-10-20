import { CheckCircle2, Circle } from "lucide-react";

const MCQAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const options =
    question?.options ||
    question?.mcqOptions ||
    [];

  const selectedOption =
    answer?.selectedOption ??
    answer?.answer ??
    "";

  const handleSelect = (option) => {
    const value =
      typeof option === "object"
        ? option.value ??
          option.option ??
          option.key ??
          option.text ??
          option.label
        : option;

    onChange({
      answer: value,
      selectedOption: value,
      attachments:
        answer?.attachments || [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Select your answer
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose one option.
          </p>
        </div>

        {selectedOption && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Answer selected
          </span>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const value =
            typeof option === "object"
              ? option.value ??
                option.option ??
                option.key ??
                option.text ??
                option.label
              : option;

          const label =
            typeof option === "object"
              ? option.text ??
                option.label ??
                option.value ??
                option.option ??
                option.key
              : option;

          const isSelected =
            String(selectedOption) ===
            String(value);

          return (
            <button
              key={`${value}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() =>
                handleSelect(option)
              }
              className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                }`}
              >
                {String.fromCharCode(
                  65 + index,
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`block text-sm leading-6 sm:text-base ${
                    isSelected
                      ? "font-semibold text-blue-900"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </span>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300 group-hover:text-blue-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {options.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-600">
            No options are available for this question.
          </p>
        </div>
      )}
    </div>
  );
};

export default MCQAnswerEditor;