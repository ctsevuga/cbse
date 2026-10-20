import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetParentDetailsQuery,
  useUpdateParentMutation,
} from "../../slices/parentApiSlice";

const EditParentScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: parent,
    isLoading: isParentLoading,
    isError,
    error,
  } = useGetParentDetailsQuery(id);

  const [
    updateParent,
    { isLoading: isUpdating },
  ] = useUpdateParentMutation();

  const [user, setUser] = useState("");
  const [isActive, setIsActive] =
    useState(true);

  const [initialized, setInitialized] =
    useState(false);

  // ======================================================
  // Populate form when parent data is loaded
  // ======================================================

  useEffect(() => {
    if (!parent || initialized) {
      return;
    }

    setUser(parent.user?._id || "");
    setIsActive(parent.isActive ?? true);

    setInitialized(true);
  }, [parent, initialized]);

  // ======================================================
  // Submit handler
  // ======================================================

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please select a parent user");
      return;
    }

    try {
      const updatedParent =
        await updateParent({
          id,
          user,
          isActive,
        }).unwrap();

      toast.success(
        "Parent profile updated successfully",
      );

      navigate(
        `/parents/${updatedParent._id}`,
        { replace: true },
      );
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to update parent profile";

      toast.error(message);
    }
  };

  // ======================================================
  // Loading state
  // ======================================================

  if (isParentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">

        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">

          <div className="animate-pulse space-y-6">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10" />

              <div className="flex-1 space-y-3">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>

            <div className="h-14 bg-white/10 rounded-xl" />
            <div className="h-14 bg-white/10 rounded-xl" />
            <div className="h-14 bg-white/10 rounded-xl" />

          </div>

        </div>

      </div>
    );
  }

  // ======================================================
  // Error state
  // ======================================================

  if (isError || !parent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">

        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-300/20 flex items-center justify-center">

            <svg
              className="w-8 h-8 text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v4m0 4h.01M10.29 3.86l-8.1 14a2 2 0 001.74 3h16.14a2 2 0 001.74-3l-8.1-14a2 2 0 00-3.42 0z"
              />
            </svg>

          </div>

          <h2 className="text-xl font-bold text-white mt-5">
            Unable to load parent
          </h2>

          <p className="text-sm text-white/60 mt-2">
            {error?.data?.message ||
              error?.error ||
              "The parent profile could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/parents")
            }
            className="mt-6 h-11 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
          >
            Back to Parents
          </button>

        </div>

      </div>
    );
  }

  const parentName =
    parent.user?.name || "Parent";

  const initials =
    parentName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part[0]?.toUpperCase(),
      )
      .join("") || "P";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:px-6 sm:py-10">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="px-5 py-6 sm:px-8 border-b border-white/10">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div className="flex items-center gap-4 min-w-0">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center shrink-0">

                  <span className="text-xl font-bold text-white">
                    {initials}
                  </span>

                </div>

                <div className="min-w-0">

                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Edit Parent
                  </h1>

                  <p className="text-sm text-white/60 mt-1 truncate">
                    Update {parentName}'s profile
                    information.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/parents/${id}`)
                }
                className="h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>

                Back
              </button>

            </div>

          </div>

          {/* ==================================================
              Form
          ================================================== */}

          <form
            onSubmit={submitHandler}
            className="p-5 sm:p-8 space-y-6"
          >

            {/* ==================================================
                School information
            ================================================== */}

            <div className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-9 h-9 rounded-lg bg-purple-400/10 border border-purple-300/10 flex items-center justify-center">

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
                      d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01"
                    />
                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    School
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    School assignment cannot be
                    changed here.
                  </p>
                </div>

              </div>

              <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">

                <p className="text-xs text-white/40 uppercase tracking-wide">
                  School
                </p>

                <p className="text-sm font-medium text-white mt-1">
                  {parent.school?.name ||
                    "Unknown School"}
                </p>

                {parent.school?.code && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {parent.school.code}
                  </p>
                )}

              </div>

            </div>

            {/* ==================================================
                Parent user
            ================================================== */}

            <div className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-300/10 flex items-center justify-center">

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
                  <h2 className="text-lg font-semibold text-white">
                    Parent User
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    Select the user associated with
                    this parent profile.
                  </p>
                </div>

              </div>

              {/* ==================================================
                  Current user information
              ================================================== */}

              <div className="rounded-lg bg-cyan-500/5 border border-cyan-300/10 p-4 mb-4">

                <p className="text-xs text-cyan-100/50 uppercase tracking-wide">
                  Currently Assigned User
                </p>

                <p className="text-sm font-semibold text-white mt-1">
                  {parent.user?.name ||
                    "Unknown User"}
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-1 mt-2">

                  {parent.user?.phone && (
                    <span className="text-xs text-white/50">
                      {parent.user.phone}
                    </span>
                  )}

                  {parent.user?.email && (
                    <span className="text-xs text-white/50">
                      {parent.user.email}
                    </span>
                  )}

                </div>

              </div>

              {/* ==================================================
                  User ID
                  ==================================================
                  Replace this with your PARENT-user query when
                  available.
              ================================================== */}

              <label className="flex flex-col gap-2">

                <span className="text-sm font-medium text-indigo-100 tracking-wide">
                  Parent User ID
                </span>

                <input
                  type="text"
                  value={user}
                  onChange={(e) =>
                    setUser(e.target.value)
                  }
                  placeholder="Enter parent user ID"
                  className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
                />

              </label>

              <p className="text-xs text-white/40 mt-2">
                The selected user must have the
                PARENT role and belong to this school.
              </p>

            </div>

            {/* ==================================================
                Status
            ================================================== */}

            <div className="rounded-xl bg-white/5 border border-white/10 p-5">

              <div className="flex items-center gap-3 mb-5">

                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-emerald-400/10 border border-emerald-300/10"
                      : "bg-red-400/10 border border-red-300/10"
                  }`}
                >

                  {isActive ? (
                    <svg
                      className="w-5 h-5 text-emerald-200"
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
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M18.36 5.64a9 9 0 11-12.73 12.73A9 9 0 0118.36 5.64z"
                      />
                    </svg>
                  )}

                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Account Status
                  </h2>

                  <p className="text-xs text-white/40 mt-0.5">
                    Control whether this parent
                    profile is active.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsActive((prev) => !prev)
                }
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-300/20 hover:bg-emerald-500/15"
                    : "bg-red-500/10 border-red-300/20 hover:bg-red-500/15"
                }`}
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-emerald-400/10"
                          : "bg-red-400/10"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isActive
                            ? "bg-emerald-300"
                            : "bg-red-300"
                        }`}
                      />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-white">
                        {isActive
                          ? "Active"
                          : "Inactive"}
                      </p>

                      <p className="text-xs text-white/50 mt-0.5">
                        Click to{" "}
                        {isActive
                          ? "deactivate"
                          : "activate"}{" "}
                        this profile
                      </p>

                    </div>

                  </div>

                  {/* Toggle */}

                  <div
                    className={`w-12 h-6 rounded-full p-1 transition ${
                      isActive
                        ? "bg-emerald-500"
                        : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        isActive
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </div>

                </div>

              </button>

            </div>

            {/* ==================================================
                Actions
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >

                {isUpdating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Saving...
                  </>
                ) : (
                  <>
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
                  </>
                )}

              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  navigate(`/parents/${id}`)
                }
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

        <div className="text-center mt-5 text-white/40 text-xs">
          Parent profile settings
        </div>

      </div>

    </div>
  );
};

export default EditParentScreen;
