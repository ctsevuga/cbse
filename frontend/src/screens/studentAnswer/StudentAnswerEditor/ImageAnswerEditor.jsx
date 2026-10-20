import {
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ImageAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const existingImage =
    answer?.attachments?.find(
      (attachment) =>
        attachment?.type === "image" ||
        attachment?.mimeType?.startsWith(
          "image/",
        ) ||
        attachment?.url,
    ) || null;

  useEffect(() => {
    if (existingImage?.url) {
      setPreviewUrl(existingImage.url);
      setFileName(
        existingImage.name ||
          existingImage.fileName ||
          "Uploaded image",
      );
    } else {
      setPreviewUrl("");
      setFileName("");
    }
  }, [existingImage?.url]);

  const hasImage =
    Boolean(previewUrl) ||
    Boolean(existingImage);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
    setFileName(file.name);

    onChange({
      answer: {
        type: "image",
        name: file.name,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      },
      selectedOption: null,
      attachments: [
        {
          type: "image",
          name: file.name,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          file,
          previewUrl: url,
        },
      ],
    });

    event.target.value = "";
  };

  const removeImage = () => {
    if (disabled) return;

    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setFileName("");

    onChange({
      answer: null,
      selectedOption: null,
      attachments: [],
    });
  };

  const replaceImage = () => {
    if (disabled) return;

    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Upload your answer
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Upload a clear image of your handwritten
            or drawn answer.
          </p>
        </div>

        {hasImage && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Image uploaded
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
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {!hasImage ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <ImagePlus className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">
                Click to upload an image
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, JPEG, WEBP and other image
                formats
              </p>
            </div>

            <span className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Upload className="h-4 w-4" />
              Select Image
            </span>
          </button>
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-700">
                  {fileName}
                </p>

                <p className="text-xs text-gray-500">
                  Image answer
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={replaceImage}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Replace
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={removeImage}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>

            <div className="flex min-h-[280px] items-center justify-center bg-gray-100 p-4">
              <img
                src={previewUrl}
                alt="Student answer preview"
                className="max-h-[500px] max-w-full rounded-lg border border-gray-200 bg-white object-contain shadow-sm"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            Upload a clear and readable image.
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

export default ImageAnswerEditor;