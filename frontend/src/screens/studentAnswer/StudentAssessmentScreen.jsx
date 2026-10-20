import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useStartStudentAttemptMutation,
  useUpdateStudentAttemptActivityMutation,
  useSubmitStudentAttemptMutation,
} from "../../slices/studentAttemptApiSlice";

import {
  useGetAnswersByAttemptQuery,
  useSaveStudentAnswerMutation,
  useSubmitStudentAnswerMutation,
} from "../../slices/studentAnswerApiSlice";

import StudentAnswerEditor from "../../components/StudentAnswerEditor";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const StudentAssessmentScreen = () => {
  const { assessmentId, attemptId: routeAttemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] =
    useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const [
    startStudentAttempt,
    {
      isLoading: isStartingAttempt,
    },
  ] = useStartStudentAttemptMutation();

  const [
    updateStudentAttemptActivity,
  ] = useUpdateStudentAttemptActivityMutation();

  const [
    submitStudentAttempt,
  ] = useSubmitStudentAttemptMutation();

  const [
    saveStudentAnswer,
  ] = useSaveStudentAnswerMutation();

  const [
    submitStudentAnswer,
  ] = useSubmitStudentAnswerMutation();

  const activeAttemptId =
    routeAttemptId || attempt?._id;

  const {
    data: answersData,
    isLoading: isLoadingAnswers,
    isError: isAnswersError,
    error: answersError,
    refetch: refetchAnswers,
  } = useGetAnswersByAttemptQuery(
    activeAttemptId,
    {
      skip: !activeAttemptId,
    },
  );

  const answers = useMemo(() => {
    if (Array.isArray(answersData)) {
      return answersData;
    }

    if (Array.isArray(answersData?.answers)) {
      return answersData.answers;
    }

    return [];
  }, [answersData]);

  const questions = useMemo(() => {
    if (!attempt?.questionOrder) {
      return [];
    }

    return attempt.questionOrder;
  }, [attempt]);

  const currentQuestion = questions[currentIndex];

  const currentAssessmentQuestionId =
    currentQuestion?._id ||
    currentQuestion?.assessmentQuestion ||
    currentQuestion;

  const currentAnswer = useMemo(() => {
    if (!currentAssessmentQuestionId) {
      return null;
    }

    return (
      localAnswers[currentAssessmentQuestionId] ||
      answers.find(
        (item) =>
          String(item.assessmentQuestion?._id || item.assessmentQuestion) ===
          String(currentAssessmentQuestionId),
      ) ||
      null
    );
  }, [
    answers,
    currentAssessmentQuestionId,
    localAnswers,
  ]);

  const answeredCount = useMemo(() => {
    return answers.filter(
      (item) =>
        item.status === "SAVED" ||
        item.status === "SUBMITTED" ||
        item.status === "IN_PROGRESS",
    ).length;
  }, [answers]);

  const submittedCount = useMemo(() => {
    return answers.filter(
      (item) => item.status === "SUBMITTED",
    ).length;
  }, [answers]);

  const progress = questions.length
    ? Math.round(
        (answeredCount / questions.length) * 100,
      )
    : 0;

  useEffect(() => {
    const initializeAttempt = async () => {
      if (routeAttemptId || !assessmentId || attempt) {
        return;
      }

      try {
        const result =
          await startStudentAttempt({
            assessmentId,
          }).unwrap();

        const startedAttempt =
          result?.attempt || result;

        setAttempt(startedAttempt);

        if (startedAttempt?._id) {
          navigate(
            `/student/assessment/${assessmentId}/attempt/${startedAttempt._id}`,
            { replace: true },
          );
        }
      } catch (error) {
        toast.error(
          error?.data?.message ||
            error?.message ||
            "Unable to start the assessment",
        );
      }
    };

    initializeAttempt();
  }, [
    assessmentId,
    attempt,
    navigate,
    routeAttemptId,
    startStudentAttempt,
  ]);

  useEffect(() => {
    if (!routeAttemptId || attempt) {
      return;
    }

    const loadAttempt = async () => {
      try {
        const result =
          await startStudentAttempt({
            assessmentId,
          }).unwrap();

        const startedAttempt =
          result?.attempt || result;

        setAttempt(startedAttempt);
      } catch (error) {
        toast.error(
          error?.data?.message ||
            error?.message ||
            "Unable to load the assessment attempt",
        );
      }
    };

    if (!attempt && assessmentId) {
      loadAttempt();
    }
  }, [
    assessmentId,
    attempt,
    routeAttemptId,
    startStudentAttempt,
  ]);

  useEffect(() => {
    if (!answers.length) {
      return;
    }

    const mappedAnswers = {};

    answers.forEach((item) => {
      const key =
        item.assessmentQuestion?._id ||
        item.assessmentQuestion;

      if (key) {
        mappedAnswers[key] = item;
      }
    });

    setLocalAnswers((previous) => ({
      ...mappedAnswers,
      ...previous,
    }));
  }, [answers]);

  useEffect(() => {
    if (!attempt?.startedAt) {
      return;
    }

    const durationMinutes =
      attempt?.assessment?.durationMinutes;

    if (!durationMinutes) {
      return;
    }

    const calculateRemaining = () => {
      const started =
        new Date(attempt.startedAt).getTime();

      const end =
        started +
        durationMinutes * 60 * 1000;

      const remaining =
        Math.max(
          0,
          Math.floor(
            (end - Date.now()) / 1000,
          ),
        );

      setTimeRemaining(remaining);

      if (remaining === 0) {
        handleSubmitAssessment();
      }
    };

    calculateRemaining();

    const timer = setInterval(
      calculateRemaining,
      1000,
    );

    return () => clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (!activeAttemptId) {
      return;
    }

    const timer = setInterval(() => {
      updateStudentAttemptActivity({
        id: activeAttemptId,
        timeSpent: calculateTimeSpent(),
        attemptedQuestions: answeredCount,
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(timer);
  }, [
    activeAttemptId,
    answeredCount,
    updateStudentAttemptActivity,
  ]);

  const calculateTimeSpent = () => {
    if (!attempt?.startedAt) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        (Date.now() -
          new Date(attempt.startedAt).getTime()) /
          1000,
      ),
    );
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) {
      return "--:--";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(
      (seconds % 3600) / 60,
    );
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0",
      )}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(remainingSeconds).padStart(
        2,
        "0",
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(remainingSeconds).padStart(
      2,
      "0",
    )}`;
  };

  const handleAnswerChange = (value) => {
    if (!currentAssessmentQuestionId) {
      return;
    }

    const answer = {
      ...currentAnswer,
      answer:
        value?.answer !== undefined
          ? value.answer
          : value,
      selectedOption:
        value?.selectedOption ??
        currentAnswer?.selectedOption ??
        null,
      attachments:
        value?.attachments ??
        currentAnswer?.attachments ??
        [],
    };

    setLocalAnswers((previous) => ({
      ...previous,
      [currentAssessmentQuestionId]:
        answer,
    }));
  };

  const handleSaveAnswer = async () => {
    if (
      !attempt?._id ||
      !currentQuestion ||
      !currentAssessmentQuestionId
    ) {
      return;
    }

    try {
      setSaving(true);

      const answerMode =
        currentQuestion?.question?.answerMode ||
        currentQuestion?.answerMode ||
        currentAnswer?.answerMode;

      const result =
        await saveStudentAnswer({
          attemptId: attempt._id,
          assessmentQuestionId:
            currentAssessmentQuestionId,
          answerMode,
          answer:
            currentAnswer?.answer ?? null,
          selectedOption:
            currentAnswer?.selectedOption ?? null,
          attachments:
            currentAnswer?.attachments ?? [],
        }).unwrap();

      setLocalAnswers((previous) => ({
        ...previous,
        [currentAssessmentQuestionId]:
          result,
      }));

      await updateStudentAttemptActivity({
        id: attempt._id,
        timeSpent: calculateTimeSpent(),
        attemptedQuestions:
          Math.max(
            answeredCount,
            Object.keys(localAnswers).length + 1,
          ),
      }).unwrap();

      toast.success("Answer saved");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Unable to save answer",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer?._id) {
      await handleSaveAnswer();
      return;
    }

    try {
      setSubmittingAnswer(true);

      await submitStudentAnswer(
        currentAnswer._id,
      ).unwrap();

      await refetchAnswers();

      toast.success(
        "Answer submitted successfully",
      );
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Unable to submit answer",
      );
    } finally {
      setSubmittingAnswer(false);
    }
  };

  async function handleSubmitAssessment() {
    if (
      !attempt?._id ||
      submittingAssessment
    ) {
      return;
    }

    try {
      setSubmittingAssessment(true);

      if (
        currentAnswer &&
        currentAnswer.status !== "SUBMITTED"
      ) {
        await handleSaveAnswer();
      }

      await submitStudentAttempt(
        attempt._id,
      ).unwrap();

      toast.success(
        "Assessment submitted successfully",
      );

      navigate(
        `/student/assessment/${assessmentId}/result/${attempt._id}`,
      );
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Unable to submit assessment",
      );
    } finally {
      setSubmittingAssessment(false);
    }
  }

  const goToQuestion = async (index) => {
    if (
      index < 0 ||
      index >= questions.length ||
      index === currentIndex
    ) {
      return;
    }

    if (
      currentAnswer &&
      currentAnswer.status !== "SUBMITTED"
    ) {
      await handleSaveAnswer();
    }

    setCurrentIndex(index);
  };

  const getQuestionStatus = (question) => {
    const id =
      question?._id ||
      question?.assessmentQuestion ||
      question;

    const answer =
      localAnswers[id] ||
      answers.find(
        (item) =>
          String(
            item.assessmentQuestion?._id ||
              item.assessmentQuestion,
          ) === String(id),
      );

    if (!answer) {
      return "NOT_STARTED";
    }

    return answer.status;
  };

  if (
    isStartingAttempt ||
    (!attempt && !isAnswersError)
  ) {
    return <Loader />;
  }

  if (isAnswersError) {
    return (
      <Message variant="danger">
        {answersError?.data?.message ||
          "Unable to load student answers"}
      </Message>
    );
  }

  if (
    isLoadingAnswers ||
    !attempt ||
    !currentQuestion
  ) {
    return <Loader />;
  }

  const question =
    currentQuestion?.question ||
    currentQuestion;

  const isQuestionSubmitted =
    currentAnswer?.status === "SUBMITTED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/30 bg-white/80 p-5 shadow-2xl backdrop-blur-lg sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Secure Assessment
              </div>

              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                {attempt.assessment?.title ||
                  "Student Assessment"}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {attempt.assessment?.subject?.name ||
                  attempt.assessment?.subject ||
                  "Assessment"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
                <div className="text-xs font-medium text-blue-600">
                  Progress
                </div>
                <div className="mt-1 text-lg font-bold text-blue-800">
                  {answeredCount}/{questions.length}
                </div>
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-center ${
                  timeRemaining !== null &&
                  timeRemaining <= 300
                    ? "bg-red-50 text-red-700"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs font-medium">
                  <Clock3 className="h-4 w-4" />
                  Time Left
                </div>
                <div className="mt-1 text-lg font-bold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="rounded-2xl border border-white/50 bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Questions
                  </h2>
                  <p className="text-xs text-gray-500">
                    {submittedCount} submitted
                  </p>
                </div>

                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {questions.length}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {questions.map(
                  (item, index) => {
                    const status =
                      getQuestionStatus(
                        item,
                      );

                    const isActive =
                      index === currentIndex;

                    const statusClass =
                      status === "SUBMITTED"
                        ? "bg-emerald-500 text-white"
                        : status === "SAVED" ||
                            status ===
                              "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600";

                    return (
                      <button
                        key={
                          item?._id ||
                          item?.assessmentQuestion ||
                          index
                        }
                        type="button"
                        onClick={() =>
                          goToQuestion(index)
                        }
                        className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? "ring-2 ring-indigo-500 ring-offset-2"
                            : ""
                        } ${statusClass}`}
                      >
                        {index + 1}

                        {status ===
                          "SUBMITTED" && (
                          <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-emerald-500" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-500" />
                  Submitted
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-blue-100" />
                  Saved
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-gray-100" />
                  Not Answered
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <div className="rounded-2xl border border-white/50 bg-white p-5 shadow-lg sm:p-7">
              <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                      Question {currentIndex + 1}
                    </span>

                    {question.questionType && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {question.questionType}
                      </span>
                    )}

                    {question.marks !==
                      undefined && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {question.marks} mark
                        {question.marks === 1
                          ? ""
                          : "s"}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold leading-relaxed text-gray-800 sm:text-2xl">
                    {question.questionText}
                  </h2>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isQuestionSubmitted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isQuestionSubmitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4" />
                      In Progress
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 sm:p-6">
                <StudentAnswerEditor
                  question={question}
                  answer={currentAnswer}
                  onChange={handleAnswerChange}
                  disabled={isQuestionSubmitted}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={
                    currentIndex === 0 ||
                    saving ||
                    submittingAnswer
                  }
                  onClick={() =>
                    goToQuestion(
                      currentIndex - 1,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {!isQuestionSubmitted && (
                    <>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={
                          handleSaveAnswer
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Answer"
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          submittingAnswer ||
                          saving
                        }
                        onClick={
                          handleSubmitAnswer
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingAnswer ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Submit Answer
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {currentIndex <
                    questions.length - 1 && (
                    <button
                      type="button"
                      disabled={
                        saving ||
                        submittingAnswer
                      }
                      onClick={() =>
                        goToQuestion(
                          currentIndex + 1,
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800">
                    Assessment reminder
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Your answers are saved while you work.
                    Submit the assessment only after you have
                    reviewed all your answers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={
                  submittingAssessment
                }
                onClick={
                  handleSubmitAssessment
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingAssessment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Assessment...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentAssessmentScreen;