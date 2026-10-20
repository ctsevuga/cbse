import { apiSlice } from "./apiSlice";
import { RESULT_URL } from "../constants";

export const resultApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /*
    ==========================================================
    CREATE RESULT
    ==========================================================

    POST /results

    Body:
    {
      attemptId
    }

    The backend determines:
    - totalMarks
    - obtainedMarks
    - percentage
    - status

    Do NOT send marks or status from the frontend.
    */

    createResult: builder.mutation({
      query: ({ attemptId }) => ({
        url: RESULT_URL,
        method: "POST",
        body: {
          attemptId,
        },
      }),

      invalidatesTags: [
        "Result",
        "StudentAttempt",
      ],
    }),

    /*
    ==========================================================
    GET ALL RESULTS
    ==========================================================

    GET /results

    Optional query parameters:
    - assessmentId
    - studentId
    - attemptId
    - status
    */

    getResults: builder.query({
      query: (params = {}) => ({
        url: RESULT_URL,
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({
                type: "Result",
                id: item._id,
              })),

              {
                type: "Result",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Result",
                id: "LIST",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    GET RESULT DETAILS
    ==========================================================

    GET /results/:resultId
    */

    getResultDetails: builder.query({
      query: (resultId) => ({
        url: `${RESULT_URL}/${resultId}`,
      }),

      providesTags: (result, error, resultId) => [
        {
          type: "Result",
          id: resultId,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    GET RESULT BY ASSESSMENT + STUDENT
    ==========================================================

    GET
    /results/assessment/:assessmentId/student/:studentId
    */

    getResultByAssessmentAndStudent: builder.query({
      query: ({
        assessmentId,
        studentId,
      }) => ({
        url: `${RESULT_URL}/assessment/${assessmentId}/student/${studentId}`,
      }),

      providesTags: (
        result,
        error,
        { assessmentId, studentId },
      ) =>
        result
          ? [
              ...result.map((item) => ({
                type: "Result",
                id: item._id,
              })),

              {
                type: "Result",
                id: `ASSESSMENT-STUDENT-${assessmentId}-${studentId}`,
              },
            ]
          : [
              {
                type: "Result",
                id: `ASSESSMENT-STUDENT-${assessmentId}-${studentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    GET RESULT BY ATTEMPT
    ==========================================================

    GET /results/attempt/:attemptId
    */

    getResultByAttempt: builder.query({
      query: (attemptId) => ({
        url: `${RESULT_URL}/attempt/${attemptId}`,
      }),

      providesTags: (
        result,
        error,
        attemptId,
      ) => [
        ...(result
          ? [
              {
                type: "Result",
                id: result._id,
              },
            ]
          : []),

        {
          type: "Result",
          id: `ATTEMPT-${attemptId}`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    GET RESULTS BY STUDENT
    ==========================================================

    GET /results/student/:studentId

    Optional:
    - assessmentId
    - status
    */

    getResultsByStudent: builder.query({
      query: ({
        studentId,
        ...params
      }) => ({
        url: `${RESULT_URL}/student/${studentId}`,
        params,
      }),

      providesTags: (
        result,
        error,
        { studentId },
      ) =>
        result
          ? [
              ...result.map((item) => ({
                type: "Result",
                id: item._id,
              })),

              {
                type: "Result",
                id: `STUDENT-${studentId}`,
              },
            ]
          : [
              {
                type: "Result",
                id: `STUDENT-${studentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    GET RESULTS BY ASSESSMENT
    ==========================================================

    GET /results/assessment/:assessmentId

    Optional:
    - studentId
    - status
    */

    getResultsByAssessment: builder.query({
      query: ({
        assessmentId,
        ...params
      }) => ({
        url: `${RESULT_URL}/assessment/${assessmentId}`,
        params,
      }),

      providesTags: (
        result,
        error,
        { assessmentId },
      ) =>
        result
          ? [
              ...result.map((item) => ({
                type: "Result",
                id: item._id,
              })),

              {
                type: "Result",
                id: `ASSESSMENT-${assessmentId}`,
              },
            ]
          : [
              {
                type: "Result",
                id: `ASSESSMENT-${assessmentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    UPDATE / RECALCULATE RESULT
    ==========================================================

    PUT /results/:resultId

    IMPORTANT:

    The frontend does NOT send:
    - totalMarks
    - obtainedMarks
    - percentage
    - status

    The backend recalculates these from StudentAttempt.

    Request:
    {
      resultId
    }
    */

    updateResult: builder.mutation({
      query: ({ resultId }) => ({
        url: `${RESULT_URL}/${resultId}`,
        method: "PUT",
      }),

      invalidatesTags: (
        result,
        error,
        { resultId },
      ) => [
        {
          type: "Result",
          id: resultId,
        },

        {
          type: "Result",
          id: "LIST",
        },

        "Result",

        "StudentAttempt",
      ],
    }),

    /*
    ==========================================================
    PUBLISH RESULT
    ==========================================================

    PATCH /results/:resultId/publish

    Backend:
    - verifies EVALUATED
    - verifies no pending answers
    - recalculates marks
    - sets PUBLISHED
    - sets publishedAt
    - sets publishedBy
    */

    publishResult: builder.mutation({
      query: (resultId) => ({
        url: `${RESULT_URL}/${resultId}/publish`,
        method: "PATCH",
      }),

      invalidatesTags: (
        result,
        error,
        resultId,
      ) => [
        {
          type: "Result",
          id: resultId,
        },

        {
          type: "Result",
          id: "LIST",
        },

        "Result",

        "StudentAttempt",
      ],
    }),

    /*
    ==========================================================
    WITHDRAW RESULT
    ==========================================================

    PATCH /results/:resultId/withdraw

    Backend:
    - verifies PUBLISHED
    - sets WITHDRAWN
    - sets withdrawnAt
    - sets withdrawnBy
    */

    withdrawResult: builder.mutation({
      query: (resultId) => ({
        url: `${RESULT_URL}/${resultId}/withdraw`,
        method: "PATCH",
      }),

      invalidatesTags: (
        result,
        error,
        resultId,
      ) => [
        {
          type: "Result",
          id: resultId,
        },

        {
          type: "Result",
          id: "LIST",
        },

        "Result",
      ],
    }),

    /*
    ==========================================================
    DELETE RESULT
    ==========================================================

    DELETE /results/:resultId

    Backend prevents deletion of:
    - PUBLISHED
    - WITHDRAWN
    */

    deleteResult: builder.mutation({
      query: (resultId) => ({
        url: `${RESULT_URL}/${resultId}`,
        method: "DELETE",
      }),

      invalidatesTags: (
        result,
        error,
        resultId,
      ) => [
        {
          type: "Result",
          id: resultId,
        },

        {
          type: "Result",
          id: "LIST",
        },

        "Result",
      ],
    }),
  }),
});

export const {
  useCreateResultMutation,

  useGetResultsQuery,

  useGetResultDetailsQuery,

  useGetResultByAssessmentAndStudentQuery,

  useGetResultByAttemptQuery,

  useGetResultsByStudentQuery,

  useGetResultsByAssessmentQuery,

  useUpdateResultMutation,

  usePublishResultMutation,

  useWithdrawResultMutation,

  useDeleteResultMutation,
} = resultApiSlice;
