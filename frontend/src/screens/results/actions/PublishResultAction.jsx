import React from "react";

import { usePublishResultMutation } from "../../../slices/resultApiSlice";

const PublishResultAction = ({
  resultId,
  disabled = false,
  onSuccess,
  onError,
  className = "",
}) => {
  const [
    publishResult,
    { isLoading },
  ] = usePublishResultMutation();

  const handlePublish = async () => {
    if (!resultId) {
      const error = new Error(
        "Result ID is required",
      );

      onError?.(error);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to publish this result? Once published, it will be available to the student.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const publishedResult =
        await publishResult(resultId).unwrap();

      onSuccess?.(publishedResult);
    } catch (error) {
      onError?.(error);

      if (!onError) {
        window.alert(
          error?.data?.message ||
            error?.error ||
            "Failed to publish result.",
        );
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={
        disabled ||
        isLoading ||
        !resultId
      }
      className={`rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isLoading
        ? "Publishing..."
        : "Publish Result"}
    </button>
  );
};

export default PublishResultAction;
