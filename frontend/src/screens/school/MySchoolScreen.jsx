
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
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useGetMySchoolQuery } from "../../slices/schoolApiSlice";

const MySchoolScreen = () => {
  const navigate = useNavigate();

  const {
    data: school,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMySchoolQuery();

  const handleView = () => {
    if (!school?._id) return;

    navigate(`/schools/${school._id}`);
  };

  const handleEdit = () => {
    if (!school?._id) return;

    navigate(`/schools/${school._id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-36 rounded-2xl bg-white shadow-sm" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-white shadow-sm" />

            <div className="space-y-6 lg:col-span-2">
              <div className="h-48 rounded-2xl bg-white shadow-sm" />
              <div className="h-48 rounded-2xl bg-white shadow-sm" />
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load School
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "We could not load your school information."}
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-7 w-7 text-slate-400" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No School Associated
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your account is not currently associated with a school.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contactDetails = school.contactDetails || {};
  const configuration = school.configuration || {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-8 sm:px-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute bottom-0 right-40 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
                  {configuration.logo ? (
                    <img
                      src={configuration.logo}
                      alt={`${school.name} logo`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-9 w-9 text-red-600" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-red-100">
                    My School
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

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleView}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                >
                  <Eye className="h-4 w-4" />
                  View School
                </button>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Pencil className="h-4 w-4" />
                  Edit School
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <Building2 className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    School Overview
                  </h2>

                  <p className="text-xs text-slate-500">
                    Basic school information
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <SummaryItem
                  label="School Name"
                  value={school.name}
                />

                <SummaryItem
                  label="School Code"
                  value={school.code}
                />

                <SummaryItem
                  label="Tenant Slug"
                  value={school.slug}
                />

                <SummaryItem
                  label="Status"
                  value={
                    school.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactive
                      </span>
                    )
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleView}
                className="mt-7 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Complete Profile
                </span>

                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <SectionHeader
                icon={<Phone className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-50"
                title="Contact Information"
                description="School contact and communication details"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-4">
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
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <SectionHeader
                icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
                iconBg="bg-emerald-50"
                title="School Configuration"
                description="Academic and regional settings"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ConfigurationItem
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Academic Session"
                  value={
                    configuration.academicSession ||
                    "Not configured"
                  }
                />

                <ConfigurationItem
                  icon={<Clock className="h-5 w-5" />}
                  label="Timezone"
                  value={
                    configuration.timezone ||
                    "Asia/Kolkata"
                  }
                />

                <ConfigurationItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Currency"
                  value={
                    configuration.currency ||
                    "INR"
                  }
                />

                <ConfigurationItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Language"
                  value={
                    configuration.language ||
                    "en"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Manage School Profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    View complete information or update your school settings.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleView}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  icon,
  iconBg,
  title,
  description,
}) => {
  return (
    <div className="mb-5 flex items-center gap-3">
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

const SummaryItem = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] break-all text-right text-sm font-semibold text-slate-700">
        {value || "Not provided"}
      </span>
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

const ConfigurationItem = ({
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
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MySchoolScreen;

