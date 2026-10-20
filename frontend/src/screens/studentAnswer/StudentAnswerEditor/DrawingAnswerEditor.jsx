import {
  CheckCircle2,
  Eraser,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DrawingAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [isErasing, setIsErasing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [hasDrawing, setHasDrawing] = useState(false);

  const existingDrawing =
    typeof answer?.answer === "object"
      ? answer.answer
      : null;

  const existingDataUrl =
    existingDrawing?.dataUrl ||
    (typeof answer?.answer === "string"
      ? answer.answer
      : "");

  const getContext = () => {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    return canvas.getContext("2d");
  };

  const configureContext = () => {
    const context = getContext();

    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = brushSize;
    context.strokeStyle = "#111827";
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const previousData =
      canvas.width > 0 && canvas.height > 0
        ? canvas.toDataURL("image/png")
        : null;

    const width =
      Math.max(
        container.clientWidth - 32,
        300,
      );

    const height = 420;

    const ratio =
      window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0,
    );

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      width,
      height,
    );

    configureContext();

    if (previousData) {
      const image = new Image();

      image.onload = () => {
        context.drawImage(
          image,
          0,
          0,
          width,
          height,
        );

        configureContext();
      };

      image.src = previousData;
    }
  };

  useEffect(() => {
    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas,
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas,
      );
    };
  }, []);

  useEffect(() => {
    if (!existingDataUrl) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const image = new Image();

    image.onload = () => {
      const width =
        parseFloat(canvas.style.width) ||
        container.clientWidth - 32;

      const height =
        parseFloat(canvas.style.height) ||
        420;

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const ratio =
        window.devicePixelRatio || 1;

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0,
      );

      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        width,
        height,
      );

      context.drawImage(
        image,
        0,
        0,
        width,
        height,
      );

      configureContext();

      setHasDrawing(true);
    };

    image.src = existingDataUrl;
  }, [existingDataUrl]);

  useEffect(() => {
    configureContext();
  }, [brushSize, isErasing]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    if (disabled) return;

    const context = getContext();
    const point = getPoint(event);

    if (!context || !point) return;

    isDrawingRef.current = true;

    context.beginPath();
    context.moveTo(
      point.x,
      point.y,
    );
  };

  const draw = (event) => {
    if (
      disabled ||
      !isDrawingRef.current
    ) {
      return;
    }

    const context = getContext();
    const point = getPoint(event);

    if (!context || !point) return;

    context.lineWidth = brushSize;

    if (isErasing) {
      context.globalCompositeOperation =
        "destination-out";
    } else {
      context.globalCompositeOperation =
        "source-over";
      context.strokeStyle = "#111827";
    }

    context.lineTo(
      point.x,
      point.y,
    );

    context.stroke();

    setHasDrawing(true);
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;

    const context = getContext();

    if (context) {
      context.closePath();
      context.globalCompositeOperation =
        "source-over";
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const dataUrl =
      canvas.toDataURL("image/png");

    onChange({
      answer: {
        type: "drawing",
        dataUrl,
        mimeType: "image/png",
      },
      selectedOption: null,
      attachments: [
        {
          type: "drawing",
          mimeType: "image/png",
          dataUrl,
        },
      ],
    });
  };

  const clearDrawing = () => {
    if (disabled) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const width =
      parseFloat(canvas.style.width) ||
      300;

    const height =
      parseFloat(canvas.style.height) ||
      420;

    const ratio =
      window.devicePixelRatio || 1;

    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0,
    );

    context.clearRect(
      0,
      0,
      width,
      height,
    );

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      width,
      height,
    );

    configureContext();

    setHasDrawing(false);

    onChange({
      answer: null,
      selectedOption: null,
      attachments: [],
    });
  };

  const undoDrawing = () => {
    if (disabled) return;

    clearDrawing();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Draw your answer
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Use the drawing area to write or draw
            your answer.
          </p>
        </div>

        {hasDrawing && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Drawing entered
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                setIsErasing(false)
              }
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                !isErasing
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Pencil className="h-4 w-4" />
              Pen
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                setIsErasing(true)
              }
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isErasing
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Eraser className="h-4 w-4" />
              Eraser
            </button>

            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
              Size

              <input
                type="range"
                min="1"
                max="15"
                value={brushSize}
                disabled={disabled}
                onChange={(event) =>
                  setBrushSize(
                    Number(event.target.value),
                  )
                }
                className="w-20"
              />

              <span className="w-5 text-center">
                {brushSize}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                disabled || !hasDrawing
              }
              onClick={undoDrawing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>

            <button
              type="button"
              disabled={
                disabled || !hasDrawing
              }
              onClick={clearDrawing}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-gray-100 p-4"
        >
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              onPointerCancel={stopDrawing}
              className={`block touch-none ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : isErasing
                    ? "cursor-cell"
                    : "cursor-crosshair"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500">
            Draw clearly inside the white canvas.
          </span>

          <div className="flex items-center gap-3">
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

export default DrawingAnswerEditor;