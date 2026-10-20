import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function MathText({ text = '' }) {
  if (!text) return null;

  // Split text into inline ($...$) and display ($$...$$)
  // mathematical expressions.
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

  return (
    <div className="math-question">
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <BlockMath
              key={index}
              math={part.slice(2, -2)}
            />
          );
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <InlineMath
              key={index}
              math={part.slice(1, -1)}
            />
          );
        }

        return (
          <React.Fragment key={index}>
            {part}
          </React.Fragment>
        );
      })}
    </div>
  );
}