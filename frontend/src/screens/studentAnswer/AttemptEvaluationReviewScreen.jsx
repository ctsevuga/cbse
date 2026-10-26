import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetEvaluationsByAttemptQuery,
  useUpdateAnswerEvaluationMutation,
  useReviseAttemptEvaluationMutation,
} from "../../slices/answerEvaluationApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

const getEvaluationList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.evaluations)) return data.evaluations;
  if (Array.isArray(data?.data?.evaluations)) {
    return data.data.evaluations;
  }
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getQuestion = (evaluation) => {
  const studentAnswer = evaluation?.studentAnswer;

  return (
    evaluation?.assessmentQuestion?.question ||
    studentAnswer?.assessmentQuestion?.question ||
    evaluation?.question ||
    studentAnswer?.question ||
    {}
  );
};

const getMaxMarks = (evaluation) => {
  const studentAnswer = evaluation?.studentAnswer;

  const values = [
    evaluation?.maxMarks,
    evaluation?.maximumMarks,
    evaluation?.assessmentQuestion?.marks,
    evaluation?.assessmentQuestion?.maxMarks,
    studentAnswer?.assessmentQuestion?.marks,
    studentAnswer?.assessmentQuestion?.maxMarks,
    studentAnswer?.maxMarks,
    studentAnswer?.question?.marks,
  ];

  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== "" &&
      Number.isFinite(Number(item)),
  );

  return value === undefined ? null : Number(value);
};

const getQuestionText = (evaluation) => {
  const question = getQuestion(evaluation);

  return (
    question?.questionText ||
    question?.text ||
    evaluation?.studentAnswer?.questionText ||
    "Question text unavailable"
  );
};

const getStudentName = (data, evaluations) => {
  const attempt = data?.attempt || data?.data?.attempt;

  const student =
    attempt?.student ||
    data?.student ||
    evaluations?.[0]?.student ||
    evaluations?.[0]?.studentAnswer?.student;

  if (!student) return "Student";

  if (typeof student === "string") return "Student";

  return (
    student?.user?.name ||
    student?.name ||
    student?.user?.phone ||
    "Student"
  );
};

const isAttemptPublished = (data) => {
  const attempt = data?.attempt || data?.data?.attempt;
  const result = data?.result || data?.data?.result;

  return Boolean(
    attempt?.isPublished ||
      attempt?.published ||
      attempt?.publishedAt ||
      attempt?.resultPublished ||
      attempt?.status === "PUBLISHED" ||
      result?.isPublished ||
      result?.published ||
      result?.publishedAt ||
      result?.status === "PUBLISHED",
  );
};

const AttemptEvaluationReviewScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [edits, setEdits] = useState({});
  const [savingEvaluationId, setSavingEvaluationId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  const {
    data: evaluationsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEvaluationsByAttemptQuery(attemptId, {
    skip: !attemptId,
  });

  const [
    updateAnswerEvaluation,
    { isLoading: isUpdatingEvaluation },
  ] = useUpdateAnswerEvaluationMutation();

  const [
    reviseAttemptEvaluation,
    { isLoading: isRevisingAttempt },
  ] = useReviseAttemptEvaluationMutation();

  const evaluations = useMemo(
    () => getEvaluationList(evaluationsData),
    [evaluationsData],
  );

  const published = useMemo(
    () => isAttemptPublished(evaluationsData),
    [evaluationsData],
  );

  const studentName = useMemo(
    () => getStudentName(evaluationsData, evaluations),
    [evaluationsData, evaluations],
  );

  useEffect(() => {
    if (!evaluations.length) return;

    setEdits((previous) => {
      const next = { ...previous };

      evaluations.forEach((evaluation) => {
        const id = getId(evaluation);

        if (!id) return;

        if (!Object.prototype.hasOwnProperty.call(next, id)) {
          next[id] = {
            marksAwarded: String(
              evaluation?.marksAwarded ?? 0,
            ),
            feedback: evaluation?.feedback ?? "",
          };
        }
      });

      return next;
    });
  }, [evaluations]);

  const evaluatedTotal = useMemo(
    () =>
      evaluations.reduce((total, evaluation) => {
        const id = getId(evaluation);
        const marks = Number(
          edits[id]?.marksAwarded ??
            evaluation?.marksAwarded ??
            0,
        );

        return total + (Number.isFinite(marks) ? marks : 0);
      }, 0),
    [evaluations, edits],
  );

  const maximumTotal = useMemo(
    () =>
      evaluations.reduce((total, evaluation) => {
        const maxMarks = getMaxMarks(evaluation);
        return total + (maxMarks ?? 0);
      }, 0),
    [evaluations],
  );

  const changedCount = useMemo(
    () =>
      evaluations.filter((evaluation) => {
        const id = getId(evaluation);
        const edit = edits[id];

        if (!edit) return false;

        return (
          Number(edit.marksAwarded) !==
            Number(evaluation?.marksAwarded ?? 0) ||
          edit.feedback !== (evaluation?.feedback ?? "")
        );
      }).length,
    [evaluations, edits],
  );

  const handleEdit = (evaluationId, field, value) => {
    setEdits((previous) => ({
      ...previous,
      [evaluationId]: {
        ...previous[evaluationId],
        [field]: value,
      },
    }));
  };

  const validateEvaluation = (evaluation) => {
    const evaluationId = getId(evaluation);
    const edit = edits[evaluationId];

    if (!evaluationId || !edit) {
      return "Evaluation data is incomplete.";
    }

    const studentAnswerId = getId(evaluation.studentAnswer);

    if (!studentAnswerId) {
      return `The student answer ID is missing for ${getQuestionText(
        evaluation,
      )}.`;
    }

    const marks = Number(edit.marksAwarded);
    const maxMarks = getMaxMarks(evaluation);

    if (
      edit.marksAwarded === "" ||
      !Number.isFinite(marks) ||
      marks < 0
    ) {
      return "Enter a valid non-negative mark.";
    }

    if (maxMarks === null) {
      return `Maximum marks are unavailable for ${getQuestionText(
        evaluation,
      )}. Verify the question's maximum marks before saving.`;
    }

    if (marks > maxMarks) {
      return `Marks for ${getQuestionText(
        evaluation,
      )} cannot exceed ${maxMarks}.`;
    }

    return null;
  };

  const handleSaveIndividual = async (evaluation) => {
    const evaluationId = getId(evaluation);
    const validationError = validateEvaluation(evaluation);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const edit = edits[evaluationId];

    try {
      setSavingEvaluationId(evaluationId);

      await updateAnswerEvaluation({
        evaluationId,
        marksAwarded: Number(edit.marksAwarded),
        feedback: edit.feedback,
      }).unwrap();

      toast.success(
        "Answer evaluation saved. Save all revisions to synchronize the result.",
      );
    } catch (saveError) {
      toast.error(
        saveError?.data?.message ||
          saveError?.message ||
          "Unable to update answer evaluation.",
      );
    } finally {
      setSavingEvaluationId(null);
    }
  };

  const handleSaveAllRevisions = async () => {
    if (!attemptId) {
      toast.error("Student attempt ID is missing.");
      return;
    }

    if (published) {
      toast.error(
        "This result is published. Revisions are no longer available.",
      );
      return;
    }

    if (!evaluations.length) {
      toast.error("No answer evaluations were found.");
      return;
    }

    for (const evaluation of evaluations) {
      const validationError = validateEvaluation(evaluation);

      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    const corrections = evaluations.map((evaluation) => {
      const evaluationId = getId(evaluation);
      const edit = edits[evaluationId];

      return {
        studentAnswerId: getId(evaluation.studentAnswer),
        marksAwarded: Number(edit.marksAwarded),
        feedback: edit.feedback,
      };
    });

    try {
      setSavingAll(true);

      await reviseAttemptEvaluation({
        attemptId,
        corrections,
      }).unwrap();

      toast.success(
        "Evaluation corrections saved and result totals synchronized.",
      );

      await refetch();
    } catch (saveError) {
      toast.error(
        saveError?.data?.message ||
          saveError?.message ||
          "Unable to revise the completed evaluation.",
      );
    } finally {
      setSavingAll(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Message variant="danger">
        {error?.data?.message ||
          "Unable to load the completed evaluation."}
      </Message>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/90 p-5 shadow-xl backdrop-blur-lg sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                <ClipboardCheck className="h-4 w-4" />
                Evaluation Review
              </div>

              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Review and Correct Marks
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <UserRound className="h-4 w-4" />
                {studentName}
              </p>

              <p className="mt-1 break-all text-xs text-gray-400">
                Attempt ID: {attemptId}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-semibold text-indigo-600">
                  Questions Evaluated
                </p>
                <p className="mt-1 text-2xl font-bold text-indigo-800">
                  {evaluations.length}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-600">
                  Revised Total
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {evaluatedTotal}
                  <span className="ml-1 text-sm font-medium text-emerald-600">
                    / {maximumTotal}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                {published
                  ? "Result already published"
                  : "Result not yet published"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-700">
                {published
                  ? "This screen is read-only because the result is marked as published. Your backend must enforce this restriction as well."
                  : "Correct marks and feedback below, then select Save All Revisions. This synchronizes answer evaluations, question-level result details, the result total and percentage, and the student attempt."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/50 bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-800">
              Question-wise Evaluation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {changedCount} unsynchronized change
              {changedCount === 1 ? "" : "s"}
              {isFetching ? " · Refreshing data..." : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAllRevisions}
            disabled={
              published ||
              savingAll ||
              isRevisingAttempt ||
              isUpdatingEvaluation ||
              !evaluations.length
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAll || isRevisingAttempt ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Revisions...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Revisions
              </>
            )}
          </button>
        </div>

        {!evaluations.length ? (
          <div className="rounded-2xl border border-white/50 bg-white p-10 text-center shadow-lg">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-bold text-gray-700">
              No answer evaluations found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              There are no answer evaluations available for this attempt.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {evaluations.map((evaluation, index) => {
              const evaluationId = getId(evaluation);
              const edit = edits[evaluationId] || {
                marksAwarded: String(
                  evaluation?.marksAwarded ?? 0,
                ),
                feedback: evaluation?.feedback ?? "",
              };

              const maxMarks = getMaxMarks(evaluation);
              const question = getQuestion(evaluation);
              const questionText = getQuestionText(evaluation);
              const isSavingThis =
                savingEvaluationId === evaluationId;

              return (
                <article
                  key={evaluationId || index}
                  className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg"
                >
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow">
                        {index + 1}
                      </div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {question?.questionType && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                              {question.questionType}
                            </span>
                          )}

                          {maxMarks !== null && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Maximum: {maxMarks}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold leading-relaxed text-gray-800">
                          {questionText}
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Evaluated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Marks Awarded
                      </label>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks ?? undefined}
                          step="any"
                          value={edit.marksAwarded}
                          disabled={published || savingAll}
                          onChange={(event) =>
                            handleEdit(
                              evaluationId,
                              "marksAwarded",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-bold text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100"
                        />

                        <span className="shrink-0 text-sm font-medium text-gray-500">
                          / {maxMarks ?? "—"}
                        </span>
                      </div>

                      {maxMarks === null && (
                        <p className="mt-2 text-xs text-red-600">
                          Maximum marks could not be determined from the returned data.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveIndividual(evaluation)
                        }
                        disabled={
                          published ||
                          savingAll ||
                          isUpdatingEvaluation ||
                          isSavingThis
                        }
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSavingThis ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Answer Evaluation
                          </>
                        )}
                      </button>

                      <p className="mt-2 text-xs leading-relaxed text-gray-500">
                        Saves this answer evaluation only. Use Save All Revisions to synchronize the final result totals.
                      </p>
                    </div>

                    <div className="lg:col-span-7">
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Teacher Feedback
                      </label>

                      <textarea
                        rows={5}
                        value={edit.feedback}
                        disabled={published || savingAll}
                        onChange={(event) =>
                          handleEdit(
                            evaluationId,
                            "feedback",
                            event.target.value,
                          )
                        }
                        placeholder="Enter feedback for the student..."
                        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {evaluations.length > 0 && (
          <div className="sticky bottom-3 mt-6 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-lg sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Revised total: {evaluatedTotal} / {maximumTotal}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {changedCount > 0
                    ? `${changedCount} answer(s) changed. Save all revisions to update the result.`
                    : "Review the marks and feedback before publishing."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAllRevisions}
                disabled={
                  published ||
                  savingAll ||
                  isRevisingAttempt ||
                  isUpdatingEvaluation ||
                  !evaluations.length
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAll || isRevisingAttempt ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Save All Revisions
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptEvaluationReviewScreen;