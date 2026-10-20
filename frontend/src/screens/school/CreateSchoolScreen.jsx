import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useCreateSchoolMutation,
} from "../../slices/schoolApiSlice";

const CreateSchoolScreen = () => {
  const navigate = useNavigate();

  const [createSchool, { isLoading }] =
    useCreateSchoolMutation();

  const [formData, setFormData] = useState({
    // School
    name: "",
    code: "",
    slug: "",
    address: "",

    // Contact
    contactPhone: "",
    contactEmail: "",
    website: "",
    contactPerson: "",

    // Configuration
    logo: "",
    academicSession: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",

    // Status
    isActive: true,

    // Initial administrator
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [createdResult, setCreatedResult] =
    useState(null);

  const [showPassword, setShowPassword] =
    useState(false);

  // ======================================================
  // Change handler
  // ======================================================

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

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

  // ======================================================
  // Generate slug from school name
  // ======================================================

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const schoolNameChangeHandler = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug
        ? prev.slug
        : generateSlug(value),
    }));

    setErrors((prev) => ({
      ...prev,
      name: "",
    }));
  };

  // ======================================================
  // Validation
  // ======================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "School name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code =
        "School code is required";
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName =
        "Administrator name is required";
    }

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone =
        "Administrator phone number is required";
    }

    if (
      formData.contactEmail.trim() &&
      !isValidEmail(
        formData.contactEmail.trim(),
      )
    ) {
      newErrors.contactEmail =
        "Please enter a valid email address";
    }

    if (
      formData.adminEmail.trim() &&
      !isValidEmail(
        formData.adminEmail.trim(),
      )
    ) {
      newErrors.adminEmail =
        "Please enter a valid administrator email";
    }

    if (
      formData.website.trim() &&
      !isValidWebsite(
        formData.website.trim(),
      )
    ) {
      newErrors.website =
        "Please enter a valid website URL";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  };

  const isValidWebsite = (website) => {
    try {
      new URL(
        website.startsWith("http")
          ? website
          : `https://${website}`,
      );

      return true;
    } catch {
      return false;
    }
  };

  // ======================================================
  // Submit handler
  // ======================================================

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Please correct the highlighted fields",
      );
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),

        code: formData.code
          .trim()
          .toUpperCase(),

        slug: formData.slug.trim()
          ? generateSlug(formData.slug)
          : undefined,

        address:
          formData.address.trim() ||
          undefined,

        contactDetails: {
          phone:
            formData.contactPhone.trim() ||
            undefined,

          email:
            formData.contactEmail
              .trim()
              .toLowerCase() ||
            undefined,

          website:
            formData.website.trim() ||
            undefined,

          contactPerson:
            formData.contactPerson.trim() ||
            undefined,
        },

        configuration: {
          logo:
            formData.logo.trim() ||
            undefined,

          academicSession:
            formData.academicSession.trim() ||
            undefined,

          timezone:
            formData.timezone.trim() ||
            "Asia/Kolkata",

          currency:
            formData.currency.trim() ||
            "INR",

          language:
            formData.language.trim() ||
            "en",
        },

        isActive: formData.isActive,

        adminName:
          formData.adminName.trim(),

        adminEmail:
          formData.adminEmail
            .trim()
            .toLowerCase() || undefined,

        adminPhone:
          formData.adminPhone.trim(),
      };

      const response =
        await createSchool(payload).unwrap();

      setCreatedResult(response);

      toast.success(
        "School created successfully",
      );
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to create school";

      toast.error(message);
    }
  };

  // ======================================================
  // Success screen
  // ======================================================

  if (createdResult) {
    const school =
      createdResult.school || {};

    const schoolAdmin =
      createdResult.schoolAdmin || {};

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">

        <div className="w-full max-w-2xl">

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">

            {/* Success header */}

            <div className="p-6 sm:p-8 text-center bg-emerald-500/10 border-b border-white/10">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-300/20 flex items-center justify-center mb-4">

                <svg
                  className="w-8 h-8 text-emerald-200"
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

              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                School Created Successfully
              </h1>

              <p className="text-white/60 mt-2 text-sm sm:text-base">
                The school and its initial administrator
                account have been created.
              </p>

            </div>

            <div className="p-5 sm:p-8 space-y-5">

              {/* School details */}

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">

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
                        d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8"
                      />
                    </svg>

                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      School Information
                    </h2>

                    <p className="text-xs text-white/50">
                      Newly created school
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <SuccessRow
                    label="School Name"
                    value={
                      school.name ||
                      formData.name
                    }
                  />

                  <SuccessRow
                    label="School Code"
                    value={
                      school.code ||
                      formData.code
                    }
                  />

                  <SuccessRow
                    label="School Slug"
                    value={
                      school.slug ||
                      formData.slug
                    }
                  />

                  <SuccessRow
                    label="Status"
                    value={
                      school.isActive
                        ? "Active"
                        : "Inactive"
                    }
                  />

                </div>

              </div>

              {/* Administrator */}

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">

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
                    <h2 className="text-lg font-bold text-white">
                      School Administrator
                    </h2>

                    <p className="text-xs text-white/50">
                      Initial administrator account
                    </p>
                  </div>

                </div>

                <div className="space-y-3">

                  <SuccessRow
                    label="Name"
                    value={
                      schoolAdmin.name ||
                      formData.adminName
                    }
                  />

                  <SuccessRow
                    label="Phone"
                    value={
                      schoolAdmin.phone ||
                      formData.adminPhone
                    }
                  />

                  <SuccessRow
                    label="Email"
                    value={
                      schoolAdmin.email ||
                      formData.adminEmail ||
                      "Not provided"
                    }
                  />

                  <SuccessRow
                    label="Role"
                    value="SCHOOL_ADMIN"
                  />

                </div>

              </div>

              {/* Temporary password */}

              <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300/20 flex items-center justify-center shrink-0">

                    <svg
                      className="w-5 h-5 text-amber-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 15v2m0-10v4m9 1a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                  </div>

                  <div className="flex-1 min-w-0">

                    <h3 className="text-base font-bold text-amber-100">
                      Temporary Password
                    </h3>

                    <p className="text-xs text-amber-100/60 mt-1 leading-5">
                      Save this password securely and
                      provide it to the school administrator.
                      The administrator will be required
                      to change it after the first login.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">

                      <div className="flex-1 h-12 rounded-lg bg-black/20 border border-amber-300/20 flex items-center px-4">

                        <span className="font-mono text-lg font-bold text-amber-100 tracking-wider break-all">
                          {showPassword
                            ? createdResult.temporaryPassword
                            : "••••••••••••"}
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev,
                          )
                        }
                        className="h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition font-medium"
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard
                            ?.writeText(
                              createdResult.temporaryPassword,
                            );

                          toast.success(
                            "Temporary password copied",
                          );
                        }}
                        className="h-12 px-4 rounded-lg bg-amber-500/20 border border-amber-300/20 text-amber-100 hover:bg-amber-500/30 transition font-medium"
                      >
                        Copy
                      </button>

                    </div>

                  </div>

                </div>

              </div>

              {/* Warning */}

              <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-300/20">

                <svg
                  className="w-5 h-5 text-red-200 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                  />
                </svg>

                <p className="text-xs text-red-100/80 leading-5">
                  This temporary password is sensitive
                  information. Do not share it publicly.
                  Make sure the administrator receives it
                  through a secure channel.
                </p>

              </div>

              {/* Actions */}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/schools/${school._id}`,
                    )
                  }
                  className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                >
                  View School
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/schools")
                  }
                  className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
                >
                  Back to Schools
                </button>

              </div>

              <button
                type="button"
                onClick={() => {
                  setCreatedResult(null);

                  setFormData({
                    name: "",
                    code: "",
                    slug: "",
                    address: "",
                    contactPhone: "",
                    contactEmail: "",
                    website: "",
                    contactPerson: "",
                    logo: "",
                    academicSession: "",
                    timezone: "Asia/Kolkata",
                    currency: "INR",
                    language: "en",
                    isActive: true,
                    adminName: "",
                    adminEmail: "",
                    adminPhone: "",
                  });
                }}
                className="w-full text-sm text-white/60 hover:text-white transition py-2"
              >
                Create Another School
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ======================================================
  // Create school form
  // ======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-6 sm:py-10">

      <div className="w-full max-w-4xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 py-6 mb-5">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/schools")
              }
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center justify-center shrink-0"
              title="Back to schools"
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

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Create School
              </h1>

              <p className="text-white/60 text-sm mt-1">
                Set up a new school and its initial
                administrator account
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

          <div className="p-5 sm:p-8 space-y-7">

            {/* ==================================================
                SCHOOL INFORMATION
            ================================================== */}

            <FormSection
              title="School Information"
              description="Basic information used to identify the school."
              icon={
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
                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8"
                  />
                </svg>
              }
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label="School Name"
                  name="name"
                  value={formData.name}
                  onChange={
                    schoolNameChangeHandler
                  }
                  placeholder="e.g. Delhi Public School"
                  required
                  error={errors.name}
                />

                <InputField
                  label="School Code"
                  name="code"
                  value={formData.code}
                  onChange={changeHandler}
                  placeholder="e.g. DPS001"
                  required
                  uppercase
                  error={errors.code}
                />

              </div>

              <InputField
                label="School Slug"
                name="slug"
                value={formData.slug}
                onChange={changeHandler}
                placeholder="e.g. dps-karaikudi"
                hint="Used as the URL-friendly school identifier."
              />

              <TextAreaField
                label="Address"
                name="address"
                value={formData.address}
                onChange={changeHandler}
                placeholder="Enter the complete school address"
                rows={3}
              />

            </FormSection>

            {/* ==================================================
                CONTACT DETAILS
            ================================================== */}

            <FormSection
              title="Contact Details"
              description="Contact information for the school."
              icon={
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
                    d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515L11 8a2 2 0 01-.55 1.89l-1.2 1.2a16 16 0 006.66 6.66l1.2-1.2A2 2 0 0119 16l3.485.78A2 2 0 0124 18.72V22a2 2 0 01-2 2C10.059 24 0 13.941 0 2a2 2 0 012-2h3z"
                  />
                </svg>
              }
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label="Contact Phone"
                  name="contactPhone"
                  type="tel"
                  value={
                    formData.contactPhone
                  }
                  onChange={changeHandler}
                  placeholder="School contact number"
                />

                <InputField
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={
                    formData.contactEmail
                  }
                  onChange={changeHandler}
                  placeholder="school@example.com"
                  error={
                    errors.contactEmail
                  }
                />

                <InputField
                  label="Website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={changeHandler}
                  placeholder="https://school.edu"
                  error={errors.website}
                />

                <InputField
                  label="Contact Person"
                  name="contactPerson"
                  value={
                    formData.contactPerson
                  }
                  onChange={changeHandler}
                  placeholder="Primary contact person"
                />

              </div>

            </FormSection>

            {/* ==================================================
                CONFIGURATION
            ================================================== */}

            <FormSection
              title="School Configuration"
              description="Customize the school's basic system settings."
              icon={
                <svg
                  className="w-5 h-5 text-pink-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.897 1.675 1.724 1.724 0 001.066 2.573 1.724 1.724 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.897 1.675 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.897-1.675 1.724 1.724 0 00-1.066-2.573 1.724 1.724 0 010-3.35 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.897-1.675 1.724 1.724 0 002.573-1.066z"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    strokeWidth={1.8}
                  />
                </svg>
              }
            >

              <InputField
                label="Logo URL"
                name="logo"
                value={formData.logo}
                onChange={changeHandler}
                placeholder="https://example.com/logo.png"
                hint="Optional URL for the school logo."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label="Academic Session"
                  name="academicSession"
                  value={
                    formData.academicSession
                  }
                  onChange={changeHandler}
                  placeholder="e.g. 2026-27"
                />

                <SelectField
                  label="Timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={changeHandler}
                  options={[
                    {
                      value: "Asia/Kolkata",
                      label:
                        "India — Asia/Kolkata",
                    },
                    {
                      value: "Asia/Dubai",
                      label:
                        "UAE — Asia/Dubai",
                    },
                    {
                      value: "Asia/Singapore",
                      label:
                        "Singapore — Asia/Singapore",
                    },
                    {
                      value: "UTC",
                      label: "UTC",
                    },
                  ]}
                />

                <SelectField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={changeHandler}
                  options={[
                    {
                      value: "INR",
                      label: "INR — Indian Rupee",
                    },
                    {
                      value: "USD",
                      label: "USD — US Dollar",
                    },
                    {
                      value: "AED",
                      label: "AED — UAE Dirham",
                    },
                    {
                      value: "SGD",
                      label:
                        "SGD — Singapore Dollar",
                    },
                  ]}
                />

                <SelectField
                  label="Language"
                  name="language"
                  value={formData.language}
                  onChange={changeHandler}
                  options={[
                    {
                      value: "en",
                      label: "English",
                    },
                    {
                      value: "ta",
                      label: "Tamil",
                    },
                    {
                      value: "hi",
                      label: "Hindi",
                    },
                  ]}
                />

              </div>

              {/* Active status */}

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
                      ? "School is Active"
                      : "School is Inactive"}
                  </p>

                  <p className="text-xs text-white/50 mt-1">
                    {formData.isActive
                      ? "The school will be available immediately."
                      : "The school will be created as inactive."}
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

            </FormSection>

            {/* ==================================================
                INITIAL ADMINISTRATOR
            ================================================== */}

            <FormSection
              title="Initial School Administrator"
              description="A SCHOOL_ADMIN account will automatically be created for this person."
              icon={
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
              }
            >

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300/20 mb-4">

                <div className="flex gap-3">

                  <svg
                    className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5"
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

                  <p className="text-xs text-emerald-100/80 leading-5">
                    The system will generate a temporary
                    password automatically. The administrator
                    must change this password after their
                    first login.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label="Administrator Name"
                  name="adminName"
                  value={formData.adminName}
                  onChange={changeHandler}
                  placeholder="e.g. John Smith"
                  required
                  error={errors.adminName}
                />

                <InputField
                  label="Administrator Phone"
                  name="adminPhone"
                  type="tel"
                  value={formData.adminPhone}
                  onChange={changeHandler}
                  placeholder="Enter phone number"
                  required
                  error={errors.adminPhone}
                />

                <div className="sm:col-span-2">

                  <InputField
                    label="Administrator Email"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={changeHandler}
                    placeholder="admin@school.edu"
                    error={errors.adminEmail}
                  />

                </div>

              </div>

            </FormSection>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="px-5 sm:px-8 py-5 bg-black/10 border-t border-white/10">

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  navigate("/schools")
                }
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {isLoading ? (
                  <span className="flex items-center gap-2">

                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Creating School...

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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>

                    Create School

                  </span>
                )}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

// ======================================================
// Form Section
// ======================================================

const FormSection = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <section>

      <div className="flex items-start gap-3 mb-4">

        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-white/50 mt-1">
            {description}
          </p>
        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
        {children}
      </div>

    </section>
  );
};

// ======================================================
// Input
// ======================================================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  uppercase = false,
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
      >
        {label}

        {required && (
          <span className="text-red-300 ml-1">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 outline-none transition shadow-sm ${
          uppercase
            ? "uppercase"
            : ""
        } ${
          error
            ? "border-2 border-red-400 focus:ring-2 focus:ring-red-300"
            : "border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
        }`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-2 text-xs text-white/40">
          {hint}
        </p>
      )}

    </div>
  );
};

// ======================================================
// Textarea
// ======================================================

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm resize-none"
      />

    </div>
  );
};

// ======================================================
// Select
// ======================================================

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="block text-sm font-medium text-indigo-100 tracking-wide mb-2"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
};

// ======================================================
// Success Row
// ======================================================

const SuccessRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-3 rounded-lg bg-white/5 border border-white/5">

      <span className="text-xs text-white/45 uppercase tracking-wide">
        {label}
      </span>

      <span className="text-sm font-medium text-white sm:text-right break-all">
        {value || "Not available"}
      </span>

    </div>
  );
};

export default CreateSchoolScreen;
