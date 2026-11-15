
import React, { useEffect, useRef } from "react";
import "mathlive";

const customLayout = {
  label: "Math",
  tooltip: "Math keyboard with subscript",
  rows: [
    [
      { label: "xₙ", insert: "#@_{#?}" },
      { label: "x²", insert: "#@^{#?}" },
      { latex: "\\frac{#@}{#?}" },
      { latex: "\\sqrt{#0}" },
      "+",
      "-",
      "=",
    ],
    [
      "[1]", "[2]", "[3]", "[4]", "[5]",
      "[6]", "[7]", "[8]", "[9]", "[0]",
    ],
  ],
};

export default function MathEditor({
  value = "",
  onChange,
  disabled = false,
}) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    const keyboard = window.mathVirtualKeyboard;

    if (!field || !keyboard) return;

    // Configure the keyboard before showing it.
    field.mathVirtualKeyboardPolicy = "manual";

    const handleFocus = () => {
      // Start with the custom layout only to verify
      // that the subscript key is available.
      keyboard.layouts = [customLayout];
      keyboard.show();
    };

    const handleInput = () => {
      onChange?.(field.value);
    };

    field.addEventListener("focusin", handleFocus);
    field.addEventListener("input", handleInput);

    return () => {
      field.removeEventListener("focusin", handleFocus);
      field.removeEventListener("input", handleInput);
    };
  }, [onChange]);

  useEffect(() => {
    const field = fieldRef.current;

    if (field && field.value !== value) {
      field.value = value ?? "";
    }
  }, [value]);

  return (
    <math-field
      ref={fieldRef}
      math-virtual-keyboard-policy="manual"
      read-only={disabled ? true : undefined}
      style={{
        display: "block",
        width: "100%",
        minHeight: "64px",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        fontSize: "22px",
        background: disabled ? "#f1f5f9" : "#fff",
      }}
    />
  );
}
