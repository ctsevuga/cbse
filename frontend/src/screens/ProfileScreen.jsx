
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useCreateProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";

const ProfileScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateProfile, { isLoading }] =
    useCreateProfileMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      setPhone(userInfo.phone || "");
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone number are required");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password || undefined,
      }).unwrap();

      dispatch(setCredentials(res));

      setPassword("");
      setConfirmPassword("");

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update profile"
      );
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 md:p-10 border border-white/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            My Profile
          </h2>

          <p className="text-gray-500 mt-2">
            Update your personal information and password
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phone Number
            </label>

            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              autoComplete="tel"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Role
            </label>

            <input
              type="text"
              value={userInfo.role || ""}
              disabled
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Updating...
                </div>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;

