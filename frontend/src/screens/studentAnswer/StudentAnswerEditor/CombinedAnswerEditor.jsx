import { useMemo } from "react";
import TextAnswerEditor from "./TextAnswerEditor";
import RichTextAnswerEditor from "./RichTextAnswerEditor";
import MathAnswerEditor from "./MathAnswerEditor";
import MathTextAnswerEditor from "./MathTextAnswerEditor";
import TableAnswerEditor from "./TableAnswerEditor";
import MathTableAnswerEditor from "./MathTableAnswerEditor";
import CodeAnswerEditor from "./CodeAnswerEditor";
import ImageAnswerEditor from "./ImageAnswerEditor";
import DrawingAnswerEditor from "./DrawingAnswerEditor";

const CombinedAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const sections = useMemo(() => {
    if (!Array.isArray(question?.combinedAnswerModes)) {
      return [];
    }

    return question.combinedAnswerModes;
  }, [question?.combinedAnswerModes]);

  const currentAnswer = answer || {};

  const updateSection = (mode, value) => {
    const currentSections = currentAnswer.sections || {};

    onChange({
      answer: {
        ...currentAnswer,
        sections: {
          ...currentSections,
          [mode]: value,
        },
      },
      selectedOption: null,
      attachments: currentAnswer.attachments || [],
    });
  };

  const getSectionAnswer = (mode) => {
    return currentAnswer.sections?.[mode] || null;
  };

  const renderEditor = (mode) => {
    const sectionAnswer = getSectionAnswer(mode);

    const handleChange = (value) => {
      updateSection(mode, value);
    };

    switch (mode) {
      case "TEXT":
        return (
          <TextAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "RICH_TEXT":
        return (
          <RichTextAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "MATH":
        return (
          <MathAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "MATH_TEXT":
        return (
          <MathTextAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "TABLE":
        return (
          <TableAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "MATH_TABLE":
        return (
          <MathTableAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "CODE":
        return (
          <CodeAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "IMAGE":
        return (
          <ImageAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case "DRAWING":
        return (
          <DrawingAnswerEditor
            question={question}
            answer={sectionAnswer}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      default:
        return null;
    }
  };

  const getModeTitle = (mode) => {
    const titles = {
      TEXT: "Answer",
      RICH_TEXT: "Detailed Answer",
      MATH: "Mathematical Expression",
      MATH_TEXT: "Explanation",
      TABLE: "Table",
      MATH_TABLE: "Mathematical Table",
      CODE: "Program / Code",
      IMAGE: "Image",
      DRAWING: "Drawing",
    };

    return titles[mode] || mode;
  };

  if (!sections.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        No answer sections have been configured for this question.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((mode, index) => (
        <div
          key={`${mode}-${index}`}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {index + 1}. {getModeTitle(mode)}
            </h3>
          </div>

          <div className="p-4">{renderEditor(mode)}</div>
        </div>
      ))}
    </div>
  );
};

export default CombinedAnswerEditor;