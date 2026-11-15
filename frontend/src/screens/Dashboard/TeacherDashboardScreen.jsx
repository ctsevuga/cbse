
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useGetTeacherDashboardQuery } from "../../slices/dashboardApiSlice";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = {
  primary: "#4F46E5",
  blue: "#2563EB",
  green: "#059669",
  orange: "#EA580C",
  red: "#DC2626",
  purple: "#9333EA",
  cyan: "#0891B2",
  yellow: "#D97706",
};

const DISTRIBUTION_RANGES = [
  { range: 0, label: "Below 33%" },
  { range: 33, label: "33–49%" },
  { range: 50, label: "50–59%" },
  { range: 60, label: "60–74%" },
  { range: 75, label: "75–89%" },
  { range: 90, label: "90–100%" },
];

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (month) => {
  if (!month) return "";

  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

const getPercentageColor = (percentage) => {
  if (percentage >= 75) return "text-emerald-700";
  if (percentage >= 50) return "text-blue-700";
  if (percentage >= 33) return "text-amber-700";
  return "text-red-700";
};

const getDistributionLabel = (range) => {
  const item = DISTRIBUTION_RANGES.find(
    (entry) => entry.range === Number(range)
  );

  return item?.label || "Other";
};


const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
}) => {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    cyan: "bg-cyan-50 text-cyan-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 font-medium">
          {title}
        </p>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
            colorStyles[color] || colorStyles.indigo
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-xl font-bold text-gray-900">
          {value}
        </h3>

        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const SectionHeading = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
    <div>
      <h2 className="text-base font-bold text-gray-800">
        {title}
      </h2>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>

    {action}
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  children,
  className = "",
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-0 ${className}`}
  >
    <SectionHeading title={title} subtitle={subtitle} />
    {children}
  </div>
);

const LoadingCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
    <div className="h-3 bg-gray-100 rounded w-2/3 mt-3" />
  </div>
);

const EmptyChart = ({
  message = "No data available yet.",
}) => (
  <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-center px-3">
    <span className="text-3xl mb-2">📊</span>
    <p className="text-sm">{message}</p>
  </div>
);

const ClassTeacherDashboardButton = ({
  onClick,
  variant = "primary",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={
      variant === "light"
        ? "px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-semibold shadow-sm whitespace-nowrap"
        : "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm whitespace-nowrap"
    }
  >
    🏫 Class Section Dashboard
  </button>
);


const TeacherDashboardScreen = () => {
  // ================================================
  // 1. Navigation and state
  // ================================================

  const navigate = useNavigate();

  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState("");

  const [academicYearOptions, setAcademicYearOptions] =
    useState([]);

  const { userInfo } = useSelector((state) => state.auth);

  const schoolSlug = userInfo?.school?.slug;

  // ================================================
  // 2. Subject Teacher Dashboard API
  // ================================================

  const {
    data: dashboard,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherDashboardQuery(
    {
      schoolSlug,
      ...(selectedAcademicYear
        ? { academicYearId: selectedAcademicYear }
        : {}),
    },
    {
      skip: !schoolSlug,
    }
  );

  // ================================================
  // 3. Extract dashboard response
  // ================================================

  const summary = dashboard?.summary || {};
  const charts = dashboard?.charts || {};

  // Controller now returns only subject teacher scopes.
  const assignments = dashboard?.assignments || [];

  // Independent of academic year and subject assignments.
  const hasClassTeacherAssignment =
    dashboard?.hasClassTeacherAssignment === true;

  const teacherType =
    dashboard?.teacherType || "NO_ASSIGNMENT";

  const recentResults = dashboard?.recentResults || [];

  const resultStatusCounts =
    dashboard?.resultStatusCounts || {};

  const goToClassTeacherDashboard = () => {
    navigate("/class/teacher/dashboard");
  };

  // ================================================
  // 4. Preserve academic year options
  // ================================================

  useEffect(() => {
    if (!assignments.length) return;

    setAcademicYearOptions((previous) => {
      const options = new Map(
        previous.map((year) => [year._id, year])
      );

      assignments.forEach((assignment) => {
        const year = assignment.academicYear;

        if (year?._id) {
          options.set(year._id, year);
        }
      });

      return Array.from(options.values()).sort(
        (a, b) =>
          new Date(b.startDate || 0) -
          new Date(a.startDate || 0)
      );
    });
  }, [assignments]);

  // ================================================
  // 5. Summary
  // ================================================

  const {
    totalStudents = 0,
    totalAssessments = 0,
    totalAttempts = 0,
    totalResults = 0,
    publishedResults = 0,
    pendingEvaluation = 0,
    averagePercentage = 0,
    passPercentage = 0,
    failPercentage = 0,
  } = summary;

  // ================================================
  // 6. Chart data
  // ================================================

  const distributionData = useMemo(() => {
    const source = charts.performanceDistribution || [];

    return DISTRIBUTION_RANGES.map((item) => {
      const found = source.find(
        (entry) => Number(entry.range) === item.range
      );

      return {
        label: item.label,
        students: found?.count || 0,
      };
    });
  }, [charts.performanceDistribution]);

  const passFailData = useMemo(
    () => [
      {
        name: "Passed",
        value: publishedResults
          ? Math.round(
              (passPercentage / 100) * publishedResults
            )
          : 0,
        color: COLORS.green,
      },
      {
        name: "Failed",
        value: publishedResults
          ? Math.round(
              (failPercentage / 100) * publishedResults
            )
          : 0,
        color: COLORS.red,
      },
    ],
    [publishedResults, passPercentage, failPercentage]
  );

  const trendData = useMemo(
    () =>
      (charts.performanceTrend || []).map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
      })),
    [charts.performanceTrend]
  );

  const subjectPerformanceData =
    charts.subjectPerformance || [];

  const sectionSubjectPerformanceData =
    charts.sectionSubjectPerformance || [];

  const assessmentPerformanceData =
    charts.assessmentPerformance || [];

  const evaluationRate = totalResults
    ? Number(
        ((publishedResults / totalResults) * 100).toFixed(1)
      )
    : 0;

  const handleAcademicYearChange = (event) => {
    setSelectedAcademicYear(event.target.value);
  };

  // ================================================
  // 7. Loading
  // ================================================

  if (isLoading || (!dashboard && isFetching)) {
    return (
      <div className="p-4 md:p-5 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // ================================================
  // 8. Error
  // ================================================

  if (!schoolSlug || error) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>

          <h2 className="font-semibold text-red-800">
            Unable to load Subject Teacher Dashboard
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {!schoolSlug
              ? "School information is missing. Please log in again."
              : error?.data?.message ||
                error?.error ||
                "Unable to retrieve dashboard data."}
          </p>

          {schoolSlug && (
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================================================
  // 9. No subject teacher assignments
  // ================================================

  if (
    teacherType === "NO_ASSIGNMENT" ||
    !assignments.length
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
          <div className="text-4xl mb-3">📚</div>

          <h2 className="text-lg font-bold text-gray-800">
            No Subject Teacher Assignments Found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            No active subject teaching assignments were found
            {selectedAcademicYear
              ? " for the selected academic year."
              : "."}
          </p>

          {selectedAcademicYear && (
            <button
              type="button"
              onClick={() => setSelectedAcademicYear("")}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              View All Academic Years
            </button>
          )}

          {hasClassTeacherAssignment && (
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-sm text-indigo-700 font-medium mb-3">
                You have an active Class Teacher assignment.
              </p>

              <ClassTeacherDashboardButton
                onClick={goToClassTeacherDashboard}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================================================
  // 10. Main dashboard
  // ================================================

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4 space-y-3">

      {/* DASHBOARD HEADER */}

      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-xl p-4 md:p-5 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <p className="text-indigo-200 text-xs font-medium">
              Academic Performance Analytics
            </p>

            <h1 className="text-xl md:text-2xl font-bold mt-1">
              Subject Teacher Dashboard
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                Subject Teacher
              </span>

              <span className="text-xs text-indigo-100">
                {assignments.length} Teaching Scope
                {assignments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            {hasClassTeacherAssignment && (
              <ClassTeacherDashboardButton
                onClick={goToClassTeacherDashboard}
                variant="light"
              />
            )}

            <div>
              <label
                htmlFor="dashboardAcademicYear"
                className="block text-xs text-indigo-100 mb-1"
              >
                Academic Year
              </label>

              <select
                id="dashboardAcademicYear"
                value={selectedAcademicYear}
                onChange={handleAcademicYearChange}
                className="bg-white text-gray-800 rounded-lg px-3 py-2 text-sm font-medium outline-none min-w-40"
              >
                <option value="">All Academic Years</option>

                {academicYearOptions.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isFetching ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-indigo-200">
              Assigned Classes
            </p>

            <p className="font-semibold text-sm mt-1">
              {[
                ...new Set(
                  assignments
                    .map((item) => item.class?.name)
                    .filter(Boolean)
                ),
              ].join(", ") || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-indigo-200">
              Assigned Sections
            </p>

            <p className="font-semibold text-sm mt-1">
              {[
                ...new Set(
                  assignments
                    .map((item) => item.section?.name)
                    .filter(Boolean)
                ),
              ].join(", ") || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-indigo-200">
              Dashboard Scope
            </p>

            <p className="font-semibold text-sm mt-1">
              Assigned Subjects Only
            </p>
          </div>
        </div>
      </div>

      {/* COMPACT DASHBOARD CONTENT */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Teaching assignments: compact horizontal chips */}
        <div className="xl:col-span-5 bg-white border border-gray-200 rounded-xl p-3 shadow-sm min-w-0">
          <SectionHeading
            title="My Teaching Assignments"
            subtitle={`${assignments.length} assigned teaching scope${assignments.length !== 1 ? "s" : ""}`}
          />
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
            {assignments.map((assignment, index) => (
              <div
                key={`${assignment.academicYear?._id}-${assignment.class?._id}-${assignment.section?._id}-${index}`}
                className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 min-w-0"
              >
                <p className="text-[10px] text-gray-500">
                  {assignment.academicYear?.name || "Academic year"}
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  {assignment.class?.name || "Class"} - {assignment.section?.name || "Section"}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(assignment.subjects || []).map((subject) => (
                    <span key={subject._id} className="text-[10px] rounded bg-white px-1.5 py-0.5 text-indigo-700 border border-indigo-100">
                      {subject.name}
                    </span>
                  ))}
                  {!assignment.subjects?.length && (
                    <span className="text-[10px] text-gray-400">No subjects</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result lifecycle */}
        <div className="xl:col-span-7 bg-white border border-gray-200 rounded-xl p-3 shadow-sm min-w-0">
          <SectionHeading title="Result Processing" subtitle="Current result lifecycle status" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: "Draft", value: resultStatusCounts.DRAFT || 0, color: "bg-gray-100 text-gray-700" },
              { label: "Pending", value: resultStatusCounts.PENDING_EVALUATION || 0, color: "bg-amber-50 text-amber-700" },
              { label: "Evaluated", value: resultStatusCounts.EVALUATED || 0, color: "bg-blue-50 text-blue-700" },
              { label: "Published", value: resultStatusCounts.PUBLISHED || 0, color: "bg-emerald-50 text-emerald-700" },
              { label: "Withdrawn", value: resultStatusCounts.WITHDRAWN || 0, color: "bg-red-50 text-red-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg px-2.5 py-2 ${item.color}`}>
                <p className="text-[10px] font-medium">{item.label}</p>
                <p className="text-lg leading-6 font-bold">{Number(item.value).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Result publication progress</span>
              <span className="font-semibold text-gray-800">{evaluationRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(Math.max(evaluationRate, 0), 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {publishedResults} published of {totalResults} total results
            </p>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section>
        <SectionHeading title="Performance Overview" subtitle="Key teaching and assessment indicators" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          <MetricCard title="Students" value={totalStudents.toLocaleString("en-IN")} icon="👨‍🎓" color="indigo" />
          <MetricCard title="Assessments" value={totalAssessments.toLocaleString("en-IN")} icon="📝" color="blue" />
          <MetricCard title="Attempts" value={totalAttempts.toLocaleString("en-IN")} icon="📋" color="purple" />
          <MetricCard title="Published" value={publishedResults.toLocaleString("en-IN")} icon="✅" color="green" />
          <MetricCard title="Pending Eval." value={pendingEvaluation.toLocaleString("en-IN")} icon="⏳" color="orange" />
          <MetricCard title="Average" value={formatPercentage(averagePercentage)} icon="📈" color="cyan" />
          <MetricCard title="Pass Rate" value={formatPercentage(passPercentage)} icon="🏆" color="green" />
          <MetricCard title="Eval. Progress" value={formatPercentage(evaluationRate)} icon="📊" color="orange" />
        </div>
      </section>

      {/* CHART ROW 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="Subject-wise Performance" subtitle="Average published percentage by subject" className="p-3">
          {subjectPerformanceData.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={subjectPerformanceData} layout="vertical" margin={{ top: 2, right: 20, left: 0, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
                <YAxis type="category" dataKey="subjectName" width={82} fontSize={9} />
                <Tooltip formatter={(v) => [formatPercentage(v), "Average"]} />
                <Bar dataKey="averagePercentage" name="Average" fill={COLORS.primary} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No published subject results available." />}
        </ChartCard>

        <ChartCard title="Pass / Fail Analysis" subtitle="Published results · pass threshold 33%" className="p-3">
          {publishedResults > 0 ? (
            <div className="grid grid-cols-2 items-center gap-2">
              <div className="relative">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={passFailData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                      {passFailData.map((entry, index) => (
                        <Cell key={`pass-fail-${index}`} fill={entry.color} stroke="white" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} results`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800">{publishedResults}</span>
                  <span className="text-[10px] text-gray-500">Results</span>
                </div>
              </div>
              <div className="space-y-3">
                {passFailData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-emerald-600" : "bg-red-600"}`} />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${index === 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {formatPercentage(index === 0 ? passPercentage : failPercentage)}
                      </p>
                      <p className="text-[10px] text-gray-500">{item.value} results</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 border-t pt-2">Pass mark: 33%</p>
              </div>
            </div>
          ) : <EmptyChart message="Pass/fail analysis will appear after results are published." />}
        </ChartCard>
      </section>

      {/* CHART ROW 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="Performance Distribution" subtitle="Published results by percentage range" className="p-3">
          {publishedResults > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={distributionData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={8} interval={0} />
                <YAxis allowDecimals={false} fontSize={9} />
                <Tooltip formatter={(v) => [`${v} results`, "Results"]} />
                <Bar dataKey="students" name="Results" radius={[5, 5, 0, 0]} barSize={25}>
                  {distributionData.map((item, index) => (
                    <Cell key={`distribution-${index}`} fill={[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.green, COLORS.purple][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No published results available for distribution." />}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 mt-1">
            <span>Below 33%: Needs improvement</span><span>33–59%: Developing</span>
            <span>60–74%: Good</span><span>75%+: Strong</span>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Performance Trend" subtitle="Average published percentage over time" className="p-3">
          {trendData.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={trendData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthLabel" fontSize={9} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
                <Tooltip formatter={(v) => [formatPercentage(v), "Average"]} />
                <Area type="monotone" dataKey="averagePercentage" stroke={COLORS.primary} strokeWidth={2} fill="url(#performanceGradient)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Performance trends will appear as results are published." />}
        </ChartCard>
      </section>

      {/* CHART ROW 3 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="Section & Subject Performance" subtitle="Average and pass percentage across assigned scopes" className="p-3">
          {sectionSubjectPerformanceData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={sectionSubjectPerformanceData.map((item) => ({
                  ...item,
                  displayName: `${item.className || "Class"}-${item.sectionName || "Section"} | ${item.subjectName || "Subject"}`,
                }))}
                layout="vertical"
                margin={{ top: 2, right: 18, left: 0, bottom: 2 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
                <YAxis type="category" dataKey="displayName" width={145} fontSize={8} />
                <Tooltip formatter={(v, name) => [formatPercentage(v), name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="averagePercentage" name="Average" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={9} />
                <Bar dataKey="passPercentage" name="Pass" fill={COLORS.green} radius={[0, 4, 4, 0]} barSize={9} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Section-wise performance will appear after results are published." />}
        </ChartCard>

        <ChartCard title="Assessment-wise Performance" subtitle="Average performance across assessments" className="p-3">
          {assessmentPerformanceData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={assessmentPerformanceData} margin={{ top: 5, right: 8, left: -18, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="title" angle={-25} textAnchor="end" interval="preserveStartEnd" height={55} fontSize={8} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
                <Tooltip formatter={(v, name) => [formatPercentage(v), name]} />
                <Bar dataKey="averagePercentage" name="Average" fill={COLORS.blue} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No assessment performance data available." />}
        </ChartCard>
      </section>

      {/* REPORT TABLES: side-by-side on wide screens */}
      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
        <ChartCard title="Section-wise Performance Report" subtitle="Published-result summary by assigned section and subject" className="p-3">
          {sectionSubjectPerformanceData.length ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-gray-50 text-gray-600">
                  <tr>
                    {["Class", "Section", "Subject", "Students", "Average", "Pass %", "Fail %", "Results"].map((heading) => (
                      <th key={heading} className="px-2 py-2 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sectionSubjectPerformanceData.map((item, index) => (
                    <tr key={`${item.academicYearId}-${item.classId}-${item.sectionId}-${item.subjectId}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-2">{item.className || "-"}</td>
                      <td className="px-2 py-2">{item.sectionName || "-"}</td>
                      <td className="px-2 py-2 font-medium">{item.subjectName || "-"}</td>
                      <td className="px-2 py-2 text-center">{Number(item.studentCount || 0).toLocaleString("en-IN")}</td>
                      <td className={`px-2 py-2 text-center font-bold ${getPercentageColor(Number(item.averagePercentage || 0))}`}>{formatPercentage(item.averagePercentage)}</td>
                      <td className="px-2 py-2 text-center text-emerald-700">{formatPercentage(item.passPercentage)}</td>
                      <td className="px-2 py-2 text-center text-red-600">{formatPercentage(item.failPercentage)}</td>
                      <td className="px-2 py-2 text-center">{Number(item.totalResults || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyChart message="No section-wise report is available yet." />}
        </ChartCard>

        <ChartCard title="Recent Published Results" subtitle="Latest student results for your assigned subjects" className="p-3">
          {recentResults.length ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-gray-50 text-gray-600">
                  <tr>
                    {["Student", "Class", "Section", "Assessment", "Subject", "Marks", "Percentage", "Published"].map((heading) => (
                      <th key={heading} className="px-2 py-2 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map((result) => {
                    const percentage = Number(result.percentage || 0);
                    return (
                      <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-2 py-2">
                          <p className="font-semibold text-gray-800">{result.student?.user?.name || "Unknown Student"}</p>
                          <p className="text-[10px] text-gray-500">{result.student?.admissionNumber || "-"}</p>
                        </td>
                        <td className="px-2 py-2">{result.assessment?.class?.name || "-"}</td>
                        <td className="px-2 py-2">{result.assessment?.section?.name || "-"}</td>
                        <td className="px-2 py-2 max-w-36 truncate">{result.assessment?.title || "-"}</td>
                        <td className="px-2 py-2">{result.assessment?.subject?.name || "-"}</td>
                        <td className="px-2 py-2 text-center">{result.obtainedMarks ?? 0}/{result.totalMarks ?? 0}</td>
                        <td className={`px-2 py-2 text-center font-bold ${getPercentageColor(percentage)}`}>{formatPercentage(percentage)}</td>
                        <td className="px-2 py-2">{formatDate(result.publishedAt || result.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <EmptyChart message="No published results available." />}
        </ChartCard>
      </section>

      {/* DASHBOARD FOOTER */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          CBSE Learning Analytics – Subject Teacher Dashboard
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {isFetching && (
            <span className="text-xs text-indigo-600">
              Updating dashboard...
            </span>
          )}

          {hasClassTeacherAssignment && (
            <ClassTeacherDashboardButton
              onClick={goToClassTeacherDashboard}
            />
          )}

          <span className="text-xs text-gray-400">
            Data is based on your active subject teacher assignments.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardScreen;
