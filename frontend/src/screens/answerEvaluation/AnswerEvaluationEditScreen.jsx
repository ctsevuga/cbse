import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAnswerEvaluationDetailsQuery,
  useUpdateAnswerEvaluationMutation,
} from "../../slices/answerEvaluationApiSlice";

const AnswerEvaluationEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAnswerEvaluationDetailsQuery(id);

  const [
    updateAnswerEvaluation,
    { isLoading: isUpdating },
  ] = useUpdateAnswerEvaluationMutation();

  const [marksAwarded, setMarksAwarded] = useState("");
  const [feedback, setFeedback] = useState("");
  const [evaluationStatus, setEvaluationStatus] =
    useState("");

  useEffect(() => {
    if (!evaluation) {
      return;
    }

    setMarksAwarded(
      evaluation.marksAwarded ?? "",
    );

    setFeedback(
      evaluation.feedback ?? "",
    );

    setEvaluationStatus(
      evaluation.evaluationStatus || "REVISED",
    );
  }, [evaluation]);

  const getStudentName = () => {
    return (
      evaluation?.student?.user?.name ||
      evaluation?.student?.name ||
      "Student"
    );
  };

  const getAssessmentTitle = () => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment
        ?.title ||
      evaluation?.studentAnswer?.assessment?.title ||
      "Assessment"
    );
  };

  const getSubjectName = () => {
    return (
      evaluation?.studentAnswer?.attempt?.assessment
        ?.subject?.name ||
      evaluation?.studentAnswer?.assessment?.subject
        ?.name ||
      "-"
    );
  };

  const getQuestionText = () => {
    return (
      evaluation?.studentAnswer?.assessmentQuestion
        ?.question?.questionText ||
      evaluation?.studentAnswer?.question?.questionText ||
      "Question not available"
    );
  };

  const getStudentAnswer = () => {
    const studentAnswer =
      evaluation?.studentAnswer;

    return (
      studentAnswer?.answerText ||
      studentAnswer?.answer ||
      studentAnswer?.textAnswer ||
      studentAnswer?.response ||
      "No answer provided"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const maximumMarks =
      Number(evaluation?.maximumMarks ?? 0);

    const numericMarks = Number(marksAwarded);

    if (
      marksAwarded === "" ||
      Number.isNaN(numericMarks)
    ) {
      toast.error("Please enter marks awarded");
      return;
    }

    if (numericMarks < 0) {
      toast.error("Marks awarded cannot be negative");
      return;
    }

    if (numericMarks > maximumMarks) {
      toast.error(
        `Marks awarded cannot exceed ${maximumMarks}`,
      );
      return;
    }

    if (!evaluationStatus) {
      toast.error("Please select an evaluation status");
      return;
    }

    try {
      await updateAnswerEvaluation({
        id: evaluation._id,
        marksAwarded: numericMarks,
        feedback: feedback.trim(),
        evaluationStatus,
      }).unwrap();

      toast.success(
        "Answer evaluation updated successfully",
      );

      navigate(
        `/teacher/answer-evaluation/${evaluation._id}/view`,
        {
          replace: true,
        },
      );
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update answer evaluation";

      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="animate-pulse text-white text-lg font-semibold">
            Loading evaluation...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !evaluation) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Answer evaluation not found";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            Unable to Load Evaluation
          </h2>

          <p className="mt-3 text-white/70">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 h-11 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maximumMarks =
    evaluation.maximumMarks ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Edit Answer Evaluation
              </h1>

              <p className="mt-1 text-white/70">
                Review and revise the marks, feedback, and evaluation status.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
              <p className="text-xs text-white/50">
                Maximum Marks
              </p>

              <p className="text-xl font-bold text-white">
                {maximumMarks}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
                Student
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {getStudentName()}
              </p>

              {evaluation?.student?.admissionNumber && (
                <p className="mt-1 text-sm text-white/60">
                  Admission No:{" "}
                  {evaluation.student.admissionNumber}
                </p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
                Assessment
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {getAssessmentTitle()}
              </p>

              <p className="mt-1 text-sm text-white/60">
                Subject: {getSubjectName()}
              </p>
            </div>
          </div>

          <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-3">
              Question
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-white">
              {getQuestionText()}
            </p>
          </div>

          <div className="mt-5 bg-black/10 border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold mb-3">
              Student Answer
            </p>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-base leading-relaxed text-white/90 whitespace-pre-wrap">
                {getStudentAnswer()}
              </p>
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="mt-6 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <label className="text-sm font-medium text-indigo-100 tracking-wide">
                  Marks Awarded
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={maximumMarks}
                    step="0.5"
                    value={marksAwarded}
                    onChange={(e) =>
                      setMarksAwarded(
                        e.target.value,
                      )
                    }
                    className="w-full h-12 px-4 pr-20 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                    placeholder="Enter marks"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                    / {maximumMarks}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <label className="text-sm font-medium text-indigo-100 tracking-wide">
                  Evaluation Status
                </label>

                <select
                  value={evaluationStatus}
                  onChange={(e) =>
                    setEvaluationStatus(
                      e.target.value,
                    )
                  }
                  className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                >
                  <option value="REVISED">
                    Revised
                  </option>

                  <option value="REVIEW_REQUIRED">
                    Review Required
                  </option>

                  <option value="EVALUATED">
                    Evaluated
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <label className="text-sm font-medium text-indigo-100 tracking-wide">
                Teacher Feedback
              </label>

              <textarea
                value={feedback}
                onChange={(e) =>
                  setFeedback(e.target.value)
                }
                maxLength={2000}
                rows={6}
                placeholder="Enter feedback for this evaluation..."
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm resize-y"
              />

              <div className="text-right text-xs text-white/50">
                {feedback.length} / 2000
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Current Evaluation
                  </p>

                  <p className="text-sm text-white/60 mt-1">
                    Status:{" "}
                    {evaluation.evaluationStatus}
                  </p>
                </div>

                <div className="text-sm text-white/60">
                  Last evaluated:{" "}
                  {formatDate(
                    evaluation.evaluatedAt,
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdating
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  navigate(
                    `/teacher/answer-evaluation/${evaluation._id}/view`,
                  )
                }
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnswerEvaluationEditScreen;