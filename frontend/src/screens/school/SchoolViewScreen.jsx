import React from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  CalendarDays,
  Clock,
  IndianRupee,
  Languages,
  CheckCircle2,
  XCircle,
  Copy,
  ShieldCheck,
} from "lucide-react";

import { useGetSchoolDetailsQuery } from "../../slices/schoolApiSlice";


const SchoolDetailsScreen = () => {
  const {
    data: school,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSchoolDetailsQuery();


  const copyToClipboard = async (value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">

          {/* Header skeleton */}
          <div className="mb-6 h-32 rounded-2xl bg-white shadow-sm" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            <div className="h-80 rounded-2xl bg-white shadow-sm lg:col-span-1" />

            <div className="space-y-6 lg:col-span-2">
              <div className="h-56 rounded-2xl bg-white shadow-sm" />
              <div className="h-56 rounded-2xl bg-white shadow-sm" />
            </div>

          </div>
        </div>
      </div>
    );
  }


  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to Load School Details
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the school information."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    );
  }


  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              School Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The requested school information could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }


  const configuration = school.configuration || {};
  const contactDetails = school.contactDetails || {};
  const createdBy = school.createdBy || {};


  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-8 sm:px-8">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-white/10 blur-xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">

                  {configuration.logo ? (
                    <img
                      src={configuration.logo}
                      alt={`${school.name} logo`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-red-600" />
                  )}

                </div>

                <div>
                  <p className="text-sm font-medium text-red-100">
                    School Profile
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {school.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {school.code}
                    </span>

                    {school.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/20 px-3 py-1 text-xs font-semibold text-white">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactive
                      </span>
                    )}

                  </div>
                </div>

              </div>

              <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">

                <p className="text-xs font-medium text-red-100">
                  Tenant Slug
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <span className="text-sm font-semibold text-white">
                    {school.slug}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(school.slug)}
                    className="rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                    title="Copy tenant slug"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>


        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* =================================================
              LEFT COLUMN
          ================================================== */}
          <div className="space-y-6 lg:col-span-1">

            {/* School Identity */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <Building2 className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    School Identity
                  </h2>

                  <p className="text-xs text-slate-500">
                    Tenant information
                  </p>
                </div>

              </div>


              <div className="space-y-4">

                <InfoRow
                  label="School Name"
                  value={school.name}
                />

                <InfoRow
                  label="School Code"
                  value={school.code}
                  copyable
                  onCopy={() => copyToClipboard(school.code)}
                />

                <InfoRow
                  label="Tenant Slug"
                  value={school.slug}
                  copyable
                  onCopy={() => copyToClipboard(school.slug)}
                />

                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        school.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {school.isActive ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </>
                      )}
                    </span>
                  }
                />

              </div>

            </div>


            {/* Created By */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Created By
                  </h2>

                  <p className="text-xs text-slate-500">
                    School administrator
                  </p>
                </div>

              </div>


              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>

                <div className="min-w-0">

                  <p className="truncate font-semibold text-slate-800">
                    {createdBy.name || "N/A"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {createdBy.email || createdBy.phone || "N/A"}
                  </p>

                </div>

              </div>


              {createdBy.role && (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">

                  <p className="text-xs font-medium text-slate-500">
                    Role
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {createdBy.role}
                  </p>

                </div>
              )}

            </div>

          </div>


          {/* =================================================
              RIGHT COLUMN
          ================================================== */}
          <div className="space-y-6 lg:col-span-2">

            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <SectionHeader
                icon={<Phone className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-50"
                title="Contact Information"
                description="School contact and communication details"
              />


              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone"
                  value={contactDetails.phone}
                />

                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={contactDetails.email}
                />

                <ContactItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Website"
                  value={contactDetails.website}
                />

                <ContactItem
                  icon={<User className="h-5 w-5" />}
                  label="Contact Person"
                  value={contactDetails.contactPerson}
                />

              </div>


              {school.address && (
                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <MapPin className="h-5 w-5 text-red-500" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {school.address}
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>


            {/* Configuration */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <SectionHeader
                icon={<CalendarDays className="h-5 w-5 text-emerald-600" />}
                iconBg="bg-emerald-50"
                title="School Configuration"
                description="Academic and regional settings"
              />


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <ConfigurationCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Academic Session"
                  value={configuration.academicSession}
                />

                <ConfigurationCard
                  icon={<Clock className="h-5 w-5" />}
                  label="Timezone"
                  value={configuration.timezone || "Asia/Kolkata"}
                />

                <ConfigurationCard
                  icon={<IndianRupee className="h-5 w-5" />}
                  label="Currency"
                  value={configuration.currency || "INR"}
                />

                <ConfigurationCard
                  icon={<Languages className="h-5 w-5" />}
                  label="Language"
                  value={configuration.language || "en"}
                />

              </div>

            </div>


            {/* System Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <SectionHeader
                icon={<ShieldCheck className="h-5 w-5 text-purple-600" />}
                iconBg="bg-purple-50"
                title="System Information"
                description="School record information"
              />


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <ConfigurationCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Created"
                  value={
                    school.createdAt
                      ? new Date(school.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "N/A"
                  }
                />

                <ConfigurationCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Last Updated"
                  value={
                    school.updatedAt
                      ? new Date(school.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "N/A"
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};


/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

const SectionHeader = ({
  icon,
  iconBg,
  title,
  description,
}) => {
  return (
    <div className="mb-6 flex items-center gap-3">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">
          {title}
        </h2>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
};


const InfoRow = ({
  label,
  value,
  copyable = false,
  onCopy,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <div className="flex items-center gap-2 text-right">

        <span className="break-all text-sm font-semibold text-slate-700">
          {value || "N/A"}
        </span>

        {copyable && value && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}

      </div>

    </div>
  );
};


const ContactItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>

      </div>

    </div>
  );
};


const ConfigurationCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {value || "Not configured"}
          </p>

        </div>

      </div>

    </div>
  );
};


export default SchoolDetailsScreen;