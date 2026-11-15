import { apiSlice } from "./apiSlice";
import { ANSWER_EVALUATION_URL } from "../constants";

export const answerEvaluationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAnswerEvaluation: builder.mutation({
      query: ({ studentAnswerId, marksAwarded, feedback }) => ({
        url: ANSWER_EVALUATION_URL,
        method: "POST",
        body: {
          studentAnswerId,
          marksAwarded,
          ...(feedback?.trim() ? { feedback: feedback.trim() } : {}),
        },
      }),

      invalidatesTags: (result, error, { studentAnswerId }) => [
        {
          type: "AnswerEvaluation",
          id: result?._id,
        },
        {
          type: "AnswerEvaluation",
          id: "LIST",
        },
        {
          type: "AnswerEvaluation",
          id: "MY",
        },
        {
          type: "AnswerEvaluation",
          id: "PENDING",
        },
        {
          type: "AnswerEvaluation",
          id: `STUDENT-ANSWER-${studentAnswerId}`,
        },
        "AnswerEvaluation",
      ],
    }),

    getAnswerEvaluations: builder.query({
      query: (params = {}) => ({
        url: ANSWER_EVALUATION_URL,
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((evaluation) => ({
                type: "AnswerEvaluation",
                id: evaluation._id,
              })),
              {
                type: "AnswerEvaluation",
                id: "LIST",
              },
            ]
          : [
              {
                type: "AnswerEvaluation",
                id: "LIST",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    getAttemptsForEvaluation: builder.query({
  query: ({ assessment, student }) => ({
    url: `${ANSWER_EVALUATION_URL}/attempts`,
    params: {
      assessment,
      student,
    },
  }),

  providesTags: (result, error, { assessment, student }) => [
    {
      type: "AnswerEvaluation",
      id: `ATTEMPTS-${assessment}-${student}`,
    },
  ],

  keepUnusedDataFor: 5,
}),
getAssessmentAttemptsForTeacher: builder.query({
  query: (assessmentId) => ({
    url: `${ANSWER_EVALUATION_URL}/assessment-attempts`,
    params: {
      assessment: assessmentId,
    },
  }),

  providesTags: (result, error, assessmentId) => [
    {
      type: "AnswerEvaluation",
      id: `ASSESSMENT-ATTEMPTS-${assessmentId}`,
    },
    {
      type: "StudentAttempt",
      id: `ASSESSMENT-${assessmentId}`,
    },
  ],

  keepUnusedDataFor: 5,
}),
getAttemptsForReview: builder.query({
  query: ({ student, assessment }) => ({
    url: `${ANSWER_EVALUATION_URL}/attempts/review`,
    params: {
      student,
      assessment,
    },
  }),

  providesTags: (result, error, { student, assessment }) => [
    {
      type: "AnswerEvaluation",
      id: `ATTEMPTS-REVIEW-${assessment}-${student}`,
    },
  ],

  keepUnusedDataFor: 5,
}),
completeAttemptEvaluation: builder.mutation({
  query: (attemptId) => ({
    url: `${ANSWER_EVALUATION_URL}/attempt/${attemptId}/complete`,
    method: "POST",
  }),

  invalidatesTags: (result, error, attemptId) =>
    error
      ? []
      : [
          {
            type: "AnswerEvaluation",
            id: "LIST",
          },
          {
            type: "AnswerEvaluation",
            id: "MY",
          },
          {
            type: "AnswerEvaluation",
            id: "PENDING",
          },
          {
            type: "AnswerEvaluation",
            id: `ATTEMPT-${attemptId}`,
          },
          {
            type: "AnswerEvaluation",
            id: `ATTEMPT-RESULT-${attemptId}`,
          },
          "AnswerEvaluation",
          "StudentAttempt",
        ],
}),

    getMyAnswerEvaluations: builder.query({
      query: (params = {}) => ({
        url: `${ANSWER_EVALUATION_URL}/my`,
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((evaluation) => ({
                type: "AnswerEvaluation",
                id: evaluation._id,
              })),
              {
                type: "AnswerEvaluation",
                id: "MY",
              },
            ]
          : [
              {
                type: "AnswerEvaluation",
                id: "MY",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    getPendingAnswerEvaluations: builder.query({
      query: () => ({
        url: `${ANSWER_EVALUATION_URL}/pending`,
      }),

      providesTags: (result) => [
        {
          type: "AnswerEvaluation",
          id: "PENDING",
        },
        ...(result?.answers
          ? result.answers.map((answer) => ({
              type: "AnswerEvaluation",
              id: `PENDING-ANSWER-${answer._id}`,
            }))
          : []),
      ],

      keepUnusedDataFor: 5,
    }),

    getAnswerEvaluationDetails: builder.query({
      query: (evaluationId) => ({
        url: `${ANSWER_EVALUATION_URL}/${evaluationId}`,
      }),

      providesTags: (result, error, evaluationId) => [
        {
          type: "AnswerEvaluation",
          id: evaluationId,
        },
        ...(result?.studentAnswer
          ? [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-ANSWER-${getId(result.studentAnswer)}`,
              },
            ]
          : []),
      ],

      keepUnusedDataFor: 5,
    }),

    getEvaluationByStudentAnswer: builder.query({
      query: (studentAnswerId) => ({
        url: `${ANSWER_EVALUATION_URL}/student-answer/${studentAnswerId}`,
      }),

      providesTags: (result, error, studentAnswerId) => [
        {
          type: "AnswerEvaluation",
          id: `STUDENT-ANSWER-${studentAnswerId}`,
        },
        ...(result
          ? [
              {
                type: "AnswerEvaluation",
                id: result._id,
              },
            ]
          : []),
      ],

      keepUnusedDataFor: 5,
    }),

    getEvaluationsByAttempt: builder.query({
      query: (attemptId) => ({
        url: `${ANSWER_EVALUATION_URL}/attempt/${attemptId}`,
      }),

      providesTags: (result, error, attemptId) => [
        {
          type: "AnswerEvaluation",
          id: `ATTEMPT-${attemptId}`,
        },
        ...(result?.evaluations
          ? result.evaluations.map((evaluation) => ({
              type: "AnswerEvaluation",
              id: evaluation._id,
            }))
          : []),
      ],

      keepUnusedDataFor: 5,
    }),

    getEvaluationsByStudent: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `${ANSWER_EVALUATION_URL}/student/${studentId}`,
        params,
      }),

      providesTags: (result, error, { studentId }) =>
        result
          ? [
              ...result.map((evaluation) => ({
                type: "AnswerEvaluation",
                id: evaluation._id,
              })),
              {
                type: "AnswerEvaluation",
                id: `STUDENT-${studentId}`,
              },
            ]
          : [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-${studentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    updateAnswerEvaluation: builder.mutation({
      query: ({
        evaluationId,
        marksAwarded,
        feedback,
        evaluationStatus,
      }) => ({
        url: `${ANSWER_EVALUATION_URL}/${evaluationId}`,
        method: "PUT",
        body: {
          ...(marksAwarded !== undefined ? { marksAwarded } : {}),
          ...(feedback !== undefined ? { feedback } : {}),
          ...(evaluationStatus !== undefined ? { evaluationStatus } : {}),
        },
      }),

      invalidatesTags: (result, error, { evaluationId }) => [
        {
          type: "AnswerEvaluation",
          id: evaluationId,
        },
        {
          type: "AnswerEvaluation",
          id: "LIST",
        },
        {
          type: "AnswerEvaluation",
          id: "MY",
        },
        {
          type: "AnswerEvaluation",
          id: "PENDING",
        },
        ...(result?.student
          ? [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-${getId(result.student)}`,
              },
            ]
          : []),
        ...(result?.studentAnswer
          ? [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-ANSWER-${getId(result.studentAnswer)}`,
              },
            ]
          : []),
        "AnswerEvaluation",
      ],
    }),
reviseAttemptEvaluation: builder.mutation({
  query: ({ attemptId, corrections }) => ({
    url: `${ANSWER_EVALUATION_URL}/attempts/${attemptId}/revise`,
    method: "PUT",
    body: {
      corrections,
    },
  }),

  invalidatesTags: (result, error, { attemptId }) =>
    error
      ? []
      : [
          {
            type: "AnswerEvaluation",
            id: "LIST",
          },
          {
            type: "AnswerEvaluation",
            id: "MY",
          },
          {
            type: "AnswerEvaluation",
            id: `ATTEMPT-${attemptId}`,
          },
          {
            type: "AnswerEvaluation",
            id: `ATTEMPT-RESULT-${attemptId}`,
          },
          {
            type: "AnswerEvaluation",
            id: `ATTEMPT-REVIEW-${attemptId}`,
          },
          "AnswerEvaluation",
          "StudentAttempt",
        ],
}),

getAttemptsForReviewByAssessment: builder.query({
  query: ({ assessmentId }) => ({
    url: `${ANSWER_EVALUATION_URL}/attempts/review/by-assessment`,
    params: { assessment: assessmentId, },
  }),

  transformResponse: (response) => {
    return Array.isArray(response)
      ? response
      : response?.data?.attempts ||
          response?.data ||
          response?.attempts ||
          [];
  },

  providesTags: (result, error, { assessment }) => [
    {
      type: "AnswerEvaluation",
      id: `ATTEMPTS-REVIEW-ASSESSMENT-${assessment}`,
    },
    ...(result || []).map((attempt) => ({
      type: "StudentAttempt",
      id: attempt._id,
    })),
  ],

  keepUnusedDataFor: 5,
}),

    saveAnswerEvaluation: builder.mutation({
  query: ({ studentAnswerId, marksAwarded, feedback }) => ({
    url: `${ANSWER_EVALUATION_URL}/save`,
    method: "POST",
    body: {
      studentAnswerId,
      marksAwarded,
      feedback: feedback?.trim() ?? "",
    },
  }),

  invalidatesTags: (result, error, { studentAnswerId }) =>
    error
      ? []
      : [
          {
            type: "AnswerEvaluation",
            id: result?.data?._id ?? result?._id,
          },
          {
            type: "AnswerEvaluation",
            id: "LIST",
          },
          {
            type: "AnswerEvaluation",
            id: "MY",
          },
          {
            type: "AnswerEvaluation",
            id: "PENDING",
          },
          {
            type: "AnswerEvaluation",
            id: `STUDENT-ANSWER-${studentAnswerId}`,
          },
          "AnswerEvaluation",
        ],
}),

    updateAnswerEvaluationStatus: builder.mutation({
      query: ({ evaluationId, evaluationStatus }) => ({
        url: `${ANSWER_EVALUATION_URL}/${evaluationId}/status`,
        method: "PATCH",
        body: {
          evaluationStatus,
        },
      }),

      invalidatesTags: (result, error, { evaluationId }) => [
        {
          type: "AnswerEvaluation",
          id: evaluationId,
        },
        {
          type: "AnswerEvaluation",
          id: "LIST",
        },
        {
          type: "AnswerEvaluation",
          id: "MY",
        },
        {
          type: "AnswerEvaluation",
          id: "PENDING",
        },
        ...(result?.student
          ? [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-${getId(result.student)}`,
              },
            ]
          : []),
        ...(result?.studentAnswer
          ? [
              {
                type: "AnswerEvaluation",
                id: `STUDENT-ANSWER-${getId(result.studentAnswer)}`,
              },
            ]
          : []),
        "AnswerEvaluation",
      ],
    }),
  }),
});

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return value;
};

export const {
  useCreateAnswerEvaluationMutation,
  useSaveAnswerEvaluationMutation,
  useCompleteAttemptEvaluationMutation,
  useReviseAttemptEvaluationMutation,
  useGetAnswerEvaluationsQuery,
  useGetMyAnswerEvaluationsQuery,
  useGetPendingAnswerEvaluationsQuery,
  useGetAnswerEvaluationDetailsQuery,
  useGetEvaluationByStudentAnswerQuery,
  useGetEvaluationsByAttemptQuery,
  useGetEvaluationsByStudentQuery,
  useGetAttemptsForEvaluationQuery,
  useGetAssessmentAttemptsForTeacherQuery,
  useGetAttemptsForReviewByAssessmentQuery,
  useGetAttemptsForReviewQuery,
  useUpdateAnswerEvaluationMutation,
  useUpdateAnswerEvaluationStatusMutation,
} = answerEvaluationApiSlice;
