import React, { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Settings,
  Image,
  CalendarDays,
  Clock,
  Languages,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Save,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  useGetSchoolDetailsQuery,
  useUpdateSchoolMutation,
} from "../../slices/schoolApiSlice";


const SchoolEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
   * If your useGetSchoolDetailsQuery does not require an ID,
   * remove "id" from this call.
   */
  const {
    data: school,
    isLoading: isSchoolLoading,
    isError: isSchoolError,
    error: schoolError,
  } = useGetSchoolDetailsQuery(id);

  const [
    updateSchool,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateSchoolMutation();


  const [formData, setFormData] = useState({
    name: "",
    code: "",
    slug: "",
    address: "",

    contactDetails: {
      phone: "",
      email: "",
      website: "",
      contactPerson: "",
    },

    configuration: {
      logo: "",
      academicSession: "",
      timezone: "Asia/Kolkata",
      currency: "INR",
      language: "en",
    },

    isActive: true,
  });


  const [validationError, setValidationError] = useState("");


  /* =========================================================
     LOAD SCHOOL DATA
  ========================================================== */

  useEffect(() => {
    if (!school) return;

    setFormData({
      name: school.name || "",
      code: school.code || "",
      slug: school.slug || "",
      address: school.address || "",

      contactDetails: {
        phone: school.contactDetails?.phone || "",
        email: school.contactDetails?.email || "",
        website: school.contactDetails?.website || "",
        contactPerson:
          school.contactDetails?.contactPerson || "",
      },

      configuration: {
        logo: school.configuration?.logo || "",
        academicSession:
          school.configuration?.academicSession || "",
        timezone:
          school.configuration?.timezone || "Asia/Kolkata",
        currency:
          school.configuration?.currency || "INR",
        language:
          school.configuration?.language || "en",
      },

      isActive:
        school.isActive !== undefined
          ? school.isActive
          : true,
    });
  }, [school]);


  /* =========================================================
     SUCCESS
  ========================================================== */

  useEffect(() => {
    if (isUpdateSuccess) {
      setValidationError("");
    }
  }, [isUpdateSuccess]);


  /* =========================================================
     BASIC FIELD HANDLER
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
  };


  /* =========================================================
     CONTACT DETAILS HANDLER
  ========================================================== */

  const handleContactChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,

      contactDetails: {
        ...previous.contactDetails,
        [name]: value,
      },
    }));

    setValidationError("");
  };


  /* =========================================================
     CONFIGURATION HANDLER
  ========================================================== */

  const handleConfigurationChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,

      configuration: {
        ...previous.configuration,
        [name]: value,
      },
    }));

    setValidationError("");
  };


  /* =========================================================
     STATUS HANDLER
  ========================================================== */

  const handleStatusChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      isActive: e.target.checked,
    }));
  };


  /* =========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "School name is required.";
    }

    if (!formData.code.trim()) {
      return "School code is required.";
    }

    if (!formData.slug.trim()) {
      return "School slug is required.";
    }

    if (
      formData.contactDetails.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.contactDetails.email,
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };


  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    try {
      await updateSchool({
        id,
        ...formData,
      }).unwrap();

      /*
       * Keep the user on the edit screen.
       * The RTK Query cache will be updated according to
       * your API slice configuration.
       */
    } catch (err) {
      console.error("Update school failed:", err);
    }
  };


  /* =========================================================
     CANCEL
  ========================================================== */

  const handleCancel = () => {
    navigate(-1);
  };


  /* =========================================================
     LOADING
  ========================================================== */

  if (isSchoolLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="mb-6 h-32 rounded-2xl bg-white shadow-sm" />

          <div className="space-y-6">

            <div className="h-80 rounded-2xl bg-white shadow-sm" />

            <div className="h-80 rounded-2xl bg-white shadow-sm" />

            <div className="h-64 rounded-2xl bg-white shadow-sm" />

          </div>

        </div>

      </div>
    );
  }


  /* =========================================================
     LOAD ERROR
  ========================================================== */

  if (isSchoolError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load School
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {schoolError?.data?.message ||
                schoolError?.error ||
                "The school information could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-6xl">

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-7 sm:px-8">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg">

                  {formData.configuration.logo ? (
                    <img
                      src={formData.configuration.logo}
                      alt={`${formData.name} logo`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-red-600" />
                  )}

                </div>

                <div>

                  <p className="text-sm font-medium text-red-100">
                    School Administration
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    Edit School
                  </h1>

                  <p className="mt-1 text-sm text-red-100">
                    Update school profile and configuration
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

            </div>

          </div>

        </div>


        {/* ===================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {isUpdateSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                School updated successfully
              </p>

              <p className="text-xs text-emerald-700">
                The school information has been saved.
              </p>
            </div>

          </div>
        )}


        {/* ===================================================
            ERROR MESSAGE
        ==================================================== */}

        {(validationError || isUpdateError) && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>

              <p className="text-sm font-semibold text-red-800">
                Unable to update school
              </p>

              <p className="mt-0.5 text-xs text-red-700">
                {validationError ||
                  updateError?.data?.message ||
                  updateError?.error ||
                  "Please check the entered information and try again."}
              </p>

            </div>

          </div>
        )}


        <form onSubmit={handleSubmit}>

          <div className="space-y-6">

            {/* =================================================
                BASIC SCHOOL INFORMATION
            ================================================== */}

            <FormSection
              icon={<Building2 className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-50"
              title="School Information"
              description="Basic identity and tenant information"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="School Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter school name"
                  required
                />

                <InputField
                  label="School Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Example: DPS001"
                  required
                  uppercase
                />

                <InputField
                  label="Tenant Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="Example: dps-karaikudi"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-slate-300">

                    <div className="flex items-center gap-3">

                      {formData.isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          {formData.isActive
                            ? "School Active"
                            : "School Inactive"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formData.isActive
                            ? "School can access the platform"
                            : "School access is disabled"}
                        </p>

                      </div>

                    </div>


                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleStatusChange}
                      className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />

                  </label>
                </div>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>

                <div className="relative">

                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter complete school address"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  />

                </div>

              </div>

            </FormSection>


            {/* =================================================
                CONTACT DETAILS
            ================================================== */}

            <FormSection
              icon={<Phone className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-50"
              title="Contact Details"
              description="School communication and contact information"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.contactDetails.phone}
                  onChange={handleContactChange}
                  placeholder="School phone number"
                  icon={<Phone className="h-4 w-4" />}
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.contactDetails.email}
                  onChange={handleContactChange}
                  placeholder="school@example.com"
                  icon={<Mail className="h-4 w-4" />}
                />

                <InputField
                  label="Website"
                  name="website"
                  value={formData.contactDetails.website}
                  onChange={handleContactChange}
                  placeholder="https://www.example.com"
                  icon={<Globe className="h-4 w-4" />}
                />

                <InputField
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactDetails.contactPerson}
                  onChange={handleContactChange}
                  placeholder="Principal / Administrator"
                  icon={<User className="h-4 w-4" />}
                />

              </div>

            </FormSection>


            {/* =================================================
                CONFIGURATION
            ================================================== */}

            <FormSection
              icon={<Settings className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              title="School Configuration"
              description="Academic, regional and display settings"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="Logo URL"
                  name="logo"
                  value={formData.configuration.logo}
                  onChange={handleConfigurationChange}
                  placeholder="https://example.com/logo.png"
                  icon={<Image className="h-4 w-4" />}
                />

                <InputField
                  label="Academic Session"
                  name="academicSession"
                  value={formData.configuration.academicSession}
                  onChange={handleConfigurationChange}
                  placeholder="Example: 2026-27"
                  icon={<CalendarDays className="h-4 w-4" />}
                />

                <InputField
                  label="Timezone"
                  name="timezone"
                  value={formData.configuration.timezone}
                  onChange={handleConfigurationChange}
                  placeholder="Asia/Kolkata"
                  icon={<Clock className="h-4 w-4" />}
                />

                <InputField
                  label="Currency"
                  name="currency"
                  value={formData.configuration.currency}
                  onChange={handleConfigurationChange}
                  placeholder="INR"
                  icon={<IndianRupee className="h-4 w-4" />}
                />

                <InputField
                  label="Language"
                  name="language"
                  value={formData.configuration.language}
                  onChange={handleConfigurationChange}
                  placeholder="en"
                  icon={<Languages className="h-4 w-4" />}
                />

              </div>


              {/* Logo Preview */}

              {formData.configuration.logo && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Logo Preview
                  </p>

                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">

                    <img
                      src={formData.configuration.logo}
                      alt="School logo preview"
                      className="h-full w-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                  </div>

                </div>
              )}

            </FormSection>


            {/* =================================================
                ACTION BAR
            ================================================== */}

            <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isUpdating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};


/* ============================================================
   FORM SECTION
============================================================ */

const FormSection = ({
  icon,
  iconBg,
  title,
  description,
  children,
}) => {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      <div className="mb-6 flex items-center gap-3">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>

        <div>

          <h2 className="font-bold text-slate-800">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
};


/* ============================================================
   INPUT FIELD
============================================================ */

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  uppercase = false,
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">

        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3 ${
            icon ? "pl-10" : "px-4"
          } ${
            uppercase ? "uppercase" : ""
          } pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10`}
        />

      </div>

    </div>
  );
};


export default SchoolEditScreen;