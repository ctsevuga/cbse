
import { Fragment, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const extractText = (value) => {
  if (value == null) return "";

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join(" ");
  }

  if (!isObject(value)) return "";

  if (typeof value.text === "string") return value.text;
  if (typeof value.plainText === "string") return value.plainText;
  if (typeof value.content === "string") return value.content;
  if (typeof value.html === "string") return value.html;

  if (Array.isArray(value.content)) {
    return value.content.map(extractText).join(" ");
  }

  if (Array.isArray(value.children)) {
    return value.children.map(extractText).join(" ");
  }

  return "";
};

// Render LaTeX safely using KaTeX.
function MathContent({ expression, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(expression, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "htmlAndMathml",
      });
    } catch {
      return expression;
    }
  }, [expression, display]);

  return (
    <span
      className={
        display
          ? "block overflow-x-auto py-2"
          : "inline"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Supports:
// $x^2$
// $$x^2$$
// \(x^2\)
// \[x^2\]

function MathText({ text, forceMath = false }) {
  const parts = useMemo(() => {
    const source = String(text ?? "");

    if (!source) return [];

    if (forceMath) {
      return [
        {
          type: "math",
          expression: source,
          display: true,
          key: 0,
        },
      ];
    }

    const result = [];
    let position = 0;
    let key = 0;

    const delimiters = [
      { open: "$$", close: "$$", display: true },
      { open: "\\[", close: "\\]", display: true },
      { open: "\\(", close: "\\)", display: false },
      { open: "$", close: "$", display: false },
    ];

    while (position < source.length) {
      let found = null;

      for (const delimiter of delimiters) {
        const start = source.indexOf(
          delimiter.open,
          position
        );

        if (start !== -1 && (!found || start < found.start)) {
          found = {
            ...delimiter,
            start,
          };
        }
      }

      if (!found) {
        result.push({
          type: "text",
          value: source.slice(position),
          key: key++,
        });
        break;
      }

      if (found.start > position) {
        result.push({
          type: "text",
          value: source.slice(position, found.start),
          key: key++,
        });
      }

      const expressionStart =
        found.start + found.open.length;

      const end = source.indexOf(
        found.close,
        expressionStart
      );

      if (end === -1) {
        result.push({
          type: "text",
          value: source.slice(found.start),
          key: key++,
        });
        break;
      }

      result.push({
        type: "math",
        expression: source.slice(expressionStart, end),
        display: found.display,
        key: key++,
      });

      position = end + found.close.length;
    }

    return result;
  }, [text, forceMath]);

  return (
    <div className="whitespace-pre-wrap break-words leading-8">
      {parts.map((part) =>
        part.type === "math" ? (
          <MathContent
            key={part.key}
            expression={part.expression}
            display={part.display}
          />
        ) : (
          <Fragment key={part.key}>
            {part.value}
          </Fragment>
        )
      )}
    </div>
  );
}


// Render question values.

const normalizeEditorName = (editor) => {
  const name =
    typeof editor === "object" && editor !== null
      ? editor.name
      : editor;

  return String(name || "").trim().toLowerCase();
};

const getEditorType = (editor) => {
  const name = normalizeEditorName(editor);

  const mode =
    typeof editor === "object" && editor !== null
      ? String(editor.answerMode || "").toUpperCase()
      : "";

  if (
    name.includes("multiple choice") ||
    mode === "MCQ"
  ) {
    return "MCQ";
  }

  if (
    name.includes("short answer") ||
    mode === "TEXT" ||
    mode === "RICH_TEXT"
  ) {
    return "TEXT";
  }

  if (
    name.includes("mathematical expression") ||
    mode === "MATH"
  ) {
    return "MATH";
  }

  if (
    name.includes("step-by-step") ||
    name.includes("step by step") ||
    mode === "MATH_TEXT"
  ) {
    return "MATH_TEXT";
  }

  if (
    name.includes("tabular answer") ||
    mode === "TABLE"
  ) {
    return "TABLE";
  }

  return mode || "TEXT";
};

const getQuestionText = (question) =>
  question?.questionText ??
  question?.text ??
  question?.content ??
  "Question content unavailable.";

const getOptionValue = (option) => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }

  return (
    option?.optionText ??
    option?.text ??
    option?.value ??
    option?.content ??
    option
  );
};

// Extract structured steps from common data representations.
const getSteps = (value) => {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.steps)) return value.steps;

  if (Array.isArray(value?.content)) return value.content;

  return null;
};

const containsLatex = (text) => {
  if (typeof text !== "string") return false;

  return (
    text.includes("$$") ||
    text.includes("\\[") ||
    text.includes("\\(") ||
    /\$[^$\n]+?\$/.test(text)
  );
};

// Render question content according to its editor.
function QuestionValue({ value, mode = "TEXT" }) {
  if (value == null || value === "") {
    return (
      <span className="text-gray-400">
        No content provided.
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index}>
            <QuestionValue value={item} mode={mode} />
          </div>
        ))}
      </div>
    );
  }

  if (isObject(value)) {
    const imageUrl =
      value.url || value.src || value.imageUrl;

    if (
      typeof imageUrl === "string" &&
      /^https?:\/\//i.test(imageUrl)
    ) {
      return (
        <figure className="my-3">
          <img
            src={imageUrl}
            alt={value.alt || "Question illustration"}
            loading="lazy"
            className="max-h-96 max-w-full rounded-lg object-contain"
          />

          {value.caption && (
            <figcaption className="mt-1 text-sm text-gray-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    const text = extractText(value);

    if (text) {
      return <QuestionValue value={text} mode={mode} />;
    }

    return (
      <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  const text = String(value);

if (
  mode === "MATH" ||
  mode === "MATH_TEXT" ||
  containsLatex(text)
) {
  return <MathText text={text} />;
}

  return (
    <div className="whitespace-pre-wrap break-words leading-7">
      {text}
    </div>
  );
}

// MCQ options.
function OptionList({ options }) {
  if (!options || options.length === 0) return null;

  const entries = Array.isArray(options)
    ? options.map((option, index) => ({
        label:
          option?.optionLabel ||
          option?.key ||
          option?.label ||
          String.fromCharCode(65 + index),
        value: getOptionValue(option),
      }))
    : Object.entries(options).map(([label, value]) => ({
        label,
        value,
      }));

  return (
    <div className="mt-4 space-y-3">
      <h4 className="font-semibold text-gray-800">
        Options
      </h4>

      {entries.map((option, index) => (
        <div
          key={`${option.label}-${index}`}
          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {option.label}
          </span>

          <div className="flex-1">
            <QuestionValue value={option.value} mode="MATH" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Step-by-step solution preview.
function StepByStepPreview({ value }) {
  const steps = getSteps(value);

  if (!steps) {
    return <QuestionValue value={value} mode="MATH_TEXT" />;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-50 p-3"
        >
          <p className="mb-2 text-sm font-semibold text-indigo-700">
            Step {index + 1}
          </p>

          <QuestionValue value={step} mode="MATH_TEXT" />
        </div>
      ))}
    </div>
  );
}

// Tabular answer preview.
function TablePreview({ value }) {
  if (!isObject(value)) {
    return <QuestionValue value={value} mode="TEXT" />;
  }

  const headers = value.headers || value.columns || [];
  const rows = value.rows || value.data || [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return <QuestionValue value={value} mode="TEXT" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 && (
          <thead className="bg-indigo-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-200 px-4 py-3 text-left font-semibold"
                >
                  {extractText(header)}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {rows.map((row, rowIndex) => {
            const cells = Array.isArray(row)
              ? row
              : Object.values(row || {});

            return (
              <tr key={rowIndex}>
                {cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-200 px-4 py-3"
                  >
                    <QuestionValue value={cell} mode="TEXT" />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TeacherQuestionPreview({ question }) {
  const editor = question?.answerEditorConfiguration;

  const editorType = getEditorType(editor);

  const editorName =
    typeof editor === "object" && editor !== null
      ? editor.name
      : String(editor || "Unknown editor");

  const questionText = getQuestionText(question);

  const options = question?.options;

  const questionType = question?.questionType;

  // The answer editor determines how the question is rendered.
  const renderQuestion = () => {
    switch (editorType) {
      case "MCQ":
        return (
          <>
            <QuestionValue value={questionText} mode="TEXT" />

            <OptionList options={options} />
          </>
        );

      case "TEXT":
        return (
          <QuestionValue value={questionText} mode="TEXT" />
        );

      case "MATH":
        return (
          <QuestionValue value={questionText} mode="MATH" />
        );

      case "MATH_TEXT":
        return (
          <QuestionValue value={questionText} mode="MATH_TEXT" />
        );

      case "TABLE":
        return (
          <QuestionValue value={questionText} mode="TEXT" />
        );

      default:
        return (
          <QuestionValue value={questionText} mode="TEXT" />
        );
    }
  };

  // Optional answer structure, when available in the question.
  const answerContent =
    question?.answer ??
    question?.correctAnswer ??
    question?.sampleAnswer;

  return (
    <div className="min-w-0 space-y-4">

      {/* Question metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
          {questionType?.replaceAll("_", " ") || "QUESTION"}
        </span>

        <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
          {editorName}
        </span>
      </div>

      {/* Question statement */}
      <div className="text-base leading-7 text-gray-900">
        {renderQuestion()}
      </div>

      {/* Optional answer preview */}
      {answerContent != null && (
        <details className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700">
            View answer / solution
          </summary>

          <div className="mt-3">
            {editorType === "MATH_TEXT" ? (
              <StepByStepPreview value={answerContent} />
            ) : editorType === "TABLE" ? (
              <TablePreview value={answerContent} />
            ) : (
              <QuestionValue
                value={answerContent}
                mode={editorType}
              />
            )}
          </div>
        </details>
      )}

    </div>
  );
}

