import { useEffect, useMemo, useState } from "react"; import { useNavigate } from "react-router-dom";

import { useStartStudentAttemptMutation } from "../../slices/studentAttemptApiSlice";

import { useGetStudentEligibleAssessmentsQuery } from "../../slices/assessmentApiSlice";

const formatDate = (value) => { if (!value) return "Not specified";

const date = new Date(value);

if (Number.isNaN(date.getTime())) { return "Not specified"; }

return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", }); };

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) {
    return "Not specified";
  }

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const getErrorMessage = (error, fallback) => { if (!error) return "";

return ( error?.data?.message || error?.data?.error || error?.error || fallback ); };

const StartStudentAttempt = ({
  initialAssessmentId = "",
  onStarted,
}) => {
  const navigate = useNavigate();

  // Fetch assessments eligible for the authenticated student.
  const {
    data: assessmentResponse,
    isLoading: isAssessmentsLoading,
    isFetching: isAssessmentsFetching,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useGetStudentEligibleAssessmentsQuery();

  // Support either an array response or { assessments: [] }.
  const assessments = useMemo(() => {
    if (Array.isArray(assessmentResponse)) {
      return assessmentResponse;
    }

    if (
      Array.isArray(
        assessmentResponse?.assessments
      )
    ) {
      return assessmentResponse.assessments;
    }

    return [];
  }, [assessmentResponse]);

const [ selectedAssessmentId, setSelectedAssessmentId, ] = useState(initialAssessmentId || "");

const [ startStudentAttempt, { isLoading: isStarting, error: startError, }, ] = useStartStudentAttemptMutation();

// Keep active assessments only.
  const availableAssessments = useMemo(
    () => assessments.filter((assessment) => assessment?.status === "ACTIVE"),
    [assessments],
  );

// Find the currently selected assessment.
  const selectedAssessment = useMemo(
    () =>
      availableAssessments.find(
        (assessment) => String(assessment._id) === String(selectedAssessmentId),
      ),
    [availableAssessments, selectedAssessmentId],
  );

// Apply the initial assessment only when it is eligible.
  useEffect(() => {
    const initialId = String(initialAssessmentId || "");

const initialIsAvailable =
  initialId &&
  availableAssessments.some(
    (assessment) =>
      String(assessment._id) === initialId,
  );

setSelectedAssessmentId(
  initialIsAvailable ? initialId : "",
);


}, [initialAssessmentId, availableAssessments]);

const handleAssessmentChange = (event) => {
    setSelectedAssessmentId(event.target.value);
  };

const handleStart = async () => {
    if (!selectedAssessmentId || !selectedAssessment || isStarting) {
      return;
    }

try {
  const attempt = await startStudentAttempt({
  assessmentId: selectedAssessmentId,
}).unwrap();

console.log("Start attempt API response:", attempt);
console.log("Question order:", attempt?.questionOrder);
console.log(
  "First question:",
  attempt?.questionOrder?.[0]
);

  if (onStarted) {
    onStarted(attempt);
  }

  if (attempt?._id) {
    navigate(
      `/student/assessments/attempt/${attempt._id}`,
      {
        state: {
          attempt,
          assessment: selectedAssessment,
        },
      },
    );
  }
} catch (error) {
  console.error("Failed to start assessment:", error);
}


};

const hasAssessment = Boolean(selectedAssessment);

const isLoadingAssessments = isAssessmentsLoading || isAssessmentsFetching;

return ( <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-4xl"> <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 text-white sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-50 backdrop-blur">
              Student Assessment
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start your assessment
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Select an available assessment,
              review the instructions, and begin
              when you are ready.
            </p>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
            <svg
              className="h-8 w-8"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 4V2h6v2"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8 lg:p-10">

        {/* Assessment loading */}
        {isLoadingAssessments && (
          <div
            role="status"
            className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800"
          >
            Loading your eligible assessments...
          </div>
        )}

        {/* Assessment-fetch error */}
        {assessmentsError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <p className="font-semibold">
              Unable to load assessments
            </p>

            <p className="mt-1 text-sm">
              {getErrorMessage(
                assessmentsError,
                "Please try loading your assessments again.",
              )}
            </p>

            <button
              type="button"
              onClick={refetchAssessments}
              disabled={isLoadingAssessments}
              className="mt-3 text-sm font-semibold underline underline-offset-4 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* Assessment-start error */}
        {startError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Unable to start assessment
              </p>

              <p className="mt-1 text-sm">
                {getErrorMessage(
                  startError,
                  "Unable to start the assessment. Please try again.",
                )}
              </p>

              {startError?.data?.attemptId && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/student/assessments/attempt/${startError.data.attemptId}`,
                    )
                  }
                  className="mt-3 text-sm font-semibold underline underline-offset-4"
                >
                  Continue existing attempt
                </button>
              )}
            </div>
          </div>
        )}

        {/* Assessment dropdown */}
        <section>
          <label
            htmlFor="assessment"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Choose an assessment
          </label>

          <div className="relative">
            <select
              id="assessment"
              value={selectedAssessmentId}
              onChange={handleAssessmentChange}
              disabled={
                isLoadingAssessments ||
                isStarting ||
                Boolean(assessmentsError) ||
                availableAssessments.length === 0
              }
              className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                Select an assessment
              </option>

              {availableAssessments.map((assessment) => (
                <option
                  key={assessment._id}
                  value={assessment._id}
                >
                  {assessment.title || "Untitled assessment"}
                  {assessment.subject?.name
                    ? ` — ${assessment.subject.name}`
                    : ""}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </div>
          </div>

          {/* Empty state */}
          {!isLoadingAssessments &&
            !assessmentsError &&
            availableAssessments.length === 0 && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  No eligible assessments available
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  No active assessments were found for your
                  student profile. Please check again later
                  or contact your school administrator.
                </p>

                <button
                  type="button"
                  onClick={refetchAssessments}
                  className="mt-3 text-sm font-semibold text-amber-900 underline underline-offset-4"
                >
                  Refresh assessments
                </button>
              </div>
            )}
        </section>

        {/* Selected assessment details */}
        {hasAssessment && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Selected assessment
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedAssessment.title}
                  </h2>

                  {selectedAssessment.subject?.name && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedAssessment.subject.name}
                    </p>
                  )}
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
              <div className="p-5">
                <p className="text-xs font-medium text-slate-500">
                  Questions
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {selectedAssessment.totalQuestions ?? "—"}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-slate-500">
                  Total marks
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {selectedAssessment.totalMarks ?? "—"}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-slate-500">
                  Duration
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatDuration(
                    selectedAssessment.durationMinutes,
                  )}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-slate-500">
                  Attempts
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {selectedAssessment.maxAttempts ?? "Unlimited"}
                </p>
              </div>
            </div>

            {(selectedAssessment.startDate ||
              selectedAssessment.endDate) && (
              <div className="border-t border-slate-200 bg-white p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Available from
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(selectedAssessment.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Available until
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(selectedAssessment.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Instructions */}
        {hasAssessment && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    d="M12 8v4l2.5 2.5"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-semibold text-indigo-950">
                  Before you begin
                </h3>

                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-indigo-900/75">
                  <li>
                    Make sure you have enough uninterrupted
                    time to complete the assessment.
                  </li>

                  <li>
                    Your question order may be randomized.
                  </li>

                  <li>
                    Your attempt will be recorded against
                    your student account.
                  </li>

                  <li>
                    Avoid closing the assessment while answering.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Start button */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Your student profile is automatically associated
            with this attempt.
          </p>

          <button
            type="button"
            onClick={handleStart}
            disabled={
              !selectedAssessment ||
              isStarting ||
              isLoadingAssessments
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isStarting ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
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
                    className="opacity-90"
                    fill="currentColor"
                    d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3Z"
                  />
                </svg>

                Starting assessment...
              </>
            ) : (
              <>
                Start Assessment

                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14m-6-6 6 6-6 6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  </div>
</div>


  );
};

export default StartStudentAttempt;