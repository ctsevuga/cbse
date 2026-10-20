
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRegisterMutation } from "../slices/usersApiSlice";

import { toast } from "react-toastify";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !password) {
      toast.error("Name, phone number and password are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      }).unwrap();

      toast.success("User created successfully");

      navigate("/users");
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Registration failed";

      if (message === "Only admin can create users") {
        toast.error("Only school administrators can create users");
      } else if (
        message === "School could not be identified" ||
        message === "School profile not found"
      ) {
        toast.error(
          "School could not be identified. Please access the application using your school URL.",
        );
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Create User
          </h1>

          <p className="text-gray-500 mt-2">
            Add a user to your school account
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
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-2 pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
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

                  Creating User...
                </div>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-gray-600">
          Only school administrators can create users.
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

