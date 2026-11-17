import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateAssessmentQuestionMutation } from "../../slices/assessmentQuestionApiSlice";

import { useGetMyAssessmentsQuery } from "../../slices/assessmentApiSlice";

import { useGetAssessmentSectionsQuery } from "../../slices/assessmentSectionApiSlice";
import { useGetSubjectsQuery } from "../../slices/subjectApiSlice";
import { useGetChaptersQuery } from "../../slices/chapterApiSlice";
import { useGetAssignmentQuestionsQuery } from "../../slices/questionApiSlice";

import TeacherQuestionPreview from "../../components/questions/TeacherQuestionPreview";

const PAGE_SIZE = 10;

const QUESTION_TYPES = [
  "MCQ",
  "DESCRIPTIVE",
  "ASSERTION_REASON",
  "CASE_STUDY",
  "FILL_BLANK",
  "MATCHING",
  "TRUE_FALSE",
];

const getArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getAssessmentName = (item) =>
  item?.name ||
  item?.title ||
  item?.assessmentName ||
  item?.code ||
  "Unnamed Assessment";

const getSectionName = (item) =>
  `${item?.sectionCode || ""} - ${item?.title || "Untitled Section"}`;

const getQuestionText = (item) => {
  const value =
    item?.questionText ??
    item?.text ??
    item?.content ??
    item?.title ??
    item?.name ??
    item?.question ??
    "Untitled question";

  if (typeof value === "string") return value;

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((part) =>
        typeof part === "string" ? part : part?.text || part?.content || "",
      )
      .filter(Boolean)
      .join(" ");
  }

  if (value && typeof value === "object") {
    if (typeof value.text === "string") {
      return value.text;
    }

    if (typeof value.content === "string") {
      return value.content;
    }

    if (typeof value.html === "string") {
      return value.html;
    }

    if (Array.isArray(value.content)) {
      const extractText = (nodes) =>
        nodes
          .map((node) => {
            if (typeof node === "string") {
              return node;
            }

            if (node?.text) return node.text;

            if (Array.isArray(node?.content)) {
              return extractText(node.content);
            }

            return "";
          })
          .filter(Boolean)
          .join(" ");

      return extractText(value.content) || "Question content";
    }

    return JSON.stringify(value);
  }

  return "Untitled question";
};

const getPaginatedQuestions = (data) => {
  const questions = getArray(data, ["questions", "data", "results"]);

  return {
    questions,
    total: Number(
      data?.pagination?.totalQuestions ??
        data?.totalQuestions ??
        data?.total ??
        questions.length,
    ),
    page: Number(data?.pagination?.page ?? data?.page ?? 1),
    pages: Number(
      data?.pagination?.totalPages ?? data?.totalPages ?? data?.pages ?? 1,
    ),
  };
};

const CreateAssessmentQuestionScreen = () => {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState("");
  const [section, setSection] = useState("");

  // Keep selected IDs when navigating between result pages.
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [marks, setMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [questionGroup, setQuestionGroup] = useState("");

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");

  // Server-side search and filters.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionMarks, setQuestionMarks] = useState("");
  const [page, setPage] = useState(1);

  const [createAssessmentQuestion, { isLoading: isAssigning }] =
    useCreateAssessmentQuestionMutation();

  const {
  data: assessmentsData,
  isLoading: assessmentsLoading,
  isError: assessmentsError,
} = useGetMyAssessmentsQuery();

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useGetAssessmentSectionsQuery(assessment ? { assessment } : undefined, {
    skip: !assessment,
  });

  // Debounce the search input by 350 milliseconds.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);
  const { data: subjectsData, isLoading: subjectsLoading } =
    useGetSubjectsQuery();

  const subjects = getArray(subjectsData, ["subjects"]);

  // Load chapters belonging to the selected subject.
  const { data: chaptersData, isLoading: chaptersLoading } =
    useGetChaptersQuery(subject ? { subject } : undefined, {
      skip: !subject,
    });

  const chapters = getArray(chaptersData, ["chapters"]);
  // All question filtering and pagination happen on the server.
  const {
    data: questionsData,
    isLoading: questionsLoading,
    isFetching: questionsFetching,
    isError: questionsError,
  } = useGetAssignmentQuestionsQuery(
    {
      page,
      limit: PAGE_SIZE,
      ...(search ? { keyword: search } : {}),
      ...(subject ? { subject } : {}),
      ...(chapter ? { chapter } : {}),
      ...(topic ? { topic } : {}),
      ...(questionType ? { questionType } : {}),
      ...(questionMarks !== "" ? { marks: questionMarks } : {}),
      isActive: true,
      status: "APPROVED",
    },
    {
      skip: !section,
    },
  );

  const assessments = getArray(assessmentsData, ["assessments"]).filter(
    (item) => String(item?.status || "").toUpperCase() === "DRAFT",
  );

  const sections = getArray(sectionsData, ["sections"]);

  const pagination = useMemo(
    () => getPaginatedQuestions(questionsData),
    [questionsData],
  );

  const questions = pagination.questions;
  const totalQuestions = pagination.total;
  const totalPages = Math.max(1, pagination.pages);

  const selectedSection = sections.find((item) => item._id === section);

  const requiredCount = Number(selectedSection?.numberOfQuestions || 0);

  const selectedQuestionSet = useMemo(
    () => new Set(selectedQuestions),
    [selectedQuestions],
  );

  // Reset section-related data when the assessment changes.
  useEffect(() => {
    setSection("");
    setSelectedQuestions([]);
    setMarks("");
    setNegativeMarks("0");
    setQuestionGroup("");
    setSearchInput("");
    setSearch("");
    setQuestionType("");
    setQuestionMarks("");
    setPage(1);
  }, [assessment]);
  
  // Clear the selected section if it is no longer available.
  useEffect(() => {
    if (section && !sections.some((item) => item._id === section)) {
      setSection("");
      setSelectedQuestions([]);
    }
  }, [sections, section]);

  // Initialize marks and question type from the selected section.
  useEffect(() => {
    if (!selectedSection) return;

    setMarks(String(selectedSection.marksPerQuestion ?? ""));
    setSelectedQuestions([]);
    setQuestionType(selectedSection.questionType || "");
    setQuestionMarks("");
    setSearchInput("");
    setSearch("");
    setPage(1);
    setSubject("");
    setChapter("");
    setTopic("");
  }, [
    section,
    selectedSection?.marksPerQuestion,
    selectedSection?.questionType,
  ]);

  // Restart pagination whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [questionType, questionMarks]);

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((current) => {
      if (current.includes(questionId)) {
        return current.filter((id) => id !== questionId);
      }

      if (current.length >= requiredCount) {
        toast.warning(`This section requires only ${requiredCount} questions.`);
        return current;
      }

      return [...current, questionId];
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!assessment) {
      toast.error("Please select an assessment.");
      return;
    }

    if (!section || !selectedSection) {
      toast.error("Please select an assessment section.");
      return;
    }

    if (requiredCount < 1 || selectedQuestions.length !== requiredCount) {
      toast.error(
        `Select exactly ${requiredCount} questions. You selected ${selectedQuestions.length}.`,
      );
      return;
    }

    if (marks === "" || !Number.isFinite(Number(marks)) || Number(marks) < 0) {
      toast.error("Please enter valid question marks.");
      return;
    }

    if (Number(marks) !== Number(selectedSection.marksPerQuestion)) {
      toast.error(
        `Marks must match the section requirement (${selectedSection.marksPerQuestion}).`,
      );
      return;
    }

    if (
      negativeMarks === "" ||
      !Number.isFinite(Number(negativeMarks)) ||
      Number(negativeMarks) < 0
    ) {
      toast.error("Please enter valid negative marks.");
      return;
    }

    const confirmed = window.confirm(
      `Assign ${selectedQuestions.length} questions to ${getSectionName(selectedSection)}?`,
    );

    if (!confirmed) return;

    let succeeded = 0;
    const failures = [];

    for (let index = 0; index < selectedQuestions.length; index++) {
      const questionId = selectedQuestions[index];

      try {
        await createAssessmentQuestion({
          assessment,
          section,
          question: questionId,

          // Keep order because the current schema requires it.
          // This does not perform order-uniqueness verification.
          order: index + 1,

          marks: Number(marks),
          negativeMarks: Number(negativeMarks),

          ...(questionGroup.trim()
            ? { questionGroup: questionGroup.trim() }
            : {}),
        }).unwrap();

        succeeded++;
      } catch (err) {
        failures.push({
          questionId,
          message: err?.data?.message || err?.error || "Unknown error",
        });
      }
    }

    if (failures.length === 0) {
      toast.success(`Successfully assigned all ${succeeded} questions.`);

      // Keep the teacher on this screen and allow assigning questions
      // to another section of the same assessment.
      setSection("");
      setSelectedQuestions([]);
      setMarks("");
      setNegativeMarks("0");
      setQuestionGroup("");
      setSearchInput("");
      setSearch("");
      setQuestionType("");
      setQuestionMarks("");
      setSubject("");
      setChapter("");
      setTopic("");
      setPage(1);
      return;
    }

    if (succeeded > 0) {
      toast.warning(
        `${succeeded} questions assigned; ${failures.length} failed. Check the console for details.`,
      );
    } else {
      toast.error(failures[0]?.message || "Unable to assign questions.");
    }

    console.error("Question assignment failures:", failures);
  };

  const isFetchingQuestions = questionsLoading || questionsFetching;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
      <div className="w-full max-w-5xl rounded-2xl border border-white/20 bg-white/10 px-5 py-7 shadow-2xl backdrop-blur-xl sm:px-8">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Assign Assessment Questions
          </h2>

          <p className="mt-2 text-white/80">
            Search, filter, and select questions for each assessment section.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Assessment
              </label>

              <select
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                disabled={assessmentsLoading || isAssigning}
                required
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-800"
              >
                <option value="">Select assessment</option>

                {assessments.map((item) => (
                  <option key={item._id} value={item._id}>
                    {getAssessmentName(item)}
                  </option>
                ))}
              </select>

              {assessmentsError && (
                <p className="mt-2 text-sm text-red-200">
                  Unable to load assessments.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Assessment Section
              </label>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!assessment || sectionsLoading || isAssigning}
                required
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-800"
              >
                <option value="">
                  {!assessment
                    ? "Select assessment first"
                    : sectionsLoading
                      ? "Loading sections..."
                      : "Select assessment section"}
                </option>

                {sections.map((item) => (
                  <option key={item._id} value={item._id}>
                    {getSectionName(item)}
                  </option>
                ))}
              </select>

              {sectionsError && (
                <p className="mt-2 text-sm text-red-200">
                  Unable to load assessment sections.
                </p>
              )}
            </div>
          </div>

          {selectedSection && (
            <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/20 p-4">
              <h3 className="font-semibold text-white">
                {getSectionName(selectedSection)}
              </h3>

              <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-white/90 sm:grid-cols-4">
                <p>Type: {selectedSection.questionType}</p>

                <p>Required: {requiredCount}</p>

                <p>Marks/question: {selectedSection.marksPerQuestion}</p>

                <p>Total marks: {selectedSection.totalMarks}</p>
              </div>

              <p className="mt-3 text-lg font-bold text-white">
                Selected: {selectedQuestions.length}/{requiredCount}
              </p>
            </div>
          )}

          {section && selectedSection && (
            <div className="space-y-5 rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Select Questions
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Selected questions remain selected when you search or change
                    pages.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-800">
                  {selectedQuestions.length}/{requiredCount} selected
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Subject */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subject
                  </label>

                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setChapter("");
                      setTopic("");
                      setPage(1);
                    }}
                    disabled={isAssigning || subjectsLoading}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                  >
                    <option value="">All subjects</option>

                    {subjects.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name || item.title || item.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Chapter
                  </label>

                  <select
                    value={chapter}
                    onChange={(e) => {
                      setChapter(e.target.value);
                      setTopic("");
                      setPage(1);
                    }}
                    disabled={!subject || chaptersLoading || isAssigning}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                  >
                    <option value="">
                      {!subject
                        ? "Select subject first"
                        : chaptersLoading
                          ? "Loading chapters..."
                          : "All chapters"}
                    </option>

                    {chapters.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name ||
                          item.title ||
                          item.chapterName ||
                          "Untitled chapter"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search question */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Search question
                  </label>

                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search question text..."
                    disabled={isAssigning}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Question type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Question type
                  </label>

                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    disabled={isAssigning}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                  >
                    <option value="">All question types</option>

                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marks */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Marks
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={questionMarks}
                    onChange={(e) => setQuestionMarks(e.target.value)}
                    placeholder="Any marks"
                    disabled={isAssigning}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                <p>{totalQuestions} matching question(s)</p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setQuestionType(selectedSection.questionType || "");
                    setQuestionMarks("");
                    setSubject("");
                    setChapter("");
                    setTopic("");
                    setPage(1);
                  }}
                  disabled={isAssigning}
                  className="font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Reset filters
                </button>
              </div>

              {questionsError ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                  Unable to load questions. Please try again.
                </div>
              ) : isFetchingQuestions ? (
                <div className="py-10 text-center text-gray-600">
                  Loading questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
                  No questions match your search and filters. Try another search
                  or reset the filters.
                </div>
              ) : (
                <div className="space-y-2">
  {questions.map((item, index) => {
    const questionId = item._id;
    const isSelected = selectedQuestionSet.has(questionId);

    const isDisabled =
      !isSelected &&
      selectedQuestions.length >= requiredCount;

    return (
      <div
        key={questionId}
        className={`rounded-xl border transition-all ${
          isSelected
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start gap-3 p-3">

          <input
            type="checkbox"
            checked={isSelected}
            disabled={isAssigning || isDisabled}
            onChange={() => toggleQuestion(questionId)}
            className="mt-1 h-5 w-5 shrink-0 accent-indigo-600"
          />

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-sm font-semibold text-gray-900">
                Question {((page - 1) * PAGE_SIZE) + index + 1}
              </span>

              {item.questionType && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                  {item.questionType.replaceAll("_", " ")}
                </span>
              )}

              <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                {item.marks} mark(s)
              </span>

              {isSelected && (
                <span className="text-xs font-semibold text-indigo-700">
                  Selected
                </span>
              )}

            </div>

            {/* Compact question summary */}

            {/* Compact question preview */}

{/* Compact mathematical question preview */}

<div className="mt-2 overflow-hidden text-sm text-gray-700">
  <TeacherQuestionPreview
    question={item}
    compact
  />
</div>

            {/* Expand full question preview only when required */}

            <details className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                View question and options
              </summary>

              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <TeacherQuestionPreview question={item} />
              </div>
            </details>

          </div>
        </div>
      </div>
    );
  })}
</div>
              )}

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page <= 1 || isFetchingQuestions || isAssigning}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={
                      page >= totalPages || isFetchingQuestions || isAssigning
                    }
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Selection progress */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${
                        requiredCount > 0
                          ? Math.min(
                              100,
                              (selectedQuestions.length / requiredCount) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-700">
                  {selectedQuestions.length === requiredCount &&
                  requiredCount > 0
                    ? "Required question count reached."
                    : `${Math.max(
                        0,
                        requiredCount - selectedQuestions.length,
                      )} more question(s) to select.`}
                </p>
              </div>
            </div>
          )}

          {/* Marks and optional question group */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white">
                Marks per question
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                required
                disabled={isAssigning}
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white">
                Negative marks
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
                required
                disabled={isAssigning}
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white">
                Question Group (optional)
              </label>

              <input
                type="text"
                value={questionGroup}
                onChange={(e) => setQuestionGroup(e.target.value)}
                disabled={isAssigning}
                placeholder="Question group ID"
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-800"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isAssigning}
              className="h-12 flex-1 rounded-xl border border-white/30 bg-white/10 font-semibold text-white hover:bg-white/20 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isAssigning ||
                !assessment ||
                !section ||
                requiredCount < 1 ||
                selectedQuestions.length !== requiredCount ||
                isFetchingQuestions
              }
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 font-semibold text-white disabled:opacity-50"
            >
              {isAssigning
                ? "Assigning Questions..."
                : `Assign ${selectedQuestions.length} Question(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentQuestionScreen;
