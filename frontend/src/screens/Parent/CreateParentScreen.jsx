import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useCreateParentMutation,
} from "../../slices/parentApiSlice";

const CreateParentScreen = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState("");

  const [createParent, { isLoading }] =
    useCreateParentMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    const normalizedUser = user.trim();

    if (!normalizedUser) {
      toast.error("User ID is required");
      return;
    }

    try {
      await createParent({
        user: normalizedUser,
      }).unwrap();

      toast.success(
        "Parent profile created successfully",
      );

      setUser("");

      navigate("/parents");
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to create parent profile";

      switch (message) {
        case "User is required":
          toast.error("Please enter a user ID");
          break;

        case "School is required":
          toast.error(
            "School could not be identified",
          );
          break;

        case "School not found":
          toast.error("School not found");
          break;

        case "School is inactive":
          toast.error(
            "Your school is currently inactive",
          );
          break;

        case "User not found":
          toast.error("User was not found");
          break;

        case "Selected user must have PARENT role":
          toast.error(
            "The selected user must have PARENT role",
          );
          break;

        case "Parent user must belong to a school":
          toast.error(
            "The selected parent user does not belong to a school",
          );
          break;

        case "User does not belong to the selected school":
          toast.error(
            "The selected user does not belong to your school",
          );
          break;

        case "Parent profile already exists for this user":
          toast.error(
            "A parent profile already exists for this user",
          );
          break;

        default:
          toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:py-10">

      <div className="w-full max-w-2xl">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-5 sm:px-8 py-6 border-b border-white/10">

            <div className="flex items-start gap-4">

              <button
                type="button"
                onClick={() => navigate("/parents")}
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center shrink-0"
                title="Back to parents"
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

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-300/20 flex items-center justify-center">

                  <svg
                    className="w-6 h-6 text-cyan-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Create Parent
                  </h1>

                  <p className="text-white/60 text-sm mt-1">
                    Create a parent profile for an
                    existing PARENT user.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="p-5 sm:p-8"
          >

            {/* Information */}
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-300/20">

              <div className="flex gap-3">

                <svg
                  className="w-5 h-5 text-cyan-200 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <div>
                  <p className="text-sm font-semibold text-cyan-100">
                    Parent profile
                  </p>

                  <p className="text-xs text-cyan-100/60 mt-1 leading-5">
                    Select an existing user with the{" "}
                    <span className="font-semibold text-cyan-100">
                      PARENT
                    </span>{" "}
                    role. The school is automatically
                    determined from your account.
                  </p>
                </div>

              </div>

            </div>

            {/* User ID */}
            <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">

              <label
                htmlFor="user"
                className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
              >
                User ID
                <span className="text-red-300 ml-1">
                  *
                </span>
              </label>

              <input
                id="user"
                name="user"
                type="text"
                value={user}
                onChange={(e) =>
                  setUser(e.target.value)
                }
                placeholder="Enter the existing PARENT user's ID"
                autoComplete="off"
                autoFocus
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm font-mono"
              />

              <p className="mt-2 text-xs text-white/40">
                Enter the MongoDB ObjectId of the
                existing PARENT user.
              </p>

            </div>

            {/* School information */}
            <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4">

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center shrink-0">

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
                      d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8"
                    />
                  </svg>

                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-100">
                    School
                  </p>

                  <p className="text-xs text-emerald-100/60 mt-1">
                    The parent will automatically be
                    associated with your school.
                  </p>
                </div>

              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">

              <button
                type="button"
                disabled={isLoading}
                onClick={() => navigate("/parents")}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">

                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Creating Parent...

                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">

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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>

                    Create Parent

                  </span>
                )}

              </button>

            </div>

          </form>
        </div>

        <div className="text-center mt-5 text-white/50 text-xs">
          The school is automatically determined
          from your authenticated account.
        </div>

      </div>
    </div>
  );
};

export default CreateParentScreen;
