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

  const [
    createAnswerEvaluation,
    { isLoading },
  ] = useCreateAnswerEvaluationMutation();

  const student =
    studentAnswer?.student;

  const assessment =
    studentAnswer?.attempt?.assessment;

  const question =
    studentAnswer?.assessmentQuestion?.question ||
    studentAnswer?.question;

  const maximumMarks =
    student?.maximumMarks ||
    studentAnswer?.assessmentQuestion?.question?.marks ||
    studentAnswer?.question?.marks ||
    studentAnswer?.assessmentQuestion?.section?.marksPerQuestion ||
    0;

  const studentName =
    student?.user?.name ||
    "Unknown Student";

  const questionText =
    question?.questionText ||
    "Question not available";

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

    if (
      marksAwarded === "" ||
      marksAwarded === null
    ) {
      toast.error("Please enter marks awarded");
      return;
    }

    const numericMarks =
      Number(marksAwarded);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > maximumMarks
    ) {
      toast.error(
        `Marks must be between 0 and ${maximumMarks}`,
      );
      return;
    }

    try {
      await createAnswerEvaluation({
        studentAnswerId,
        marksAwarded: numericMarks,
        feedback: feedback.trim(),
      }).unwrap();

      toast.success(
        "Answer evaluated successfully",
      );

      navigate(-1);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to evaluate answer",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-6 shadow-2xl backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Evaluate Student Answer
              </h1>

              <p className="mt-1 text-sm text-white/70 sm:text-base">
                Review the answer and award marks
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
            >
              Back
            </button>
          </div>
        </div>

        {!studentAnswer && (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/20 p-6 text-center shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">
              Student answer not available
            </h2>

            <p className="mt-2 text-sm text-white/70">
              Please return to the pending evaluation list
              and select the answer again.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
            >
              Back to Evaluations
            </button>
          </div>
        )}

        {studentAnswer && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                      Student
                    </p>

                    <p className="mt-1 text-base font-semibold text-white">
                      {studentName}
                    </p>

                    {student?.admissionNumber && (
                      <p className="mt-1 text-xs text-white/50">
                        Admission No:{" "}
                        {student.admissionNumber}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                      Assessment
                    </p>

                    <p className="mt-1 text-base font-semibold text-white">
                      {assessment?.title ||
                        "Assessment"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                      Subject
                    </p>

                    <p className="mt-1 text-base font-semibold text-white">
                      {assessment?.subject?.name ||
                        "Subject"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                      Maximum Marks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                      {maximumMarks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="mb-5">
                  <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                    Question
                  </span>

                  <h2 className="mt-4 text-lg font-semibold leading-7 text-white sm:text-xl">
                    {questionText}
                  </h2>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-indigo-100/70">
                    Student Answer
                  </p>

                  <div className="min-h-32 whitespace-pre-wrap text-sm leading-7 text-white/90">
                    {studentAnswerText ||
                      "No answer text available."}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <form
                onSubmit={submitHandler}
                className="sticky top-6 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Evaluation
                  </h2>

                  <p className="mt-1 text-sm text-white/60">
                    Award marks based on the student's
                    answer.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <label className="text-sm font-medium text-indigo-100">
                    Marks Awarded
                  </label>

                  <div className="mt-2 flex items-center gap-3">
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
                      placeholder="0"
                      className="h-12 w-full rounded-lg bg-white px-4 text-lg font-semibold text-gray-800 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
                    />

                    <span className="text-lg font-semibold text-white/70">
                      / {maximumMarks}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <label className="text-sm font-medium text-indigo-100">
                    Feedback
                  </label>

                  <textarea
                    value={feedback}
                    onChange={(e) =>
                      setFeedback(e.target.value)
                    }
                    maxLength={2000}
                    rows={7}
                    placeholder="Enter optional feedback for the student..."
                    className="mt-2 w-full resize-none rounded-lg bg-white px-4 py-3 text-sm leading-6 text-gray-800 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
                  />

                  <div className="mt-2 text-right text-xs text-white/50">
                    {feedback.length}/2000
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "Submitting Evaluation..."
                    : "Submit Evaluation"}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-white/50">
                  Once submitted, this answer will be
                  marked as evaluated.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerEvaluationScreen;