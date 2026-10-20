
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Save,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetSectionDetailsQuery,
  useUpdateSectionMutation,
} from "../../slices/sectionApiSlice";
import {
  useGetAcademicYearsQuery,
} from "../../slices/academicYearApiSlice";
import {
  useGetClassesQuery,
} from "../../slices/classApiSlice";
import {
  useGetTeachersQuery,
} from "../../slices/teacherApiSlice";

const EditSectionScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    academicYear: "",
    class: "",
    name: "",
    classTeacher: "",
    isActive: true,
  });

  const [validationError, setValidationError] =
    useState("");

  const {
    data: section,
    isLoading: isSectionLoading,
    isError: isSectionError,
    error: sectionError,
  } = useGetSectionDetailsQuery(id);

  const {
    data: academicYears = [],
    isLoading: isAcademicYearsLoading,
  } = useGetAcademicYearsQuery();

  const {
    data: classes = [],
    isLoading: isClassesLoading,
  } = useGetClassesQuery();

  const {
    data: teachers = [],
    isLoading: isTeachersLoading,
  } = useGetTeachersQuery();

  const [
    updateSection,
    { isLoading: isUpdating },
  ] = useUpdateSectionMutation();

  useEffect(() => {
    if (!section) {
      return;
    }

    setFormData({
      academicYear:
        section.academicYear?._id ||
        section.academicYear ||
        "",
      class:
        section.class?._id ||
        section.class ||
        "",
      name: section.name || "",
      classTeacher:
        section.classTeacher?._id ||
        section.classTeacher ||
        "",
      isActive: section.isActive ?? true,
    });
  }, [section]);

  const selectedAcademicYear = useMemo(
    () =>
      academicYears.find(
        (item) =>
          item._id === formData.academicYear,
      ),
    [academicYears, formData.academicYear],
  );

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) =>
          item._id === formData.class,
      ),
    [classes, formData.class],
  );

  const selectedTeacher = useMemo(
    () =>
      teachers.find(
        (item) =>
          item._id === formData.classTeacher,
      ),
    [teachers, formData.classTeacher],
  );

  const getTeacherName = (teacher) => {
    if (teacher?.user?.name) {
      return teacher.user.name;
    }

    if (teacher?.name) {
      return teacher.name;
    }

    if (
      teacher?.user?.firstName ||
      teacher?.user?.lastName
    ) {
      return [
        teacher.user.firstName,
        teacher.user.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return "Teacher";
  };

  const getAcademicYearName = (academicYear) => {
    return (
      academicYear?.name ||
      academicYear?.academicYear ||
      "Academic Year"
    );
  };

  const getClassName = (classRecord) => {
    return (
      classRecord?.name ||
      classRecord?.code ||
      "Class"
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const normalizedName =
      formData.name.trim();

    if (!formData.academicYear) {
      setValidationError(
        "Please select an academic year.",
      );
      return;
    }

    if (!formData.class) {
      setValidationError(
        "Please select a class.",
      );
      return;
    }

    if (!normalizedName) {
      setValidationError(
        "Please enter a section name.",
      );
      return;
    }

    try {
      await updateSection({
        id,
        academicYear:
          formData.academicYear,
        class: formData.class,
        name: normalizedName,
        classTeacher:
          formData.classTeacher || null,
        isActive: formData.isActive,
      }).unwrap();

      navigate(`/sections/${id}`);
    } catch (err) {
      setValidationError(
        err?.data?.message ||
          err?.error ||
          "Unable to update section. Please try again.",
      );
    }
  };

  if (
    isSectionLoading ||
    isAcademicYearsLoading ||
    isClassesLoading ||
    isTeachersLoading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading section details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSectionError || !section) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/sections")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Sections
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <XCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load section
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {sectionError?.data?.message ||
                sectionError?.error ||
                "The requested section could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/sections")}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Back to Sections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/sections/${id}`)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              title="Back"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
              <Users
                size={24}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Edit Section
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update section information and assignment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Users
                        size={21}
                        className="text-indigo-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Section {section.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Modify the section details below.
                      </p>
                    </div>
                  </div>
                </div>

                {formData.isActive ? (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <XCircle size={14} />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {validationError && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <XCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-sm font-medium leading-6 text-red-700">
                    {validationError}
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="academicYear"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <CalendarDays
                      size={17}
                      className="text-indigo-500"
                    />
                    Academic Year
                  </label>

                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      Select academic year
                    </option>

                    {academicYears.map(
                      (academicYear) => (
                        <option
                          key={academicYear._id}
                          value={academicYear._id}
                        >
                          {getAcademicYearName(
                            academicYear,
                          )}
                        </option>
                      ),
                    )}
                  </select>

                  {selectedAcademicYear && (
                    <p className="mt-2 text-xs text-slate-400">
                      Current selection:{" "}
                      {getAcademicYearName(
                        selectedAcademicYear,
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="class"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <BookOpen
                      size={17}
                      className="text-indigo-500"
                    />
                    Class
                  </label>

                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      Select class
                    </option>

                    {classes.map((classRecord) => (
                      <option
                        key={classRecord._id}
                        value={classRecord._id}
                      >
                        {getClassName(
                          classRecord,
                        )}
                        {classRecord.code &&
                        classRecord.name
                          ? ` (${classRecord.code})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {selectedClass && (
                    <p className="mt-2 text-xs text-slate-400">
                      Current selection:{" "}
                      {getClassName(selectedClass)}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Users
                      size={17}
                      className="text-indigo-500"
                    />
                    Section Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: A"
                    maxLength={50}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Enter the section name used by the school.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="classTeacher"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <UserRound
                      size={17}
                      className="text-indigo-500"
                    />
                    Class Teacher
                  </label>

                  <select
                    id="classTeacher"
                    name="classTeacher"
                    value={formData.classTeacher}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      No class teacher
                    </option>

                    {teachers.map((teacher) => (
                      <option
                        key={teacher._id}
                        value={teacher._id}
                      >
                        {getTeacherName(teacher)}
                        {teacher.employeeCode
                          ? ` (${teacher.employeeCode})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {selectedTeacher && (
                    <p className="mt-2 text-xs text-slate-400">
                      Current selection:{" "}
                      {getTeacherName(
                        selectedTeacher,
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {formData.isActive ? (
                        <CheckCircle2
                          size={19}
                          className="text-emerald-600"
                        />
                      ) : (
                        <XCircle
                          size={19}
                          className="text-slate-500"
                        />
                      )}

                      <h3 className="text-sm font-bold text-slate-900">
                        Section Status
                      </h3>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {formData.isActive
                        ? "This section is active and available for school operations."
                        : "This section is inactive and should not be used for new assignments."}
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer sr-only"
                    />

                    <span className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-100">
                      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {formData.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/sections/${id}`)
                  }
                  disabled={isUpdating}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                <CheckCircle2
                  size={18}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-900">
                  Section Update
                </h3>

                <p className="mt-1 text-sm leading-6 text-indigo-700">
                  Changes are validated against the school,
                  academic year, class, and assigned teacher
                  before they are saved.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditSectionScreen;
