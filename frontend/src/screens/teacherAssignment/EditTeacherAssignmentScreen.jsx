import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Users,
  GraduationCap,
  BookOpen,
  Layers3,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  useGetTeacherAssignmentDetailsQuery,
  useUpdateTeacherAssignmentMutation,
} from "../../slices/teacherAssignmentApiSlice";

import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";

import {
  useGetSectionsQuery,
} from "../../slices/sectionApiSlice";

import {
  useGetSubjectsQuery,
} from "../../slices/subjectApiSlice";

import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";

import {
  useGetUsersQuery,
} from "../../slices/usersApiSlice";

const EditTeacherAssignmentScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(
  (state) => state.auth
);

const schoolSlug = userInfo?.school?.slug;
  const { id } = useParams();

  const {
  data: assignment,
  isLoading: assignmentLoading,
  error: assignmentError,
} = useGetTeacherAssignmentDetailsQuery(
  {
    schoolSlug,
    assignmentId: id,
  },
  {
    skip: !schoolSlug || !id,
  }
);

  const {
    data: academicYears = [],
    isLoading: academicYearsLoading,
  } = useGetAcademicYearsQuery();

  const {
    data: sections = [],
    isLoading: sectionsLoading,
  } = useGetSectionsQuery();

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useGetSubjectsQuery();

  const {
    data: classes = [],
    isLoading: classesLoading,
  } = useGetClassesQuery();

  const {
    data: teachers = [],
    isLoading: teachersLoading,
  } = useGetUsersQuery({
    role: "TEACHER",
  });

  const [
    updateTeacherAssignment,
    { isLoading: isUpdating },
  ] = useUpdateTeacherAssignmentMutation();

  const [formData, setFormData] = useState({
    academicYear: "",
    teacher: "",
    class: "",
    section: "",
    subject: "",
    assignmentType: "",
  });

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!assignment) {
      return;
    }

    setFormData({
      academicYear:
        assignment.academicYear?._id ||
        assignment.academicYear ||
        "",
      teacher:
        assignment.teacher?._id ||
        assignment.teacher ||
        "",
      class:
        assignment.class?._id ||
        assignment.class ||
        "",
      section:
        assignment.section?._id ||
        assignment.section ||
        "",
      subject:
        assignment.subject?._id ||
        assignment.subject ||
        "",
      assignmentType:
        assignment.assignmentType || "",
    });
  }, [assignment]);

  const filteredSections = useMemo(() => {
    if (!formData.academicYear) {
      return [];
    }

    return sections.filter((section) => {
      const sectionAcademicYear =
        section.academicYear?._id ||
        section.academicYear;

      return (
        String(sectionAcademicYear) ===
        String(formData.academicYear)
      );
    });
  }, [
    sections,
    formData.academicYear,
  ]);

  const selectedSection = useMemo(() => {
    return sections.find(
      (section) =>
        String(section._id) ===
        String(formData.section),
    );
  }, [
    sections,
    formData.section,
  ]);

  const filteredClasses = useMemo(() => {
    if (!formData.section) {
      return [];
    }

    const sectionClassId =
      selectedSection?.class?._id ||
      selectedSection?.class;

    if (!sectionClassId) {
      return [];
    }

    return classes.filter(
      (item) =>
        String(item._id) ===
        String(sectionClassId),
    );
  }, [
    classes,
    selectedSection,
    formData.section,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrorMessage("");

    if (name === "academicYear") {
      setFormData((prev) => ({
        ...prev,
        academicYear: value,
        section: "",
        class: "",
      }));
      return;
    }

    if (name === "section") {
      setFormData((prev) => ({
        ...prev,
        section: value,
        class: "",
      }));
      return;
    }

    if (name === "assignmentType") {
      setFormData((prev) => ({
        ...prev,
        assignmentType: value,
        subject:
          value === "CLASS_TEACHER"
            ? ""
            : prev.subject,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!formData.academicYear) {
      setErrorMessage(
        "Please select an academic year.",
      );
      return;
    }

    if (!formData.teacher) {
      setErrorMessage(
        "Please select a teacher.",
      );
      return;
    }

    if (!formData.section) {
      setErrorMessage(
        "Please select a section.",
      );
      return;
    }

    if (!formData.class) {
      setErrorMessage(
        "Please select a class.",
      );
      return;
    }

    if (!formData.assignmentType) {
      setErrorMessage(
        "Please select an assignment type.",
      );
      return;
    }

    if (
      formData.assignmentType ===
        "SUBJECT_TEACHER" &&
      !formData.subject
    ) {
      setErrorMessage(
        "Please select a subject for a subject teacher assignment.",
      );
      return;
    }

    const payload = {
  schoolSlug,
  assignmentId: id,
  academicYear: formData.academicYear,
  teacher: formData.teacher,
  class: formData.class,
  section: formData.section,
  assignmentType: formData.assignmentType,
};

if (formData.assignmentType === "SUBJECT_TEACHER") {
  payload.subject = formData.subject;
}

try {
  await updateTeacherAssignment(payload).unwrap();

  navigate(`/admin/teacher-assignments/${id}`);
} catch (err) {
  setErrorMessage(
    err?.data?.message ||
      "Failed to update teacher assignment."
  );
}
  };

  const handleCancel = () => {
    navigate(
      `/admin/teacher-assignments/${id}`,
    );
  };

  if (
    assignmentLoading ||
    academicYearsLoading ||
    sectionsLoading ||
    subjectsLoading ||
    classesLoading ||
    teachersLoading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-40 rounded-2xl bg-slate-200" />

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 h-6 w-48 rounded bg-slate-200" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  1, 2, 3, 4, 5, 6,
                ].map((item) => (
                  <div
                    key={item}
                    className="h-14 rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to load assignment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {assignmentError?.data?.message ||
                "Teacher assignment could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/teacher-assignments",
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
          Teacher Assignments
        </button>

        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
          <div className="px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <Users className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-100">
                  Teacher Assignment
                </p>

                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Edit Assignment
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Update teacher, academic year,
                  class, section and subject details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Assignment Information
                </h2>

                <p className="text-sm text-slate-500">
                  Select the teacher and teaching assignment details.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  Academic Year
                </label>

                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears.map(
                    (academicYear) => (
                      <option
                        key={academicYear._id}
                        value={academicYear._id}
                      >
                        {academicYear.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Teacher
                </label>

                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select Teacher
                  </option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher._id}
                      value={teacher._id}
                    >
                      {teacher.name}
                      {teacher.email
                        ? ` - ${teacher.email}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Layers3 className="h-4 w-4 text-indigo-500" />
                  Section
                </label>

                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  disabled={
                    !formData.academicYear
                  }
                  className={inputClass}
                  required
                >
                  <option value="">
                    {formData.academicYear
                      ? "Select Section"
                      : "Select Academic Year First"}
                  </option>

                  {filteredSections.map(
                    (section) => (
                      <option
                        key={section._id}
                        value={section._id}
                      >
                        {section.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                  Class
                </label>

                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  disabled={
                    !formData.section
                  }
                  className={inputClass}
                  required
                >
                  <option value="">
                    {formData.section
                      ? "Select Class"
                      : "Select Section First"}
                  </option>

                  {filteredClasses.map(
                    (item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                        {item.code
                          ? ` (${item.code})`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Layers3 className="h-4 w-4 text-indigo-500" />
                  Assignment Type
                </label>

                <select
                  name="assignmentType"
                  value={formData.assignmentType}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select Assignment Type
                  </option>

                  <option value="CLASS_TEACHER">
                    Class Teacher
                  </option>

                  <option value="SUBJECT_TEACHER">
                    Subject Teacher
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Subject
                </label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={
                    formData.assignmentType !==
                    "SUBJECT_TEACHER"
                  }
                  className={inputClass}
                  required={
                    formData.assignmentType ===
                    "SUBJECT_TEACHER"
                  }
                >
                  <option value="">
                    {formData.assignmentType ===
                    "SUBJECT_TEACHER"
                      ? "Select Subject"
                      : "Not required for Class Teacher"}
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.name}
                      {subject.code
                        ? ` (${subject.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Assignment rule
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    A Class Teacher assignment does not
                    require a subject. A Subject Teacher
                    assignment requires a subject.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {isUpdating
                ? "Updating..."
                : "Update Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherAssignmentScreen;