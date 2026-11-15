
import { MathJax } from "better-react-mathjax";

const MathRenderer = ({ children, inline = false }) => {
  if (!children) return null;

  return (
    <MathJax
      inline={inline}
      dynamic
      hideUntilTypeset="first"
    >
      {String(children)}
    </MathJax>
  );
};

export default MathRenderer;
