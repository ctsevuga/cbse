import { apiSlice } from "./apiSlice";
import { AUDITLOG_URL } from "../constants";

export const auditLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAuditLog: builder.mutation({
      query: (data) => ({
        url: AUDITLOG_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AuditLog"],
    }),

    getAuditLogs: builder.query({
      query: (params = {}) => ({
        url: AUDITLOG_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((auditLog) => ({
                type: "AuditLog",
                id: auditLog._id,
              })),
              {
                type: "AuditLog",
                id: "LIST",
              },
            ]
          : [
              {
                type: "AuditLog",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getMyAuditLogs: builder.query({
      query: () => ({
        url: `${AUDITLOG_URL}/my`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((auditLog) => ({
                type: "AuditLog",
                id: auditLog._id,
              })),
              {
                type: "AuditLog",
                id: "MY",
              },
            ]
          : [
              {
                type: "AuditLog",
                id: "MY",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getAuditLogDetails: builder.query({
      query: (auditLogId) => ({
        url: `${AUDITLOG_URL}/${auditLogId}`,
      }),
      providesTags: (result, error, auditLogId) => [
        {
          type: "AuditLog",
          id: auditLogId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getAuditLogsByUser: builder.query({
      query: (userId) => ({
        url: `${AUDITLOG_URL}/user/${userId}`,
      }),
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map((auditLog) => ({
                type: "AuditLog",
                id: auditLog._id,
              })),
              {
                type: "AuditLog",
                id: `USER-${userId}`,
              },
            ]
          : [
              {
                type: "AuditLog",
                id: `USER-${userId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getAuditLogsByEntity: builder.query({
      query: ({ entityType, entityId, school }) => ({
        url: `${AUDITLOG_URL}/entity/${entityType}/${entityId}`,
        params: school ? { school } : {},
      }),
      providesTags: (result, error, { entityType, entityId }) =>
        result
          ? [
              ...result.map((auditLog) => ({
                type: "AuditLog",
                id: auditLog._id,
              })),
              {
                type: "AuditLog",
                id: `ENTITY-${entityType}-${entityId}`,
              },
            ]
          : [
              {
                type: "AuditLog",
                id: `ENTITY-${entityType}-${entityId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getAuditLogsByAction: builder.query({
      query: ({ action, school }) => ({
        url: `${AUDITLOG_URL}/action/${action}`,
        params: school ? { school } : {},
      }),
      providesTags: (result, error, { action }) =>
        result
          ? [
              ...result.map((auditLog) => ({
                type: "AuditLog",
                id: auditLog._id,
              })),
              {
                type: "AuditLog",
                id: `ACTION-${action}`,
              },
            ]
          : [
              {
                type: "AuditLog",
                id: `ACTION-${action}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    deleteAuditLog: builder.mutation({
      query: (auditLogId) => ({
        url: `${AUDITLOG_URL}/${auditLogId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, auditLogId) => [
        {
          type: "AuditLog",
          id: auditLogId,
        },
        {
          type: "AuditLog",
          id: "LIST",
        },
        {
          type: "AuditLog",
          id: "MY",
        },
        "AuditLog",
      ],
    }),
  }),
});

export const {
  useCreateAuditLogMutation,
  useGetAuditLogsQuery,
  useGetMyAuditLogsQuery,
  useGetAuditLogDetailsQuery,
  useGetAuditLogsByUserQuery,
  useGetAuditLogsByEntityQuery,
  useGetAuditLogsByActionQuery,
  useDeleteAuditLogMutation,
} = auditLogApiSlice;