import { apiSlice } from "./apiSlice";
import { RESULT_DETAIL_URL } from "../constants";

const resultDetailTags = (result = []) => [
  ...result.map((item) => ({
    type: "ResultDetail",
    id: item._id,
  })),
  {
    type: "ResultDetail",
    id: "LIST",
  },
];

export const resultDetailApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /*
    ==========================================================
    Create Result Detail
    ==========================================================

    School is derived from the authenticated user on the server.

    Do NOT send:
      schoolId
      school

    For teachers, evaluatedBy should also normally be derived
    from the authenticated teacher by the controller.
    ==========================================================
    */

    createResultDetail: builder.mutation({
      query: (data) => ({
        url: RESULT_DETAIL_URL,
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        {
          type: "ResultDetail",
          id: "LIST",
        },
        {
          type: "ResultDetail",
          id: "PENDING",
        },
        {
          type: "ResultDetail",
          id: "MY-EVALUATIONS",
        },
      ],
    }),

    /*
    ==========================================================
    Get Result Details

    Supports controller query filters such as:

      result
      assessmentQuestion
      question
      subject
      chapter
      topic
      questionType
      evaluationStatus
      evaluatedBy

    No school parameter is required.
    ==========================================================
    */

    getResultDetails: builder.query({
      query: (params = {}) => ({
        url: RESULT_DETAIL_URL,
        params,
      }),

      providesTags: (result) =>
        resultDetailTags(result),

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Single Result Detail
    ==========================================================
    */

    getResultDetailById: builder.query({
      query: (resultDetailId) => ({
        url: `${RESULT_DETAIL_URL}/${resultDetailId}`,
      }),

      providesTags: (result, error, resultDetailId) => [
        {
          type: "ResultDetail",
          id: resultDetailId,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Result Details By Result
    ==========================================================
    */

    getResultDetailsByResult: builder.query({
      query: (resultId) => ({
        url: `${RESULT_DETAIL_URL}/result/${resultId}`,
      }),

      providesTags: (result, error, resultId) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: `RESULT-${resultId}`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Result Detail By Assessment Question
    ==========================================================

    Controller requires:

      ?result=<resultId>

    Therefore the query argument should be:

      {
        assessmentQuestionId,
        result
      }
    ==========================================================
    */

    getResultDetailByAssessmentQuestion: builder.query({
      query: ({ assessmentQuestionId, result }) => ({
        url: `${RESULT_DETAIL_URL}/assessment-question/${assessmentQuestionId}`,
        params: {
          result,
        },
      }),

      providesTags: (
        response,
        error,
        { assessmentQuestionId, result: resultId },
      ) => [
        ...(response
          ? [
              {
                type: "ResultDetail",
                id: response._id,
              },
            ]
          : []),

        {
          type: "ResultDetail",
          id: `ASSESSMENT-QUESTION-${assessmentQuestionId}${
            resultId ? `-${resultId}` : ""
          }`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Result Details By Student
    ==========================================================
    */

    getResultDetailsByStudent: builder.query({
      query: (studentId) => ({
        url: `${RESULT_DETAIL_URL}/student/${studentId}`,
      }),

      providesTags: (result, error, studentId) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: `STUDENT-${studentId}`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Result Details By Question
    ==========================================================
    */

    getResultDetailsByQuestion: builder.query({
      query: (questionId) => ({
        url: `${RESULT_DETAIL_URL}/question/${questionId}`,
      }),

      providesTags: (result, error, questionId) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: `QUESTION-${questionId}`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Get Result Details By Subject
    ==========================================================
    */

    getResultDetailsBySubject: builder.query({
      query: (subjectId) => ({
        url: `${RESULT_DETAIL_URL}/subject/${subjectId}`,
      }),

      providesTags: (result, error, subjectId) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: `SUBJECT-${subjectId}`,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    My Result Detail Evaluations
    ==========================================================

    Server determines the teacher from the logged-in user.

    No teacherId is sent from the client.
    ==========================================================
    */

    getMyResultDetailEvaluations: builder.query({
      query: () => ({
        url: `${RESULT_DETAIL_URL}/my-evaluations`,
      }),

      providesTags: (result) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: "MY-EVALUATIONS",
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Pending Result Details
    ==========================================================

    Server automatically limits the result to the logged-in
    user's school.
    ==========================================================
    */

    getPendingResultDetails: builder.query({
      query: () => ({
        url: `${RESULT_DETAIL_URL}/pending`,
      }),

      providesTags: (result) => [
        ...(result || []).map((item) => ({
          type: "ResultDetail",
          id: item._id,
        })),

        {
          type: "ResultDetail",
          id: "PENDING",
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ==========================================================
    Update Result Detail
    ==========================================================

    Expected:

      {
        resultDetailId,
        obtainedMarks,
        evaluationStatus,
        evaluatedBy?
      }

    For a TEACHER, evaluatedBy should normally not be supplied.
    The controller resolves the authenticated teacher.
    ==========================================================
    */

    updateResultDetail: builder.mutation({
      query: ({ resultDetailId, ...data }) => ({
        url: `${RESULT_DETAIL_URL}/${resultDetailId}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { resultDetailId }) => [
        {
          type: "ResultDetail",
          id: resultDetailId,
        },

        {
          type: "ResultDetail",
          id: "LIST",
        },

        {
          type: "ResultDetail",
          id: "MY-EVALUATIONS",
        },

        {
          type: "ResultDetail",
          id: "PENDING",
        },

        ...(result?.result?._id
          ? [
              {
                type: "ResultDetail",
                id: `RESULT-${result.result._id}`,
              },
            ]
          : []),

        ...(result?.student?._id
          ? [
              {
                type: "ResultDetail",
                id: `STUDENT-${result.student._id}`,
              },
            ]
          : []),

        ...(result?.question?._id
          ? [
              {
                type: "ResultDetail",
                id: `QUESTION-${result.question._id}`,
              },
            ]
          : []),

        ...(result?.subject?._id
          ? [
              {
                type: "ResultDetail",
                id: `SUBJECT-${result.subject._id}`,
              },
            ]
          : []),
      ],
    }),

    /*
    ==========================================================
    Update Evaluation Status
    ==========================================================

    Expected:

      {
        resultDetailId,
        evaluationStatus,
        evaluatedBy?
      }

    For a teacher, evaluatedBy should normally be omitted.
    ==========================================================
    */

    updateResultDetailStatus: builder.mutation({
      query: ({
        resultDetailId,
        evaluationStatus,
        evaluatedBy,
      }) => ({
        url: `${RESULT_DETAIL_URL}/${resultDetailId}/status`,
        method: "PATCH",
        body: {
          evaluationStatus,

          ...(evaluatedBy
            ? {
                evaluatedBy,
              }
            : {}),
        },
      }),

      invalidatesTags: (result, error, { resultDetailId }) => [
        {
          type: "ResultDetail",
          id: resultDetailId,
        },

        {
          type: "ResultDetail",
          id: "LIST",
        },

        {
          type: "ResultDetail",
          id: "MY-EVALUATIONS",
        },

        {
          type: "ResultDetail",
          id: "PENDING",
        },

        ...(result?.result?._id
          ? [
              {
                type: "ResultDetail",
                id: `RESULT-${result.result._id}`,
              },
            ]
          : []),
      ],
    }),

    /*
    ==========================================================
    Delete Result Detail
    ==========================================================
    */

    deleteResultDetail: builder.mutation({
      query: (resultDetailId) => ({
        url: `${RESULT_DETAIL_URL}/${resultDetailId}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "ResultDetail",
          id: "LIST",
        },

        {
          type: "ResultDetail",
          id: "MY-EVALUATIONS",
        },

        {
          type: "ResultDetail",
          id: "PENDING",
        },

        "ResultDetail",
      ],
    }),
  }),
});

/*
============================================================
Hooks
============================================================
*/

export const {
  useCreateResultDetailMutation,

  useGetResultDetailsQuery,

  useGetResultDetailByIdQuery,

  useGetResultDetailsByResultQuery,

  useGetResultDetailByAssessmentQuestionQuery,

  useGetResultDetailsByStudentQuery,

  useGetResultDetailsByQuestionQuery,

  useGetResultDetailsBySubjectQuery,

  useGetMyResultDetailEvaluationsQuery,

  useGetPendingResultDetailsQuery,

  useUpdateResultDetailMutation,

  useUpdateResultDetailStatusMutation,

  useDeleteResultDetailMutation,
} = resultDetailApiSlice;
