
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Save,
  School,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useCreateAcademicYearMutation } from "../../slices/academicYearApiSlice";


const CreateAcademicYearScreen = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const [createAcademicYear, { isLoading }] =
    useCreateAcademicYearMutation();

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    isActive: true,
  });

  const [errors, setErrors] = useState({});


  /*
   * ======================================================
   * Determine whether the logged-in user is SUPER_ADMIN
   * ======================================================
   */
  const isSuperAdmin = userInfo?.role === "SUPER_ADMIN";


  /*
   * ======================================================
   * Initialize school for non SUPER_ADMIN users
   *
   * The backend uses req.schoolId for school users.
   * We therefore do not need to send school from the
   * frontend for normal school users.
   * ======================================================
   */
  useEffect(() => {
    if (!isSuperAdmin) {
      setFormData((prev) => ({
        ...prev,
        school: "",
      }));
    }
  }, [isSuperAdmin]);


  /*
   * ======================================================
   * Handle input changes
   * ======================================================
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };


  /*
   * ======================================================
   * Client-side validation
   * ======================================================
   */
  const validateForm = () => {
    const newErrors = {};

    if (isSuperAdmin && !formData.school) {
      newErrors.school = "School is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Academic year name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /*
   * ======================================================
   * Submit
   * ======================================================
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the highlighted fields");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        isActive: formData.isActive,
      };

      /*
       * SUPER_ADMIN must specify the school.
       *
       * Other users should NOT send a school from the
       * form because the backend uses req.schoolId.
       */
      if (isSuperAdmin) {
        payload.school = formData.school;
      }

      await createAcademicYear(payload).unwrap();

      toast.success("Academic year created successfully");

      navigate("/admin/academic-years");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to create academic year",
      );
    }
  };


  /*
   * ======================================================
   * Cancel
   * ======================================================
   */
  const cancelHandler = () => {
    navigate("/admin/academic-years");
  };


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            Header
        ================================================== */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <CalendarDays className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                Create Academic Year
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add a new academic year for the school.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelHandler}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>


        {/* ==================================================
            Main Card
        ================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-600 p-2">
                <School className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Academic Year Details
                </h2>

                <p className="text-sm text-slate-500">
                  Enter the academic year information below.
                </p>
              </div>
            </div>
          </div>


          {/* Form */}
          <form onSubmit={submitHandler}>

            <div className="space-y-6 p-6">

              {/* ==================================================
                  SUPER ADMIN SCHOOL
              ================================================== */}
              {isSuperAdmin && (
                <div>
                  <label
                    htmlFor="school"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    School
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <School className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="school"
                      name="school"
                      type="text"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="Enter School ID"
                      className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                        errors.school
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    SUPER_ADMIN can specify the school for this academic year.
                  </p>

                  {errors.school && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.school}
                    </p>
                  )}
                </div>
              )}


              {/* ==================================================
                  Name
              ================================================== */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Academic Year
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: 2026-27"
                  maxLength={50}
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    errors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                />

                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">
                    For example, 2026-27.
                  </p>
                )}
              </div>


              {/* ==================================================
                  Dates
              ================================================== */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Start Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:ring-2 ${
                        errors.startDate
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>


                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    End Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:ring-2 ${
                        errors.endDate
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endDate}
                    </p>
                  )}
                </div>

              </div>


              {/* ==================================================
                  Status Options
              ================================================== */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Current */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isCurrent: !prev.isCurrent,
                    }))
                  }
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                    formData.isCurrent
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        formData.isCurrent
                          ? "bg-indigo-100"
                          : "bg-slate-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          formData.isCurrent
                            ? "text-indigo-600"
                            : "text-slate-500"
                        }`}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Current Academic Year
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Make this the school's current year.
                      </p>
                    </div>
                  </div>

                  {formData.isCurrent ? (
                    <ToggleRight className="h-7 w-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-slate-400" />
                  )}
                </button>


                {/* Active */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                    formData.isActive
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        formData.isActive
                          ? "bg-emerald-100"
                          : "bg-slate-200"
                      }`}
                    >
                      {formData.isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-slate-500" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Active
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Allow this academic year to be used.
                      </p>
                    </div>
                  </div>

                  {formData.isActive ? (
                    <ToggleRight className="h-7 w-7 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-slate-400" />
                  )}
                </button>

              </div>


              {/* ==================================================
                  Information Box
              ================================================== */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Academic Year Information
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Only one academic year can be marked as current for
                      a school. If you mark this academic year as current,
                      the backend will automatically remove the current
                      status from the previous academic year.
                    </p>
                  </div>
                </div>
              </div>

            </div>


            {/* ==================================================
                Footer Actions
            ================================================== */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={cancelHandler}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Academic Year
                  </>
                )}
              </button>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateAcademicYearScreen;

