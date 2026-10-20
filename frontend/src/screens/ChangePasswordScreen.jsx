
import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { toast } from "react-toastify";

import {
  useChangePasswordMutation,
} from "../slices/usersApiSlice";

import {
  setCredentials,
} from "../slices/authSlice";

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const [
    changePassword,
    { isLoading },
  ] = useChangePasswordMutation();

  const redirect =
    new URLSearchParams(location.search).get("redirect") ||
    "/home";

  useEffect(() => {
    if (!userInfo) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(
        "New password must be different from current password"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      dispatch(
        setCredentials({
          ...userInfo,
          mustChangePassword: false,
        })
      );

      toast.success(
        "Password changed successfully"
      );

      navigate(redirect, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Failed to change password";

      toast.error(message);
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-6 sm:px-8 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Change Password
          </h2>

          <p className="text-white/70 mt-2">
            Create a new password for your account
          </p>
        </div>

        {userInfo.mustChangePassword && (
          <div className="mb-6 rounded-xl border border-yellow-300/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
            <p className="font-semibold mb-1">
              Password change required
            </p>

            <p>
              You are using a temporary password.
              Please change it before continuing.
            </p>
          </div>
        )}

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-indigo-100"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                className="w-full h-12 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm px-4 pr-20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showCurrentPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-indigo-100"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className="w-full h-12 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm px-4 pr-20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showNewPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            <p className="text-xs text-indigo-100/70">
              Password must be at least 6 characters.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-indigo-100"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className="w-full h-12 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm px-4 pr-20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse tracking-wide">
                Changing Password...
              </span>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;

