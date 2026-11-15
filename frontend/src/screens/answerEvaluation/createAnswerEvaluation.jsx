
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateAnswerEvaluationMutation } from "../../slices/answerEvaluationApiSlice";

const AnswerEvaluationScreen = () => {
  const { studentAnswerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const studentAnswer = location.state?.studentAnswer;

  const [marksAwarded, setMarksAwarded] = useState("");
  const [feedback, setFeedback] = useState("");

  const [createAnswerEvaluation, { isLoading }] =
    useCreateAnswerEvaluationMutation();

  const student = studentAnswer?.student;
  const assessment = studentAnswer?.attempt?.assessment;

  const question =
    studentAnswer?.assessmentQuestion?.question ||
    studentAnswer?.question;

  const maximumMarks =
    student?.maximumMarks ||
    question?.marks ||
    studentAnswer?.assessmentQuestion?.section?.marksPerQuestion ||
    0;

  const studentName = student?.user?.name || "Unknown Student";

  const questionText =
    question?.questionText || "Question not available";

  const questionType = (
    question?.questionType ||
    question?.type ||
    ""
  ).toUpperCase();

  const isMCQ = [
    "MCQ",
    "MULTIPLE_CHOICE",
  ].includes(questionType);

  const studentAnswerText =
    studentAnswer?.answerText ||
    studentAnswer?.answer ||
    studentAnswer?.textAnswer ||
    studentAnswer?.response ||
    "";

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!studentAnswerId) {
      toast.error("Student answer could not be identified");
      return;
    }

    if (marksAwarded === "") {
      toast.error("Please enter marks awarded");
      return;
    }

    const numericMarks = Number(marksAwarded);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > maximumMarks
    ) {
      toast.error(`Marks must be between 0 and ${maximumMarks}`);
      return;
    }

    try {
      await createAnswerEvaluation({
        studentAnswerId,
        marksAwarded: numericMarks,
        feedback: feedback.trim(),
      }).unwrap();

      toast.success("Answer evaluated successfully");
      navigate(-1);
    } catch (err) {
      toast.error(
        err?.data?.message ||
        err?.error ||
        "Unable to evaluate answer"
      );
    }
  };

  if (!studentAnswer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-gray-100 p-4">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <h2 className="font-semibold text-red-600">
            Student answer not available
          </h2>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded bg-indigo-600 px-5 py-2 text-white"
          >
            Back to Evaluations
          </button>
        </div>
      </div>
    );
  }

  return (
    // IMPORTANT:
    // 120px is reserved for the existing application header/navigation.
    // Adjust this value if your application header has a different height.
    <div className="h-[calc(100dvh-120px)] min-h-0 overflow-hidden bg-slate-100 p-2">

      <div className="mx-auto flex h-full min-h-0 max-w-[1800px] flex-col">

        {/* COMPACT STUDENT INFORMATION */}
        <header className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">

          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs">

            <span className="font-bold text-indigo-700">
              Evaluate
            </span>

            <span className="text-gray-700">
              <b>Student:</b> {studentName}
            </span>

            <span className="text-gray-700">
              <b>Assessment:</b> {assessment?.title || "Assessment"}
            </span>

            <span className="text-gray-700">
              <b>Subject:</b> {assessment?.subject?.name || "Subject"}
            </span>

            <span className="rounded bg-indigo-50 px-2 py-1 font-bold text-indigo-700">
              {maximumMarks} Marks
            </span>

          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 rounded border px-3 py-1.5 text-xs hover:bg-gray-100"
          >
            Back
          </button>

        </header>

        {/* THREE COLUMN WORKSPACE */}
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(260px,0.8fr)]">

          {/* QUESTION PANEL */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white">

            <div className="flex shrink-0 items-center justify-between border-b bg-indigo-50 px-3 py-2">

              <h2 className="text-sm font-bold text-indigo-800">
                Question
              </h2>

              <span className="text-xs text-indigo-600">
                {questionType}
              </span>

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">

              <div className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                {questionText}
              </div>

            </div>

            <div className="shrink-0 border-t px-3 py-2 text-xs text-gray-500">
              Maximum Marks: <b>{maximumMarks}</b>
            </div>

          </section>

          {/* STUDENT ANSWER / AUTOMATED EVALUATION */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white">

            <div className="shrink-0 border-b bg-gray-50 px-3 py-2">

              <h2 className="text-sm font-bold text-gray-800">
                {isMCQ ? "Automated Evaluation" : "Student Answer"}
              </h2>

            </div>

            {isMCQ ? (

              <div className="flex min-h-0 flex-1 items-center justify-center p-3">

                <div className="text-center">
                  <div className="mb-2 text-3xl text-green-600">
                    ✓
                  </div>

                  <p className="text-sm font-semibold text-green-700">
                    Automatically Evaluated
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    No manual answer evaluation required.
                  </p>
                </div>

              </div>

            ) : (

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">

                <div className="whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-800">
                  {studentAnswerText || "No answer text available."}
                </div>

              </div>

            )}

          </section>

          {/* EVALUATION PANEL */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white">

            <div className="shrink-0 border-b bg-indigo-50 px-3 py-2">
              <h2 className="text-sm font-bold text-indigo-800">
                Teacher Evaluation
              </h2>
            </div>

            <form
              onSubmit={submitHandler}
              className="flex min-h-0 flex-1 flex-col overflow-hidden p-3"
            >

              {/* MARKS */}
              <div className="mb-3 shrink-0">

                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Marks Awarded
                </label>

                <div className="flex items-center gap-2">

                  <input
                    type="number"
                    min="0"
                    max={maximumMarks}
                    step="0.5"
                    required
                    value={marksAwarded}
                    onChange={(e) => setMarksAwarded(e.target.value)}
                    placeholder="Marks"
                    className="h-10 min-w-0 flex-1 rounded border border-gray-300 px-3 text-base font-bold outline-none focus:border-indigo-500"
                  />

                  <span className="text-sm font-semibold text-gray-500">
                    / {maximumMarks}
                  </span>

                </div>

              </div>

              {/* FEEDBACK */}
              <div className="mb-3 flex min-h-0 flex-1 flex-col">

                <label className="mb-1 shrink-0 text-xs font-semibold text-gray-700">
                  Feedback (Optional)
                </label>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={2000}
                  placeholder="Enter feedback..."
                  className="min-h-20 w-full flex-1 resize-none rounded border border-gray-300 p-2 text-sm outline-none focus:border-indigo-500"
                />

                <div className="mt-1 shrink-0 text-right text-xs text-gray-400">
                  {feedback.length}/2000
                </div>

              </div>

              {/* FIXED SUBMIT AREA */}
              <div className="shrink-0 border-t pt-2">

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 w-full rounded bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit Evaluation"}
                </button>

              </div>

            </form>

          </section>

        </main>

      </div>
    </div>
  );
};

export default AnswerEvaluationScreen;
