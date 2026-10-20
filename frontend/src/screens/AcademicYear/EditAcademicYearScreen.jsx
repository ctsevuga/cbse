
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Loader2,
  Save,
  School,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetAcademicYearDetailsQuery,
  useUpdateAcademicYearMutation,
} from "../../slices/academicYearApiSlice";


const EditAcademicYearScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: academicYear,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAcademicYearDetailsQuery(id);

  const [
    updateAcademicYear,
    { isLoading: isUpdating },
  ] = useUpdateAcademicYearMutation();

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  /* ======================================================
     Populate form when academic year is loaded
     ====================================================== */

  useEffect(() => {
    if (academicYear) {
      setFormData({
        name: academicYear.name || "",
        startDate: academicYear.startDate
          ? academicYear.startDate.substring(0, 10)
          : "",
        endDate: academicYear.endDate
          ? academicYear.endDate.substring(0, 10)
          : "",
        isCurrent: academicYear.isCurrent === true,
        isActive:
          academicYear.isActive !== false,
      });
    }
  }, [academicYear]);


  /* ======================================================
     Input change
     ====================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
  };


  /* ======================================================
     Toggle handlers
     ====================================================== */

  const handleCurrentToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isCurrent: !prev.isCurrent,
      // A current academic year must always be active.
      isActive: !prev.isCurrent
        ? true
        : prev.isActive,
    }));

    setErrors((prev) => ({
      ...prev,
      isCurrent: "",
      isActive: "",
    }));
  };


  const handleActiveToggle = () => {
    setFormData((prev) => {
      const newIsActive = !prev.isActive;

      return {
        ...prev,
        isActive: newIsActive,
        // Cannot make a current academic year inactive.
        isCurrent: !newIsActive
          ? false
          : prev.isCurrent,
      };
    });

    setErrors((prev) => ({
      ...prev,
      isCurrent: "",
      isActive: "",
    }));
  };


  /* ======================================================
     Validation
     ====================================================== */

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();

    if (!name) {
      newErrors.name =
        "Academic year name is required.";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required.";
    }

    if (!formData.endDate) {
      newErrors.endDate =
        "End date is required.";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >=
        new Date(formData.endDate)
    ) {
      newErrors.endDate =
        "End date must be after start date.";
    }

    if (
      formData.isCurrent &&
      !formData.isActive
    ) {
      newErrors.isActive =
        "A current academic year must be active.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /* ======================================================
     Submit
     ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Please correct the highlighted fields.",
      );
      return;
    }

    try {
      await updateAcademicYear({
        id,
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        isActive: formData.isActive,
      }).unwrap();

      toast.success(
        "Academic year updated successfully.",
      );

      navigate(`/admin/academic-years/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to update academic year.",
      );
    }
  };


  /* ======================================================
     Loading
     ====================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Loading Academic Year
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we load the details.
          </p>
        </div>
      </div>
    );
  }


  /* ======================================================
     Error
     ====================================================== */

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <CircleAlert className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Unable to Load Academic Year
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                "The academic year could not be loaded."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/academic-years")
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Academic Years
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            Top navigation
            ================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/academic-years/${id}`,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <GraduationCap className="h-4 w-4 text-indigo-500" />
            Academic Year
          </div>
        </div>


        {/* ==================================================
            Main card
            ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

          {/* ==================================================
              Header
              ================================================== */}

          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-8 sm:px-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/5" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <CalendarDays className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Academic Year Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Edit Academic Year
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                  Update the academic year details,
                  dates and status for your school.
                </p>
              </div>
            </div>
          </div>


          {/* ==================================================
              School information
              ================================================== */}

          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <School className="h-5 w-5 text-indigo-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  School
                </p>

                <p className="mt-1 truncate text-base font-semibold text-slate-800">
                  {academicYear?.school?.name ||
                    "School"}
                </p>

                {academicYear?.school?.code && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    Code:{" "}
                    <span className="font-medium text-slate-600">
                      {academicYear.school.code}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>


          {/* ==================================================
              Form
              ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="px-6 py-7 sm:px-8 sm:py-8"
          >

            {/* ==================================================
                Basic details
                ================================================== */}

            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Academic Year Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the name and duration of the
                  academic year.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Academic year name */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Academic Year
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: 2026-27"
                    disabled={isUpdating}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>


                {/* Start date */}

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Start Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      disabled={isUpdating}
                      className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:ring-4 ${
                        errors.startDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  {errors.startDate && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>


                {/* End date */}

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    End Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      disabled={isUpdating}
                      className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:ring-4 ${
                        errors.endDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>

                  {errors.endDate && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/* ==================================================
                Status section
                ================================================== */}

            <div className="mt-8 border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Academic Year Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Control how this academic year is used
                  within the school.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Current */}

                <button
                  type="button"
                  onClick={handleCurrentToggle}
                  disabled={isUpdating}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    formData.isCurrent
                      ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          formData.isCurrent
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          Current Academic Year
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Set this as the school's
                          current academic year.
                        </p>
                      </div>
                    </div>

                    {formData.isCurrent ? (
                      <ToggleRight className="h-7 w-7 shrink-0 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 shrink-0 text-slate-400" />
                    )}
                  </div>
                </button>


                {/* Active */}

                <button
                  type="button"
                  onClick={handleActiveToggle}
                  disabled={isUpdating}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    formData.isActive
                      ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          formData.isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          Active
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Allow this academic year to
                          be used in the system.
                        </p>
                      </div>
                    </div>

                    {formData.isActive ? (
                      <ToggleRight className="h-7 w-7 shrink-0 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 shrink-0 text-slate-400" />
                    )}
                  </div>
                </button>
              </div>

              {formData.isCurrent && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                  <p className="text-xs leading-5 text-indigo-700">
                    Saving this academic year as current
                    will automatically remove the current
                    status from any other academic year in
                    the same school.
                  </p>
                </div>
              )}
            </div>


            {/* ==================================================
                Actions
                ================================================== */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/academic-years/${id}`,
                  )
                }
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
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


        {/* ==================================================
            Footer hint
            ================================================== */}

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <GraduationCap className="h-4 w-4" />
          Academic year settings are managed at school level.
        </div>
      </div>
    </div>
  );
};

export default EditAcademicYearScreen;

