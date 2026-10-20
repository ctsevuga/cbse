import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  Plus,
  School,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCreateSectionMutation } from "../../slices/sectionApiSlice";
import { useGetAcademicYearsQuery } from "../../slices/academicYearApiSlice";
import { useGetClassesQuery } from "../../slices/classApiSlice";
import { useGetTeachersQuery } from "../../slices/teacherApiSlice";

const CreateSectionScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    academicYear: "",
    class: "",
    name: "",
    classTeacher: "",
  });

  const [errors, setErrors] = useState({});

  const {
    data: academicYears = [],
    isLoading: isLoadingAcademicYears,
    isError: isAcademicYearsError,
  } = useGetAcademicYearsQuery();

  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    isError: isClassesError,
  } = useGetClassesQuery();

  const {
    data: teachers = [],
    isLoading: isLoadingTeachers,
    isError: isTeachersError,
  } = useGetTeachersQuery();

  const [
    createSection,
    { isLoading: isCreating },
  ] = useCreateSectionMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.academicYear) {
      newErrors.academicYear =
        "Please select an academic year.";
    }

    if (!formData.class) {
      newErrors.class =
        "Please select a class.";
    }

    if (!formData.name.trim()) {
      newErrors.name =
        "Section name is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createSection({
        academicYear: formData.academicYear,
        class: formData.class,
        name: formData.name.trim(),
        classTeacher:
          formData.classTeacher || undefined,
      }).unwrap();

      navigate("/sections");
    } catch (err) {
      setErrors({
        submit:
          err?.data?.message ||
          err?.error ||
          "Unable to create section. Please try again.",
      });
    }
  };

  const isLoading =
    isLoadingAcademicYears ||
    isLoadingClasses ||
    isLoadingTeachers;

  const hasLoadingError =
    isAcademicYearsError ||
    isClassesError ||
    isTeachersError;

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

    return teacher?.employeeCode || "Unnamed Teacher";
  };

  const getAcademicYearName = (academicYear) => {
    return (
      academicYear?.name ||
      academicYear?.academicYear ||
      "Unnamed Academic Year"
    );
  };

  const getClassName = (classRecord) => {
    return (
      classRecord?.name ||
      classRecord?.code ||
      "Unnamed Class"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/sections"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              title="Back to Sections"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Users
                  size={21}
                  className="text-indigo-600"
                />

                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Create Section
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Create a new section for an academic year and class.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-7 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <Users size={28} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Section Information
                    </h2>

                    <p className="mt-1 text-sm text-indigo-100">
                      Set up the class section and assign its class teacher.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-6 sm:p-8">
                {errors.submit && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium leading-6 text-red-700">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {hasLoadingError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <p className="text-sm font-medium leading-6 text-amber-700">
                      Some dropdown information could not be loaded.
                      Please refresh the page and try again.
                    </p>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="academicYear"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Academic Year
                    </label>

                    <div className="relative">
                      <GraduationCap
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        id="academicYear"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`h-12 w-full appearance-none rounded-xl border bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                          errors.academicYear
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                        }`}
                      >
                        <option value="">
                          Select academic year
                        </option>

                        {academicYears.map((academicYear) => (
                          <option
                            key={academicYear._id}
                            value={academicYear._id}
                          >
                            {getAcademicYearName(
                              academicYear,
                            )}
                            {academicYear.isCurrent
                              ? " (Current)"
                              : ""}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {errors.academicYear && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.academicYear}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="class"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Class
                    </label>

                    <div className="relative">
                      <BookOpen
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`h-12 w-full appearance-none rounded-xl border bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                          errors.class
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                        }`}
                      >
                        <option value="">
                          Select class
                        </option>

                        {classes.map((classRecord) => (
                          <option
                            key={classRecord._id}
                            value={classRecord._id}
                          >
                            {getClassName(classRecord)}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {errors.class && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.class}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Section Name
                  </label>

                  <div className="relative">
                    <Users
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="For example, A"
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                      }`}
                    />
                  </div>

                  {errors.name ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      Enter the section name, such as A, B, C or D.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="classTeacher"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Class Teacher
                    <span className="ml-1 font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      id="classTeacher"
                      name="classTeacher"
                      value={formData.classTeacher}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        Select class teacher
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

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    You can assign or change the class teacher later.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-7">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Link
                      to="/sections"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      disabled={isCreating || isLoading}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreating ? (
                        <>
                          <Loader2
                            size={19}
                            className="animate-spin"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={19} />
                          Create Section
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                  <School
                    size={21}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    School
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Current School
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                The section will automatically be created under the
                school associated with your account.
              </p>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <CheckCircle2
                    size={19}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    Section Setup
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-indigo-900/70">
                    Select the academic year and class, provide a
                    section name, and optionally assign a class teacher.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Users
                    size={19}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Example
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Class XII - A
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  A section belongs to a specific class and academic
                  year. The same section name can be used for another
                  class or academic year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateSectionScreen;