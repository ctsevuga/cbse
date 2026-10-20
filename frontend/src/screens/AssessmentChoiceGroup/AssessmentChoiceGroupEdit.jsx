import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Hash,
  Layers3,
  ListChecks,
  Loader2,
  Save,
  Target,
  Trophy,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  useGetAssessmentChoiceGroupDetailsQuery,
  useUpdateAssessmentChoiceGroupMutation,
} from "../../slices/assessmentChoiceGroupApiSlice";
import {
  useGetAssessmentsQuery,
} from "../../slices/assessmentApiSlice";
import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const AssessmentChoiceGroupEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: choiceGroup,
    isLoading: isLoadingChoiceGroup,
    isError: isChoiceGroupError,
    error: choiceGroupError,
  } = useGetAssessmentChoiceGroupDetailsQuery(id);

  const {
    data: assessmentsData,
    isLoading: isLoadingAssessments,
  } = useGetAssessmentsQuery();

  const assessments = useMemo(() => {
    if (Array.isArray(assessmentsData)) {
      return assessmentsData;
    }

    if (Array.isArray(assessmentsData?.assessments)) {
      return assessmentsData.assessments;
    }

    if (Array.isArray(assessmentsData?.data)) {
      return assessmentsData.data;
    }

    return [];
  }, [assessmentsData]);

  const methods = useForm({
    defaultValues: {
      section: "",
      name: "",
      code: "",
      selectionMode: "ANY",
      requiredQuestions: 1,
      maxQuestions: "",
      directions: "",
      totalMarks: "",
      order: "",
      isActive: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
      isDirty,
    },
  } = methods;

  const assessmentId =
    choiceGroup?.assessment?._id ||
    choiceGroup?.assessment;

  const selectedSection =
    watch("section");

  const selectedMode =
    watch("selectionMode");

  const requiredQuestions =
    watch("requiredQuestions");

  const maxQuestions =
    watch("maxQuestions");

  const {
    data: sectionsData,
    isLoading: isLoadingSections,
  } = useGetSectionsQuery(
    assessmentId,
    {
      skip: !assessmentId,
    },
  );

  const sections = useMemo(() => {
    if (Array.isArray(sectionsData)) {
      return sectionsData;
    }

    if (Array.isArray(sectionsData?.sections)) {
      return sectionsData.sections;
    }

    if (Array.isArray(sectionsData?.data)) {
      return sectionsData.data;
    }

    return [];
  }, [sectionsData]);

  const [
    updateAssessmentChoiceGroup,
    {
      isLoading: isUpdating,
    },
  ] =
    useUpdateAssessmentChoiceGroupMutation();

  useEffect(() => {
    if (!choiceGroup) {
      return;
    }

    reset({
      section:
        choiceGroup.section?._id ||
        choiceGroup.section ||
        "",
      name: choiceGroup.name || "",
      code: choiceGroup.code || "",
      selectionMode:
        choiceGroup.selectionMode || "ANY",
      requiredQuestions:
        choiceGroup.requiredQuestions || 1,
      maxQuestions:
        choiceGroup.maxQuestions ?? "",
      directions:
        choiceGroup.directions || "",
      totalMarks:
        choiceGroup.totalMarks ?? "",
      order:
        choiceGroup.order ?? "",
      isActive:
        choiceGroup.isActive !== false,
    });
  }, [choiceGroup, reset]);

  const getAssessmentName = () => {
    if (
      choiceGroup?.assessment &&
      typeof choiceGroup.assessment === "object"
    ) {
      return (
        choiceGroup.assessment.name ||
        choiceGroup.assessment.title ||
        choiceGroup.assessment.assessmentName ||
        "Assessment"
      );
    }

    const assessment = assessments.find(
      (item) =>
        item._id === assessmentId,
    );

    return (
      assessment?.name ||
      assessment?.title ||
      assessment?.assessmentName ||
      "Assessment"
    );
  };

  const getSectionName = (section) => {
    if (!section) {
      return "";
    }

    if (typeof section === "object") {
      return (
        section.name ||
        section.title ||
        section.sectionName ||
        "Untitled Section"
      );
    }

    const sectionData = sections.find(
      (item) =>
        item._id === section,
    );

    return (
      sectionData?.name ||
      sectionData?.title ||
      sectionData?.sectionName ||
      ""
    );
  };

  const onSubmit = async (data) => {
    if (
      data.maxQuestions !== "" &&
      Number(data.requiredQuestions) >
        Number(data.maxQuestions)
    ) {
      toast.error(
        "Required questions cannot be greater than maximum questions.",
      );
      return;
    }

    if (
      data.selectionMode === "EXACT" &&
      data.maxQuestions !== "" &&
      Number(data.requiredQuestions) >
        Number(data.maxQuestions)
    ) {
      toast.error(
        "Required questions cannot be greater than maximum questions.",
      );
      return;
    }

    const payload = {
      section:
        data.section || null,
      name: data.name.trim(),
      code: data.code.trim(),
      selectionMode:
        data.selectionMode,
      requiredQuestions:
        Number(data.requiredQuestions),
      maxQuestions:
        data.maxQuestions !== ""
          ? Number(data.maxQuestions)
          : undefined,
      directions:
        data.directions.trim(),
      totalMarks:
        data.totalMarks !== ""
          ? Number(data.totalMarks)
          : undefined,
      order:
        data.order !== ""
          ? Number(data.order)
          : undefined,
      isActive:
        Boolean(data.isActive),
    };

    try {
      await updateAssessmentChoiceGroup({
        id,
        ...payload,
      }).unwrap();

      toast.success(
        "Assessment choice group updated successfully.",
      );

      navigate(
        `/assessment-choice-groups/${id}`,
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Unable to update assessment choice group.",
      );
    }
  };

  const getSelectionHelp = () => {
    switch (selectedMode) {
      case "EXACT":
        return `Students must answer exactly ${requiredQuestions || 0} question(s).`;

      case "AT_LEAST":
        return `Students must answer at least ${requiredQuestions || 0} question(s).`;

      case "AT_MOST":
        return `Students can answer at most ${requiredQuestions || 0} question(s).`;

      case "ANY":
      default:
        if (maxQuestions) {
          return `Students can answer any ${requiredQuestions || 0} question(s) from a maximum of ${maxQuestions}.`;
        }

        return `Students can answer any ${requiredQuestions || 0} question(s).`;
    }
  };

  if (
    isLoadingChoiceGroup ||
    isLoadingAssessments
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Loading choice group
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Preparing the choice group for editing.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    isChoiceGroupError ||
    !choiceGroup
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/assessment-choice-groups"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Choice Groups
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Unable to load choice group
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {choiceGroupError?.data?.message ||
                "The requested choice group could not be found."}
            </p>

            <Link
              to="/assessment-choice-groups"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Back to Choice Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={`/assessment-choice-groups/${id}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Choice Group
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update the selection rules and configuration.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <CheckCircle2
                className={`h-4 w-4 ${
                  choiceGroup.isActive !== false
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              />

              <span className="text-sm font-medium text-slate-700">
                {choiceGroup.isActive !== false
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-7 text-white sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <ListChecks className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-indigo-100">
                      Editing
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {choiceGroup.name}
                    </h2>

                    <p className="mt-2 text-sm text-indigo-100">
                      {choiceGroup.code
                        ? `Code: ${choiceGroup.code}`
                        : "No code assigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Assessment
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    The assessment is permanently associated with this choice group.
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                        Assessment
                      </p>

                      <p className="mt-1 truncate font-semibold text-slate-900">
                        {getAssessmentName()}
                      </p>
                    </div>

                    <div className="ml-auto hidden rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:block">
                      Immutable
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="section"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Section
                  </label>

                  <div className="relative">
                    <Layers3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      id="section"
                      {...register("section")}
                      disabled={isLoadingSections}
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        Assessment-wide
                      </option>

                      {sections.map(
                        (section) => (
                          <option
                            key={section._id}
                            value={section._id}
                          >
                            {getSectionName(
                              section,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Leave this as Assessment-wide if the choice group should not be limited to a specific section.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Basic Information
                    </h3>

                    <p className="text-sm text-slate-500">
                      Define the identity of this choice group.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Example: Attempt Any 2"
                    {...register("name", {
                      required:
                        "Name is required",
                      maxLength: {
                        value: 150,
                        message:
                          "Name cannot exceed 150 characters.",
                      },
                    })}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Code
                  </label>

                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="code"
                      type="text"
                      placeholder="Example: CG-01"
                      {...register("code", {
                        maxLength: {
                          value: 50,
                          message:
                            "Code cannot exceed 50 characters.",
                        },
                      })}
                      className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm uppercase text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${
                        errors.code
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>

                  {errors.code && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.code.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Selection Rules
                    </h3>

                    <p className="text-sm text-slate-500">
                      Configure how many questions students can select.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="selectionMode"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Selection Mode
                    </label>

                    <select
                      id="selectionMode"
                      {...register(
                        "selectionMode",
                      )}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="ANY">
                        Any
                      </option>
                      <option value="EXACT">
                        Exactly
                      </option>
                      <option value="AT_LEAST">
                        At least
                      </option>
                      <option value="AT_MOST">
                        At most
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="requiredQuestions"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Required Questions
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="requiredQuestions"
                      type="number"
                      min="1"
                      {...register(
                        "requiredQuestions",
                        {
                          required:
                            "Required questions is required.",
                          min: {
                            value: 1,
                            message:
                              "Must be at least 1.",
                          },
                          valueAsNumber: true,
                        },
                      )}
                      className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-4 focus:ring-indigo-500/10 ${
                        errors.requiredQuestions
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />

                    {errors.requiredQuestions && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {
                          errors
                            .requiredQuestions
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="maxQuestions"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Maximum Questions
                    </label>

                    <input
                      id="maxQuestions"
                      type="number"
                      min="1"
                      placeholder="Optional"
                      {...register(
                        "maxQuestions",
                        {
                          validate:
                            (value) => {
                              if (
                                value === ""
                              ) {
                                return true;
                              }

                              if (
                                Number(value) <
                                Number(
                                  requiredQuestions,
                                )
                              ) {
                                return "Maximum must be greater than or equal to required questions.";
                              }

                              return true;
                            },
                        },
                      )}
                      className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-4 focus:ring-indigo-500/10 ${
                        errors.maxQuestions
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />

                    {errors.maxQuestions && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {
                          errors.maxQuestions
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <ListChecks className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-indigo-900">
                        Selection preview
                      </p>

                      <p className="mt-1 text-sm leading-6 text-indigo-700">
                        {getSelectionHelp()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Marks & Display
                    </h3>

                    <p className="text-sm text-slate-500">
                      Configure marks and display order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="totalMarks"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Total Marks
                  </label>

                  <input
                    id="totalMarks"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    {...register(
                      "totalMarks",
                      {
                        validate:
                          (value) => {
                            if (
                              value === ""
                            ) {
                              return true;
                            }

                            if (
                              Number(value) <
                              0
                            ) {
                              return "Marks cannot be negative.";
                            }

                            return true;
                          },
                      },
                    )}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-4 focus:ring-indigo-500/10 ${
                      errors.totalMarks
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />

                  {errors.totalMarks && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.totalMarks.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Display Order
                  </label>

                  <input
                    id="order"
                    type="number"
                    min="1"
                    placeholder="Optional"
                    {...register(
                      "order",
                      {
                        validate:
                          (value) => {
                            if (
                              value === ""
                            ) {
                              return true;
                            }

                            if (
                              Number(value) <
                              1
                            ) {
                              return "Order must be at least 1.";
                            }

                            return true;
                          },
                      },
                    )}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-4 focus:ring-indigo-500/10 ${
                      errors.order
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />

                  {errors.order && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.order.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Directions
                    </h3>

                    <p className="text-sm text-slate-500">
                      Optional instructions displayed to students.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <textarea
                  id="directions"
                  rows="5"
                  placeholder="Example: Attempt any two questions."
                  {...register(
                    "directions",
                    {
                      maxLength: {
                        value: 1000,
                        message:
                          "Directions cannot exceed 1000 characters.",
                      },
                    },
                  )}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${
                    errors.directions
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500"
                  }`}
                />

                {errors.directions && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.directions.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Active Choice Group
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                      Active choice groups can be used when assigning questions to an assessment.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-4 z-20">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden text-sm text-slate-500 sm:block">
                  {isDirty
                    ? "You have unsaved changes."
                    : "No changes have been made."}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:ml-auto">
                  <Link
                    to={`/assessment-choice-groups/${id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default AssessmentChoiceGroupEdit;
