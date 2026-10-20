import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  useLoginMutation,
  useForgotPasswordMutation,
} from "../slices/usersApiSlice";

import { useGetActiveSchoolsQuery } from "../slices/schoolApiSlice";

import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";

const LoginScreen = () => {
  // School filters and selection
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");

  // Login fields
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);
  const [forgotPhone, setForgotPhone] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: schools = [],
    isLoading: isSchoolsLoading,
    isError: isSchoolsError,
    error: schoolsError,
  } = useGetActiveSchoolsQuery();

  const [login, { isLoading }] = useLoginMutation();

  const [
    forgotPassword,
    { isLoading: isForgotPasswordLoading },
  ] = useForgotPasswordMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const redirect =
    new URLSearchParams(location.search).get("redirect") ||
    "/home";

  // ============================================
  // UNIQUE STATES
  // ============================================

  const states = useMemo(() => {
    return [
      ...new Set(
        schools
          .map((school) => school.state?.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [schools]);

  // ============================================
  // CITIES FOR SELECTED STATE
  // ============================================

  const cities = useMemo(() => {
    return [
      ...new Set(
        schools
          .filter(
            (school) =>
              !selectedState ||
              school.state?.toLowerCase() ===
                selectedState.toLowerCase(),
          )
          .map((school) => school.city?.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [schools, selectedState]);

  // ============================================
  // FILTER SCHOOLS
  // ============================================

  const filteredSchools = useMemo(() => {
    return schools
      .filter((school) => {
        const matchesState =
          !selectedState ||
          school.state?.toLowerCase() ===
            selectedState.toLowerCase();

        const matchesCity =
          !selectedCity ||
          school.city?.toLowerCase() ===
            selectedCity.toLowerCase();

        return matchesState && matchesCity;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [schools, selectedState, selectedCity]);

  // ============================================
  // AUTHENTICATED USER REDIRECT
  // ============================================

  useEffect(() => {
    if (!userInfo) return;

    if (userInfo.mustChangePassword) {
      navigate("/change-password", {
        replace: true,
      });
      return;
    }

    navigate(redirect, {
      replace: true,
    });
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
  console.log("Active schools:", schools);
}, [schools]);

  // ============================================
  // STATE CHANGE
  // ============================================

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity("");
    setSchoolSlug("");
  };

  // ============================================
  // CITY CHANGE
  // ============================================

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSchoolSlug("");
  };

  // ============================================
  // SCHOOL CHANGE
  // ============================================

  const handleSchoolChange = (e) => {
    setSchoolSlug(e.target.value);
  };

  // ============================================
  // LOGIN
  // ============================================

  const submitHandler = async (e) => {
    e.preventDefault();

    const normalizedPhone = phone.trim();

    console.log("Selected schoolSlug:", schoolSlug);
console.log("Login payload:", {
  schoolSlug,
  phone: normalizedPhone,
  password: "[REDACTED]",
});

    if (!schoolSlug) {
      toast.error("Please select your school");
      return;
    }

    if (!normalizedPhone || !password) {
      toast.error(
        "Please enter your phone number and password",
      );
      return;
    }

    try {
      const res = await login({
        schoolSlug,
        phone: normalizedPhone,
        password,
      }).unwrap();

      dispatch(setCredentials(res));

      if (res.mustChangePassword) {
        toast.info(
          "Please change your temporary password",
        );

        navigate("/change-password", {
          replace: true,
        });

        return;
      }

      navigate(redirect, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Login failed";

      switch (message) {
        case "School could not be identified":
        case "School not found or inactive":
          toast.error(
            "Please select a valid, active school.",
          );
          break;

        case "Invalid phone number or password":
          toast.error(
            "Invalid phone number or password",
          );
          break;

        default:
          toast.error(message);
      }
    }
  };

  // ============================================
  // FORGOT PASSWORD
  // ============================================

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();

    const normalizedPhone = forgotPhone.trim();

    if (!schoolSlug) {
      toast.error("Please select your school");
      return;
    }

    if (!normalizedPhone) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      const res = await forgotPassword({
        slug: schoolSlug,
        phone: normalizedPhone,
      }).unwrap();

      toast.success(
        res?.message ||
          "If your account exists, your password reset request has been recorded.",
      );

      setShowForgotPassword(false);
      setForgotPhone("");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to submit password reset request",
      );
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-10">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-6 sm:px-8 py-8">
        {/* HEADER */}

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome Back
          </h2>

          <h5 className="text-white/70 font-bold sm:text-xl mt-1">
            Sign in to continue
          </h5>
        </div>

        {/* SCHOOL LOADING ERROR */}

        {isSchoolsError && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-500/20 border border-red-300/30 p-3 text-sm text-white"
          >
            {schoolsError?.data?.message ||
              "Unable to load schools. Please refresh the page and try again."}
          </div>
        )}

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >
          {/* STATE FILTER */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <label
              htmlFor="state"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Filter by State
            </label>

            <select
              id="state"
              value={selectedState}
              onChange={handleStateChange}
              disabled={
                isSchoolsLoading ||
                isSchoolsError ||
                states.length === 0 ||
                isLoading
              }
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:opacity-60"
            >
              <option value="">
                {isSchoolsLoading
                  ? "Loading states..."
                  : states.length === 0
                    ? "No states available"
                    : "All States"}
              </option>

              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* CITY FILTER */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <label
              htmlFor="city"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Filter by City / Town
            </label>

            <select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={
                isSchoolsLoading ||
                isSchoolsError ||
                cities.length === 0 ||
                isLoading
              }
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:opacity-60"
            >
              <option value="">
                {selectedState
                  ? "All Cities"
                  : "All Cities / Towns"}
              </option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* SCHOOL SELECTOR */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <label
              htmlFor="school"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Select School
            </label>

            <select
              id="school"
              value={schoolSlug}
              onChange={handleSchoolChange}
              disabled={
                isSchoolsLoading ||
                isSchoolsError ||
                filteredSchools.length === 0 ||
                isLoading
              }
              required
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:opacity-60"
            >
              <option value="">
                {isSchoolsLoading
                  ? "Loading schools..."
                  : isSchoolsError
                    ? "Unable to load schools"
                    : filteredSchools.length === 0
                      ? "No schools match your filters"
                      : "Choose your school"}
              </option>

              {filteredSchools.map((school) => {
                const location = [
                  school.city,
                  school.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <option
                    key={school.slug}
                    value={school.slug}
                  >
                    {school.name}
                    {location ? ` — ${location}` : ""}
                  </option>
                );
              })}
            </select>

            {!isSchoolsLoading &&
              !isSchoolsError &&
              schools.length === 0 && (
                <p className="text-xs text-indigo-100">
                  No active schools are currently available.
                  Please contact your administrator.
                </p>
              )}

            {!isSchoolsLoading &&
              !isSchoolsError &&
              schools.length > 0 &&
              filteredSchools.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedState("");
                    setSelectedCity("");
                    setSchoolSlug("");
                  }}
                  className="self-start text-sm text-indigo-200 hover:text-white underline"
                >
                  Clear filters
                </button>
              )}
          </div>

          {/* PHONE */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              autoFocus
              required
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
            />
          </div>

          {/* PASSWORD */}

          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <label
              htmlFor="password"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Password
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full h-12 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm px-4"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="self-start text-sm font-medium text-indigo-200 hover:text-indigo-400 transition px-1 py-1"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              disabled={
                isLoading ||
                isSchoolsLoading ||
                isSchoolsError ||
                !schoolSlug
              }
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse tracking-wide">
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForgotPassword((prev) => !prev)
              }
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
            >
              Forgot Password
            </button>
          </div>
        </form>

        {/* FORGOT PASSWORD FORM */}

        {showForgotPassword && (
          <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/20">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Forgot Password?
              </h3>

              <p className="text-sm text-white/70 mt-1">
                Enter your registered phone number.
                Your request will be sent to your school
                administrator.
              </p>

              {!schoolSlug && (
                <p className="text-sm text-amber-200 mt-2">
                  Select your school above before submitting
                  a password reset request.
                </p>
              )}
            </div>

            <form
              onSubmit={forgotPasswordHandler}
              className="space-y-3"
            >
              <input
                type="tel"
                inputMode="tel"
                placeholder="Enter your phone number"
                value={forgotPhone}
                onChange={(e) =>
                  setForgotPhone(e.target.value)
                }
                autoComplete="tel"
                required
                className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
              />

              <button
                type="submit"
                disabled={
                  isForgotPasswordLoading ||
                  !schoolSlug
                }
                className="w-full h-11 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isForgotPasswordLoading
                  ? "Submitting..."
                  : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* FOOTER */}

        <div className="text-center mt-6 text-white/70 text-sm">
          Students are created and managed by their
          school administrator.
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;