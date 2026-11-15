
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  useGetParentDashboardQuery,
} from "../../slices/dashboardApiSlice";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ======================================================
// CONSTANTS
// ======================================================

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
  { range: "0-32", label: "Below 33%" },
  { range: "33-49", label: "33–49%" },
  { range: "50-59", label: "50–59%" },
  { range: "60-74", label: "60–74%" },
  { range: "75-89", label: "75–89%" },
  { range: "90-100", label: "90–100%" },
];

// ======================================================
// FORMATTERS
// ======================================================

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

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

const formatDateTime = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

// ======================================================
// STATUS STYLES
// ======================================================

const getAttemptStatusStyle = (status) => {
  const styles = {
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    SUBMITTED: "bg-amber-100 text-amber-700",
    EVALUATING: "bg-orange-100 text-orange-700",
    EVALUATED: "bg-emerald-100 text-emerald-700",
    ABANDONED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
};

const getResultStatusStyle = (status) => {
  const styles = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_EVALUATION: "bg-amber-100 text-amber-700",
    EVALUATED: "bg-blue-100 text-blue-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    WITHDRAWN: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
};

const getAssessmentStatusStyle = (status) => {
  const styles = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
};

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

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
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
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
          <p className="mt-1 text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const SectionHeading = ({ title, subtitle, action }) => (
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 className="text-base font-bold text-gray-800">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">
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
    className={`min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4 ${className}`}
  >
    <SectionHeading
      title={title}
      subtitle={subtitle}
    />

    {children}
  </div>
);

const LoadingCard = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-3">
    <div className="h-3 w-1/2 rounded bg-gray-200" />
    <div className="mt-4 h-7 w-1/3 rounded bg-gray-200" />
    <div className="mt-3 h-3 w-2/3 rounded bg-gray-100" />
  </div>
);

const EmptyChart = ({
  message = "No data available yet.",
}) => (
  <div className="flex h-44 flex-col items-center justify-center px-3 text-center text-gray-400">
    <span className="mb-2 text-3xl">📊</span>
    <p className="text-sm">{message}</p>
  </div>
);

const StatusBadge = ({ status, getStyle }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
      getStyle(status)
    }`}
  >
    {status?.replace(/_/g, " ") || "-"}
  </span>
);

// ======================================================
// LOADING SCREEN
// ======================================================

const ParentDashboardLoading = () => (
  <div className="space-y-4 p-3 md:p-5">
    <div className="h-32 animate-pulse rounded-xl bg-gray-200" />

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <LoadingCard />
      <LoadingCard />
    </div>
  </div>
);

// ======================================================
// PARENT DASHBOARD SCREEN
// ======================================================

const ParentDashboardScreen = () => {

  // ================================================
  // 1. AUTHENTICATION
  // ================================================

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  // ================================================
  // 2. SELECTED CHILD STATE
  // ================================================

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  // Initially selectedStudentId is empty.
  // Backend automatically returns the first child.
  // Subsequent dropdown selections pass studentId.

  // ================================================
  // 3. PARENT DASHBOARD API
  // ================================================

  const queryParams = {
    schoolSlug,

    ...(selectedStudentId
      ? { studentId: selectedStudentId }
      : {}),
  };

  const {
    currentData: dashboard,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetParentDashboardQuery(
    queryParams,
    {
      skip: !schoolSlug,
    }
  );

  // ================================================
  // 4. EXTRACT RESPONSE
  // ================================================

  const parent = dashboard?.parent || {};

  const children = dashboard?.children || [];

  const student =
    dashboard?.selectedChild ||
    dashboard?.student ||
    {};

  const summary = dashboard?.summary || {};

  const charts = dashboard?.charts || {};

  const assessments =
    dashboard?.assessments || [];

  const upcomingAssessments =
    dashboard?.upcomingAssessmentList || [];

  const activeAssessments =
    dashboard?.activeAssessmentList || [];

  const recentAttempts =
    dashboard?.recentAttempts || [];

  const recentResults =
    dashboard?.recentResults || [];

  const attemptStatusCounts =
    dashboard?.attemptStatusCounts || {};

  const resultStatusCounts =
    dashboard?.resultStatusCounts || {};

  // ================================================
  // 5. SELECTED CHILD DROPDOWN VALUE
  // ================================================

  const effectiveStudentId =
    selectedStudentId ||
    student?._id ||
    "";

  const handleChildChange = (event) => {
    const nextStudentId = event.target.value;

    if (!nextStudentId) return;

    // Avoid a redundant request if the selected
    // child is already the currently displayed child.
    if (nextStudentId === effectiveStudentId) {
      return;
    }

    setSelectedStudentId(nextStudentId);
  };

  // ================================================
  // 6. SUMMARY VALUES
  // ================================================

  const {
    totalAssessments = 0,
    upcomingAssessments: upcomingCount = 0,
    activeAssessments: activeCount = 0,
    completedAssessments = 0,
    notAttemptedAssessments = 0,

    totalAttempts = 0,
    inProgressAttempts = 0,
    completedAttempts = 0,

    totalResults = 0,
    publishedResults = 0,
    pendingEvaluation = 0,

    averagePercentage = 0,
    passPercentage = 0,
    failPercentage = 0,

    totalObtainedMarks = 0,
    totalMaximumMarks = 0,

    passCount = 0,
    failCount = 0,
  } = summary;

  // ================================================
  // 7. DERIVED VALUES
  // ================================================

  const evaluationRate = totalResults
    ? Number(
        (
          (publishedResults / totalResults) *
          100
        ).toFixed(1)
      )
    : 0;

  const averageMarks = totalMaximumMarks
    ? `${formatNumber(totalObtainedMarks)} / ${formatNumber(
        totalMaximumMarks
      )}`
    : "0";

  // ================================================
  // 8. CHART DATA
  // ================================================

  const subjectPerformanceData =
    charts.subjectPerformance || [];

  const trendData = useMemo(
    () =>
      (charts.performanceTrend || []).map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
      })),
    [charts.performanceTrend]
  );

  const distributionData = useMemo(() => {
    const source =
      charts.performanceDistribution || [];

    return DISTRIBUTION_RANGES.map((item) => {
      const found = source.find(
        (entry) =>
          String(entry.range) === item.range
      );

      return {
        label: item.label,
        results: found?.count || 0,
      };
    });
  }, [charts.performanceDistribution]);

  const passFailData = useMemo(
    () => [
      {
        name: "Passed",
        value: passCount,
        color: COLORS.green,
      },
      {
        name: "Failed",
        value: failCount,
        color: COLORS.red,
      },
    ],
    [passCount, failCount]
  );

  // ================================================
  // 9. CHILD INFORMATION
  // ================================================

  const studentName =
    student.name || "Student";

  const admissionNumber =
    student.admissionNumber || "-";

  const className =
    student.class?.name || "-";

  const sectionName =
    student.section?.name || "-";

  const streamName =
    student.stream?.name || "-";

  const academicYearName =
    student.academicYear?.name ||
    dashboard?.academicYear?.name ||
    "-";

  // ================================================
  // 10. LOADING STATE
  // ================================================

  if (isLoading || (!dashboard && isFetching)) {
    return <ParentDashboardLoading />;
  }

  // ================================================
  // 11. ERROR STATE
  // ================================================

  if (!schoolSlug || error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">

          <div className="mb-3 text-3xl">
            ⚠️
          </div>

          <h2 className="font-semibold text-red-800">
            Unable to load Parent Dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
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
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700"
            >
              Retry
            </button>
          )}

        </div>
      </div>
    );
  }

  // ================================================
  // 12. NO CHILDREN STATE
  // ================================================

  if (!children.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">

        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="mb-4 text-5xl">
            👨‍👩‍👧
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Welcome, {parent.name || userInfo?.name || "Parent"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No active children are currently linked to
            your parent account.
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Please contact your school administrator
            to verify your parent-student association.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>

        </div>
      </div>
    );
  }

  // ================================================
  // 13. MAIN DASHBOARD
  // ================================================

  return (
    <div className="min-h-screen space-y-4 bg-gray-50 p-3 md:p-5">

      {/* =========================================
          PARENT HEADER AND CHILD SELECTOR
      ========================================= */}

      <div className="rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-4 text-white shadow-md">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div className="min-w-0">

            <p className="text-xs font-medium text-indigo-200">
              CBSE Learning Analytics
            </p>

            <h1 className="mt-1 text-xl font-bold md:text-2xl">
              Welcome, {parent.name || userInfo?.name || "Parent"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Parent Dashboard
              </span>

              <span className="text-xs text-indigo-100">
                {children.length} linked{" "}
                {children.length === 1 ? "child" : "children"}
              </span>

            </div>

          </div>

          {/* CHILD DROPDOWN AND REFRESH */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">

            <div className="min-w-0 sm:min-w-64">

              <label
                htmlFor="parentChildSelect"
                className="mb-1 block text-xs font-medium text-indigo-100"
              >
                Select Child
              </label>

              <select
                id="parentChildSelect"
                value={effectiveStudentId}
                onChange={handleChildChange}
                className="w-full rounded-lg border border-white/30 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {children.map((child) => (
                  <option
                    key={child._id}
                    value={child._id}
                  >
                    {child.name}
                    {child.admissionNumber
                      ? ` (${child.admissionNumber})`
                      : ""}
                  </option>
                ))}
              </select>

            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/25 disabled:opacity-50"
            >
              {isFetching
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </div>

        {/* SELECTED CHILD INFORMATION */}

        <div className="mt-4 border-t border-white/20 pt-3">

          <div className="mb-3 flex flex-wrap items-center gap-2">

            <h2 className="text-base font-bold">
              {studentName}
            </h2>

            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold">
              Selected Child
            </span>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <div>
              <p className="text-xs text-indigo-200">
                Admission Number
              </p>

              <p className="mt-1 text-sm font-semibold">
                {admissionNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-indigo-200">
                Class
              </p>

              <p className="mt-1 text-sm font-semibold">
                {className}
              </p>
            </div>

            <div>
              <p className="text-xs text-indigo-200">
                Section / Stream
              </p>

              <p className="mt-1 text-sm font-semibold">
                {sectionName} / {streamName}
              </p>
            </div>

            <div>
              <p className="text-xs text-indigo-200">
                Academic Year
              </p>

              <p className="mt-1 text-sm font-semibold">
                {academicYearName}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* CHILD SWITCH LOADING INDICATOR */}

      {isFetching && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
          Loading selected child's performance...
        </div>
      )}

      {/* =========================================
          ACADEMIC OVERVIEW
      ========================================= */}

      <section>

        <SectionHeading
          title="Academic Overview"
          subtitle={`Assessment activities and performance of ${studentName}`}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <MetricCard
            title="Assessments"
            value={formatNumber(totalAssessments)}
            subtitle="Available assessments"
            icon="📝"
            color="indigo"
          />

          <MetricCard
            title="Total Attempts"
            value={formatNumber(totalAttempts)}
            subtitle="Assessment attempts"
            icon="📋"
            color="blue"
          />

          <MetricCard
            title="In Progress"
            value={formatNumber(inProgressAttempts)}
            subtitle="Attempts in progress"
            icon="⏳"
            color="orange"
          />

          <MetricCard
            title="Published Results"
            value={formatNumber(publishedResults)}
            subtitle="Results available"
            icon="✅"
            color="green"
          />

          <MetricCard
            title="Pending Evaluation"
            value={formatNumber(pendingEvaluation)}
            subtitle="Awaiting teacher evaluation"
            icon="🕒"
            color="orange"
          />

          <MetricCard
            title="Average Performance"
            value={formatPercentage(averagePercentage)}
            subtitle="Published assessment average"
            icon="📈"
            color="cyan"
          />

          <MetricCard
            title="Pass Percentage"
            value={formatPercentage(passPercentage)}
            subtitle="Results scoring 33% or above"
            icon="🏆"
            color="green"
          />

          <MetricCard
            title="Completed Assessments"
            value={formatNumber(completedAssessments)}
            subtitle={`${formatNumber(notAttemptedAssessments)} not attempted`}
            icon="🎯"
            color="purple"
          />

        </div>
      </section>

      {/* =========================================
          ASSESSMENT ACTIVITY
      ========================================= */}

      <section>

        <SectionHeading
          title="Assessment Activity"
          subtitle="Current assessment schedule and progress"
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <MetricCard
            title="Upcoming"
            value={formatNumber(upcomingCount)}
            subtitle="Scheduled assessments"
            icon="📅"
            color="blue"
          />

          <MetricCard
            title="Active"
            value={formatNumber(activeCount)}
            subtitle="Currently available"
            icon="🚀"
            color="green"
          />

          <MetricCard
            title="Completed"
            value={formatNumber(completedAssessments)}
            subtitle="Assessment activities"
            icon="✔️"
            color="purple"
          />

          <MetricCard
            title="Not Attempted"
            value={formatNumber(notAttemptedAssessments)}
            subtitle="No recorded attempt"
            icon="📌"
            color="orange"
          />

        </div>
      </section>

      {/* =========================================
          PERFORMANCE CHARTS
      ========================================= */}

      <section>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

          {/* SUBJECT PERFORMANCE */}

          <ChartCard
            title="Subject-wise Performance"
            subtitle="Average published percentage by subject"
          >

            {subjectPerformanceData.length ? (

              <ResponsiveContainer width="100%" height={280}>

                <BarChart
                  data={subjectPerformanceData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 25,
                    left: 10,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    fontSize={10}
                  />

                  <YAxis
                    type="category"
                    dataKey="subjectName"
                    width={95}
                    fontSize={10}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatPercentage(value),
                      "Average Performance",
                    ]}
                  />

                  <Bar
                    dataKey="averagePercentage"
                    name="Average Percentage"
                    fill={COLORS.primary}
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <EmptyChart message="Subject-wise performance will appear after results are published." />

            )}

          </ChartCard>

          {/* MONTHLY PERFORMANCE TREND */}

          <ChartCard
            title="Monthly Performance Trend"
            subtitle="Published result performance over time"
          >

            {trendData.length ? (

              <ResponsiveContainer width="100%" height={280}>

                <AreaChart
                  data={trendData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <defs>
                    <linearGradient
                      id="parentPerformanceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="monthLabel"
                    fontSize={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    fontSize={10}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatPercentage(value),
                      "Average Performance",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="averagePercentage"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#parentPerformanceGradient)"
                    activeDot={{ r: 5 }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <EmptyChart message="Performance trends will appear as results are published." />

            )}

          </ChartCard>

        </div>
      </section>

      {/* =========================================
          PERFORMANCE DISTRIBUTION AND PASS/FAIL
      ========================================= */}

      <section>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

          {/* PERFORMANCE DISTRIBUTION */}

          <ChartCard
            title="Performance Distribution"
            subtitle="Published results in each percentage range"
          >

            {publishedResults > 0 ? (

              <ResponsiveContainer width="100%" height={270}>

                <BarChart data={distributionData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    fontSize={9}
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={false}
                    fontSize={10}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value} results`,
                      "Count",
                    ]}
                  />

                  <Bar
                    dataKey="results"
                    name="Results"
                    radius={[6, 6, 0, 0]}
                    barSize={30}
                  >

                    {distributionData.map((item, index) => (
                      <Cell
                        key={`distribution-${index}`}
                        fill={[
                          COLORS.red,
                          COLORS.orange,
                          COLORS.yellow,
                          COLORS.blue,
                          COLORS.green,
                          COLORS.purple,
                        ][index]}
                      />
                    ))}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <EmptyChart message="No published results available." />

            )}

          </ChartCard>

          {/* PASS / FAIL ANALYSIS */}

          <ChartCard
            title="Pass / Fail Analysis"
            subtitle="Published results using the 33% threshold"
          >

            {publishedResults > 0 ? (

              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2">

                <div className="relative">

                  <ResponsiveContainer width="100%" height={230}>

                    <PieChart>

                      <Pie
                        data={passFailData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={4}
                      >

                        {passFailData.map((entry, index) => (
                          <Cell
                            key={`pass-fail-${index}`}
                            fill={entry.color}
                            stroke="white"
                          />
                        ))}

                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          `${value} results`,
                          "Count",
                        ]}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-2xl font-bold text-gray-800">
                      {publishedResults}
                    </span>

                    <span className="text-xs text-gray-500">
                      Results
                    </span>

                  </div>

                </div>

                <div className="space-y-4">

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-600" />

                      <span className="text-sm text-gray-600">
                        Passed
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-emerald-700">
                        {formatPercentage(passPercentage)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {passCount} results
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-600" />

                      <span className="text-sm text-gray-600">
                        Failed
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-red-700">
                        {formatPercentage(failPercentage)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {failCount} results
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-gray-100 pt-3">

                    <p className="text-xs text-gray-500">
                      Pass threshold
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-800">
                      33%
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <EmptyChart message="Pass/fail analysis will appear after results are published." />

            )}

          </ChartCard>

        </div>
      </section>

      {/* =========================================
          UPCOMING ASSESSMENTS
      ========================================= */}

      <section>

        <ChartCard
          title="Upcoming Assessments"
          subtitle={`Scheduled assessments for ${studentName}`}
        >

          {upcomingAssessments.length ? (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Assessment
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Subject
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Type
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Questions
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Marks
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Starts
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Ends
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {upcomingAssessments.map((assessment) => (

                    <tr
                      key={assessment._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-3 py-2.5">

                        <p className="min-w-36 font-semibold text-gray-800">
                          {assessment.title}
                        </p>

                        <StatusBadge
                          status={assessment.status}
                          getStyle={getAssessmentStatusStyle}
                        />

                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {assessment.subject?.name || "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {assessment.assessmentType?.replace(/_/g, " ") || "-"}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        {assessment.totalQuestions ?? "-"}
                      </td>

                      <td className="px-3 py-2.5 text-center font-semibold">
                        {assessment.totalMarks ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {formatDateTime(assessment.startDate)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {formatDateTime(assessment.endDate)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            <EmptyChart message="No upcoming assessments scheduled." />

          )}

        </ChartCard>

      </section>

      {/* =========================================
          ACTIVE ASSESSMENTS
      ========================================= */}

      <section>

        <ChartCard
          title="Active Assessments"
          subtitle={`Assessments currently available for ${studentName}`}
        >

          {activeAssessments.length ? (

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

              {activeAssessments.map((assessment) => {

                const latestAttempt =
                  assessment.latestAttempt;

                return (

                  <div
                    key={assessment._id}
                    className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0">

                        <h3 className="text-sm font-bold text-gray-800">
                          {assessment.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {assessment.subject?.name || "-"}
                        </p>

                      </div>

                      <StatusBadge
                        status={assessment.status}
                        getStyle={getAssessmentStatusStyle}
                      />

                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">

                      <div>
                        <p className="text-[10px] text-gray-500">
                          Questions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {assessment.totalQuestions}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-500">
                          Maximum Marks
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {assessment.totalMarks}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-500">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {assessment.durationMinutes} min
                        </p>
                      </div>

                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-2">

                      <p className="text-xs text-gray-500">
                        Ends: {formatDateTime(assessment.endDate)}
                      </p>

                      {latestAttempt && (

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">

                          <span className="text-xs text-gray-500">
                            Latest Attempt
                          </span>

                          <StatusBadge
                            status={latestAttempt.status}
                            getStyle={getAttemptStatusStyle}
                          />

                        </div>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          ) : (

            <EmptyChart message="There are no currently active assessments." />

          )}

        </ChartCard>

      </section>

      {/* =========================================
          RECENT ATTEMPTS
      ========================================= */}

      <section>

        <ChartCard
          title="Recent Assessment Attempts"
          subtitle={`Latest assessment activities of ${studentName}`}
        >

          {recentAttempts.length ? (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Assessment
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Subject
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Attempt
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Attempted
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Submitted At
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentAttempts.map((attempt) => (

                    <tr
                      key={attempt._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-3 py-2.5">

                        <p className="min-w-36 font-semibold text-gray-800">
                          {attempt.assessment?.title || "Assessment"}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {attempt.assessment?.subject?.name || "-"}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        {attempt.attemptNumber ?? "-"}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        {attempt.attemptedQuestions ?? 0}
                        {" / "}
                        {attempt.totalQuestions ?? 0}
                      </td>

                      <td className="px-3 py-2.5">
                        <StatusBadge
                          status={attempt.status}
                          getStyle={getAttemptStatusStyle}
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                        {formatDateTime(attempt.submittedAt)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            <EmptyChart message="No assessment attempts are available." />

          )}

        </ChartCard>

      </section>

      {/* =========================================
          RECENT PUBLISHED RESULTS
      ========================================= */}

      <section>

        <ChartCard
          title="Published Results"
          subtitle={`Recently published results of ${studentName}`}
        >

          {recentResults.length ? (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Assessment
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Subject
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Marks
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Percentage
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5">
                      Published Date
                    </th>

                    <th className="whitespace-nowrap px-3 py-2.5 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentResults.map((result) => (

                    <tr
                      key={result._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-3 py-2.5">

                        <p className="min-w-36 font-semibold text-gray-800">
                          {result.assessment?.title || "Assessment"}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {result.assessment?.assessmentType?.replace(
                            /_/g,
                            " "
                          ) || ""}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        {result.assessment?.subject?.name || "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-center font-semibold">
                        {result.obtainedMarks ?? 0}
                        {" / "}
                        {result.totalMarks ?? 0}
                      </td>

                      <td className="px-3 py-2.5 text-center">

                        <span
                          className={`font-bold ${getPercentageColor(
                            Number(result.percentage || 0)
                          )}`}
                        >
                          {formatPercentage(result.percentage)}
                        </span>

                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                        {formatDate(
                          result.publishedAt || result.updatedAt
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-center">

                        {result.status === "PUBLISHED" && (

                          <Link
                            to={`/result-details/result/${result._id}`}
                            className="inline-flex whitespace-nowrap items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            View Result
                          </Link>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            <EmptyChart message="Published results will appear here." />

          )}

        </ChartCard>

      </section>

      {/* =========================================
          RESULT PROCESSING OVERVIEW
      ========================================= */}

      <section>

        <ChartCard
          title="Result Processing Overview"
          subtitle={`Status of ${studentName}'s assessment results`}
        >

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {[
              {
                label: "Draft",
                value: resultStatusCounts.DRAFT || 0,
                color: "bg-gray-100 text-gray-700",
              },
              {
                label: "Pending Evaluation",
                value: resultStatusCounts.PENDING_EVALUATION || 0,
                color: "bg-amber-100 text-amber-700",
              },
              {
                label: "Evaluated",
                value: resultStatusCounts.EVALUATED || 0,
                color: "bg-blue-100 text-blue-700",
              },
              {
                label: "Published",
                value: resultStatusCounts.PUBLISHED || 0,
                color: "bg-emerald-100 text-emerald-700",
              },
              {
                label: "Withdrawn",
                value: resultStatusCounts.WITHDRAWN || 0,
                color: "bg-red-100 text-red-700",
              },
            ].map((item) => (

              <div
                key={item.label}
                className={`rounded-xl p-3 ${item.color}`}
              >

                <p className="text-xs font-medium">
                  {item.label}
                </p>

                <p className="mt-2 text-xl font-bold">
                  {formatNumber(item.value)}
                </p>

              </div>

            ))}

          </div>

          <div className="mt-4">

            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">

              <span>Result publication progress</span>

              <span className="font-semibold text-gray-800">
                {evaluationRate.toFixed(1)}%
              </span>

            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(evaluationRate, 0),
                    100
                  )}%`,
                }}
              />

            </div>

            <p className="mt-2 text-xs text-gray-500">
              {publishedResults} published out of {totalResults} results.
            </p>

          </div>

        </ChartCard>

      </section>

      {/* =========================================
          DASHBOARD FOOTER
      ========================================= */}

      <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 py-3 sm:flex-row">

        <p className="text-xs text-gray-400">
          CBSE Learning Analytics – Parent Dashboard
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">

          {isFetching && (
            <span className="text-xs text-indigo-600">
              Updating dashboard...
            </span>
          )}

          <span className="text-xs text-gray-400">
            Academic performance overview of your child
          </span>

        </div>

      </div>

    </div>
  );
};

export default ParentDashboardScreen;
