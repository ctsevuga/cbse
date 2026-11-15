
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateTeacherMutation } from "../../slices/teacherApiSlice";
import {
  useGetTeacherUsersQuery,
} from "../../slices/usersApiSlice";

const CreateTeacherScreen = () => {
  const navigate = useNavigate();

  // ============================================
  // FORM STATE
  // ============================================

  const [user, setUser] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [qualification, setQualification] = useState("");

  // ============================================
  // API
  // ============================================

  const [createTeacher, { isLoading }] =
    useCreateTeacherMutation();

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch,
  } = useGetTeacherUsersQuery();

  // ============================================
  // NORMALIZE USERS RESPONSE
  // ============================================

  const users = useMemo(() => {
    return usersData?.users || [];
  }, [usersData]);

  // ============================================
  // SELECTED USER
  // ============================================

  const selectedUser = useMemo(() => {
    return users.find(
      (item) => String(item._id) === String(user)
    );
  }, [users, user]);

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = () => {
    setUser("");
    setEmployeeCode("");
    setQualification("");
  };

  // ============================================
  // SUBMIT HANDLER
  // ============================================

  const submitHandler = async (e) => {
    e.preventDefault();

    const normalizedEmployeeCode =
      employeeCode.trim().toUpperCase();

    const normalizedQualification =
      qualification.trim();

    if (!user) {
      toast.error("Please select a teacher");
      return;
    }

    if (!normalizedEmployeeCode) {
      toast.error("Please enter an employee code");
      return;
    }

    try {
      await createTeacher({
        user,
        employeeCode: normalizedEmployeeCode,
        qualification:
          normalizedQualification || undefined,
      }).unwrap();

      toast.success("Teacher created successfully");

      resetForm();

      navigate("/teachers");

    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to create teacher";

      switch (message) {
        case "Teacher profile already exists for this user":
          toast.error(
            "A teacher profile already exists for this user."
          );
          break;

        case "Employee code already exists in this school":
          toast.error(
            "This employee code is already used in this school."
          );
          break;

        case "User does not belong to the logged-in user's school":
          toast.error(
            "The selected user does not belong to your school."
          );
          break;

        case "Selected user must have TEACHER role":
          toast.error(
            "Please select a user with the TEACHER role."
          );
          break;

        case "School context is missing. Please authenticate and resolve school.":
          toast.error(
            "Unable to identify your school. Please login again."
          );
          break;

        case "School is inactive":
          toast.error("Your school is inactive.");
          break;

        default:
          toast.error(message);
      }
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:py-10">

      <div className="w-full max-w-sm sm:max-w-xl lg:max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 lg:px-10 py-7 sm:py-9">

        {/* HEADER */}

        <div className="text-center mb-7">

          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">

            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 14c3.314 0 6-2.239 6-5s-2.686-5-6-5-6 2.239-6 5 2.686 5 6 5z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 21c.8-3.5 4.2-5 9-5s8.2 1.5 9 5"
              />
            </svg>

          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Create Teacher
          </h2>

          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Add a teacher profile to your school
          </p>

        </div>

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >

          {/* TEACHER DROPDOWN */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">

            <label
              htmlFor="teacher-user"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Select Teacher
            </label>

            <select
              id="teacher-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={isUsersLoading || isUsersError || users.length === 0}
              required
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
            >

              <option value="">
                {isUsersLoading
                  ? "Loading teachers..."
                  : isUsersError
                    ? "Unable to load teachers"
                    : users.length === 0
                      ? "No teacher users available"
                      : "Select a teacher"}
              </option>

              {users.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                  {item.phone
                    ? ` - ${item.phone}`
                    : ""}
                  {item.email
                    ? ` (${item.email})`
                    : ""}
                </option>
              ))}

            </select>

            {isUsersError && (
              <div className="flex items-center justify-between">

                <p className="text-xs text-red-200">
                  Unable to load teacher users.
                </p>

                <button
                  type="button"
                  onClick={refetch}
                  className="text-xs text-white underline hover:text-indigo-200"
                >
                  Retry
                </button>

              </div>
            )}

            {!isUsersLoading &&
              !isUsersError &&
              users.length === 0 && (
                <p className="text-xs text-yellow-200">
                  No active teacher users found in your school.
                </p>
              )}

            <p className="text-xs text-indigo-100/60">
              Only active TEACHER users belonging to your school are displayed.
            </p>

          </div>

          {/* SELECTED TEACHER */}

          {selectedUser && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-300/20">

              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {(selectedUser.name || "T")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold text-white truncate">
                  {selectedUser.name}
                </p>

                <p className="text-xs text-white/60 truncate">
                  {selectedUser.email || selectedUser.phone}
                </p>

              </div>

              <span className="ml-auto text-xs font-semibold text-emerald-300">
                Selected
              </span>

            </div>
          )}

          {/* EMPLOYEE CODE */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">

            <label
              htmlFor="employee-code"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Employee Code
            </label>

            <input
              id="employee-code"
              type="text"
              placeholder="e.g. TCH001"
              value={employeeCode}
              onChange={(e) =>
                setEmployeeCode(e.target.value.toUpperCase())
              }
              maxLength={30}
              autoComplete="off"
              required
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm uppercase"
            />

            <p className="text-xs text-indigo-100/60">
              This code must be unique within the school.
            </p>

          </div>

          {/* QUALIFICATION */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">

            <label
              htmlFor="qualification"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Qualification
              <span className="text-white/50"> (Optional)</span>
            </label>

            <input
              id="qualification"
              type="text"
              placeholder="e.g. M.Sc, B.Ed"
              value={qualification}
              onChange={(e) =>
                setQualification(e.target.value)
              }
              maxLength={100}
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
            />

          </div>

          {/* TEACHER PROFILE SUMMARY */}

          {(selectedUser || employeeCode || qualification) && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">

              <h3 className="text-sm font-semibold text-white mb-3">
                Teacher Profile Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <p className="text-xs text-white/50">
                    Teacher
                  </p>

                  <p className="text-sm text-white font-medium truncate">
                    {selectedUser?.name || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    School
                  </p>

                  <p className="text-sm text-white font-medium">
                    Automatically resolved by backend
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    Employee Code
                  </p>

                  <p className="text-sm text-white font-medium">
                    {employeeCode.trim()
                      ? employeeCode.trim().toUpperCase()
                      : "Not entered"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    Qualification
                  </p>

                  <p className="text-sm text-white font-medium truncate">
                    {qualification.trim() || "Not specified"}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-3 pt-3">

            <button
              type="submit"
              disabled={
                isLoading ||
                isUsersLoading ||
                isUsersError ||
                !user
              }
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse tracking-wide">
                  Creating Teacher...
                </span>
              ) : (
                "Create Teacher"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/teachers")}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              Cancel
            </button>

          </div>

        </form>

        {/* FOOTER */}

        <div className="text-center mt-6 text-white/60 text-xs sm:text-sm">
          Teacher profiles are linked to an existing teacher user account.
        </div>

      </div>
    </div>
  );
};

export default CreateTeacherScreen;
