
import { useEffect, useRef, useState } from "react";
import "mathlive";

const MathTextAnswerEditor = ({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Enter your mathematical expression...",
  className = "",
  minRows = 10,
  multiline = true,
}) => {
  const editorRef = useRef(null);
  const fieldRefs = useRef([]);
  const [activeLine, setActiveLine] = useState(0);

  const answer = typeof value === "string" ? value : "";
  const lines = multiline ? answer.split("\n") : [answer];

  // Keep MathLive fields synchronized with the parent value.
  useEffect(() => {
    const fields = fieldRefs.current;

    fields.forEach((field, index) => {
      if (!field) return;

      const lineValue = lines[index] ?? "";

      if (field.value !== lineValue) {
        field.value = lineValue;
      }

      field.readOnly = disabled;
    });
  }, [answer, disabled, multiline]);

  const updateLine = (index, nextValue) => {
    const nextLines = [...lines];

    nextLines[index] = nextValue;

    onChange?.(nextLines.join("\n"));
  };

  const handleKeyDown = (event, index) => {
    if (disabled || !multiline) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      const field = fieldRefs.current[index];
      const currentValue = field?.value ?? "";

      const nextLines = [...lines];
      nextLines[index] = currentValue;
      nextLines.splice(index + 1, 0, "");

      onChange?.(nextLines.join("\n"));

      requestAnimationFrame(() => {
        const nextField = fieldRefs.current[index + 1];

        if (nextField) {
          nextField.focus();
          setActiveLine(index + 1);
        }
      });
    }

    // Support Backspace at the beginning of a line
    // to merge it with the previous line.
    if (event.key === "Backspace" && index > 0) {
      const field = fieldRefs.current[index];

      if (field?.position === 0 || field?.selectionIsCollapsed === false) {
        return;
      }

      const currentValue = field?.value ?? "";

      if (currentValue.length === 0) {
        event.preventDefault();

        const nextLines = [...lines];
        nextLines.splice(index, 1);

        onChange?.(nextLines.join("\n"));

        requestAnimationFrame(() => {
          const previousField = fieldRefs.current[index - 1];

          if (previousField) {
            previousField.focus();
            setActiveLine(index - 1);
          }
        });
      }
    }
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div
        ref={editorRef}
        className={`min-h-[300px] max-h-[700px] overflow-y-auto rounded-2xl border bg-white p-3 transition ${
          disabled
            ? "border-slate-200 bg-slate-100"
            : "border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200"
        }`}
        style={{ minHeight: `${Math.max(minRows, 10) * 2.5}rem` }}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={`mb-2 rounded-xl border px-3 py-2 transition ${
              activeLine === index
                ? "border-indigo-200 bg-indigo-50/30"
                : "border-transparent"
            }`}
          >
            <math-field
              ref={(element) => {
                fieldRefs.current[index] = element;
              }}
              aria-label={`Mathematical answer line ${index + 1}`}
              aria-disabled={disabled}
              onFocus={() => setActiveLine(index)}
              onInput={(event) => {
                updateLine(index, event.currentTarget.value);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="math-text-answer-field block w-full min-h-10 bg-transparent text-lg text-slate-900"
              math-virtual-keyboard-policy="auto"
              smart-mode="true"
              read-only={disabled ? "true" : undefined}
            >
              {line}
            </math-field>
          </div>
        ))}

        {answer.length === 0 && (
          <p className="pointer-events-none px-3 py-1 text-sm text-slate-400">
            {placeholder}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Press Enter to start a new line.
        </span>

        <span>
          Fractions · Matrices · Powers · Roots
        </span>
      </div>

      {disabled && (
        <p className="text-xs text-slate-500">
          The answer editor is currently read-only.
        </p>
      )}
    </div>
  );
};

export default MathTextAnswerEditor;
