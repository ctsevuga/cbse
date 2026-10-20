import { apiSlice } from "./apiSlice";
import { QUESTION_URL } from "../constants";

export const questionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuestion: builder.mutation({
      query: (data) => ({
        url: QUESTION_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        {
          type: "Question",
          id: "LIST",
        },
      ],
    }),

    getQuestions: builder.query({
      query: (params = {}) => ({
        url: QUESTION_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Question",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionDetails: builder.query({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}`,
      }),
      providesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getQuestionsBySubject: builder.query({
      query: (subjectId) => ({
        url: `${QUESTION_URL}/subject/${subjectId}`,
      }),
      providesTags: (result, error, subjectId) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: `SUBJECT-${subjectId}`,
              },
            ]
          : [
              {
                type: "Question",
                id: `SUBJECT-${subjectId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionsByChapter: builder.query({
      query: (chapterId) => ({
        url: `${QUESTION_URL}/chapter/${chapterId}`,
      }),
      providesTags: (result, error, chapterId) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: `CHAPTER-${chapterId}`,
              },
            ]
          : [
              {
                type: "Question",
                id: `CHAPTER-${chapterId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionsByTopic: builder.query({
      query: (topicId) => ({
        url: `${QUESTION_URL}/topic/${topicId}`,
      }),
      providesTags: (result, error, topicId) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: `TOPIC-${topicId}`,
              },
            ]
          : [
              {
                type: "Question",
                id: `TOPIC-${topicId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionsByGroup: builder.query({
      query: (questionGroupId) => ({
        url: `${QUESTION_URL}/group/${questionGroupId}`,
      }),
      providesTags: (result, error, questionGroupId) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: `GROUP-${questionGroupId}`,
              },
            ]
          : [
              {
                type: "Question",
                id: `GROUP-${questionGroupId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getMyQuestions: builder.query({
      query: () => ({
        url: `${QUESTION_URL}/my`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "Question",
                id: "MY",
              },
            ]
          : [
              {
                type: "Question",
                id: "MY",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateQuestion: builder.mutation({
      query: ({ questionId, ...data }) => ({
        url: `${QUESTION_URL}/${questionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { questionId }) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    submitQuestionForApproval: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}/submit`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    approveQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    rejectQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    archiveQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    updateQuestionStatus: builder.mutation({
      query: ({ questionId, isActive }) => ({
        url: `${QUESTION_URL}/${questionId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { questionId }) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),

    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTION_URL}/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, questionId) => [
        {
          type: "Question",
          id: questionId,
        },
        {
          type: "Question",
          id: "LIST",
        },
        {
          type: "Question",
          id: "MY",
        },
      ],
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useGetQuestionsQuery,
  useGetQuestionDetailsQuery,
  useGetQuestionsBySubjectQuery,
  useGetQuestionsByChapterQuery,
  useGetQuestionsByTopicQuery,
  useGetQuestionsByGroupQuery,
  useGetMyQuestionsQuery,
  useUpdateQuestionMutation,
  useSubmitQuestionForApprovalMutation,
  useApproveQuestionMutation,
  useRejectQuestionMutation,
  useArchiveQuestionMutation,
  useUpdateQuestionStatusMutation,
  useDeleteQuestionMutation,
} = questionApiSlice;