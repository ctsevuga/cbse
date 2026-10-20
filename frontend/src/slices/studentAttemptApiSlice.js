import { apiSlice } from "./apiSlice";
import { STUDENT_ATTEMPT_URL } from "../constants";

export const studentAttemptApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /* ==========================================================
         Start Student Attempt
         POST /api/student-attempts/start

         Student is determined by the logged-in user on the server.

         Body:
         {
           assessmentId
         }

         IMPORTANT:
         Do NOT send studentId.
      ========================================================== */
      startStudentAttempt: builder.mutation({
        query: ({ assessmentId }) => ({
          url: `${STUDENT_ATTEMPT_URL}/start`,
          method: "POST",
          body: {
            assessmentId,
          },
        }),
        invalidatesTags: (
          result,
          error,
          { assessmentId },
        ) => [
          {
            type: "StudentAttempt",
            id: "MY_LIST",
          },
          {
            type: "StudentAttempt",
            id: `ASSESSMENT-${assessmentId}`,
          },
          {
            type: "StudentAttempt",
            id: "LIST",
          },
        ],
      }),

      /* ==========================================================
         Get My Student Attempts
         GET /api/student-attempts/my

         Optional query parameters:
         - assessmentId
         - status

         Only the logged-in student's attempts are returned.
      ========================================================== */
      getMyStudentAttempts: builder.query({
        query: (params = {}) => ({
          url: `${STUDENT_ATTEMPT_URL}/my`,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.map((attempt) => ({
                  type: "StudentAttempt",
                  id: attempt._id,
                })),
                {
                  type: "StudentAttempt",
                  id: "MY_LIST",
                },
              ]
            : [
                {
                  type: "StudentAttempt",
                  id: "MY_LIST",
                },
              ],
        keepUnusedDataFor: 5,
      }),

      /* ==========================================================
         Get Attempts By Assessment
         GET /api/student-attempts/assessment/:assessmentId

         STUDENT:
           Returns only the logged-in student's attempts.

         STAFF:
           Can access attempts belonging to their school.

         Optional query parameters:
         - studentId
         - status
      ========================================================== */
      getAttemptsByAssessment: builder.query({
        query: ({
          assessmentId,
          ...params
        }) => ({
          url: `${STUDENT_ATTEMPT_URL}/assessment/${assessmentId}`,
          params,
        }),
        providesTags: (
          result,
          error,
          { assessmentId },
        ) =>
          result
            ? [
                ...result.map((attempt) => ({
                  type: "StudentAttempt",
                  id: attempt._id,
                })),
                {
                  type: "StudentAttempt",
                  id: `ASSESSMENT-${assessmentId}`,
                },
              ]
            : [
                {
                  type: "StudentAttempt",
                  id: `ASSESSMENT-${assessmentId}`,
                },
              ],
        keepUnusedDataFor: 5,
      }),

      /* ==========================================================
         Get Attempts By Student
         GET /api/student-attempts/student/:studentId

         Intended primarily for school staff.

         A STUDENT can only access their own studentId;
         this is enforced by the controller.
         
         Optional query parameters:
         - assessmentId
         - status
      ========================================================== */
      getAttemptsByStudent: builder.query({
        query: ({
          studentId,
          ...params
        }) => ({
          url: `${STUDENT_ATTEMPT_URL}/student/${studentId}`,
          params,
        }),
        providesTags: (
          result,
          error,
          { studentId },
        ) =>
          result
            ? [
                ...result.map((attempt) => ({
                  type: "StudentAttempt",
                  id: attempt._id,
                })),
                {
                  type: "StudentAttempt",
                  id: `STUDENT-${studentId}`,
                },
              ]
            : [
                {
                  type: "StudentAttempt",
                  id: `STUDENT-${studentId}`,
                },
              ],
        keepUnusedDataFor: 5,
      }),

      /* ==========================================================
         Get All Student Attempts
         GET /api/student-attempts

         Optional query parameters:
         - assessmentId
         - studentId
         - status

         STUDENT:
           Controller should restrict results to own attempts.

         STAFF:
           Controller should restrict results to their school.
      ========================================================== */
      getStudentAttempts: builder.query({
        query: (params = {}) => ({
          url: STUDENT_ATTEMPT_URL,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.map((attempt) => ({
                  type: "StudentAttempt",
                  id: attempt._id,
                })),
                {
                  type: "StudentAttempt",
                  id: "LIST",
                },
              ]
            : [
                {
                  type: "StudentAttempt",
                  id: "LIST",
                },
              ],
        keepUnusedDataFor: 5,
      }),

      /* ==========================================================
         Get Student Attempt Details
         GET /api/student-attempts/:id

         Student:
           Can only access their own attempt.

         Staff:
           Can access attempts within their school.
      ========================================================== */
      getStudentAttemptDetails: builder.query({
        query: (attemptId) => ({
          url: `${STUDENT_ATTEMPT_URL}/${attemptId}`,
        }),
        providesTags: (
          result,
          error,
          attemptId,
        ) => [
          {
            type: "StudentAttempt",
            id: attemptId,
          },
        ],
        keepUnusedDataFor: 5,
      }),

      /* ==========================================================
         Update Attempt Activity
         PATCH /api/student-attempts/:id/activity

         Student only.

         Body:
         {
           timeSpent?,
           attemptedQuestions?
         }
      ========================================================== */
      updateStudentAttemptActivity:
        builder.mutation({
          query: ({
            attemptId,
            ...data
          }) => ({
            url: `${STUDENT_ATTEMPT_URL}/${attemptId}/activity`,
            method: "PATCH",
            body: data,
          }),
          invalidatesTags: (
            result,
            error,
            { attemptId },
          ) => [
            {
              type: "StudentAttempt",
              id: attemptId,
            },
            {
              type: "StudentAttempt",
              id: "MY_LIST",
            },
          ],
        }),

      /* ==========================================================
         Submit Student Attempt
         PATCH /api/student-attempts/:id/submit

         Student only.

         Body:
         {
           timeSpent?,
           attemptedQuestions?
         }
      ========================================================== */
     
submitStudentAttempt: builder.mutation({
  query: ({
    attemptId,
    timeSpent,
    attemptedQuestions,
    answers,
  }) => ({
    url: `${STUDENT_ATTEMPT_URL}/${attemptId}/submit`,
    method: "PATCH",
    body: {
      timeSpent,
      attemptedQuestions,
      answers,
    },
  }),

  invalidatesTags: (result, error, { attemptId }) => [
    {
      type: "StudentAttempt",
      id: attemptId,
    },
    {
      type: "StudentAttempt",
      id: "MY_LIST",
    },
    {
      type: "StudentAttempt",
      id: "LIST",
    },
  ],
}),

      /* ==========================================================
         Update Student Attempt Status
         PATCH /api/student-attempts/:id/status

         STAFF ONLY.

         Body:
         {
           status
         }
      ========================================================== */
      updateStudentAttemptStatus:
        builder.mutation({
          query: ({
            attemptId,
            status,
          }) => ({
            url: `${STUDENT_ATTEMPT_URL}/${attemptId}/status`,
            method: "PATCH",
            body: {
              status,
            },
          }),
          invalidatesTags: (
            result,
            error,
            { attemptId },
          ) => [
            {
              type: "StudentAttempt",
              id: attemptId,
            },
            {
              type: "StudentAttempt",
              id: "LIST",
            },
            {
              type: "StudentAttempt",
              id: "MY_LIST",
            },
          ],
        }),

      /* ==========================================================
         Update Student Attempt Result
         PATCH /api/student-attempts/:id/result

         STAFF ONLY.

         Body:
         {
           attemptedQuestions?,
           obtainedMarks?,
           timeSpent?
         }
      ========================================================== */
      updateStudentAttemptResult:
        builder.mutation({
          query: ({
            attemptId,
            ...data
          }) => ({
            url: `${STUDENT_ATTEMPT_URL}/${attemptId}/result`,
            method: "PATCH",
            body: data,
          }),
          invalidatesTags: (
            result,
            error,
            { attemptId },
          ) => [
            {
              type: "StudentAttempt",
              id: attemptId,
            },
            {
              type: "StudentAttempt",
              id: "LIST",
            },
            {
              type: "StudentAttempt",
              id: "MY_LIST",
            },
          ],
        }),

      /* ==========================================================
         Delete Student Attempt
         DELETE /api/student-attempts/:id

         HM / SCHOOL ADMIN only.
      ========================================================== */
      deleteStudentAttempt:
        builder.mutation({
          query: (attemptId) => ({
            url: `${STUDENT_ATTEMPT_URL}/${attemptId}`,
            method: "DELETE",
          }),
          invalidatesTags: (
            result,
            error,
            attemptId,
          ) => [
            {
              type: "StudentAttempt",
              id: attemptId,
            },
            {
              type: "StudentAttempt",
              id: "LIST",
            },
            {
              type: "StudentAttempt",
              id: "MY_LIST",
            },
          ],
        }),
    }),
  });

export const {
  useStartStudentAttemptMutation,
  useGetMyStudentAttemptsQuery,
  useGetAttemptsByAssessmentQuery,
  useGetAttemptsByStudentQuery,
  useGetStudentAttemptsQuery,
  useGetStudentAttemptDetailsQuery,
  useUpdateStudentAttemptActivityMutation,
  useSubmitStudentAttemptMutation,
  useUpdateStudentAttemptStatusMutation,
  useUpdateStudentAttemptResultMutation,
  useDeleteStudentAttemptMutation,
} = studentAttemptApiSlice;
