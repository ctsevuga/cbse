import React from "react";

import { useWithdrawResultMutation } from "../../../slices/resultApiSlice";

const WithdrawResultAction = ({
  resultId,
  disabled = false,
  onSuccess,
  onError,
  className = "",
}) => {
  const [
    withdrawResult,
    { isLoading },
  ] = useWithdrawResultMutation();

  const handleWithdraw = async () => {
    if (!resultId) {
      const error = new Error(
        "Result ID is required",
      );

      onError?.(error);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to withdraw this published result? The result will no longer be available as a published result.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const withdrawnResult =
        await withdrawResult(resultId).unwrap();

      onSuccess?.(withdrawnResult);
    } catch (error) {
      onError?.(error);

      if (!onError) {
        window.alert(
          error?.data?.message ||
            error?.error ||
            "Failed to withdraw result.",
        );
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleWithdraw}
      disabled={
        disabled ||
        isLoading ||
        !resultId
      }
      className={`rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isLoading
        ? "Withdrawing..."
        : "Withdraw Result"}
    </button>
  );
};

export default WithdrawResultAction;
