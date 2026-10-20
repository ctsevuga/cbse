import MathText from '../../components/MathText';
import StudentAnswerRenderer from "../../components/StudentAnswerRenderer";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useSubmitStudentAttemptMutation,
  useUpdateStudentAttemptActivityMutation,
} from "../../slices/studentAttemptApiSlice";

const getErrorMessage = (error) => {
  if (!error) return "";

  return (
    error?.data?.message ||
    error?.error ||
    "Something went wrong. Please try again."
  );
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0,
  );

  const hours = Math.floor(
    safeSeconds / 3600,
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60,
  );

  const remainingSeconds =
    safeSeconds % 60;

  return [
    hours > 0
      ? String(hours).padStart(2, "0")
      : null,
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(
      2,
      "0",
    ),
  ]
    .filter(Boolean)
    .join(":");
};

const getInitialRemainingSeconds = (
  attempt,
) => {
  if (!attempt?.startedAt) {
    return 0;
  }

  const durationSeconds =
    Number(attempt.durationMinutes || 0) *
    60;

  const startedAt =
    new Date(attempt.startedAt).getTime();

  const elapsedSeconds = Math.floor(
    (Date.now() - startedAt) / 1000,
  );

  return Math.max(
    0,
    durationSeconds - elapsedSeconds,
  );
};


const normalizeAnswers = (savedAnswers) => {
  if (Array.isArray(savedAnswers)) {
    return savedAnswers.reduce((result, item) => {
      const questionId =
        typeof item?.question === "object"
          ? item.question?._id
          : item?.question;

      if (questionId) {
        result[String(questionId)] =
          typeof item.answer === "string"
            ? item.answer
            : "";
      }

      return result;
    }, {});
  }

  if (
    savedAnswers &&
    typeof savedAnswers === "object"
  ) {
    return savedAnswers;
  }

  return {};
};


const hasAnswerValue = (value) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined;
};


const StudentAssessmentAttemptScreen = ({
  attempt: attemptProp,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams();

  const navigationAttempt =
    location.state?.attempt;

  const navigationAssessment =
    location.state?.assessment;

  const initialAttempt =
    attemptProp || navigationAttempt;

  const [attempt, setAttempt] =
    useState(initialAttempt);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
    
  
  
const [answers, setAnswers] = useState(() =>
  normalizeAnswers(initialAttempt?.answers)
);

const [attemptedQuestions, setAttemptedQuestions] =
  useState(() => {
    const existingAnswers = normalizeAnswers(
      initialAttempt?.answers
    );

    const answerCount = Object.values(
      existingAnswers
    ).filter(hasAnswerValue).length;

    return Math.max(
      Number(initialAttempt?.attemptedQuestions || 0),
      answerCount
    );
  });


  const [timeSpent, setTimeSpent] =
    useState(
      Number(
        initialAttempt?.timeSpent || 0,
      ),
    );

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      getInitialRemainingSeconds(
        initialAttempt,
      ),
    );

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [
    updateActivity,
    {
      isLoading: isUpdatingActivity,
      error: activityError,
    },
  ] =
    useUpdateStudentAttemptActivityMutation();

    




  const [
    submitAttempt,
    {
      isLoading: isSubmitting,
      error: submitError,
    },
  ] =
    useSubmitStudentAttemptMutation();

  const questionOrder =
    useMemo(() => {
      if (
        !attempt?.questionOrder ||
        !Array.isArray(
          attempt.questionOrder,
        )
      ) {
        return [];
      }

      return [...attempt.questionOrder].sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0),
      );
    }, [attempt]);

  const totalQuestions =
    Number(
      attempt?.totalQuestions ||
        questionOrder.length ||
        0,
    );

  const currentQuestion =
    questionOrder[
      currentQuestionIndex
    ];

    console.log(
  "Full current question:",
  JSON.stringify(currentQuestion, null, 2)
);

console.log(
  "Question object:",
  JSON.stringify(currentQuestion?.question, null, 2)
);

    
const questionData =
  currentQuestion?.question &&
  typeof currentQuestion.question === "object"
    ? currentQuestion.question.question &&
      typeof currentQuestion.question.question === "object"
      ? currentQuestion.question.question
      : currentQuestion.question
    : currentQuestion;

const currentQuestionId =
  currentQuestion?.question?._id ||
  currentQuestion?.questionId ||
  (typeof currentQuestion?.question === "string"
    ? currentQuestion.question
    : null);

const questionText =
  questionData?.questionText ||
  questionData?.text ||
  questionData?.title ||
  questionData?.content ||
  currentQuestion?.questionText ||
  currentQuestion?.text ||
  currentQuestion?.title ||
  "";


  const answerEditorConfiguration =
  questionData?.answerEditorConfiguration || null;

const answerMode =
  answerEditorConfiguration?.answerMode || "TEXT";

const editorOptions =
  answerEditorConfiguration?.configuration || {};

  const assessment =
    attempt?.assessment ||
    navigationAssessment;

  
const answeredCount = questionOrder.filter((item) => {
  const question = item?.question;

  const questionId =
    typeof question === "object"
      ? question?._id
      : question;

  return questionId &&
    hasAnswerValue(answers[String(questionId)]);
}).length;

const progressPercentage =
  totalQuestions > 0
    ? Math.round(
        (answeredCount / totalQuestions) * 100
      )
    : 0;


  const isTimeWarning =
    remainingSeconds > 0 &&
    remainingSeconds <= 300;

  const isExpired =
    remainingSeconds <= 0;

  const updateAttemptActivity =
    useCallback(
      async (
        nextTimeSpent = timeSpent,
        nextAttemptedQuestions =
          attemptedQuestions,
      ) => {
        if (
          !attempt?._id ||
          attempt.status !==
            "IN_PROGRESS"
        ) {
          return null;
        }

        try {
          const updated =
            await updateActivity({
              id: attempt._id,
              timeSpent:
                nextTimeSpent,
              attemptedQuestions:
                nextAttemptedQuestions,
            }).unwrap();

          setAttempt(updated);

          if (
            updated?.timeSpent !==
            undefined
          ) {
            setTimeSpent(
              Number(
                updated.timeSpent,
              ),
            );
          }

          if (
            updated?.attemptedQuestions !==
            undefined
          ) {
            setAttemptedQuestions(
              Number(
                updated.attemptedQuestions,
              ),
            );
          }

          return updated;
        } catch {
          return null;
        }
      },
      [
        attempt?._id,
        attempt?.status,
        attemptedQuestions,
        timeSpent,
        updateActivity,
      ],
    );





const handleAnswerChange = useCallback(
  (value) => {
    if (!currentQuestionId || isExpired) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [String(currentQuestionId)]: value,
    }));

    setAttemptedQuestions((previousCount) => {
      const previousAnswer =
        answers[String(currentQuestionId)] ?? "";

      const wasAnswered = hasAnswerValue(previousAnswer);
      const isAnswered = hasAnswerValue(value);

      return Math.max(
        0,
        Math.min(
          totalQuestions,
          previousCount +
            Number(isAnswered) -
            Number(wasAnswered)
        )
      );
    });
  },
  [
    currentQuestionId,
    isExpired,
    answers,
    totalQuestions,
  ]
);



  useEffect(() => {
    if (!attempt?.startedAt) {
      return;
    }

    const updateTimer = () => {
      const nextRemaining =
        getInitialRemainingSeconds(
          attempt,
        );

      setRemainingSeconds(
        nextRemaining,
      );

      const durationSeconds =
        Number(
          attempt.durationMinutes || 0,
        ) * 60;

      const elapsed =
        Math.max(
          0,
          durationSeconds -
            nextRemaining,
        );

      setTimeSpent(
        Math.max(
          Number(
            attempt.timeSpent || 0,
          ),
          elapsed,
        ),
      );
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000,
    );

    return () =>
      clearInterval(interval);
  }, [
    attempt?.startedAt,
    attempt?.durationMinutes,
    attempt?.timeSpent,
  ]);

  useEffect(() => {
    if (
      !attempt?._id ||
      attempt.status !==
        "IN_PROGRESS"
    ) {
      return;
    }

    const interval = setInterval(() => {
      updateAttemptActivity();
    }, 30000);

    return () =>
      clearInterval(interval);
  }, [
    attempt?._id,
    attempt?.status,
    updateAttemptActivity,
  ]);

  useEffect(() => {
    if (
      !isExpired ||
      !attempt?._id ||
      attempt.status !==
        "IN_PROGRESS"
    ) {
      return;
    }

    updateAttemptActivity(
      timeSpent,
      attemptedQuestions,
    );
  }, [
    isExpired,
    attempt?._id,
    attempt?.status,
    timeSpent,
    attemptedQuestions,
    updateAttemptActivity,
  ]);

  const handleQuestionChange = (
    index,
  ) => {
    if (
      index < 0 ||
      index >= totalQuestions
    ) {
      return;
    }

    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (
      currentQuestionIndex <
      totalQuestions - 1
    ) {
      setCurrentQuestionIndex(
        (current) => current + 1,
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(
        (current) => current - 1,
      );
    }
  };

  const handleAttemptedChange = (
    attempted,
  ) => {
    const nextValue = attempted
      ? Math.min(
          totalQuestions,
          attemptedQuestions + 1,
        )
      : Math.max(
          0,
          attemptedQuestions - 1,
        );

    setAttemptedQuestions(
      nextValue,
    );

    updateAttemptActivity(
      timeSpent,
      nextValue,
    );
  };

  

  

const handleSubmit = async () => {
  if (!attempt?._id || isSubmitting) {
    return;
  }

  try {
    const formattedAnswers = Object.entries(answers).map(
      ([question, answer]) => ({
        question,
        answer: typeof answer === "string"
          ? answer
          : String(answer ?? ""),
      })
    );

    const result = await submitAttempt({
      attemptId: attempt._id,
      timeSpent,
      attemptedQuestions: answeredCount,
      answers: formattedAnswers,
    }).unwrap();

    setAttempt(result);

    onSubmit?.(result);

    navigate(
      `/student/assessments/attempt/${attempt._id}/result`,
      {
        state: {
          attempt: result,
          assessment,
        },
      }
    );
  } catch (error) {
    console.error(
      "Failed to submit assessment:",
      error
    );

    setShowSubmitModal(false);
  }
};


  const handleExit = async () => {
    await updateAttemptActivity(
      timeSpent,
      attemptedQuestions,
    );

    navigate(
      "/home",
    );
  };

  if (!attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path
                strokeLinecap="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Attempt not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not find the assessment
            attempt. Please return to your
            assessments and try again.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/assessments",
              )
            }
            className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    {assessment?.title ||
                      "Assessment"}
                  </h1>

                  <p className="text-xs text-slate-500 sm:text-sm">
                    Attempt #
                    {attempt.attemptNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 ${
                  isTimeWarning
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    isTimeWarning
                      ? "animate-pulse"
                      : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path
                    strokeLinecap="round"
                    d="M12 7v5l3 2"
                  />
                </svg>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    Time remaining
                  </p>

                  <p className="font-mono text-base font-bold">
                    {formatTime(
                      remainingSeconds,
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    true,
                  )
                }
                disabled={
                  isSubmitting ||
                  attempt.status !==
                    "IN_PROGRESS"
                }
                className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:px-5"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                Progress
              </span>

              <span>
                {answeredCount} /{" "}
                {totalQuestions} answered
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {(activityError ||
          submitError) && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
              </svg>
            </div>

            <div>
              <p className="font-semibold">
                Unable to update assessment
              </p>

              <p className="mt-1 text-sm text-red-700">
                {getErrorMessage(
                  activityError ||
                    submitError,
                )}
              </p>
            </div>
          </div>
        )}

        {isTimeWarning &&
          !isExpired && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path
                    strokeLinecap="round"
                    d="M12 7v5l3 2"
                  />
                </svg>
              </div>

              <div>
                <p className="font-semibold">
                  Your time is running out
                </p>

                <p className="text-sm text-amber-800">
                  Please review your answers
                  and submit the assessment
                  before the timer reaches zero.
                </p>
              </div>
            </div>
          )}

        {isExpired && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path
                    strokeLinecap="round"
                    d="M12 8v4m0 4h.01"
                  />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-red-900">
                  Assessment time has expired
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  Your assessment time has
                  expired. The attempt can no
                  longer be submitted manually.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 lg:sticky lg:top-36">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Questions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {answeredCount} of{" "}
                  {totalQuestions} answered
                </p>
              </div>

              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                {progressPercentage}%
              </span>
            </div>

            
<div className="mt-5 grid grid-cols-5 gap-2">
  {questionOrder.map((item, index) => {
    const active = index === currentQuestionIndex;

    // Extract the question object or ID without redeclaring variables.
    const questionData = item?.question;

    const questionId =
      typeof questionData === "object"
        ? questionData?._id
        : questionData;

    const isCurrentAttempted =
      Boolean(questionId) &&
      hasAnswerValue(answers[String(questionId)]);

    return (
      <button
        key={questionId || index}
        type="button"
        onClick={() => handleQuestionChange(index)}
        className={`flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition ${
          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
            : isCurrentAttempted
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {index + 1}
      </button>
    );
  })}
</div>


            <div className="mt-5 space-y-2 border-t border-slate-200 pt-5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-600" />
                Current
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                Answered
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                Unanswered
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
            <div className="border-b border-slate-200 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Question{" "}
                  {currentQuestionIndex +
                    1}{" "}
                  of {totalQuestions}
                </span>

                {currentQuestion?.order && (
                  <span className="text-xs font-medium text-slate-400">
                    Question #
                    {currentQuestion.order}
                  </span>
                )}
              </div>
            </div>

            
<div className="p-5 sm:p-7 lg:p-9">
  {!currentQuestion ? (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="font-semibold text-amber-900">
        No question available
      </h2>

      <p className="mt-2 text-sm text-amber-800">
        No question was found at this position.
        Please check the assessment question data.
      </p>
    </div>
  ) : (
    <div className="space-y-6">
      {/* Question text */}
      <div>
        <h2 className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">
          {questionText ? (
            <MathText text={questionText} />
          ) : (
            "Question text unavailable"
          )}
        </h2>

        {!questionText && (
          <p className="mt-2 text-sm text-amber-700">
            The server did not return a recognizable
            question text field.
          </p>
        )}
      </div>

      {/* Configuration-driven answer editor */}
      <StudentAnswerRenderer
        key={currentQuestionId || currentQuestionIndex}
        question={questionData}
        answerEditorConfiguration={answerEditorConfiguration}
        value={
          currentQuestionId
            ? answers[currentQuestionId] ?? ""
            : ""
        }
        onChange={handleAnswerChange}
        disabled={isExpired || !currentQuestionId}
      />

      <p className="text-xs leading-5 text-slate-500">
        Your answers are maintained in this page's state
        and included when you submit the assessment.
      </p>
    </div>
  )}
</div>


            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  currentQuestionIndex ===
                  0
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>
                Previous
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                {isUpdatingActivity && (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    Saving progress...
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  currentQuestionIndex >=
                    totalQuestions - 1 ||
                  isExpired
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Next
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 18l6-6-6-6"
                  />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </main>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Submit assessment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You have answered{" "}
              <span className="font-semibold text-slate-700">
                {answeredCount}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {totalQuestions}
              </span>{" "}
              questions.
            </p>

            {answeredCount <
              totalQuestions && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Some questions are still
                unanswered. Are you sure you
                want to submit?
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false,
                  )
                }
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Continue Assessment
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                      />

                      <path
                        fill="currentColor"
                        d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3Z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssessmentAttemptScreen;
