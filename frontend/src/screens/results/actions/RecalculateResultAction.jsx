import React from "react";

import { useUpdateResultMutation } from "../../slices/resultApiSlice";

const RecalculateResultAction = ({
  resultId,
  onSuccess,
  onError,
  className = "",
}) => {
  const [
    updateResult,
    { isLoading },
  ] = useUpdateResultMutation();

  const handleRecalculate = async () => {
    if (!resultId) {
      const error = new Error(
        "Result ID is required",
      );

      onError?.(error);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to recalculate this result using the latest evaluation data?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const updatedResult =
        await updateResult({
          resultId,
        }).unwrap();

      onSuccess?.(updatedResult);
    } catch (error) {
      onError?.(error);

      if (!onError) {
        window.alert(
          error?.data?.message ||
            error?.error ||
            "Failed to recalculate result.",
        );
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleRecalculate}
      disabled={isLoading || !resultId}
      className={`rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isLoading
        ? "Recalculating..."
        : "Recalculate Result"}
    </button>
  );
};

export default RecalculateResultAction;
