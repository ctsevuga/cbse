import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  School,
  User,
  Users,
  BookOpen,
  Layers3,
  Hash,
  UserRound,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import { useGetMyStudentProfileQuery } from "../../slices/studentApiSlice";

const MyStudentProfileScreen = () => {
  const navigate = useNavigate();

  /*
   * Current API:
   *
   * GET /api/students/me
   *
   * Controller:
   * getMyStudentProfile
   *
   * The controller restricts the request to:
   *   user: req.user._id
   *   school: req.schoolId
   *
   * and populates:
   *   user
   *   school
   *   academicYear
   *   class
   *   section
   *   subjectCombination
   */
  const {
    data: student,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyStudentProfileQuery();

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getInitials = (name) => {
    if (!name) return "ST";

    return String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const handleRefresh = async () => {
    try {
      await refetch().unwrap();
      toast.success("Profile refreshed successfully.");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Unable to refresh your profile.",
      );
    }
  };

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-10 w-56 rounded-lg bg-slate-200" />

          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="h-48 bg-slate-200" />

            <div className="px-6 pb-8 sm:px-8">
              <div className="-mt-12 h-24 w-24 rounded-3xl bg-slate-300" />

              <div className="mt-5 h-7 w-64 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-48 rounded bg-slate-200" />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="h-36 rounded-2xl bg-slate-100" />
                <div className="h-36 rounded-2xl bg-slate-100" />
                <div className="h-36 rounded-2xl bg-slate-100" />
                <div className="h-36 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * Error
   * ==========================================================
   */
  if (isError) {
    const message =
      error?.data?.message ||
      error?.error ||
      "Unable to load your student profile.";

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <UserRound className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {message}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />

                {isFetching
                  ? "Refreshing..."
                  : "Try Again"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * Profile Not Found
   * ==========================================================
   */
  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <UserRound className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Student profile not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your student profile could not be found for the
              current school.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * Populated Controller Response
   * ==========================================================
   *
   * The controller uses:
   *
   * .populate("user", "name email phone role isActive")
   * .populate("school", "name code")
   * .populate(
   *   "academicYear",
   *   "name startDate endDate isCurrent"
   * )
   * .populate("class", "name code")
   * .populate("section", "name")
   * .populate("subjectCombination", "name code")
   */

  const user =
    student.user && typeof student.user === "object"
      ? student.user
      : {};

  const school =
    student.school && typeof student.school === "object"
      ? student.school
      : {};

  const academicYear =
    student.academicYear &&
    typeof student.academicYear === "object"
      ? student.academicYear
      : {};

  const studentClass =
    student.class &&
    typeof student.class === "object"
      ? student.class
      : {};

  const section =
    student.section &&
    typeof student.section === "object"
      ? student.section
      : {};

  const subjects = Array.isArray(
    student.subjectCombination,
  )
    ? student.subjectCombination
    : [];

  const studentName = user.name || "Student";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Student Portal
              </p>

              <p className="text-sm font-semibold text-slate-700">
                My Profile
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              title="Refresh profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* =====================================================
            PROFILE CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">

          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-10 sm:px-8">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl font-extrabold text-indigo-600 shadow-xl ring-4 ring-white/20">
                {getInitials(studentName)}
              </div>

              <div className="min-w-0 text-white">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {studentName}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      student.isActive
                        ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-200/30"
                        : "bg-red-400/20 text-red-50 ring-1 ring-red-200/30"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        student.isActive
                          ? "bg-emerald-300"
                          : "bg-red-300"
                      }`}
                    />

                    {student.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-2 text-sm text-blue-50">
                  <GraduationCap className="h-4 w-4" />

                  {studentClass.name || "Class"}

                  {section.name
                    ? ` • ${section.name}`
                    : ""}
                </p>

                <p className="mt-1 text-sm text-blue-100">
                  {school.name || "School"}

                  {school.code
                    ? ` • ${school.code}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              PROFILE CONTENT
          ================================================== */}

          <div className="p-5 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">

              {/* ==================================================
                  PERSONAL INFORMATION
              ================================================== */}

              <ProfileCard
                icon={User}
                title="Personal Information"
                iconClass="bg-indigo-50 text-indigo-600"
              >
                <InfoRow
                  icon={Hash}
                  label="Admission Number"
                  value={student.admissionNumber}
                />

                <InfoRow
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={formatDate(student.dateOfBirth)}
                />

                <InfoRow
                  icon={Users}
                  label="Gender"
                  value={formatLabel(student.gender)}
                />
              </ProfileCard>

              {/* ==================================================
                  ACADEMIC INFORMATION
              ================================================== */}

              <ProfileCard
                icon={School}
                title="Academic Information"
                iconClass="bg-blue-50 text-blue-600"
              >
                <InfoRow
                  icon={CalendarDays}
                  label="Academic Year"
                  value={academicYear.name}
                />

                <InfoRow
                  icon={GraduationCap}
                  label="Class"
                  value={
                    studentClass.code
                      ? `${studentClass.name || ""} (${studentClass.code})`
                      : studentClass.name
                  }
                />

                <InfoRow
                  icon={Layers3}
                  label="Section"
                  value={section.name}
                />

                <InfoRow
                  icon={BookOpen}
                  label="Stream"
                  value={formatLabel(student.stream)}
                />
              </ProfileCard>

              {/* ==================================================
                  SUBJECT COMBINATION
              ================================================== */}

              <ProfileCard
                icon={BookOpen}
                title="Subject Combination"
                iconClass="bg-emerald-50 text-emerald-600"
              >
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => {
                      const subjectId =
                        typeof subject === "object"
                          ? subject._id
                          : subject;

                      const subjectName =
                        typeof subject === "object"
                          ? subject.name
                          : "Subject";

                      const subjectCode =
                        typeof subject === "object"
                          ? subject.code
                          : null;

                      return (
                        <div
                          key={subjectId}
                          className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-emerald-800">
                            {subjectName || "Subject"}
                          </p>

                          {subjectCode && (
                            <p className="mt-0.5 text-xs font-medium text-emerald-600">
                              {subjectCode}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                    <BookOpen className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      No subjects assigned.
                    </p>
                  </div>
                )}
              </ProfileCard>

              {/* ==================================================
                  ACCOUNT INFORMATION
              ================================================== */}

              <ProfileCard
                icon={UserRound}
                title="Account Information"
                iconClass="bg-violet-50 text-violet-600"
              >
                <InfoRow
                  icon={User}
                  label="Role"
                  value={user.role || "STUDENT"}
                />

                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={user.phone}
                />

                <div
                  className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 ${
                    user.isActive
                      ? "bg-emerald-50"
                      : "bg-red-50"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      user.isActive
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  />

                  <span
                    className={`text-xs font-semibold ${
                      user.isActive
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    Account is{" "}
                    {user.isActive
                      ? "active"
                      : "inactive"}
                  </span>
                </div>
              </ProfileCard>
            </div>

            {/* ==================================================
                ACADEMIC STATUS
            ================================================== */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Academic Status
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                    <span>
                      {studentClass.name || "Class"}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span>
                      {section.name || "Section"}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span>
                      {formatLabel(student.stream)}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span>
                      {academicYear.name ||
                        "Academic Year"}
                    </span>
                  </div>
                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                    student.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      student.isActive
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  {student.isActive
                    ? "Active Student"
                    : "Inactive Student"}
                </div>
              </div>
            </div>

            {/* ==================================================
                SCHOOL / ACADEMIC YEAR DETAILS
            ================================================== */}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <School className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      School
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {school.name || "—"}
                    </p>

                    {school.code && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Code: {school.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Academic Year
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {academicYear.name || "—"}
                    </p>

                    {academicYear.isCurrent && (
                      <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                        Current Academic Year
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER NOTE
        ====================================================== */}

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

          <p className="text-xs leading-5 text-indigo-800">
            Your profile information is displayed from your
            current student record. Academic placement and
            school information are managed by your school
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

/*
 * ==========================================================
 * Profile Card
 * ==========================================================
 */
const ProfileCard = ({
  icon: Icon,
  title,
  iconClass,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

/*
 * ==========================================================
 * Information Row
 * ==========================================================
 */
const InfoRow = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

export default MyStudentProfileScreen;
