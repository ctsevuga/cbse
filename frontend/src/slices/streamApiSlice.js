import { apiSlice } from "./apiSlice";
import { STREAM_URL } from "../constants";

export const streamApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createStream: builder.mutation({
      query: (data) => ({
        url: STREAM_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Stream"],
    }),

    getStreams: builder.query({
      query: (params = {}) => ({
        url: STREAM_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((stream) => ({
                type: "Stream",
                id: stream._id,
              })),
              {
                type: "Stream",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Stream",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getStreamDetails: builder.query({
      query: (streamId) => ({
        url: `${STREAM_URL}/${streamId}`,
      }),
      providesTags: (result, error, streamId) => [
        {
          type: "Stream",
          id: streamId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getStreamsBySchool: builder.query({
      query: ({ schoolId, ...params }) => ({
        url: `${STREAM_URL}/school/${schoolId}`,
        params,
      }),
      providesTags: (result, error, { schoolId }) =>
        result
          ? [
              ...result.map((stream) => ({
                type: "Stream",
                id: stream._id,
              })),
              {
                type: "Stream",
                id: `SCHOOL-${schoolId}`,
              },
            ]
          : [
              {
                type: "Stream",
                id: `SCHOOL-${schoolId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateStream: builder.mutation({
      query: ({ streamId, ...data }) => ({
        url: `${STREAM_URL}/${streamId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { streamId }) => [
        {
          type: "Stream",
          id: streamId,
        },
        {
          type: "Stream",
          id: "LIST",
        },
        "Stream",
      ],
    }),

    updateStreamStatus: builder.mutation({
      query: ({ streamId, isActive }) => ({
        url: `${STREAM_URL}/${streamId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { streamId }) => [
        {
          type: "Stream",
          id: streamId,
        },
        {
          type: "Stream",
          id: "LIST",
        },
        "Stream",
      ],
    }),

    deleteStream: builder.mutation({
      query: (streamId) => ({
        url: `${STREAM_URL}/${streamId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, streamId) => [
        {
          type: "Stream",
          id: streamId,
        },
        {
          type: "Stream",
          id: "LIST",
        },
        "Stream",
      ],
    }),
  }),
});

export const {
  useCreateStreamMutation,
  useGetStreamsQuery,
  useGetStreamDetailsQuery,
  useGetStreamsBySchoolQuery,
  useUpdateStreamMutation,
  useUpdateStreamStatusMutation,
  useDeleteStreamMutation,
} = streamApiSlice;