
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  useGetSchoolAdminDashboardQuery,
} from "../../slices/dashboardApiSlice";

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

// ==================================================
// CONSTANTS
// ==================================================

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

// ==================================================
// FORMATTERS
// ==================================================

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
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

const getId = (value) =>
  value?._id?.toString?.() ||
  value?.toString?.() ||
  "";

const getPercentageColor = (value) => {
  const percentage = Number(value || 0);

  if (percentage >= 75) return "text-emerald-700";
  if (percentage >= 50) return "text-blue-700";
  if (percentage >= 33) return "text-amber-700";

  return "text-red-700";
};

const getPercentageBackground = (value) => {
  const percentage = Number(value || 0);

  if (percentage >= 75) return "bg-emerald-500";
  if (percentage >= 50) return "bg-blue-500";
  if (percentage >= 33) return "bg-amber-500";

  return "bg-red-500";
};

// ==================================================
// REUSABLE COMPONENTS
// ==================================================

const EmptyChart = ({
  message = "No data available yet.",
  height = "h-48",
}) => (
  <div
    className={`${height} flex flex-col items-center justify-center text-gray-400`}
  >
    <span className="text-3xl mb-2">📊</span>
    <p className="text-xs text-center">{message}</p>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
  </div>
);

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
}) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    cyan: "bg-cyan-50 text-cyan-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500 truncate">
          {title}
        </p>

        <span
          className={`w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 ${
            styles[color] || styles.indigo
          }`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-1">
        <h3 className="text-xl font-bold text-gray-900">
          {value}
        </h3>

        {subtitle && (
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const SectionHeading = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
    <div>
      <h2 className="text-sm md:text-base font-bold text-gray-800">
        {title}
      </h2>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-0.5">
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
    className={`bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm min-w-0 ${className}`}
  >
    <SectionHeading
      title={title}
      subtitle={subtitle}
    />

    {children}
  </div>
);

const PercentageBadge = ({
  value,
  available = true,
}) => (
  <span
    className={`font-semibold ${
      available
        ? getPercentageColor(value)
        : "text-gray-400"
    }`}
  >
    {available ? formatPercentage(value) : "N/A"}
  </span>
);

// ==================================================
// FILTER DROPDOWN
// ==================================================

const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "All",
}) => (
  <div className="min-w-0 flex-1">
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>

    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full bg-white border border-gray-300 text-gray-800 rounded-md px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
    >
      <option value="">{placeholder}</option>

      {options.map((item) => (
        <option
          key={item._id}
          value={item._id}
        >
          {item.name}
          {item.code ? ` (${item.code})` : ""}
        </option>
      ))}
    </select>
  </div>
);


const SchoolAdminDashboardScreen = () => {

  // ==================================================
  // 1. STATE
  // ==================================================

  const [selectedStream, setSelectedStream] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [showAllAssessments, setShowAllAssessments] =
    useState(false);

  const [showAllTeachers, setShowAllTeachers] =
    useState(false);

  const [showAllResults, setShowAllResults] =
    useState(false);

  // ==================================================
  // 2. AUTHENTICATION
  // ==================================================

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  const userRole = userInfo?.role;

  const authorizedRoles = [
    "SCHOOL_ADMIN",
    "HM",
  ];

  const hasAccess = authorizedRoles.includes(userRole);

  // ==================================================
  // 3. RTK QUERY
  // ==================================================

  const {
    data: dashboard,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSchoolAdminDashboardQuery(
    {
      schoolSlug,

      streamId: selectedStream || undefined,

      classId: selectedClass || undefined,

      sectionId: selectedSection || undefined,

      subjectId: selectedSubject || undefined,
    },
    {
      skip: !schoolSlug || !hasAccess,
      refetchOnMountOrArgChange: true,
    }
  );

  // ==================================================
  // 4. DASHBOARD RESPONSE
  // ==================================================

  const summary = dashboard?.summary || {};

  const charts = dashboard?.charts || {};

  const filters = dashboard?.filters || {};

  const filterOptions = filters.options || {};

  const resultStatusCounts =
    dashboard?.resultStatusCounts || {};

  const attemptStatusCounts =
    dashboard?.attemptStatusCounts || {};

  const recentResults =
    dashboard?.recentResults || [];

  const streams = filterOptions.streams || [];

  const classes = filterOptions.classes || [];

  const sections = filterOptions.sections || [];

  const subjects = filterOptions.subjects || [];

  // ==================================================
  // 5. FILTER CHANGE HANDLERS
  // ==================================================

  const handleStreamChange = (value) => {
    setSelectedStream(value);

    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);

    setSelectedSection("");
    setSelectedSubject("");
  };

  const handleSectionChange = (value) => {
    setSelectedSection(value);

    setSelectedSubject("");
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  const handleResetFilters = () => {
    setSelectedStream("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
  };

  const hasActiveFilters = Boolean(
    selectedStream ||
    selectedClass ||
    selectedSection ||
    selectedSubject
  );

  // ==================================================
  // 6. SUMMARY VALUES
  // ==================================================

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

  // ==================================================
  // 7. SUBJECT PERFORMANCE
  // ==================================================

  const subjectPerformanceData = useMemo(
    () =>
      (charts.subjectPerformance || []).map((item) => ({
        ...item,

        subjectId: getId(item.subjectId),

        subjectName: item.subjectName || "Subject",

        averagePercentage: Number(
          item.averagePercentage || 0
        ),

        passPercentage: Number(
          item.passPercentage || 0
        ),

        failPercentage: Number(
          item.failPercentage || 0
        ),

        totalResults: Number(
          item.totalResults || 0
        ),

        totalStudents: Number(
          item.totalStudents || 0
        ),

        totalAssessments: Number(
          item.totalAssessments || 0
        ),
      })),
    [charts.subjectPerformance]
  );

  const subjectsWithResults = useMemo(
    () =>
      subjectPerformanceData.filter(
        (item) => item.totalResults > 0
      ),
    [subjectPerformanceData]
  );

  // ==================================================
  // 8. ASSESSMENT PERFORMANCE
  // ==================================================

  const assessmentPerformanceData = useMemo(
    () => charts.assessmentPerformance || [],
    [charts.assessmentPerformance]
  );

  const visibleAssessmentData = showAllAssessments
    ? assessmentPerformanceData
    : assessmentPerformanceData.slice(0, 10);

  // ==================================================
  // 9. TEACHER PERFORMANCE
  // ==================================================

  const teacherPerformanceData = useMemo(
    () =>
      (charts.teacherPerformance || []).map((item) => ({
        ...item,

        teacherId: getId(item.teacherId),

        teacherName: item.teacherName || "Teacher",

        averagePercentage: Number(
          item.averagePercentage || 0
        ),

        totalResults: Number(
          item.totalResults || 0
        ),

        totalAssessments: Number(
          item.totalAssessments || 0
        ),

        totalStudents: Number(
          item.totalStudents || 0
        ),

        passCount: Number(item.passCount || 0),

        failCount: Number(item.failCount || 0),
      })),
    [charts.teacherPerformance]
  );

  const visibleTeacherData = showAllTeachers
    ? teacherPerformanceData
    : teacherPerformanceData.slice(0, 10);

  // ==================================================
  // 10. PERFORMANCE DISTRIBUTION
  // ==================================================

  const distributionData = useMemo(() => {
    const source =
      charts.performanceDistribution || [];

    return DISTRIBUTION_RANGES.map((item) => {
      const found = source.find(
        (entry) =>
          Number(entry.range) === item.range
      );

      return {
        range: item.range,
        label: item.label,
        results: Number(found?.count || 0),
      };
    });
  }, [charts.performanceDistribution]);

  // ==================================================
  // 11. PASS / FAIL DATA
  // ==================================================

  const passFailData = useMemo(() => {
    const passed = Math.round(
      (Number(passPercentage) / 100) *
        publishedResults
    );

    return [
      {
        name: "Passed",
        value: passed,
        color: COLORS.green,
      },
      {
        name: "Failed",
        value: Math.max(
          0,
          publishedResults - passed
        ),
        color: COLORS.red,
      },
    ];
  }, [publishedResults, passPercentage]);

  // ==================================================
  // 12. MONTHLY PERFORMANCE TREND
  // ==================================================

  const trendData = useMemo(
    () =>
      (charts.performanceTrend || []).map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
        averagePercentage: Number(
          item.averagePercentage || 0
        ),
      })),
    [charts.performanceTrend]
  );

  // ==================================================
  // 13. PERFORMANCE HIGHLIGHTS
  // ==================================================

  const strongestSubject = useMemo(
    () =>
      [...subjectsWithResults].sort(
        (a, b) =>
          b.averagePercentage - a.averagePercentage
      )[0],
    [subjectsWithResults]
  );

  const weakestSubject = useMemo(
    () =>
      [...subjectsWithResults].sort(
        (a, b) =>
          a.averagePercentage - b.averagePercentage
      )[0],
    [subjectsWithResults]
  );

  const strongestTeacher = useMemo(
    () =>
      [...teacherPerformanceData].sort(
        (a, b) =>
          b.averagePercentage - a.averagePercentage
      )[0],
    [teacherPerformanceData]
  );

  // ==================================================
  // 14. PUBLICATION RATE
  // ==================================================

  const publicationRate = totalResults
    ? (publishedResults / totalResults) * 100
    : 0;

  // ==================================================
  // 15. RECENT RESULTS
  // ==================================================

  const visibleRecentResults = showAllResults
    ? recentResults
    : recentResults.slice(0, 10);

  // ==================================================
  // 16. LOADING
  // ==================================================

  if (!schoolSlug) {
    return (
      <div className="p-5 text-sm text-gray-600">
        School information is unavailable.
        Please sign in again.
      </div>
    );
  }

  // ==================================================
  // 17. ROLE VALIDATION
  // ==================================================

  if (!hasAccess) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <h2 className="font-bold text-red-800">
            Access Denied
          </h2>

          <p className="text-sm text-red-600 mt-2">
            Only School Administrators and Headmasters
            can access the school performance dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // 18. LOADING SCREEN
  // ==================================================

  if (isLoading) {
    return (
      <div className="p-3 md:p-5 space-y-4">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse" />

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  // ==================================================
  // 19. ERROR
  // ==================================================

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="font-bold text-red-800">
            Unable to Load School Dashboard
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error?.data?.message ||
              error?.error ||
              "Something went wrong."}
          </p>

          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // 20. MAIN JSX
  // ==================================================


  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4 space-y-4">

      {/* ==========================================
          DASHBOARD HEADER AND FILTERS
      ========================================== */}

      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-xl px-4 py-3 text-white shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">

          <div>
            <p className="text-xs text-indigo-200">
              CBSE Learning Analytics
            </p>

            <h1 className="text-xl md:text-2xl font-bold">
              School Performance Dashboard
            </h1>

            <p className="text-xs text-indigo-100 mt-1">
              Complete student performance across the school
            </p>
          </div>

          <div className="flex items-center gap-2">

            <span className="px-3 py-1.5 bg-white/15 rounded-full text-xs font-semibold">
              {userRole === "HM"
                ? "Headmaster"
                : "School Administrator"}
            </span>

            <button
              onClick={refetch}
              disabled={isFetching}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-xs font-semibold disabled:opacity-50"
            >
              {isFetching ? "Refreshing..." : "↻ Refresh"}
            </button>

          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-4 pt-3 border-t border-white/20">

          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

            <p className="text-xs font-semibold text-indigo-100">
              Performance Filters
            </p>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-white underline hover:text-indigo-100"
              >
                Clear all filters
              </button>
            )}

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

            {/* STREAM */}

            <div>
              <label className="block text-xs text-indigo-100 mb-1">
                Stream
              </label>

              <select
                value={selectedStream}
                onChange={(event) =>
                  handleStreamChange(event.target.value)
                }
                className="w-full bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs outline-none"
              >
                <option value="">All Streams</option>

                {streams.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS */}

            <div>
              <label className="block text-xs text-indigo-100 mb-1">
                Class
              </label>

              <select
                value={selectedClass}
                onChange={(event) =>
                  handleClassChange(event.target.value)
                }
                className="w-full bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs outline-none"
              >
                <option value="">All Classes</option>

                {classes.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION */}

            <div>
              <label className="block text-xs text-indigo-100 mb-1">
                Section
              </label>

              <select
                value={selectedSection}
                onChange={(event) =>
                  handleSectionChange(event.target.value)
                }
                className="w-full bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs outline-none"
              >
                <option value="">All Sections</option>

                {sections.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJECT */}

            <div>
              <label className="block text-xs text-indigo-100 mb-1">
                Subject
              </label>

              <select
                value={selectedSubject}
                onChange={(event) =>
                  handleSubjectChange(event.target.value)
                }
                className="w-full bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs outline-none"
              >
                <option value="">All Subjects</option>

                {subjects.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* FETCHING INDICATOR */}

      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-indigo-600">
          <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Updating dashboard...
        </div>
      )}

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">

          <MetricCard
            title="Students"
            value={formatNumber(totalStudents)}
            subtitle="Active students"
            icon="👨‍🎓"
            color="indigo"
          />

          <MetricCard
            title="Assessments"
            value={formatNumber(totalAssessments)}
            subtitle="Available assessments"
            icon="📝"
            color="purple"
          />

          <MetricCard
            title="Attempts"
            value={formatNumber(totalAttempts)}
            subtitle="Student attempts"
            icon="📋"
            color="cyan"
          />

          <MetricCard
            title="Results"
            value={formatNumber(totalResults)}
            subtitle="All result records"
            icon="📊"
            color="blue"
          />

          <MetricCard
            title="Published"
            value={formatNumber(publishedResults)}
            subtitle="Published results"
            icon="✅"
            color="green"
          />

          <MetricCard
            title="Pending"
            value={formatNumber(pendingEvaluation)}
            subtitle="Evaluations"
            icon="⏳"
            color="orange"
          />

          <MetricCard
            title="Average"
            value={formatPercentage(averagePercentage)}
            subtitle="Published results"
            icon="📈"
            color="blue"
          />

          <MetricCard
            title="Pass Rate"
            value={formatPercentage(passPercentage)}
            subtitle="Result-level"
            icon="🏆"
            color="green"
          />

        </div>
      </section>

      {/* ==========================================
          PERFORMANCE HIGHLIGHTS
      ========================================== */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* STRONGEST SUBJECT */}

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            Highest Average Subject
          </p>

          <h3 className="font-bold text-gray-800 mt-1">
            {strongestSubject?.subjectName || "Not available"}
          </h3>

          <p className="text-lg font-bold text-emerald-700 mt-1">
            {strongestSubject
              ? formatPercentage(strongestSubject.averagePercentage)
              : "-"}
          </p>
        </div>

        {/* WEAKEST SUBJECT */}

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            Lowest Average Subject
          </p>

          <h3 className="font-bold text-gray-800 mt-1">
            {weakestSubject?.subjectName || "Not available"}
          </h3>

          <p className="text-lg font-bold text-orange-700 mt-1">
            {weakestSubject
              ? formatPercentage(weakestSubject.averagePercentage)
              : "-"}
          </p>
        </div>

        {/* PUBLICATION PROGRESS */}

        <div className="bg-white border border-gray-200 rounded-lg p-3">

          <p className="text-xs text-gray-500">
            Result Publication Progress
          </p>

          <div className="flex items-center justify-between mt-1">

            <h3 className="text-lg font-bold text-indigo-700">
              {formatPercentage(publicationRate)}
            </h3>

            <span className="text-xs text-gray-500">
              {publishedResults} / {totalResults}
            </span>

          </div>

          <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{
                width: `${Math.min(100, publicationRate)}%`,
              }}
            />
          </div>

        </div>

      </section>

      {/* ==========================================
          SUBJECT-WISE PERFORMANCE
      ========================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">

        <ChartCard
          title="Subject-wise Average Performance"
          subtitle="Average percentage across published results"
        >
          {subjectsWithResults.length ? (

            <ResponsiveContainer
              width="100%"
              height={Math.max(
                240,
                subjectsWithResults.length * 45
              )}
            >
              <BarChart
                data={subjectsWithResults}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 35,
                  left: 5,
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
                  width={105}
                  fontSize={10}
                />

                <Tooltip
                  formatter={(value) => [
                    formatPercentage(value),
                    "Average",
                  ]}
                />

                <Bar
                  dataKey="averagePercentage"
                  name="Average"
                  fill={COLORS.primary}
                  radius={[0, 5, 5, 0]}
                  barSize={22}
                />

              </BarChart>
            </ResponsiveContainer>

          ) : (
            <EmptyChart message="No published subject results yet." />
          )}

        </ChartCard>

        <ChartCard
          title="Subject-wise Pass / Fail Comparison"
          subtitle="Based on published results"
        >
          {subjectsWithResults.length ? (

            <ResponsiveContainer
              width="100%"
              height={Math.max(
                240,
                subjectsWithResults.length * 45
              )}
            >
              <BarChart
                data={subjectsWithResults}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 5,
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
                  width={105}
                  fontSize={10}
                />

                <Tooltip
                  formatter={(value) =>
                    formatPercentage(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="passPercentage"
                  name="Pass %"
                  fill={COLORS.green}
                  barSize={17}
                  radius={[0, 4, 4, 0]}
                />

                <Bar
                  dataKey="failPercentage"
                  name="Fail %"
                  fill={COLORS.red}
                  barSize={17}
                  radius={[0, 4, 4, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          ) : (
            <EmptyChart message="No published results available." />
          )}

        </ChartCard>

      </section>

      {/* ==========================================
          SUBJECT PERFORMANCE REPORT
      ========================================== */}

      <section>
        <ChartCard
          title="Subject-wise Performance Report"
          subtitle="Detailed student and assessment analysis"
        >
          {subjectPerformanceData.length ? (

            <div className="overflow-x-auto">

              <table className="w-full text-xs text-left">

                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b">

                    <th className="px-3 py-2">Subject</th>

                    <th className="px-3 py-2 text-center">
                      Assessments
                    </th>

                    <th className="px-3 py-2 text-center">
                      Students
                    </th>

                    <th className="px-3 py-2 text-center">
                      Results
                    </th>

                    <th className="px-3 py-2 text-center">
                      Average
                    </th>

                    <th className="px-3 py-2 text-center">
                      Pass %
                    </th>

                    <th className="px-3 py-2 text-center">
                      Fail %
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {subjectPerformanceData.map((item) => (

                    <tr
                      key={item.subjectId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                        {item.subjectName}
                      </td>

                      <td className="px-3 py-2 text-center">
                        {formatNumber(item.totalAssessments)}
                      </td>

                      <td className="px-3 py-2 text-center">
                        {formatNumber(item.totalStudents)}
                      </td>

                      <td className="px-3 py-2 text-center">
                        {formatNumber(item.totalResults)}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <PercentageBadge
                          value={item.averagePercentage}
                          available={item.totalResults > 0}
                        />
                      </td>

                      <td className="px-3 py-2 text-center text-emerald-700 font-semibold">
                        {item.totalResults
                          ? formatPercentage(item.passPercentage)
                          : "N/A"}
                      </td>

                      <td className="px-3 py-2 text-center text-red-600 font-semibold">
                        {item.totalResults
                          ? formatPercentage(item.failPercentage)
                          : "N/A"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (
            <EmptyChart message="No subject performance data available." />
          )}

        </ChartCard>
      </section>

      {/* ==========================================
          ASSESSMENT-WISE PERFORMANCE
      ========================================== */}

      <section>
        <ChartCard
          title="Assessment-wise Performance"
          subtitle="Average published performance by assessment"
        >

          {visibleAssessmentData.length ? (

            <>
              <div className="overflow-x-auto">

                <div
                  style={{
                    minWidth: Math.max(
                      650,
                      visibleAssessmentData.length * 75
                    ),
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height={270}
                  >
                    <BarChart
                      data={visibleAssessmentData}
                      margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 65,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="title"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        fontSize={10}
                      />

                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        fontSize={10}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatPercentage(value)
                        }
                      />

                      <Bar
                        dataKey="averagePercentage"
                        name="Average"
                        fill={COLORS.blue}
                        barSize={28}
                        radius={[5, 5, 0, 0]}
                      />

                    </BarChart>
                  </ResponsiveContainer>

                </div>

              </div>

              {assessmentPerformanceData.length > 10 && (
                <button
                  onClick={() =>
                    setShowAllAssessments((previous) => !previous)
                  }
                  className="mt-2 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  {showAllAssessments
                    ? "Show fewer assessments"
                    : "Show all assessments"}
                </button>
              )}

            </>

          ) : (
            <EmptyChart message="No published assessment performance yet." />
          )}

        </ChartCard>
      </section>

      {/* ==========================================
          TEACHER PERFORMANCE
      ========================================== */}

      <section className="space-y-3">

        <ChartCard
          title="Teacher-level Performance"
          subtitle="Student performance in published assessments created by each teacher"
        >

          {teacherPerformanceData.length ? (

            <>

              {/* TEACHER PERFORMANCE CHART */}

              <ResponsiveContainer
                width="100%"
                height={Math.max(
                  240,
                  visibleTeacherData.length * 48
                )}
              >
                <BarChart
                  data={visibleTeacherData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 35,
                    left: 5,
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
                    dataKey="teacherName"
                    width={125}
                    fontSize={10}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatPercentage(value),
                      "Average",
                    ]}
                  />

                  <Bar
                    dataKey="averagePercentage"
                    name="Average Student Performance"
                    fill={COLORS.purple}
                    radius={[0, 5, 5, 0]}
                    barSize={23}
                  />

                </BarChart>
              </ResponsiveContainer>

              {/* TEACHER PERFORMANCE TABLE */}

              <div className="mt-4 overflow-x-auto">

                <table className="w-full text-xs text-left">

                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600">

                      <th className="px-3 py-2">
                        Teacher
                      </th>

                      <th className="px-3 py-2 text-center">
                        Assessments
                      </th>

                      <th className="px-3 py-2 text-center">
                        Students
                      </th>

                      <th className="px-3 py-2 text-center">
                        Results
                      </th>

                      <th className="px-3 py-2 text-center">
                        Average
                      </th>

                      <th className="px-3 py-2 text-center">
                        Passed
                      </th>

                      <th className="px-3 py-2 text-center">
                        Failed
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {visibleTeacherData.map((item) => (

                      <tr
                        key={item.teacherId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                          {item.teacherName}
                        </td>

                        <td className="px-3 py-2 text-center">
                          {formatNumber(item.totalAssessments)}
                        </td>

                        <td className="px-3 py-2 text-center">
                          {formatNumber(item.totalStudents)}
                        </td>

                        <td className="px-3 py-2 text-center">
                          {formatNumber(item.totalResults)}
                        </td>

                        <td className="px-3 py-2 text-center">
                          <PercentageBadge
                            value={item.averagePercentage}
                            available={item.totalResults > 0}
                          />
                        </td>

                        <td className="px-3 py-2 text-center text-emerald-700 font-semibold">
                          {formatNumber(item.passCount)}
                        </td>

                        <td className="px-3 py-2 text-center text-red-600 font-semibold">
                          {formatNumber(item.failCount)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {teacherPerformanceData.length > 10 && (
                <button
                  onClick={() =>
                    setShowAllTeachers((previous) => !previous)
                  }
                  className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  {showAllTeachers
                    ? "Show fewer teachers"
                    : "Show all teachers"}
                </button>
              )}

              {/* PERFORMANCE NOTE */}

              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">

                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This report attributes
                  published student results to the teacher who
                  created the assessment. It does not independently
                  measure teaching effectiveness or subject-teacher
                  assignment.
                </p>

              </div>

            </>

          ) : (
            <EmptyChart message="Teacher-level assessment performance will appear after results are published." />
          )}

        </ChartCard>

      </section>

      {/* ==========================================
          PERFORMANCE HIGHLIGHT
      ========================================== */}

      {strongestTeacher && (
        <section>
          <div className="bg-white border border-gray-200 rounded-lg p-3">

            <p className="text-xs text-gray-500">
              Highest Average Assessment Creator Performance
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">

              <h3 className="font-bold text-gray-800">
                {strongestTeacher.teacherName}
              </h3>

              <p className="text-lg font-bold text-emerald-700">
                {formatPercentage(
                  strongestTeacher.averagePercentage
                )}
              </p>

            </div>

          </div>
        </section>
      )}

      {/* ==========================================
          STUDENT PERFORMANCE DISTRIBUTION
      ========================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">

        <ChartCard
          title="Student Performance Distribution"
          subtitle="Published results grouped by percentage range"
        >

          {publishedResults ? (

            <ResponsiveContainer
              width="100%"
              height={250}
            >
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

                <Tooltip />

                <Bar
                  dataKey="results"
                  name="Results"
                  barSize={30}
                  radius={[5, 5, 0, 0]}
                >
                  {distributionData.map((item, index) => (
                    <Cell
                      key={item.range}
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

        {/* OVERALL PASS / FAIL */}

        <ChartCard
          title="Overall Pass / Fail"
          subtitle="Published results using a 33% pass threshold"
        >

          {publishedResults ? (

            <div className="flex flex-col sm:flex-row items-center gap-3">

              <ResponsiveContainer
                width="100%"
                height={250}
              >
                <PieChart>

                  <Pie
                    data={passFailData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                  >
                    {passFailData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>

              <div className="w-full sm:w-40 space-y-3 text-sm">

                <div>
                  <p className="text-xs text-gray-500">
                    Passed
                  </p>

                  <p className="font-bold text-emerald-700">
                    {formatPercentage(passPercentage)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Failed
                  </p>

                  <p className="font-bold text-red-700">
                    {formatPercentage(failPercentage)}
                  </p>
                </div>

              </div>

            </div>

          ) : (
            <EmptyChart message="No published results available." />
          )}

        </ChartCard>

      </section>

      {/* ==========================================
          MONTHLY PERFORMANCE TREND
      ========================================== */}

      <section>

        <ChartCard
          title="Monthly Performance Trend"
          subtitle="Average published result percentage over time"
        >

          {trendData.length ? (

            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <AreaChart data={trendData}>

                <defs>
                  <linearGradient
                    id="schoolAdminGradient"
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
                  formatter={(value) =>
                    formatPercentage(value)
                  }
                />

                <Area
                  type="monotone"
                  dataKey="averagePercentage"
                  name="Average"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#schoolAdminGradient)"
                />

              </AreaChart>
            </ResponsiveContainer>

          ) : (
            <EmptyChart message="Monthly performance trend will appear after results are published." />
          )}

        </ChartCard>

      </section>

      {/* ==========================================
          RESULT PROCESSING STATUS
      ========================================== */}

      <section>

        <ChartCard
          title="Result Processing Overview"
          subtitle="Current status of assessment results"
        >

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">

            {[
              {
                label: "Draft",
                value: resultStatusCounts.DRAFT || 0,
                color: "bg-gray-100 text-gray-700",
              },
              {
                label: "Pending Evaluation",
                value:
                  resultStatusCounts.PENDING_EVALUATION || 0,
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
                className={`rounded-lg p-3 ${item.color}`}
              >

                <p className="text-xs">
                  {item.label}
                </p>

                <p className="text-xl font-bold mt-1">
                  {formatNumber(item.value)}
                </p>

              </div>

            ))}

          </div>

        </ChartCard>

      </section>

      {/* ==========================================
          ATTEMPT STATUS
      ========================================== */}

      <section>

        <ChartCard
          title="Student Assessment Attempt Status"
          subtitle="Overall assessment participation"
        >

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">

            {[
              {
                label: "In Progress",
                value: attemptStatusCounts.IN_PROGRESS || 0,
                color: "bg-blue-50 text-blue-700",
              },
              {
                label: "Submitted",
                value: attemptStatusCounts.SUBMITTED || 0,
                color: "bg-indigo-50 text-indigo-700",
              },
              {
                label: "Evaluating",
                value: attemptStatusCounts.EVALUATING || 0,
                color: "bg-amber-50 text-amber-700",
              },
              {
                label: "Evaluated",
                value: attemptStatusCounts.EVALUATED || 0,
                color: "bg-emerald-50 text-emerald-700",
              },
              {
                label: "Abandoned",
                value: attemptStatusCounts.ABANDONED || 0,
                color: "bg-red-50 text-red-700",
              },
              {
                label: "Expired",
                value: attemptStatusCounts.EXPIRED || 0,
                color: "bg-orange-50 text-orange-700",
              },
            ].map((item) => (

              <div
                key={item.label}
                className={`rounded-lg p-3 ${item.color}`}
              >

                <p className="text-xs">
                  {item.label}
                </p>

                <p className="text-xl font-bold mt-1">
                  {formatNumber(item.value)}
                </p>

              </div>

            ))}

          </div>

        </ChartCard>

      </section>

      {/* ==========================================
          RECENT PUBLISHED RESULTS
      ========================================== */}

      <section>

        <ChartCard
          title="Recent Published Results"
          subtitle="Latest published student results across the school"
        >

          {visibleRecentResults.length ? (

            <>

              <div className="overflow-x-auto">

                <table className="w-full text-xs text-left">

                  <thead>

                    <tr className="bg-gray-50 border-b text-gray-600">

                      <th className="px-3 py-2">
                        Student
                      </th>

                      <th className="px-3 py-2">
                        Stream
                      </th>

                      <th className="px-3 py-2">
                        Class
                      </th>

                      <th className="px-3 py-2">
                        Section
                      </th>

                      <th className="px-3 py-2">
                        Subject
                      </th>

                      <th className="px-3 py-2">
                        Assessment
                      </th>

                      <th className="px-3 py-2 text-center">
                        Marks
                      </th>

                      <th className="px-3 py-2 text-center">
                        Percentage
                      </th>

                      <th className="px-3 py-2">
                        Published
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {visibleRecentResults.map((result) => (

                      <tr
                        key={result._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-3 py-2">

                          <p className="font-semibold text-gray-800 whitespace-nowrap">
                            {result.student?.user?.name || "-"}
                          </p>

                          <p className="text-gray-500">
                            {result.student?.admissionNumber || "-"}
                          </p>

                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {result.assessment?.stream?.name || "-"}
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {result.assessment?.class?.name || "-"}
                        </td>

                        <td className="px-3 py-2">
                          {result.assessment?.section?.name || "-"}
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {result.assessment?.subject?.name || "-"}
                        </td>

                        <td className="px-3 py-2">
                          {result.assessment?.title || "-"}
                        </td>

                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {result.obtainedMarks} / {result.totalMarks}
                        </td>

                        <td className="px-3 py-2 text-center">
                          <PercentageBadge
                            value={result.percentage}
                          />
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDate(result.publishedAt)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {recentResults.length > 10 && (
                <button
                  onClick={() =>
                    setShowAllResults((previous) => !previous)
                  }
                  className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  {showAllResults
                    ? "Show fewer results"
                    : "Show all recent results"}
                </button>
              )}

            </>

          ) : (
            <EmptyChart message="No published results available for the selected filters." />
          )}

        </ChartCard>

      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-400 py-2">

        <p>
          CBSE Learning Analytics – School Dashboard
        </p>

        <p>
          Performance calculations use published results only.
        </p>

      </div>

    </div>
  );
};

export default SchoolAdminDashboardScreen;
