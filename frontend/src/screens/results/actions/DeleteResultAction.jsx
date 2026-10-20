import React from "react";

import { useDeleteResultMutation } from "../../slices/resultApiSlice";

const DeleteResultAction = ({
  resultId,
  disabled = false,
  onSuccess,
  onError,
  className = "",
}) => {
  const [
    deleteResult,
    { isLoading },
  ] = useDeleteResultMutation();

  const handleDelete = async () => {
    if (!resultId) {
      const error = new Error(
        "Result ID is required",
      );

      onError?.(error);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this result? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await deleteResult(resultId).unwrap();

      onSuccess?.(response);
    } catch (error) {
      onError?.(error);

      if (!onError) {
        window.alert(
          error?.data?.message ||
            error?.error ||
            "Failed to delete result.",
        );
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={
        disabled ||
        isLoading ||
        !resultId
      }
      className={`rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isLoading
        ? "Deleting..."
        : "Delete Result"}
    </button>
  );
};

export default DeleteResultAction;
