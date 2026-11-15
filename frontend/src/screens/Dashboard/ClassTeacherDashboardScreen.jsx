
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  useGetClassTeacherDashboardQuery,
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

const getPercentageColor = (value) => {
  const percentage = Number(value || 0);

  if (percentage >= 75) return "text-emerald-700";
  if (percentage >= 50) return "text-blue-700";
  if (percentage >= 33) return "text-amber-700";

  return "text-red-700";
};

const getId = (value) =>
  value?._id?.toString?.() ||
  value?.toString?.() ||
  "";

const getScopeKey = (assignment) =>
  [
    getId(assignment.academicYear),
    getId(assignment.class),
    getId(assignment.section),
  ].join("_");

const getResultScopeKey = (result) =>
  [
    getId(result.assessment?.academicYear),
    getId(result.assessment?.class),
    getId(result.assessment?.section),
  ].join("_");

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
    <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 shadow-sm min-w-0">
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
        <h3 className="text-lg font-bold text-gray-900">
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
  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
    <div>
      <h2 className="text-xs md:text-sm font-bold text-gray-800">
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
    className={`bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm min-w-0 ${className}`}
  >
    <SectionHeading
      title={title}
      subtitle={subtitle}
    />

    {children}
  </div>
);

const PercentageBadge = ({ value, available = true }) => (
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


const ClassTeacherDashboardScreen = () => {
  // ================================================
  // 1. STATE
  // ================================================

  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

  const [academicYearOptions, setAcademicYearOptions] =
    useState([]);

  const [showAllAssessments, setShowAllAssessments] =
    useState(false);

  // ================================================
  // 2. AUTHENTICATION
  // ================================================

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const schoolSlug = userInfo?.school?.slug;

  // ================================================
  // 3. RTK QUERY
  // ================================================

  const {
    data: dashboard,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetClassTeacherDashboardQuery(
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
  // 4. DASHBOARD RESPONSE
  // ================================================

  const summary = dashboard?.summary || {};
  const charts = dashboard?.charts || {};

  const assignments = useMemo(
    () => dashboard?.assignments || [],
    [dashboard?.assignments]
  );

  const recentResults = dashboard?.recentResults || [];

  const teacherType =
    dashboard?.teacherType || "NO_CLASS_ASSIGNMENT";

  const resultStatusCounts =
    dashboard?.resultStatusCounts || {};

  // ================================================
  // 5. ACADEMIC YEAR OPTIONS
  // ================================================

  useEffect(() => {
    if (!assignments.length) return;

    setAcademicYearOptions((previous) => {
      const options = new Map(
        previous.map((item) => [item._id, item])
      );

      assignments.forEach((assignment) => {
        const year = assignment.academicYear;

        if (year?._id) {
          options.set(year._id.toString(), year);
        }
      });

      return Array.from(options.values()).sort(
        (a, b) =>
          String(b.name || "").localeCompare(
            String(a.name || ""),
            undefined,
            { numeric: true }
          )
      );
    });
  }, [assignments]);

  // ================================================
  // 6. SECTION OPTIONS
  // ================================================

  const sectionOptions = useMemo(() => {
    return assignments.map((assignment) => ({
      key: getScopeKey(assignment),
      academicYear: assignment.academicYear,
      class: assignment.class,
      section: assignment.section,
    }));
  }, [assignments]);

  useEffect(() => {
    if (
      selectedSection &&
      !sectionOptions.some(
        (item) => item.key === selectedSection
      )
    ) {
      setSelectedSection("");
    }
  }, [selectedSection, sectionOptions]);

  const selectedScope = sectionOptions.find(
    (item) => item.key === selectedSection
  );

  // ================================================
  // 7. SUMMARY VALUES
  // ================================================

  const {
    totalStudents = 0,
    totalSubjects = 0,
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
  // 8. SUBJECT PERFORMANCE
  // ================================================

  const subjectPerformanceData = useMemo(
    () =>
      (charts.sectionSubjectPerformance || []).map(
        (item) => ({
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
          totalAttempts: Number(
            item.totalAttempts || 0
          ),
          totalResults: Number(
            item.totalResults || 0
          ),
        })
      ),
    [charts.sectionSubjectPerformance]
  );

  // ================================================
  // 9. SUBJECT ATTEMPT DATA
  // ================================================

  const subjectAttemptData = useMemo(
    () =>
      [...subjectPerformanceData].sort(
        (a, b) => b.totalAttempts - a.totalAttempts
      ),
    [subjectPerformanceData]
  );

  // ================================================
  // 10. ASSESSMENT PERFORMANCE
  // ================================================

  const assessmentPerformanceData =
    charts.assessmentPerformance || [];



  // ================================================
  // 11. DISTRIBUTION DATA
  // ================================================

  const distributionData = useMemo(() => {
    const source =
      charts.performanceDistribution || [];

    return DISTRIBUTION_RANGES.map((item) => {
      const found = source.find(
        (entry) =>
          Number(entry.range) === item.range
      );

      return {
        label: item.label,
        results: Number(found?.count || 0),
      };
    });
  }, [charts.performanceDistribution]);

  // ================================================
  // 12. PASS / FAIL DATA
  // ================================================

  const passFailData = useMemo(
    () => {
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
    },
    [publishedResults, passPercentage]
  );

  // ================================================
  // 13. MONTHLY TREND
  // ================================================

  const trendData = useMemo(
    () =>
      (charts.performanceTrend || []).map(
        (item) => ({
          ...item,
          monthLabel: formatMonth(item.month),
        })
      ),
    [charts.performanceTrend]
  );

  // ================================================
  // 14. RECENT RESULTS
  // ================================================

  const visibleRecentResults = useMemo(() => {
    if (!selectedSection) return recentResults;

    return recentResults.filter(
      (result) =>
        getResultScopeKey(result) === selectedSection
    );
  }, [recentResults, selectedSection]);

  // ================================================
  // 15. INDICATORS
  // ================================================

  const publicationRate = totalResults
    ? (publishedResults / totalResults) * 100
    : 0;

  const subjectWithResults =
    subjectPerformanceData.filter(
      (item) => item.totalResults > 0
    );

  const strongestSubject = [...subjectWithResults].sort(
    (a, b) =>
      b.averagePercentage - a.averagePercentage
  )[0];

  const weakestSubject = [...subjectWithResults].sort(
    (a, b) =>
      a.averagePercentage - b.averagePercentage
  )[0];

  const handleAcademicYearChange = (event) => {
    setSelectedAcademicYear(event.target.value);
    setSelectedSection("");
  };

  // ================================================
  // 16. LOADING
  // ================================================

  if (!schoolSlug) {
    return (
      <div className="p-5 text-sm text-gray-600">
        School information is unavailable.
        Please sign in again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 md:p-5 space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />

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

  // ================================================
  // 17. ERROR
  // ================================================

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="font-bold text-red-800">
            Unable to load Class Teacher Dashboard
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

  // ================================================
  // 18. NO ASSIGNMENT
  // ================================================

  if (
    teacherType === "NO_CLASS_ASSIGNMENT" ||
    !assignments.length
  ) {
    return (
      <div className="p-5">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🏫</div>

          <h2 className="font-bold text-gray-800">
            No Class Teacher Assignment Found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            The dashboard will become available
            after you are assigned as a class teacher
            for a section.
          </p>
        </div>
      </div>
    );
  }

  // Main JSX starts in Section 4.


  const compactSubjectData = subjectWithResults.slice(0, 6);
  const compactAttemptData = subjectAttemptData.slice(0, 6);
  const compactAssessmentData = showAllAssessments
    ? assessmentPerformanceData
    : assessmentPerformanceData.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 p-2.5 md:p-3 space-y-3">
      {/* HEADER + FILTERS */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-xl px-4 py-3 text-white shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-indigo-200">CBSE Learning Analytics</p>
            <h1 className="text-lg md:text-xl font-bold">Class Teacher Dashboard</h1>
            <p className="text-[11px] text-indigo-100">Student performance across assigned sections</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-[10px] text-indigo-100">
              Academic Year
              <select value={selectedAcademicYear} onChange={handleAcademicYearChange} className="block mt-1 bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs min-w-32">
                <option value="">All Years</option>
                {academicYearOptions.map((year) => <option key={year._id} value={year._id}>{year.name}</option>)}
              </select>
            </label>
            <label className="text-[10px] text-indigo-100">
              Assigned Section
              <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} className="block mt-1 bg-white text-gray-800 rounded-md px-2.5 py-2 text-xs min-w-40">
                <option value="">All Assigned Sections</option>
                {sectionOptions.map((item) => <option key={item.key} value={item.key}>{item.class?.name} - {item.section?.name} ({item.academicYear?.name})</option>)}
              </select>
            </label>
            <button type="button" onClick={refetch} disabled={isFetching} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-xs font-semibold disabled:opacity-50">
              {isFetching ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/20">
          {assignments.map((assignment) => <span key={getScopeKey(assignment)} className="px-2 py-1 bg-white/15 rounded-full text-[10px]">{assignment.class?.name} - {assignment.section?.name}</span>)}
          {isFetching && <span className="text-[10px] text-indigo-100 self-center">Updating...</span>}
        </div>
      </header>

      {selectedScope && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-800">
          Recent results filtered to <strong>{selectedScope.class?.name} - {selectedScope.section?.name}</strong>. Summary cards and aggregate charts still cover all assigned sections; section-specific aggregation requires a backend filter.
        </div>
      )}

      {/* KPI STRIP */}
      <section className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        <MetricCard title="Students" value={formatNumber(totalStudents)} subtitle="Assigned sections" icon="👨‍🎓" color="indigo" />
        <MetricCard title="Subjects" value={formatNumber(totalSubjects)} subtitle="With assessments" icon="📚" color="blue" />
        <MetricCard title="Assessments" value={formatNumber(totalAssessments)} subtitle="All subjects" icon="📝" color="purple" />
        <MetricCard title="Attempts" value={formatNumber(totalAttempts)} subtitle="Student attempts" icon="📋" color="cyan" />
        <MetricCard title="Published" value={formatNumber(publishedResults)} subtitle="Official results" icon="✅" color="green" />
        <MetricCard title="Pending" value={formatNumber(pendingEvaluation)} subtitle="Evaluations" icon="⏳" color="orange" />
        <MetricCard title="Average" value={formatPercentage(averagePercentage)} subtitle="Published results" icon="📈" color="blue" />
        <MetricCard title="Pass Rate" value={formatPercentage(passPercentage)} subtitle="Result-level" icon="🏆" color="green" />
      </section>

      {/* QUICK INSIGHTS + PUBLICATION */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm min-w-0">
          <p className="text-[10px] text-gray-500">Highest Average Subject</p>
          <div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-gray-800 truncate">{strongestSubject?.subjectName || "Not available"}</p><p className="text-sm font-bold text-emerald-700">{strongestSubject ? formatPercentage(strongestSubject.averagePercentage) : "-"}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm min-w-0">
          <p className="text-[10px] text-gray-500">Lowest Average Subject</p>
          <div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-gray-800 truncate">{weakestSubject?.subjectName || "Not available"}</p><p className="text-sm font-bold text-orange-700">{weakestSubject ? formatPercentage(weakestSubject.averagePercentage) : "-"}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-[10px] text-gray-500">Result Publication Progress</p><p className="text-sm font-bold text-indigo-700">{formatPercentage(publicationRate)}</p></div>
          <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, publicationRate)}%` }} /></div>
          <p className="text-[10px] text-gray-500 mt-1">{formatNumber(publishedResults)} / {formatNumber(totalResults)} published</p>
        </div>
      </section>

      {/* PERFORMANCE CHARTS: THREE HORIZONTAL PAIRS */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <ChartCard title="Subject-wise Average Performance" subtitle="Average published percentage · top 6 subjects" className="p-2.5">
          {compactSubjectData.length ? <ResponsiveContainer width="100%" height={170}>
            <BarChart data={compactSubjectData} layout="vertical" margin={{ top: 2, right: 20, left: 0, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
              <YAxis type="category" dataKey="subjectName" width={88} fontSize={9} />
              <Tooltip formatter={(v) => [formatPercentage(v), "Average"]} />
              <Bar dataKey="averagePercentage" fill={COLORS.primary} radius={[0, 5, 5, 0]} barSize={13} />
            </BarChart>
          </ResponsiveContainer> : <EmptyChart message="No published subject results yet." height="h-36" />}
        </ChartCard>

        <ChartCard title="Subject-wise Assessment Attempts" subtitle="Number of attempts · top 6 subjects" className="p-2.5">
          {compactAttemptData.some((item) => item.totalAttempts > 0) ? <ResponsiveContainer width="100%" height={170}>
            <BarChart data={compactAttemptData} layout="vertical" margin={{ top: 2, right: 20, left: 0, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={9} />
              <YAxis type="category" dataKey="subjectName" width={88} fontSize={9} />
              <Tooltip />
              <Bar dataKey="totalAttempts" name="Attempts" fill={COLORS.cyan} radius={[0, 5, 5, 0]} barSize={13} />
            </BarChart>
          </ResponsiveContainer> : <EmptyChart message="No student attempts recorded yet." height="h-36" />}
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <ChartCard title="Subject-wise Pass / Fail" subtitle="Pass and fail percentages · top 6 subjects" className="p-2.5">
          {compactSubjectData.length ? <ResponsiveContainer width="100%" height={180}>
            <BarChart data={compactSubjectData} layout="vertical" margin={{ top: 2, right: 16, left: 0, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
              <YAxis type="category" dataKey="subjectName" width={88} fontSize={9} />
              <Tooltip formatter={(v) => formatPercentage(v)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="passPercentage" name="Pass %" fill={COLORS.green} barSize={9} radius={[0, 3, 3, 0]} />
              <Bar dataKey="failPercentage" name="Fail %" fill={COLORS.red} barSize={9} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer> : <EmptyChart message="No published results available." height="h-36" />}
        </ChartCard>

        <ChartCard title="Assessment-wise Performance" subtitle={`Average published performance · ${Math.min(assessmentPerformanceData.length, showAllAssessments ? assessmentPerformanceData.length : 8)} shown`} className="p-2.5">
          {compactAssessmentData.length ? <>
            <div className="overflow-x-auto">
              <div style={{ minWidth: Math.max(420, compactAssessmentData.length * 62) }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={compactAssessmentData} margin={{ top: 5, right: 8, left: -20, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="title" angle={-25} textAnchor="end" interval="preserveStartEnd" height={55} fontSize={8} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
                    <Tooltip formatter={(v) => formatPercentage(v)} />
                    <Bar dataKey="averagePercentage" name="Average" fill={COLORS.blue} barSize={19} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {assessmentPerformanceData.length > 8 && <button type="button" onClick={() => setShowAllAssessments((v) => !v)} className="mt-1 text-[11px] font-semibold text-indigo-700 hover:underline">{showAllAssessments ? "Show fewer assessments" : `Show all ${assessmentPerformanceData.length} assessments`}</button>}
          </> : <EmptyChart message="No published assessment performance yet." height="h-36" />}
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <ChartCard title="Published Result Distribution" subtitle="Number of results in each percentage range" className="p-2.5">
          {publishedResults ? <ResponsiveContainer width="100%" height={175}>
            <BarChart data={distributionData} margin={{ top: 4, right: 8, left: -20, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={8} interval={0} />
              <YAxis allowDecimals={false} fontSize={9} />
              <Tooltip />
              <Bar dataKey="results" name="Results" barSize={24} radius={[4, 4, 0, 0]}>
                {distributionData.map((item, index) => <Cell key={`${item.label}-${index}`} fill={[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.green, COLORS.purple][index]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer> : <EmptyChart height="h-36" />}
        </ChartCard>

        <ChartCard title="Overall Pass / Fail" subtitle="Published results · 33% pass threshold" className="p-2.5">
          {publishedResults ? <div className="grid grid-cols-2 items-center gap-2">
            <div className="relative">
              <ResponsiveContainer width="100%" height={175}>
                <PieChart><Pie data={passFailData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={43} outerRadius={67} paddingAngle={3}>
                  {passFailData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-lg font-bold text-gray-800">{formatNumber(publishedResults)}</span><span className="text-[9px] text-gray-500">Results</span></div>
            </div>
            <div className="space-y-3">
              <div><p className="text-[10px] text-gray-500">Passed</p><p className="text-sm font-bold text-emerald-700">{formatPercentage(passPercentage)}</p><p className="text-[10px] text-gray-500">{formatNumber(passFailData[0].value)} students</p></div>
              <div><p className="text-[10px] text-gray-500">Failed</p><p className="text-sm font-bold text-red-700">{formatPercentage(failPercentage)}</p><p className="text-[10px] text-gray-500">{formatNumber(passFailData[1].value)} students</p></div>
            </div>
          </div> : <EmptyChart height="h-36" />}
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <ChartCard title="Monthly Performance Trend" subtitle="Average published result percentage over time" className="p-2.5">
          {trendData.length ? <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={trendData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="classTeacherGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="monthLabel" fontSize={9} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={9} />
              <Tooltip formatter={(v) => formatPercentage(v)} />
              <Area type="monotone" dataKey="averagePercentage" stroke={COLORS.primary} strokeWidth={2} fill="url(#classTeacherGradient)" />
            </AreaChart>
          </ResponsiveContainer> : <EmptyChart height="h-36" />}
        </ChartCard>

        <ChartCard title="Result Processing Overview" subtitle="Current status of assessment results" className="p-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { label: "Draft", value: resultStatusCounts.DRAFT || 0, color: "bg-gray-100 text-gray-700" },
              { label: "Pending Eval.", value: resultStatusCounts.PENDING_EVALUATION || 0, color: "bg-amber-50 text-amber-700" },
              { label: "Evaluated", value: resultStatusCounts.EVALUATED || 0, color: "bg-blue-50 text-blue-700" },
              { label: "Published", value: resultStatusCounts.PUBLISHED || 0, color: "bg-emerald-50 text-emerald-700" },
              { label: "Withdrawn", value: resultStatusCounts.WITHDRAWN || 0, color: "bg-red-50 text-red-700" },
            ].map((item) => <div key={item.label} className={`rounded-md px-2 py-2 ${item.color}`}><p className="text-[9px] font-medium">{item.label}</p><p className="text-base font-bold">{formatNumber(item.value)}</p></div>)}
          </div>
          <div className="mt-3"><div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Publication progress</span><strong className="text-gray-800">{formatPercentage(publicationRate)}</strong></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, publicationRate)}%` }} /></div><p className="text-[10px] text-gray-500 mt-1">{formatNumber(publishedResults)} of {formatNumber(totalResults)} results published</p></div>
        </ChartCard>
      </section>

      {/* DETAIL TABLES: INTERNAL SCROLL TO KEEP PAGE SHORT */}
      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
        <ChartCard title="Subject-wise Performance Report" subtitle="Detailed attempt and published-result analysis" className="p-2.5">
          {subjectPerformanceData.length ? <div className="overflow-auto max-h-64">
            <table className="w-full min-w-[720px] text-[10px] text-left">
              <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600"><tr>
                {["Subject", "Attempts", "Students Attempted", "In Progress", "Evaluated", "Results", "Average", "Pass %", "Fail %"].map((h) => <th key={h} className="px-2 py-2 whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>{subjectPerformanceData.map((item) => <tr key={item.subjectId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-2 py-2 font-semibold whitespace-nowrap">{item.subjectName}</td><td className="px-2 py-2 text-center">{formatNumber(item.totalAttempts)}</td><td className="px-2 py-2 text-center">{formatNumber(item.totalAttemptingStudents)}</td><td className="px-2 py-2 text-center">{formatNumber(item.inProgressAttempts)}</td><td className="px-2 py-2 text-center">{formatNumber(item.evaluatedAttempts)}</td><td className="px-2 py-2 text-center">{formatNumber(item.totalResults)}</td><td className="px-2 py-2 text-center"><PercentageBadge value={item.averagePercentage} available={item.totalResults > 0} /></td><td className="px-2 py-2 text-center text-emerald-700 font-semibold">{item.totalResults ? formatPercentage(item.passPercentage) : "N/A"}</td><td className="px-2 py-2 text-center text-red-600 font-semibold">{item.totalResults ? formatPercentage(item.failPercentage) : "N/A"}</td>
              </tr>)}</tbody>
            </table>
          </div> : <EmptyChart message="No subject assessment data available." height="h-28" />}
        </ChartCard>

        <ChartCard title="Recent Published Results" subtitle="Latest results across assigned sections" className="p-2.5">
          {visibleRecentResults.length ? <div className="overflow-auto max-h-64">
            <table className="w-full min-w-[700px] text-[10px] text-left">
              <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600"><tr>{["Student", "Class", "Section", "Subject", "Assessment", "Marks", "Percentage", "Published"].map((h) => <th key={h} className="px-2 py-2 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{visibleRecentResults.map((result) => <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-2 py-2"><p className="font-semibold whitespace-nowrap">{result.student?.user?.name || "-"}</p><p className="text-gray-500">{result.student?.admissionNumber || "-"}</p></td><td className="px-2 py-2">{result.assessment?.class?.name || "-"}</td><td className="px-2 py-2">{result.assessment?.section?.name || "-"}</td><td className="px-2 py-2 whitespace-nowrap">{result.assessment?.subject?.name || "-"}</td><td className="px-2 py-2 max-w-32 truncate">{result.assessment?.title || "-"}</td><td className="px-2 py-2 text-center whitespace-nowrap">{result.obtainedMarks ?? 0} / {result.totalMarks ?? 0}</td><td className="px-2 py-2 text-center"><PercentageBadge value={result.percentage} /></td><td className="px-2 py-2 whitespace-nowrap">{formatDate(result.publishedAt)}</td>
              </tr>)}</tbody>
            </table>
          </div> : <EmptyChart message="No recent published results available for this selection." height="h-28" />}
        </ChartCard>
      </section>

      <footer className="flex flex-wrap justify-between gap-2 text-[10px] text-gray-400 py-1 border-t border-gray-200">
        <p>CBSE Learning Analytics – Class Teacher Dashboard</p>
        <p>Performance calculations use published results only.</p>
      </footer>
    </div>
  );
};

export default ClassTeacherDashboardScreen;
