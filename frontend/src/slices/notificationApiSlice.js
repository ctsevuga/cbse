import { apiSlice } from "./apiSlice";
import { NOTIFICATION_URL } from "../constants";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNotification: builder.mutation({
      query: (data) => ({
        url: NOTIFICATION_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),

    getNotifications: builder.query({
      query: (params = {}) => ({
        url: NOTIFICATION_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((notification) => ({
                type: "Notification",
                id: notification._id,
              })),
              {
                type: "Notification",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Notification",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getNotificationDetails: builder.query({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}`,
      }),
      providesTags: (result, error, notificationId) => [
        {
          type: "Notification",
          id: notificationId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getMyNotifications: builder.query({
      query: (params = {}) => ({
        url: `${NOTIFICATION_URL}/my`,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((notification) => ({
                type: "Notification",
                id: notification._id,
              })),
              {
                type: "Notification",
                id: "MY",
              },
            ]
          : [
              {
                type: "Notification",
                id: "MY",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getUnreadNotifications: builder.query({
      query: () => ({
        url: `${NOTIFICATION_URL}/unread`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((notification) => ({
                type: "Notification",
                id: notification._id,
              })),
              {
                type: "Notification",
                id: "UNREAD",
              },
            ]
          : [
              {
                type: "Notification",
                id: "UNREAD",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getUnreadNotificationCount: builder.query({
      query: () => ({
        url: `${NOTIFICATION_URL}/unread-count`,
      }),
      providesTags: [
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
      ],
      keepUnusedDataFor: 5,
    }),

    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, notificationId) => [
        {
          type: "Notification",
          id: notificationId,
        },
        {
          type: "Notification",
          id: "MY",
        },
        {
          type: "Notification",
          id: "UNREAD",
        },
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
        "Notification",
      ],
    }),

    markNotificationAsUnread: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}/unread`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, notificationId) => [
        {
          type: "Notification",
          id: notificationId,
        },
        {
          type: "Notification",
          id: "MY",
        },
        {
          type: "Notification",
          id: "UNREAD",
        },
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
        "Notification",
      ],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATION_URL}/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: [
        {
          type: "Notification",
          id: "MY",
        },
        {
          type: "Notification",
          id: "UNREAD",
        },
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
        "Notification",
      ],
    }),

    updateNotification: builder.mutation({
      query: ({ notificationId, ...data }) => ({
        url: `${NOTIFICATION_URL}/${notificationId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { notificationId }) => [
        {
          type: "Notification",
          id: notificationId,
        },
        {
          type: "Notification",
          id: "LIST",
        },
        {
          type: "Notification",
          id: "MY",
        },
        {
          type: "Notification",
          id: "UNREAD",
        },
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
        "Notification",
      ],
    }),

    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, notificationId) => [
        {
          type: "Notification",
          id: notificationId,
        },
        {
          type: "Notification",
          id: "LIST",
        },
        {
          type: "Notification",
          id: "MY",
        },
        {
          type: "Notification",
          id: "UNREAD",
        },
        {
          type: "Notification",
          id: "UNREAD-COUNT",
        },
        "Notification",
      ],
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useGetNotificationsQuery,
  useGetNotificationDetailsQuery,
  useGetMyNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkNotificationAsUnreadMutation,
  useMarkAllNotificationsAsReadMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApiSlice;