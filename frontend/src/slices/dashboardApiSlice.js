
import { apiSlice } from "./apiSlice";
import { DASHBOARD_URL } from "../constants";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================================================
    // GET SUBJECT TEACHER DASHBOARD
    // ================================================

    getTeacherDashboard: builder.query({
      query: ({ schoolSlug, ...params }) => ({
        url: `${DASHBOARD_URL}/${encodeURIComponent(
          schoolSlug
        )}/teacher`,
        params,
      }),

      providesTags: (result) => [
        { type: "Dashboard", id: "TEACHER" },

        ...(result?.assignments || []).map((assignment) => ({
          type: "Dashboard",
          id: `${assignment.academicYear?._id}-${assignment.class?._id}-${assignment.section?._id}`,
        })),
      ],

      keepUnusedDataFor: 60,
    }),

    // ================================================
    // GET CLASS TEACHER DASHBOARD
    // ================================================

    getClassTeacherDashboard: builder.query({
      query: ({ schoolSlug, ...params }) => ({
        url: `${DASHBOARD_URL}/${encodeURIComponent(
          schoolSlug
        )}/class-teacher`,
        params,
      }),

      providesTags: (result) => [
        { type: "Dashboard", id: "CLASS_TEACHER" },

        ...(result?.assignments || []).map((assignment) => ({
          type: "Dashboard",
          id: `${assignment.academicYear?._id}-${assignment.class?._id}-${assignment.section?._id}`,
        })),
      ],

      keepUnusedDataFor: 60,
    }),

    // ================================================
    // GET STUDENT DASHBOARD
    // GET /api/dashboard/:slug/student
    // ================================================

    getStudentDashboard: builder.query({
      query: ({ schoolSlug, ...params }) => ({
        url: `${DASHBOARD_URL}/${encodeURIComponent(
          schoolSlug
        )}/student`,
        params,
      }),

      providesTags: (result) => [
        { type: "Dashboard", id: "STUDENT" },

        { type: "Dashboard", id: "STUDENT_ASSESSMENTS" },

        { type: "Dashboard", id: "STUDENT_RESULTS" },

        { type: "Dashboard", id: "STUDENT_PERFORMANCE" },
      ],

      keepUnusedDataFor: 60,
    }),

    // ================================================
    // GET PARENT DASHBOARD
    // GET /api/dashboard/:slug/parent
    // ================================================

    getParentDashboard: builder.query({
      query: ({
        schoolSlug,
        studentId,
        academicYearId,
        ...params
      }) => ({
        url: `${DASHBOARD_URL}/${encodeURIComponent(
          schoolSlug
        )}/parent`,

        params: {
          ...params,

          ...(studentId ? { studentId } : {}),

          ...(academicYearId
            ? { academicYearId }
            : {}),
        },
      }),

      providesTags: (result) => [
        { type: "Dashboard", id: "PARENT" },

        { type: "Dashboard", id: "PARENT_CHILDREN" },

        ...(result?.selectedChild?._id
          ? [
              {
                type: "Dashboard",
                id: `PARENT_CHILD_${result.selectedChild._id}`,
              },
            ]
          : []),

        { type: "Dashboard", id: "PARENT_PERFORMANCE" },

        { type: "Dashboard", id: "PARENT_RESULTS" },

        { type: "Dashboard", id: "PARENT_ASSESSMENTS" },
      ],

      keepUnusedDataFor: 60,
    }),


    // ================================================
    // GET SCHOOL ADMIN / HM DASHBOARD
    // GET /api/dashboard/:slug/admin
    // ================================================

    getSchoolAdminDashboard: builder.query({
      query: ({
        schoolSlug,
        streamId,
        classId,
        sectionId,
        subjectId,
        academicYearId,
      }) => ({
        url: `${DASHBOARD_URL}/${encodeURIComponent(
          schoolSlug
        )}/admin`,

        params: {
          ...(streamId ? { streamId } : {}),

          ...(classId ? { classId } : {}),

          ...(sectionId ? { sectionId } : {}),

          ...(subjectId ? { subjectId } : {}),

          ...(academicYearId
            ? { academicYearId }
            : {}),
        },
      }),

      providesTags: (result) => [
        { type: "Dashboard", id: "SCHOOL_ADMIN" },

        { type: "Dashboard", id: "SCHOOL_PERFORMANCE" },

        { type: "Dashboard", id: "SCHOOL_STUDENTS" },

        { type: "Dashboard", id: "SCHOOL_ASSESSMENTS" },

        { type: "Dashboard", id: "SCHOOL_RESULTS" },

        { type: "Dashboard", id: "SCHOOL_TEACHERS" },
      ],

      keepUnusedDataFor: 60,
    }),


  }),
});


export const {
  // Subject Teacher Dashboard
  useGetTeacherDashboardQuery,
  useLazyGetTeacherDashboardQuery,

  // Class Teacher Dashboard
  useGetClassTeacherDashboardQuery,
  useLazyGetClassTeacherDashboardQuery,

  // Student Dashboard
  useGetStudentDashboardQuery,
  useLazyGetStudentDashboardQuery,

  // Parent Dashboard
  useGetParentDashboardQuery,
  useLazyGetParentDashboardQuery,

  // School Admin / HM Dashboard
  useGetSchoolAdminDashboardQuery,
  useLazyGetSchoolAdminDashboardQuery,

} = dashboardApiSlice;

