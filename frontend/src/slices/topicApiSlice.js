import { apiSlice } from "./apiSlice";
import { TOPIC_URL } from "../constants";

export const topicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTopic: builder.mutation({
      query: (data) => ({
        url: TOPIC_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Topic"],
    }),

    getTopics: builder.query({
      query: (params = {}) => ({
        url: TOPIC_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((topic) => ({
                type: "Topic",
                id: topic._id,
              })),
              {
                type: "Topic",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Topic",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getTopicsBySubject: builder.query({
      query: ({ subjectId, ...params }) => ({
        url: `${TOPIC_URL}/subject/${subjectId}`,
        params,
      }),
      providesTags: (result, error, { subjectId }) =>
        result
          ? [
              ...result.map((topic) => ({
                type: "Topic",
                id: topic._id,
              })),
              {
                type: "Topic",
                id: `SUBJECT-${subjectId}`,
              },
            ]
          : [
              {
                type: "Topic",
                id: `SUBJECT-${subjectId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getTopicsByChapter: builder.query({
      query: ({ chapterId, ...params }) => ({
        url: `${TOPIC_URL}/chapter/${chapterId}`,
        params,
      }),
      providesTags: (result, error, { chapterId }) =>
        result
          ? [
              ...result.map((topic) => ({
                type: "Topic",
                id: topic._id,
              })),
              {
                type: "Topic",
                id: `CHAPTER-${chapterId}`,
              },
            ]
          : [
              {
                type: "Topic",
                id: `CHAPTER-${chapterId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getTopicDetails: builder.query({
      query: (topicId) => ({
        url: `${TOPIC_URL}/${topicId}`,
      }),
      providesTags: (result, error, topicId) => [
        {
          type: "Topic",
          id: topicId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    updateTopic: builder.mutation({
      query: ({ topicId, ...data }) => ({
        url: `${TOPIC_URL}/${topicId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { topicId }) => [
        {
          type: "Topic",
          id: topicId,
        },
        {
          type: "Topic",
          id: "LIST",
        },
        "Topic",
      ],
    }),

    updateTopicStatus: builder.mutation({
      query: ({ topicId, isActive }) => ({
        url: `${TOPIC_URL}/${topicId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { topicId }) => [
        {
          type: "Topic",
          id: topicId,
        },
        {
          type: "Topic",
          id: "LIST",
        },
        "Topic",
      ],
    }),

    deleteTopic: builder.mutation({
      query: (topicId) => ({
        url: `${TOPIC_URL}/${topicId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, topicId) => [
        {
          type: "Topic",
          id: topicId,
        },
        {
          type: "Topic",
          id: "LIST",
        },
        "Topic",
      ],
    }),
  }),
});

export const {
  useCreateTopicMutation,
  useGetTopicsQuery,
  useGetTopicsBySubjectQuery,
  useGetTopicsByChapterQuery,
  useGetTopicDetailsQuery,
  useUpdateTopicMutation,
  useUpdateTopicStatusMutation,
  useDeleteTopicMutation,
} = topicApiSlice;