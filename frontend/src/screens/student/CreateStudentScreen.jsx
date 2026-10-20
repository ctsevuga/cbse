import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Hash,
  IdCard,
  Loader2,
  MapPin,
  School,
  User,
  Users,
  UserRound,
  VenusAndMars,
  X,
  BookOpen,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { useCreateStudentMutation } from "../../slices/studentApiSlice";
import {
  useGetSubjectCombinationsQuery,
} from "../../slices/subjectCombinationApiSlice";

const STREAM_OPTIONS = [
  {
    value: "PCM-SCIENCE",
    label: "PCM Science",
  },
  {
    value: "PCB-SCIENCE",
    label: "PCB Science",
  },
  {
    value: "PCMB-SCIENCE",
    label: "PCMB Science",
  },
  {
    value: "COMMERCE",
    label: "Commerce",
  },
];

const SUBJECT_TYPES = [
  {
    value: "CORE",
    label: "Core",
  },
  {
    value: "ELECTIVE",
    label: "Elective",
  },
];

const emptySubject = {
  subject: "",
  type: "",
};

const CreateStudentScreen = () => {
  const navigate = useNavigate();

  const [createStudent, { isLoading }] =
    useCreateStudentMutation();

  /*
   * Subject combinations are used only to determine the
   * available subjects and selection rules.
   *
   * The selected combination itself is NOT sent to the
   * student API and is NOT stored on the Student model.
   */
  const {
    data: subjectCombinationsData,
    isLoading: isLoadingCombinations,
  } = useGetSubjectCombinationsQuery();

  const [formData, setFormData] = useState({
    user: "",
    school: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "",
    academicYear: "",
    class: "",
    section: "",
    stream: "",
    subjects: [],
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo") || "null",
  );

  const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";

  /*
   * Normalize subject combinations response.
   */
  const subjectCombinations = useMemo(() => {
    if (Array.isArray(subjectCombinationsData)) {
      return subjectCombinationsData;
    }

    return (
      subjectCombinationsData?.subjectCombinations || []
    );
  }, [subjectCombinationsData]);

  /*
   * Find the combination configured for the selected stream.
   *
   * The combination is used only as configuration/rules.
   * It is never submitted as part of the Student payload.
   */
  const getStreamId = (stream) => {
  if (!stream) return "";

  if (typeof stream === "object") {
    return String(stream._id || stream.id || "");
  }

  return String(stream);
};

const selectedCombination = useMemo(() => {
  const selectedStreamId = String(formData.stream || "");

  if (!selectedStreamId) {
    return null;
  }

  const combination = subjectCombinations.find((item) => {
    const stream = item.stream;

    const streamId =
      stream && typeof stream === "object"
        ? stream._id
        : stream;

    return String(streamId || "") === selectedStreamId;
  });

  return combination || null;
}, [formData.stream, subjectCombinations]);

  /*
   * Available subjects from the selected combination.
   *
   * Supports the revised SubjectCombination structure:
   *
   * subjects: [
   *   {
   *     subject: {...},
   *     type: "CORE"
   *   }
   * ]
   */
  const availableSubjects = useMemo(() => {
    if (!selectedCombination?.subjects) {
      return [];
    }

    return selectedCombination.subjects;
  }, [selectedCombination]);

  /*
   * Subject statistics.
   */
  const coreSubjects = formData.subjects.filter(
    (item) => item.type === "CORE",
  );

  const electiveSubjects = formData.subjects.filter(
    (item) => item.type === "ELECTIVE",
  );

  const minimumElectives =
    Number(selectedCombination?.minimumElectives) || 0;

  const maximumElectives =
    Number(selectedCombination?.maximumElectives) ||
    Number.MAX_SAFE_INTEGER;

  /*
   * ----------------------------------------------------------
   * Input helpers
   * ----------------------------------------------------------
   */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    /*
     * Changing stream changes the available SubjectCombination
     * configuration. Clear selected subjects so stale subjects
     * cannot be submitted for the new stream.
     */
    if (name === "stream") {
      setFormData((prev) => ({
        ...prev,
        stream: value,
        subjects: [],
      }));

      setErrors((prev) => ({
        ...prev,
        stream: "",
        subjects: "",
      }));
    }
  };

  const addSubject = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          ...emptySubject,
        },
      ],
    }));

    setErrors((prev) => ({
      ...prev,
      subjects: "",
    }));
  };

  const removeSubject = (index) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter(
        (_, subjectIndex) =>
          subjectIndex !== index,
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      subjects: "",
    }));
  };

  const updateSubject = (
    index,
    field,
    value,
  ) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map(
        (item, subjectIndex) =>
          subjectIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item,
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      subjects: "",
    }));
  };

  /*
   * ----------------------------------------------------------
   * Validation
   * ----------------------------------------------------------
   */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user.trim()) {
      newErrors.user =
        "Student user ID is required";
    }

    if (
      isSuperAdmin &&
      !formData.school.trim()
    ) {
      newErrors.school =
        "School ID is required for SUPER_ADMIN";
    }

    if (!formData.admissionNumber.trim()) {
      newErrors.admissionNumber =
        "Admission number is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth =
        "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender =
        "Please select gender";
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear =
        "Academic year ID is required";
    }

    if (!formData.class.trim()) {
      newErrors.class =
        "Class ID is required";
    }

    if (!formData.section.trim()) {
      newErrors.section =
        "Section ID is required";
    }

    if (!formData.stream) {
      newErrors.stream =
        "Please select a stream";
    }

    /*
     * --------------------------------------------------------
     * Subject validation
     * --------------------------------------------------------
     */

    if (formData.subjects.length === 0) {
      newErrors.subjects =
        "Select at least one subject.";
    } else {
      const hasCoreSubject =
        formData.subjects.some(
          (item) => item.type === "CORE",
        );

      if (!hasCoreSubject) {
        newErrors.subjects =
          "At least one core subject is required.";
      }

      const hasIncompleteSubject =
        formData.subjects.some(
          (item) =>
            !item.subject ||
            !item.type,
        );

      if (hasIncompleteSubject) {
        newErrors.subjects =
          "Every selected subject must have a subject and type.";
      }

      /*
       * Prevent duplicate subjects.
       */
      const subjectIds =
        formData.subjects
          .map((item) => item.subject)
          .filter(Boolean);

      const uniqueSubjectIds =
        new Set(subjectIds);

      if (
        uniqueSubjectIds.size !==
        subjectIds.length
      ) {
        newErrors.subjects =
          "The same subject cannot be selected more than once.";
      }

      /*
       * If a combination exists, make sure selected
       * subjects belong to that combination.
       */
      if (
        selectedCombination &&
        availableSubjects.length > 0
      ) {
        const allowedSubjectIds =
          availableSubjects
            .map(
              (item) =>
                item.subject?._id ||
                item.subject,
            )
            .filter(Boolean)
            .map(String);

        const invalidSubject =
          formData.subjects.find(
            (item) =>
              item.subject &&
              !allowedSubjectIds.includes(
                String(item.subject),
              ),
          );

        if (invalidSubject) {
          newErrors.subjects =
            "One or more selected subjects are not available for this stream.";
        }
      }

      /*
       * Validate that the selected type matches the
       * SubjectCombination configuration.
       */
      if (
        selectedCombination &&
        availableSubjects.length > 0
      ) {
        const hasInvalidType =
          formData.subjects.some(
            (selected) => {
              const configured =
                availableSubjects.find(
                  (item) =>
                    String(
                      item.subject?._id ||
                        item.subject,
                    ) ===
                    String(selected.subject),
                );

              return (
                configured &&
                configured.type &&
                configured.type !==
                  selected.type
              );
            },
          );

        if (hasInvalidType) {
          newErrors.subjects =
            "The subject type must match the configured CORE/ELECTIVE classification.";
        }
      }

      /*
       * Elective rules.
       */
      const electiveCount =
        formData.subjects.filter(
          (item) =>
            item.type === "ELECTIVE",
        ).length;

      if (
        electiveCount <
        minimumElectives
      ) {
        newErrors.subjects = `At least ${minimumElectives} elective subject${
          minimumElectives !== 1
            ? "s"
            : ""
        } must be selected.`;
      }

      if (
        electiveCount >
        maximumElectives
      ) {
        newErrors.subjects = `A maximum of ${maximumElectives} elective subject${
          maximumElectives !== 1
            ? "s"
            : ""
        } can be selected.`;
      }

      /*
       * minimumElectives <= maximumElectives
       */
      if (
        minimumElectives >
        maximumElectives
      ) {
        newErrors.subjects =
          "Invalid subject combination configuration: minimum electives cannot exceed maximum electives.";
      }

      /*
       * maximumElectives must not exceed the number
       * of available elective subjects.
       */
      if (
        selectedCombination &&
        availableSubjects.length > 0
      ) {
        const availableElectiveCount =
          availableSubjects.filter(
            (item) =>
              item.type === "ELECTIVE",
          ).length;

        if (
          maximumElectives >
          availableElectiveCount
        ) {
          newErrors.subjects =
            "Invalid subject combination configuration: maximum electives exceed the available elective subjects.";
        }
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /*
   * ----------------------------------------------------------
   * Submit
   * ----------------------------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Please correct the highlighted fields.",
      );
      return;
    }

    /*
     * IMPORTANT:
     *
     * The SubjectCombination is NOT sent.
     *
     * Student stores only the subjects actually selected
     * by the student/administrator.
     */
    const payload = {
      user: formData.user.trim(),

      admissionNumber:
        formData.admissionNumber
          .trim()
          .toUpperCase(),

      dateOfBirth:
        formData.dateOfBirth,

      gender: formData.gender,

      academicYear:
        formData.academicYear.trim(),

      class:
        formData.class.trim(),

      section:
        formData.section.trim(),

      stream:
        formData.stream,

      subjects:
        formData.subjects.map(
          (item) => ({
            subject: item.subject.trim(),
            type: item.type,
          }),
        ),

      isActive:
        formData.isActive,
    };

    if (
      isSuperAdmin &&
      formData.school.trim()
    ) {
      payload.school =
        formData.school.trim();
    }

    try {
      await createStudent(
        payload,
      ).unwrap();

      toast.success(
        "Student profile created successfully.",
      );

      navigate("/admin/students");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to create student profile.",
      );
    }
  };

  const handleCancel = () => {
    navigate("/admin/students");
  };

  /*
   * ----------------------------------------------------------
   * Styling helpers
   * ----------------------------------------------------------
   */

  const inputClass = (field) =>
    `w-full rounded-xl border ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
    } bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-4`;

  const selectClass = (field) =>
    `w-full appearance-none rounded-xl border ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
    } bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-4`;

  const FieldError = ({
    field,
  }) => {
    if (!errors[field]) {
      return null;
    }

    return (
      <p className="mt-1.5 text-xs font-medium text-red-600">
        {errors[field]}
      </p>
    );
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    description,
  }) => (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );

  /*
   * ----------------------------------------------------------
   * Render
   * ----------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              title="Back to students"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <GraduationCap
                    size={19}
                  />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Create Student
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Create a student profile and
                assign the student's actual
                subjects.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 sm:flex">
            <School size={15} />
            Student Management
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Hero */}

            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-7 text-white sm:px-8">
              <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />

              <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

              <div className="relative max-w-2xl">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <UserRound size={23} />
                </div>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Student Profile
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-indigo-100">
                  Enter the student's identity,
                  personal information, academic
                  placement and enrolled subjects.
                </p>
              </div>
            </div>

            <div className="space-y-8 p-5 sm:p-8">

              {/* ==================================================
                  Student Identity
              ================================================== */}

              <section>
                <SectionHeader
                  icon={IdCard}
                  title="Student Identity"
                  description="Link the student profile to the appropriate user account."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Student User ID
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="user"
                        value={
                          formData.user
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter User ObjectId"
                        className={`${inputClass(
                          "user",
                        )} pl-11`}
                      />
                    </div>

                    <FieldError field="user" />

                    <p className="mt-1.5 text-xs text-slate-400">
                      The selected User must have
                      the STUDENT role.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Admission Number
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="admissionNumber"
                        value={
                          formData.admissionNumber
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. STU2026001"
                        className={`${inputClass(
                          "admissionNumber",
                        )} pl-11 uppercase`}
                      />
                    </div>

                    <FieldError
                      field="admissionNumber"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Admission numbers are unique
                      within the school.
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        School ID
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <School
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="school"
                          value={
                            formData.school
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter School ObjectId"
                          className={`${inputClass(
                            "school",
                          )} pl-11`}
                        />
                      </div>

                      <FieldError field="school" />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Required only for SUPER_ADMIN.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ==================================================
                  Personal Information
              ================================================== */}

              <section>
                <SectionHeader
                  icon={UserRound}
                  title="Personal Information"
                  description="Enter the student's basic personal details."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Date of Birth
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="dateOfBirth"
                        value={
                          formData.dateOfBirth
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass(
                          "dateOfBirth",
                        )} pl-11`}
                      />
                    </div>

                    <FieldError field="dateOfBirth" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gender
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <VenusAndMars
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        name="gender"
                        value={
                          formData.gender
                        }
                        onChange={
                          handleChange
                        }
                        className={`${selectClass(
                          "gender",
                        )} pl-11`}
                      >
                        <option value="">
                          Select gender
                        </option>

                        <option value="MALE">
                          Male
                        </option>

                        <option value="FEMALE">
                          Female
                        </option>

                        <option value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>

                    <FieldError field="gender" />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ==================================================
                  Academic Placement
              ================================================== */}

              <section>
                <SectionHeader
                  icon={GraduationCap}
                  title="Academic Placement"
                  description="Assign the student to the academic year, class, section and stream."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Academic Year ID
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="academicYear"
                        value={
                          formData.academicYear
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter Academic Year ObjectId"
                        className={`${inputClass(
                          "academicYear",
                        )} pl-11`}
                      />
                    </div>

                    <FieldError field="academicYear" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Class ID
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <GraduationCap
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="class"
                        value={
                          formData.class
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter Class ObjectId"
                        className={`${inputClass(
                          "class",
                        )} pl-11`}
                      />
                    </div>

                    <FieldError field="class" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Section ID
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="section"
                        value={
                          formData.section
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter Section ObjectId"
                        className={`${inputClass(
                          "section",
                        )} pl-11`}
                      />
                    </div>

                    <FieldError field="section" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Stream
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Users
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
  name="stream"
  value={formData.stream}
  onChange={handleChange}
  disabled={isLoadingCombinations}
  className={`${selectClass("stream")} pl-11`}
>
  <option value="">
    {isLoadingCombinations
      ? "Loading streams..."
      : "Select stream"}
  </option>

  {subjectCombinations.map((combination) => {
    const streamId = getStreamId(combination.stream);

    const streamName =
      typeof combination.stream === "object"
        ? combination.stream.name
        : combination.name;

    return (
      <option
        key={combination._id}
        value={streamId}
      >
        {streamName || combination.name || combination.code}
      </option>
    );
  })}
</select>
                    </div>

                    <FieldError field="stream" />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ==================================================
                  Subject Selection
              ================================================== */}

              <section>
                <SectionHeader
                  icon={BookOpen}
                  title="Student Subjects"
                  description="Select the subjects the student is actually enrolled in and classify each one as CORE or ELECTIVE."
                />

                {/* Combination information */}

                {formData.stream && (
                  <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          Subject Configuration
                        </p>

                        <p className="mt-1 text-xs text-indigo-700">
                          {isLoadingCombinations
                            ? "Loading subject configuration..."
                            : selectedCombination
                              ? `Configuration found for ${formData.stream}.`
                              : "No subject combination configuration was found for this stream."}
                        </p>
                      </div>

                      {selectedCombination && (
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Core:{" "}
                            {
                              availableSubjects.filter(
                                (item) =>
                                  item.type ===
                                  "CORE",
                              ).length
                            }
                          </span>

                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            Electives:{" "}
                            {
                              availableSubjects.filter(
                                (item) =>
                                  item.type ===
                                  "ELECTIVE",
                              ).length
                            }
                          </span>

                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                            Select:{" "}
                            {minimumElectives}
                            {" - "}
                            {maximumElectives}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subject rows */}

                <div className="space-y-3">
                  {formData.subjects.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                      <BookOpen
                        size={28}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No subjects selected
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Add at least one CORE subject.
                      </p>
                    </div>
                  ) : (
                    formData.subjects.map(
                      (item, index) => (
                        <div
                          key={`subject-${index}`}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">

                            {/* Subject */}

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Subject
                              </label>

                              {availableSubjects.length >
                              0 ? (
                                <select
                                  value={
                                    item.subject
                                  }
                                  onChange={(e) =>
                                    updateSubject(
                                      index,
                                      "subject",
                                      e.target
                                        .value,
                                    )
                                  }
                                  className={selectClass(
                                    "subjects",
                                  )}
                                >
                                  <option value="">
                                    Select subject
                                  </option>

                                  {availableSubjects.map(
                                    (
                                      configuredSubject,
                                    ) => {
                                      const subject =
                                        configuredSubject.subject ||
                                        {};

                                      const subjectId =
                                        subject._id ||
                                        configuredSubject.subject;

                                      return (
                                        <option
                                          key={
                                            subjectId
                                          }
                                          value={
                                            subjectId
                                          }
                                        >
                                          {subject.name ||
                                            subjectId}
                                          {subject.code
                                            ? ` (${subject.code})`
                                            : ""}
                                        </option>
                                      );
                                    },
                                  )}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={
                                    item.subject
                                  }
                                  onChange={(e) =>
                                    updateSubject(
                                      index,
                                      "subject",
                                      e.target
                                        .value,
                                    )
                                  }
                                  placeholder="Enter Subject ObjectId"
                                  className={inputClass(
                                    "subjects",
                                  )}
                                />
                              )}
                            </div>

                            {/* Type */}

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Subject Type
                              </label>

                              <select
                                value={
                                  item.type
                                }
                                onChange={(e) =>
                                  updateSubject(
                                    index,
                                    "type",
                                    e.target
                                      .value,
                                  )
                                }
                                className={selectClass(
                                  "subjects",
                                )}
                              >
                                <option value="">
                                  Select type
                                </option>

                                {SUBJECT_TYPES.map(
                                  (type) => (
                                    <option
                                      key={
                                        type.value
                                      }
                                      value={
                                        type.value
                                      }
                                    >
                                      {type.label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            {/* Remove */}

                            <button
                              type="button"
                              onClick={() =>
                                removeSubject(
                                  index,
                                )
                              }
                              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              <Trash2
                                size={17}
                              />
                              <span className="md:hidden">
                                Remove
                              </span>
                            </button>
                          </div>

                          {/* Configuration hint */}

                          {item.subject &&
                            availableSubjects.length >
                              0 && (
                              <div className="mt-3 flex items-center gap-2 text-xs">
                                {(() => {
                                  const configured =
                                    availableSubjects.find(
                                      (
                                        available,
                                      ) =>
                                        String(
                                          available.subject?._id ||
                                            available.subject,
                                        ) ===
                                        String(
                                          item.subject,
                                        ),
                                    );

                                  if (
                                    !configured
                                  ) {
                                    return (
                                      <span className="text-red-600">
                                        This subject is
                                        not available
                                        for the selected
                                        stream.
                                      </span>
                                    );
                                  }

                                  return (
                                    <span
                                      className={
                                        configured.type ===
                                        "CORE"
                                          ? "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700"
                                          : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700"
                                      }
                                    >
                                      {configured.type ===
                                      "CORE" ? (
                                        <BookOpen
                                          size={
                                            12
                                          }
                                        />
                                      ) : (
                                        <ListChecks
                                          size={
                                            12
                                          }
                                        />
                                      )}

                                      Configured as{" "}
                                      {
                                        configured.type
                                      }
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                        </div>
                      ),
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={addSubject}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <Plus size={17} />
                  Add Subject
                </button>

                <FieldError field="subjects" />

                {/* Selection summary */}

                {formData.subjects.length >
                  0 && (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen
                          size={17}
                          className="text-blue-600"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Core
                        </p>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-blue-800">
                        {
                          coreSubjects.length
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4">
                      <div className="flex items-center gap-2">
                        <ListChecks
                          size={17}
                          className="text-amber-600"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                          Elective
                        </p>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-amber-800">
                        {
                          electiveSubjects.length
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total Subjects
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-800">
                        {
                          formData.subjects
                            .length
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Rule summary */}

                {selectedCombination && (
                  <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-sm font-semibold text-violet-900">
                      Elective Selection Rule
                    </p>

                    <p className="mt-1 text-sm text-violet-700">
                      The student must select between{" "}
                      <span className="font-bold">
                        {minimumElectives}
                      </span>{" "}
                      and{" "}
                      <span className="font-bold">
                        {maximumElectives}
                      </span>{" "}
                      elective
                      {maximumElectives !==
                      1
                        ? "s"
                        : ""}.
                    </p>
                  </div>
                )}
              </section>

              <div className="border-t border-slate-100" />

              {/* ==================================================
                  Status
              ================================================== */}

              <section>
                <SectionHeader
                  icon={CheckCircle2}
                  title="Profile Status"
                  description="Control whether this student profile is active."
                />

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        formData.isActive
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <CheckCircle2
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Active Student Profile
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Active profiles can
                        participate in assessments
                        and learning activities.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        formData.isActive
                      }
                      onChange={
                        handleChange
                      }
                      className="peer sr-only"
                    />

                    <div className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600" />

                    <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                  </div>
                </label>
              </section>
            </div>

            {/* ==================================================
                Actions
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isLoadingCombinations
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating Student...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={17}
                    />
                    Create Student
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
          <School
            size={17}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <p className="text-xs leading-5 text-indigo-800">
            <span className="font-semibold">
              Subject configuration:
            </span>{" "}
            the Subject Combination defines which
            subjects and selection rules are available.
            The student record stores only the actual
            subjects selected by the student, including
            whether each selected subject is CORE or
            ELECTIVE.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentScreen;
