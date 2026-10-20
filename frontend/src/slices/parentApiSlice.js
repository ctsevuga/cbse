import { apiSlice } from "./apiSlice";
import { PARENT_URL } from "../constants";

export const parentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createParent: builder.mutation({
      query: (data) => ({
        url: PARENT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Parent"],
    }),

    getParents: builder.query({
      query: (params = {}) => ({
        url: PARENT_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((parent) => ({
                type: "Parent",
                id: parent._id,
              })),
              {
                type: "Parent",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Parent",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getParentDetails: builder.query({
      query: (parentId) => ({
        url: `${PARENT_URL}/${parentId}`,
      }),
      providesTags: (result, error, parentId) => [
        {
          type: "Parent",
          id: parentId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getParentByUser: builder.query({
      query: (userId) => ({
        url: `${PARENT_URL}/user/${userId}`,
      }),
      providesTags: (result, error, userId) => [
        {
          type: "Parent",
          id: `USER-${userId}`,
        },
        ...(result
          ? [
              {
                type: "Parent",
                id: result._id,
              },
            ]
          : []),
      ],
      keepUnusedDataFor: 5,
    }),

    getMyParentProfile: builder.query({
      query: () => ({
        url: `${PARENT_URL}/me`,
      }),
      providesTags: (result) =>
        result
          ? [
              {
                type: "Parent",
                id: result._id,
              },
              {
                type: "Parent",
                id: "ME",
              },
            ]
          : [
              {
                type: "Parent",
                id: "ME",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateParent: builder.mutation({
      query: ({ parentId, ...data }) => ({
        url: `${PARENT_URL}/${parentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { parentId }) => [
        {
          type: "Parent",
          id: parentId,
        },
        {
          type: "Parent",
          id: "LIST",
        },
        {
          type: "Parent",
          id: "ME",
        },
        "Parent",
      ],
    }),

    updateParentStatus: builder.mutation({
      query: ({ parentId, isActive }) => ({
        url: `${PARENT_URL}/${parentId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { parentId }) => [
        {
          type: "Parent",
          id: parentId,
        },
        {
          type: "Parent",
          id: "LIST",
        },
        {
          type: "Parent",
          id: "ME",
        },
        "Parent",
      ],
    }),

    deleteParent: builder.mutation({
      query: (parentId) => ({
        url: `${PARENT_URL}/${parentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, parentId) => [
        {
          type: "Parent",
          id: parentId,
        },
        {
          type: "Parent",
          id: "LIST",
        },
        {
          type: "Parent",
          id: "ME",
        },
        "Parent",
      ],
    }),
  }),
});

export const {
  useCreateParentMutation,
  useGetParentsQuery,
  useGetParentDetailsQuery,
  useGetParentByUserQuery,
  useGetMyParentProfileQuery,
  useUpdateParentMutation,
  useUpdateParentStatusMutation,
  useDeleteParentMutation,
} = parentApiSlice;