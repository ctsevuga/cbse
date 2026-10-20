import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers3,
  Save,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useCreateTeacherAssignmentMutation,
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

const CreateTeacherAssignmentScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  const [formData, setFormData] = useState({
    academicYear: "",
    section: "",
    class: "",
    teacher: "",
    subject: "",
    assignmentType: "",
  });

  const [error, setError] = useState("");

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
    data: users = [],
    isLoading: usersLoading,
  } = useGetUsersQuery({
    role: "TEACHER",
  });

  const [
    createTeacherAssignment,
    { isLoading: creating },
  ] = useCreateTeacherAssignmentMutation();

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

    return classes.filter((item) => {
      return (
        String(item._id) ===
        String(sectionClassId)
      );
    });
  }, [
    classes,
    selectedSection,
    formData.section,
  ]);

  const teachers = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === "TEACHER",
    );
  }, [users]);

  useEffect(() => {
    if (
      formData.section &&
      !filteredSections.some(
        (section) =>
          String(section._id) ===
          String(formData.section),
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        section: "",
        class: "",
      }));
    }
  }, [
    filteredSections,
    formData.section,
  ]);

  useEffect(() => {
    if (
      formData.class &&
      !filteredClasses.some(
        (item) =>
          String(item._id) ===
          String(formData.class),
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        class: "",
      }));
    }
  }, [
    filteredClasses,
    formData.class,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");

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

  const submitHandler = async (e) => {
  e.preventDefault();
  setError("");

  if (!schoolSlug) {
    setError(
      "School information is unavailable. Please sign in again."
    );
    return;
  }

  if (!formData.academicYear) {
    setError("Please select an academic year.");
    return;
  }

  if (!formData.section) {
    setError("Please select a section.");
    return;
  }

  if (!formData.class) {
    setError("Please select a class.");
    return;
  }

  if (!formData.teacher) {
    setError("Please select a teacher.");
    return;
  }

  if (!formData.assignmentType) {
    setError("Please select an assignment type.");
    return;
  }

  if (
    formData.assignmentType === "SUBJECT_TEACHER" &&
    !formData.subject
  ) {
    setError("Please select a subject.");
    return;
  }

  const payload = {
    schoolSlug,
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
    await createTeacherAssignment(payload).unwrap();

    navigate("/admin/teacher-assignments");
  } catch (err) {
    setError(
      err?.data?.message ||
        "Unable to create teacher assignment."
    );
  }
};

  const isLoading =
    academicYearsLoading ||
    sectionsLoading ||
    subjectsLoading ||
    classesLoading ||
    usersLoading;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/teacher-assignments",
                )
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back to Teacher Assignments
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Users size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Create Teacher Assignment
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Assign a teacher to a class,
                  section and subject.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={submitHandler}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
            <div className="flex items-center gap-3">
              <GraduationCap
                className="text-indigo-600"
                size={22}
              />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Assignment Details
                </h2>
                <p className="text-sm text-slate-500">
                  Select the academic hierarchy
                  before assigning the teacher.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <X
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                icon={BriefcaseBusiness}
                disabled={
                  isLoading || creating
                }
                required
              >
                <option value="">
                  Select Academic Year
                </option>

                {academicYears.map((year) => (
                  <option
                    key={year._id}
                    value={year._id}
                  >
                    {year.name}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                icon={Layers3}
                disabled={
                  !formData.academicYear ||
                  isLoading ||
                  creating
                }
                required
              >
                <option value="">
                  {!formData.academicYear
                    ? "Select Academic Year First"
                    : filteredSections.length ===
                        0
                      ? "No Sections Available"
                      : "Select Section"}
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
              </FormSelect>

              <FormSelect
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                icon={BookOpen}
                disabled={
                  !formData.section ||
                  isLoading ||
                  creating
                }
                required
              >
                <option value="">
                  {!formData.section
                    ? "Select Section First"
                    : filteredClasses.length ===
                        0
                      ? "No Class Available"
                      : "Select Class"}
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
              </FormSelect>

              <FormSelect
                label="Teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                icon={UserRound}
                disabled={
                  isLoading || creating
                }
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
                    {teacher.phone
                      ? ` - ${teacher.phone}`
                      : ""}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Assignment Type"
                name="assignmentType"
                value={
                  formData.assignmentType
                }
                onChange={handleChange}
                icon={Users}
                disabled={
                  isLoading || creating
                }
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
              </FormSelect>

              <FormSelect
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                icon={BookOpen}
                disabled={
                  formData.assignmentType !==
                    "SUBJECT_TEACHER" ||
                  isLoading ||
                  creating
                }
                required={
                  formData.assignmentType ===
                  "SUBJECT_TEACHER"
                }
              >
                <option value="">
                  {formData.assignmentType !==
                  "SUBJECT_TEACHER"
                    ? "Not Required for Class Teacher"
                    : "Select Subject"}
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
              </FormSelect>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-indigo-600"
                />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Assignment hierarchy
                  </p>
                  <p className="mt-1 text-sm text-indigo-700">
                    Academic Year → Section →
                    Class → Teacher
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/teacher-assignments",
                )
              }
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                creating || isLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {creating
                ? "Creating..."
                : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  children,
  disabled,
  required,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        />

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {children}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

export default CreateTeacherAssignmentScreen;