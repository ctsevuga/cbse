import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetTeacherDetailsQuery,
  useUpdateTeacherMutation,
} from "../../slices/teacherApiSlice";

const EditTeacherScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: teacher,
    isLoading: isTeacherLoading,
    isError,
    error,
  } = useGetTeacherDetailsQuery(id);

  const [
    updateTeacher,
    { isLoading: isUpdating },
  ] = useUpdateTeacherMutation();

  const [formData, setFormData] = useState({
    user: "",
    employeeCode: "",
    qualification: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  /*
   * Populate form after teacher details are loaded.
   */
  useEffect(() => {
    if (!teacher) {
      return;
    }

    setFormData({
      user: teacher.user?._id || teacher.user || "",
      employeeCode: teacher.employeeCode || "",
      qualification: teacher.qualification || "",
      isActive: teacher.isActive ?? true,
    });
  }, [teacher]);

  /*
   * Input handler
   */
  const changeHandler = (e) => {
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

  /*
   * Form validation
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.user.trim()) {
      newErrors.user =
        "User is required";
    }

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode =
        "Employee code is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Submit handler
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Please correct the highlighted fields",
      );
      return;
    }

    try {
      const updatedTeacher =
        await updateTeacher({
          id,
          user: formData.user.trim(),
          employeeCode:
            formData.employeeCode
              .trim()
              .toUpperCase(),
          qualification:
            formData.qualification.trim(),
          isActive:
            formData.isActive,
        }).unwrap();

      toast.success(
        "Teacher updated successfully",
      );

      /*
       * Go to the teacher details page
       * after successful update.
       */
      navigate(
        `/teachers/${updatedTeacher._id || id}`,
        {
          replace: true,
        },
      );
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update teacher";

      toast.error(message);
    }
  };

  /*
   * Loading state
   */
  if (isTeacherLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 text-center">

          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-xl font-semibold text-white">
            Loading Teacher
          </h2>

          <p className="text-white/60 text-sm mt-2">
            Please wait while we load the teacher
            information.
          </p>

        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (isError || !teacher) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Teacher not found";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-300/20 flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7 text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white">
            Unable to Load Teacher
          </h2>

          <p className="text-white/60 text-sm mt-2">
            {message}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/teachers")
            }
            className="mt-6 w-full h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition"
          >
            Back to Teachers
          </button>

        </div>
      </div>
    );
  }

  const teacherName =
    teacher.user?.name ||
    "Teacher";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-10">

      <div className="w-full max-w-3xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 py-6 mb-5">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teachers/${id}`,
                )
              }
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center shrink-0"
              title="Back"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Edit Teacher
              </h1>

              <p className="text-white/60 text-sm mt-1 truncate">
                Update {teacherName}'s teacher profile
              </p>
            </div>

          </div>

        </div>

        {/* ==================================================
            CURRENT TEACHER SUMMARY
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5 sm:p-6 mb-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
              {teacherName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {teacherName}
                </h2>

                <span
                  className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold ${
                    teacher.isActive
                      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-300/20"
                      : "bg-red-500/15 text-red-200 border border-red-300/20"
                  }`}
                >
                  {teacher.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <p className="text-white/50 text-sm mt-1">
                {teacher.user?.email ||
                  teacher.user?.phone ||
                  "No contact information"}
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={submitHandler}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden"
        >

          <div className="p-5 sm:p-8 space-y-6">

            {/* ==================================================
                USER INFORMATION
            ================================================== */}

            <div>

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-300/20 flex items-center justify-center">

                  <svg
                    className="w-5 h-5 text-cyan-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    />

                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      strokeWidth={1.8}
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M19 8v6m3-3h-6"
                    />
                  </svg>

                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    User Account
                  </h3>

                  <p className="text-xs text-white/50">
                    Linked teacher user account
                  </p>
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">

                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
                >
                  User ID
                </label>

                <input
                  id="user"
                  name="user"
                  type="text"
                  value={formData.user}
                  onChange={changeHandler}
                  placeholder="Enter teacher user ID"
                  className={`w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 outline-none transition shadow-sm ${
                    errors.user
                      ? "border-2 border-red-400 focus:ring-2 focus:ring-red-300"
                      : "border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
                  }`}
                />

                {errors.user && (
                  <p className="mt-2 text-sm text-red-200">
                    {errors.user}
                  </p>
                )}

                <p className="mt-2 text-xs text-white/50">
                  The selected user must have the
                  TEACHER role and belong to this school.
                </p>

              </div>

            </div>

            {/* ==================================================
                PROFESSIONAL INFORMATION
            ================================================== */}

            <div>

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-300/20 flex items-center justify-center">

                  <svg
                    className="w-5 h-5 text-purple-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M5 12v5c0 1.5 3.1 3 7 3s7-1.5 7-3v-5"
                    />
                  </svg>

                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Professional Information
                  </h3>

                  <p className="text-xs text-white/50">
                    Teacher employment details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Employee Code */}

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">

                  <label
                    htmlFor="employeeCode"
                    className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
                  >
                    Employee Code
                  </label>

                  <input
                    id="employeeCode"
                    name="employeeCode"
                    type="text"
                    value={
                      formData.employeeCode
                    }
                    onChange={changeHandler}
                    placeholder="e.g. TCH001"
                    autoComplete="off"
                    className={`w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 uppercase outline-none transition shadow-sm ${
                      errors.employeeCode
                        ? "border-2 border-red-400 focus:ring-2 focus:ring-red-300"
                        : "border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
                    }`}
                  />

                  {errors.employeeCode && (
                    <p className="mt-2 text-sm text-red-200">
                      {errors.employeeCode}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-white/50">
                    Employee codes are automatically
                    stored in uppercase.
                  </p>

                </div>

                {/* Qualification */}

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">

                  <label
                    htmlFor="qualification"
                    className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
                  >
                    Qualification
                    <span className="text-white/40">
                      {" "}
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="qualification"
                    name="qualification"
                    type="text"
                    value={
                      formData.qualification
                    }
                    onChange={changeHandler}
                    placeholder="e.g. M.Sc., B.Ed."
                    className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                  />

                </div>

              </div>

            </div>

            {/* ==================================================
                STATUS
            ================================================== */}

            <div>

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-300/20 flex items-center justify-center">

                  <svg
                    className="w-5 h-5 text-emerald-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C16.176 19.29 20 14.591 20 9c0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>

                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Teacher Status
                  </h3>

                  <p className="text-xs text-white/50">
                    Control teacher profile availability
                  </p>
                </div>

              </div>

              <label
                htmlFor="isActive"
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition ${
                  formData.isActive
                    ? "bg-emerald-500/10 border-emerald-300/20"
                    : "bg-red-500/10 border-red-300/20"
                }`}
              >

                <div>

                  <p className="font-semibold text-white">
                    {formData.isActive
                      ? "Teacher is Active"
                      : "Teacher is Inactive"}
                  </p>

                  <p className="text-xs text-white/50 mt-1">
                    {formData.isActive
                      ? "This teacher profile is currently active."
                      : "This teacher profile is currently inactive."}
                  </p>

                </div>

                <div className="relative shrink-0">

                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={
                      formData.isActive
                    }
                    onChange={changeHandler}
                    className="sr-only peer"
                  />

                  <div className="w-12 h-7 bg-white/20 rounded-full peer-checked:bg-emerald-500 transition-colors" />

                  <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />

                </div>

              </label>

            </div>

          </div>

          {/* ==================================================
              FORM ACTIONS
          ================================================== */}

          <div className="px-5 sm:px-8 py-5 bg-black/10 border-t border-white/10">

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  navigate(
                    `/teachers/${id}`,
                  )
                }
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>

                    Save Changes
                  </span>
                )}
              </button>

            </div>

          </div>
        </form>

        {/* ==================================================
            SCHOOL INFORMATION
        ================================================== */}

        <div className="mt-5 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">

              <svg
                className="w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8"
                />
              </svg>

            </div>

            <div className="flex-1">

              <p className="text-xs text-white/50 uppercase tracking-wide">
                School
              </p>

              <p className="text-white font-semibold mt-0.5">
                {teacher.school?.name ||
                  "School"}
              </p>

              {teacher.school?.code && (
                <p className="text-white/50 text-xs mt-0.5">
                  Code: {teacher.school.code}
                </p>
              )}

            </div>

            <span className="hidden sm:block px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white/60">
              School cannot be changed here
            </span>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EditTeacherScreen;
