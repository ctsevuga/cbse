import { apiSlice } from "./apiSlice";
import { TEACHER_ASSIGNMENT_URL } from "../constants";

export const teacherAssignmentApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      // ==========================================
      // CREATE TEACHER ASSIGNMENT
      // POST /api/teacher-assignments/:slug
      // ==========================================
      createTeacherAssignment: builder.mutation({
        query: ({ schoolSlug, ...data }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}`,
          method: "POST",
          body: data,
        }),

        invalidatesTags: [
          { type: "TeacherAssignment", id: "LIST" },
          { type: "TeacherAssignment", id: "MY_LIST" },
          "TeacherAssignment",
        ],
      }),

      // ==========================================
      // GET ALL TEACHER ASSIGNMENTS
      // GET /api/teacher-assignments/:slug
      // ==========================================
      getTeacherAssignments: builder.query({
        query: ({ schoolSlug, ...params } = {}) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}`,
          params,
        }),

        providesTags: (result) =>
          result
            ? [
                ...result.map((assignment) => ({
                  type: "TeacherAssignment",
                  id: assignment._id,
                })),
                { type: "TeacherAssignment", id: "LIST" },
              ]
            : [{ type: "TeacherAssignment", id: "LIST" }],

        keepUnusedDataFor: 5,
      }),

      // ==========================================
      // GET MY TEACHER ASSIGNMENTS
      // GET /api/teacher-assignments/:slug/my
      // ==========================================
      getMyTeacherAssignments: builder.query({
        query: (schoolSlug) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/my`,
        }),

        providesTags: (result) =>
          result
            ? [
                ...result.map((assignment) => ({
                  type: "TeacherAssignment",
                  id: assignment._id,
                })),
                { type: "TeacherAssignment", id: "MY_LIST" },
              ]
            : [{ type: "TeacherAssignment", id: "MY_LIST" }],

        keepUnusedDataFor: 5,
      }),

      // ==========================================
      // GET ASSIGNMENTS BY TEACHER
      // GET /api/teacher-assignments/:slug/teacher/:teacherId
      // ==========================================
      getAssignmentsByTeacher: builder.query({
        query: ({ schoolSlug, teacherId }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/teacher/${teacherId}`,
        }),

        providesTags: (result, error, { teacherId }) =>
          result
            ? [
                ...result.map((assignment) => ({
                  type: "TeacherAssignment",
                  id: assignment._id,
                })),
                {
                  type: "TeacherAssignment",
                  id: `TEACHER-${teacherId}`,
                },
              ]
            : [
                {
                  type: "TeacherAssignment",
                  id: `TEACHER-${teacherId}`,
                },
              ],

        keepUnusedDataFor: 5,
      }),

      // ==========================================
      // GET ASSIGNMENTS BY SECTION
      // GET /api/teacher-assignments/:slug/section/:sectionId
      // ==========================================
      getAssignmentsBySection: builder.query({
        query: ({ schoolSlug, sectionId }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/section/${sectionId}`,
        }),

        providesTags: (result, error, { sectionId }) =>
          result
            ? [
                ...result.map((assignment) => ({
                  type: "TeacherAssignment",
                  id: assignment._id,
                })),
                {
                  type: "TeacherAssignment",
                  id: `SECTION-${sectionId}`,
                },
              ]
            : [
                {
                  type: "TeacherAssignment",
                  id: `SECTION-${sectionId}`,
                },
              ],

        keepUnusedDataFor: 5,
      }),

      // ==========================================
      // GET TEACHER ASSIGNMENT DETAILS
      // GET /api/teacher-assignments/:slug/:assignmentId
      // ==========================================
      getTeacherAssignmentDetails: builder.query({
        query: ({ schoolSlug, assignmentId }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/${assignmentId}`,
        }),

        providesTags: (result, error, { assignmentId }) => [
          { type: "TeacherAssignment", id: assignmentId },
        ],

        keepUnusedDataFor: 5,
      }),

      // ==========================================
      // UPDATE TEACHER ASSIGNMENT
      // PUT /api/teacher-assignments/:slug/:assignmentId
      // ==========================================
      updateTeacherAssignment: builder.mutation({
        query: ({ schoolSlug, assignmentId, ...data }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/${assignmentId}`,
          method: "PUT",
          body: data,
        }),

        invalidatesTags: (result, error, { assignmentId }) => [
          { type: "TeacherAssignment", id: assignmentId },
          { type: "TeacherAssignment", id: "LIST" },
          { type: "TeacherAssignment", id: "MY_LIST" },
          "TeacherAssignment",
        ],
      }),

      // ==========================================
      // UPDATE ASSIGNMENT STATUS
      // PATCH /api/teacher-assignments/:slug/:assignmentId/status
      // ==========================================
      updateTeacherAssignmentStatus: builder.mutation({
        query: ({ schoolSlug, assignmentId, isActive }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/${assignmentId}/status`,
          method: "PATCH",
          body: { isActive },
        }),

        invalidatesTags: (result, error, { assignmentId }) => [
          { type: "TeacherAssignment", id: assignmentId },
          { type: "TeacherAssignment", id: "LIST" },
          { type: "TeacherAssignment", id: "MY_LIST" },
          "TeacherAssignment",
        ],
      }),

      // ==========================================
      // DELETE TEACHER ASSIGNMENT
      // DELETE /api/teacher-assignments/:slug/:assignmentId
      // ==========================================
      deleteTeacherAssignment: builder.mutation({
        query: ({ schoolSlug, assignmentId }) => ({
          url: `${TEACHER_ASSIGNMENT_URL}/${schoolSlug}/${assignmentId}`,
          method: "DELETE",
        }),

        invalidatesTags: (result, error, { assignmentId }) => [
          { type: "TeacherAssignment", id: assignmentId },
          { type: "TeacherAssignment", id: "LIST" },
          { type: "TeacherAssignment", id: "MY_LIST" },
          "TeacherAssignment",
        ],
      }),
    }),
  });

export const {
  useCreateTeacherAssignmentMutation,
  useGetTeacherAssignmentsQuery,
  useGetMyTeacherAssignmentsQuery,
  useGetAssignmentsByTeacherQuery,
  useGetAssignmentsBySectionQuery,
  useGetTeacherAssignmentDetailsQuery,
  useUpdateTeacherAssignmentMutation,
  useUpdateTeacherAssignmentStatusMutation,
  useDeleteTeacherAssignmentMutation,
} = teacherAssignmentApiSlice;
