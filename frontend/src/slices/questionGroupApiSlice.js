import { apiSlice } from "./apiSlice";
import { QUESTION_GROUP_URL } from "../constants";

export const questionGroupApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuestionGroup: builder.mutation({
      query: (data) => ({
        url: QUESTION_GROUP_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        {
          type: "QuestionGroup",
          id: "LIST",
        },
        {
          type: "QuestionGroup",
          id: "MY",
        },
        "QuestionGroup",
      ],
    }),

    getQuestionGroups: builder.query({
      query: (params = {}) => ({
        url: QUESTION_GROUP_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((group) => ({
                type: "QuestionGroup",
                id: group._id,
              })),
              {
                type: "QuestionGroup",
                id: "LIST",
              },
            ]
          : [
              {
                type: "QuestionGroup",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getMyQuestionGroups: builder.query({
      query: () => ({
        url: `${QUESTION_GROUP_URL}/my`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((group) => ({
                type: "QuestionGroup",
                id: group._id,
              })),
              {
                type: "QuestionGroup",
                id: "MY",
              },
            ]
          : [
              {
                type: "QuestionGroup",
                id: "MY",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionGroupsBySubject: builder.query({
      query: (subjectId) => ({
        url: `${QUESTION_GROUP_URL}/subject/${subjectId}`,
      }),
      providesTags: (result, error, subjectId) =>
        result
          ? [
              ...result.map((group) => ({
                type: "QuestionGroup",
                id: group._id,
              })),
              {
                type: "QuestionGroup",
                id: `SUBJECT-${subjectId}`,
              },
            ]
          : [
              {
                type: "QuestionGroup",
                id: `SUBJECT-${subjectId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionGroupsByChapter: builder.query({
      query: (chapterId) => ({
        url: `${QUESTION_GROUP_URL}/chapter/${chapterId}`,
      }),
      providesTags: (result, error, chapterId) =>
        result
          ? [
              ...result.map((group) => ({
                type: "QuestionGroup",
                id: group._id,
              })),
              {
                type: "QuestionGroup",
                id: `CHAPTER-${chapterId}`,
              },
            ]
          : [
              {
                type: "QuestionGroup",
                id: `CHAPTER-${chapterId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getQuestionGroupDetails: builder.query({
      query: (questionGroupId) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}`,
      }),
      providesTags: (result, error, questionGroupId) => [
        {
          type: "QuestionGroup",
          id: questionGroupId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getQuestionsInGroup: builder.query({
      query: (questionGroupId) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}/questions`,
      }),
      providesTags: (result, error, questionGroupId) =>
        result
          ? [
              ...result.map((question) => ({
                type: "Question",
                id: question._id,
              })),
              {
                type: "QuestionGroup",
                id: `QUESTIONS-${questionGroupId}`,
              },
            ]
          : [
              {
                type: "QuestionGroup",
                id: `QUESTIONS-${questionGroupId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateQuestionGroup: builder.mutation({
      query: ({ questionGroupId, ...data }) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { questionGroupId }) => [
        {
          type: "QuestionGroup",
          id: questionGroupId,
        },
        {
          type: "QuestionGroup",
          id: "LIST",
        },
        {
          type: "QuestionGroup",
          id: "MY",
        },
        "QuestionGroup",
      ],
    }),

    updateQuestionGroupStatus: builder.mutation({
      query: ({ questionGroupId, isActive }) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { questionGroupId }) => [
        {
          type: "QuestionGroup",
          id: questionGroupId,
        },
        {
          type: "QuestionGroup",
          id: "LIST",
        },
        {
          type: "QuestionGroup",
          id: "MY",
        },
        "QuestionGroup",
      ],
    }),

    refreshQuestionGroupStatistics: builder.mutation({
      query: (questionGroupId) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}/statistics`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, questionGroupId) => [
        {
          type: "QuestionGroup",
          id: questionGroupId,
        },
        {
          type: "QuestionGroup",
          id: "LIST",
        },
        {
          type: "QuestionGroup",
          id: "MY",
        },
        {
          type: "QuestionGroup",
          id: `QUESTIONS-${questionGroupId}`,
        },
        "QuestionGroup",
      ],
    }),

    deleteQuestionGroup: builder.mutation({
      query: (questionGroupId) => ({
        url: `${QUESTION_GROUP_URL}/${questionGroupId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, questionGroupId) => [
        {
          type: "QuestionGroup",
          id: questionGroupId,
        },
        {
          type: "QuestionGroup",
          id: "LIST",
        },
        {
          type: "QuestionGroup",
          id: "MY",
        },
        "QuestionGroup",
      ],
    }),
  }),
});

export const {
  useCreateQuestionGroupMutation,
  useGetQuestionGroupsQuery,
  useGetMyQuestionGroupsQuery,
  useGetQuestionGroupsBySubjectQuery,
  useGetQuestionGroupsByChapterQuery,
  useGetQuestionGroupDetailsQuery,
  useGetQuestionsInGroupQuery,
  useUpdateQuestionGroupMutation,
  useUpdateQuestionGroupStatusMutation,
  useRefreshQuestionGroupStatisticsMutation,
  useDeleteQuestionGroupMutation,
} = questionGroupApiSlice;