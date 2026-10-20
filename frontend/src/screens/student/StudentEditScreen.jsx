import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Save,
  UserRound,
  UserCheck,
  School,
  BookOpen,
  Hash,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetStudentDetailsQuery,
  useUpdateStudentMutation,
} from "../../slices/studentApiSlice";

import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

const StudentEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
    ============================================================
    LOAD STUDENT
    ============================================================
  */

  const {
    data: student,
    isLoading: isLoadingStudent,
    isError,
    error,
    refetch,
  } = useGetStudentDetailsQuery(id, {
    skip: !id,
  });

  /*
    ============================================================
    UPDATE STUDENT
    ============================================================
  */

  const [updateStudent, { isLoading: isUpdating }] =
    useUpdateStudentMutation();

  /*
    ============================================================
    FORM STATE
    ============================================================

    subjects now follows the backend structure:

    [
      {
        subject: "subjectObjectId",
        type: "COMPULSORY"
      }
    ]

    The controller expects:
      req.body.subjects

    NOT:
      req.body.subjectCombination
  */

  const [formData, setFormData] = useState({
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
  const { data: academicYearsResponse } =
  useGetAcademicYearsQuery();

const academicYears = Array.isArray(academicYearsResponse)
  ? academicYearsResponse
  : academicYearsResponse?.academicYears || [];

const { data: classesResponse } = useGetClassesQuery(
  { academicYear: formData.academicYear },
  { skip: !formData.academicYear }
);

const classes = Array.isArray(classesResponse)
  ? classesResponse
  : classesResponse?.classes || [];

const { data: sectionsResponse } = useGetSectionsQuery(
  { classId: formData.class },
  { skip: !formData.class }
);

const sections = Array.isArray(sectionsResponse)
  ? sectionsResponse
  : sectionsResponse?.sections || [];

  const handleAcademicYearChange = (event) => {
  const academicYear = event.target.value;

  setFormData((current) => ({
    ...current,
    academicYear,
    class: "",
    section: "",
  }));
};

const handleClassChange = (event) => {
  const classId = event.target.value;

  setFormData((current) => ({
    ...current,
    class: classId,
    section: "",
  }));
};

  /*
    ============================================================
    POPULATE FORM
    ============================================================
  */

  useEffect(() => {
    if (!student) return;

    setFormData({
      admissionNumber: student.admissionNumber || "",

      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",

      gender: student.gender || "",

      academicYear:
        student.academicYear?._id ||
        student.academicYear ||
        "",

      class:
        student.class?._id ||
        student.class ||
        "",

      section:
        student.section?._id ||
        student.section ||
        "",

      stream:
  student.stream?._id ||
  student.stream ||
  "",

      /*
        Backend response:

        subjects: [
          {
            subject: {
              _id,
              name,
              code
            },
            type
          }
        ]

        Convert it back to:

        [
          {
            subject: subjectId,
            type
          }
        ]
      */
      subjects: Array.isArray(student.subjects)
        ? student.subjects.map((item) => ({
            subject:
              item.subject?._id ||
              item.subject ||
              "",
            type: item.type || "",
          }))
        : [],

      isActive: student.isActive ?? true,
    });
  }, [student]);

  /*
    ============================================================
    INPUT HANDLER
    ============================================================
  */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
    ============================================================
    SUBJECT HANDLERS
    ============================================================
  */

  const handleSubjectChange = (
    index,
    field,
    value,
  ) => {
    setFormData((current) => {
      const subjects = [...current.subjects];

      subjects[index] = {
        ...subjects[index],
        [field]: value,
      };

      return {
        ...current,
        subjects,
      };
    });
  };

  const handleAddSubject = () => {
    setFormData((current) => ({
      ...current,
      subjects: [
        ...current.subjects,
        {
          subject: "",
          type: "CORE",
        },
      ],
    }));
  };

  const handleRemoveSubject = (index) => {
    setFormData((current) => ({
      ...current,
      subjects: current.subjects.filter(
        (_, subjectIndex) =>
          subjectIndex !== index,
      ),
    }));
  };

  /*
    ============================================================
    SUBMIT
    ============================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /*
      ----------------------------------------------------------
      Basic validation
      ----------------------------------------------------------
    */

    if (!id) {
      toast.error("Student ID is missing.");
      return;
    }

    if (!formData.admissionNumber.trim()) {
      toast.error(
        "Admission number is required.",
      );
      return;
    }

    if (!formData.dateOfBirth) {
      toast.error(
        "Date of birth is required.",
      );
      return;
    }

    if (!formData.gender) {
      toast.error("Please select gender.");
      return;
    }

    if (!formData.academicYear) {
      toast.error(
        "Academic year is required.",
      );
      return;
    }

    if (!formData.class) {
      toast.error("Class is required.");
      return;
    }

    if (!formData.section) {
      toast.error("Section is required.");
      return;
    }

    if (!formData.stream) {
      toast.error("Please select a stream.");
      return;
    }

    /*
      ----------------------------------------------------------
      Validate subjects
      ----------------------------------------------------------
    */

    const invalidSubject = formData.subjects.find(
      (item) =>
        !item.subject ||
        !item.type,
    );

    if (invalidSubject) {
      toast.error(
        "Every subject must have a subject ID and type.",
      );
      return;
    }

    /*
      ----------------------------------------------------------
      Remove duplicate subject IDs
      ----------------------------------------------------------
    */

    const subjectIds =
      formData.subjects.map(
        (item) => item.subject,
      );

    const hasDuplicateSubjects =
      new Set(subjectIds).size !==
      subjectIds.length;

    if (hasDuplicateSubjects) {
      toast.error(
        "The same subject cannot be added more than once.",
      );
      return;
    }

    /*
      ----------------------------------------------------------
      Build API payload
      ----------------------------------------------------------

      IMPORTANT:

      The new controller expects:

        subjects: [
          {
            subject,
            type
          }
        ]

      It does NOT expect:

        subjectCombination: [...]
    */

    const payload = {
      admissionNumber:
        formData.admissionNumber
          .trim()
          .toUpperCase(),

      dateOfBirth:
        formData.dateOfBirth,

      gender:
        formData.gender,

      academicYear:
        formData.academicYear,

      class:
        formData.class,

      section:
        formData.section,

      stream:
        formData.stream,

      subjects:
        formData.subjects.map(
          (item) => ({
            subject: item.subject,
            type: item.type,
          }),
        ),

      isActive:
        formData.isActive,
    };

    try {
      /*
        The mutation should send:

        PUT /students/:id

        with the payload above.

        If your API slice accepts { id, ...fields },
        this is the correct call.
      */

      await updateStudent({
        id,
        ...payload,
      }).unwrap();

      toast.success(
        "Student updated successfully.",
      );

      navigate(
        `/admin/students/${id}`,
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update student.",
      );
    }
  };

  /*
    ============================================================
    CANCEL
    ============================================================
  */

  const handleCancel = () => {
    navigate(
      `/admin/students/${id}`,
    );
  };

  /*
    ============================================================
    LOADING
    ============================================================
  */

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading student details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
    ============================================================
    ERROR
    ============================================================
  */

  if (isError || !student) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <UserRound className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Unable to load student
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {error?.data?.message ||
                error?.error ||
                "Student details could not be loaded."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/students",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
    ============================================================
    DISPLAY VALUES
    ============================================================
  */

  const studentName =
    student.user?.name ||
    "Unnamed Student";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Student Details
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  Edit Student
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Update student profile and academic information
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 sm:self-auto">
              <UserRound className="h-4 w-4" />
              {studentName}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="bg-indigo-600 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-indigo-600">
                  {studentName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {studentName}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-sm text-indigo-100">
                    <Hash className="h-4 w-4" />
                    Current Admission No:{" "}
                    <span className="font-semibold text-white">
                      {student.admissionNumber ||
                        "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

              <InputField
                label="Admission Number"
                name="admissionNumber"
                value={
                  formData.admissionNumber
                }
                onChange={handleChange}
                required
                placeholder="Enter admission number"
              />

              <DateField
                label="Date of Birth"
                name="dateOfBirth"
                value={
                  formData.dateOfBirth
                }
                onChange={handleChange}
                required
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Gender
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
              </SelectField>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <UserRound className="h-4 w-4" />
                  Student Account
                </div>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {student.user?.name ||
                    "-"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {student.user?.email ||
                    "No email"}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              ACADEMIC INFORMATION
          ================================================== */}

          <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">

            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <School className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Academic Information
                </h2>

                <p className="text-xs text-gray-500">
                  Update the student's academic placement
                </p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-gray-200 p-4">
  <h3 className="mb-4 text-sm font-semibold text-gray-800">
    Academic Placement
  </h3>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {/* Academic Year */}
    <SelectField
      label="Academic Year"
      name="academicYear"
      value={formData.academicYear}
      onChange={handleAcademicYearChange}
      required
    >
      <option value="">Select Academic Year</option>
      {academicYears.map((year) => (
        <option key={year._id} value={year._id}>
          {year.name}
        </option>
      ))}
    </SelectField>

    {/* Class */}
    <SelectField
      label="Class"
      name="class"
      value={formData.class}
      onChange={handleClassChange}
      required
      disabled={!formData.academicYear}
    >
      <option value="">Select Class</option>
      {classes.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </SelectField>

    {/* Section */}
    <SelectField
      label="Section"
      name="section"
      value={formData.section}
      onChange={handleChange}
      required
      disabled={!formData.class}
    >
      <option value="">Select Section</option>
      {sections.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </SelectField>
  </div>
</div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Current Placement
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700">
                <span>
                  {student.academicYear?.name ||
                    "-"}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span>
                  {student.class?.name ||
                    "-"}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span>
                  {student.section?.name ||
                    "-"}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span>
  {student.stream?.name ||
    student.stream?.code ||
    (typeof student.stream === "string"
      ? student.stream
      : "-")}
</span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                {student.school?.name ||
                  "School"}
              </p>
            </div>
          </div>

          {/* ==================================================
              SUBJECTS
          ================================================== */}

          <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">

            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Subject Combination
                  </h2>

                  <p className="text-xs text-gray-500">
                    Configure subject IDs and their types
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                disabled={isUpdating}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                + Add Subject
              </button>
            </div>

            <div className="p-6">

              {formData.subjects.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-gray-400" />

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No subjects configured.
                  </p>

                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Add Subject
                  </button>
                </div>
              ) : (
                <div className="space-y-4">

                  {formData.subjects.map(
                    (item, index) => {
                      /*
                        Find populated subject
                        information from the GET
                        response for display.
                      */

                      const populatedSubject =
                        student.subjects?.find(
                          (studentSubject) =>
                            String(
                              studentSubject.subject?._id ||
                                studentSubject.subject,
                            ) ===
                            String(
                              item.subject,
                            ),
                        )?.subject;

                      return (
                        <div
                          key={`${item.subject}-${index}`}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">

                            <InputField
                              label={`Subject ${index + 1} ID`}
                              name={`subject-${index}`}
                              value={
                                item.subject
                              }
                              onChange={(event) =>
                                handleSubjectChange(
                                  index,
                                  "subject",
                                  event.target.value,
                                )
                              }
                              required
                              placeholder="Subject ObjectId"
                            />

                            <SelectField
                              label="Subject Type"
                              name={`subject-type-${index}`}
                              value={
                                item.type
                              }
                              onChange={(event) =>
                                handleSubjectChange(
                                  index,
                                  "type",
                                  event.target.value,
                                )
                              }
                              required
                            >
                              <option value="">Select Type</option>
<option value="CORE">Core</option>
<option value="ELECTIVE">Elective</option>
                            </SelectField>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSubject(
                                  index,
                                )
                              }
                              disabled={
                                isUpdating
                              }
                              className="h-10 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </div>

                          {populatedSubject && (
                            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <p className="text-xs font-medium text-emerald-600">
                                Current Subject
                              </p>

                              <p className="mt-0.5 text-sm font-semibold text-emerald-800">
                                {
                                  populatedSubject.name
                                }

                                {populatedSubject.code &&
                                  ` (${populatedSubject.code})`}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs leading-5 text-blue-700">
                  Subjects are validated by the
                  backend against the student's
                  school, academic year, stream,
                  and subject configuration.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">

            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Student Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Control whether this student profile is active.
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={
                    handleChange
                  }
                  disabled={isUpdating}
                  className="peer sr-only"
                />

                <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />

                <span className="ml-3 text-sm font-semibold text-gray-700">
                  {formData.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/*
=============================================================
INPUT FIELD
=============================================================
*/

const InputField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
};

/*
=============================================================
DATE FIELD
=============================================================
*/

const DateField = ({
  label,
  name,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          id={name}
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
};

/*
=============================================================
SELECT FIELD
=============================================================
*/

const SelectField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {children}
      </select>
    </div>
  );
};

export default StudentEditScreen;
