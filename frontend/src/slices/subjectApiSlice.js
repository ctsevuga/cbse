import { apiSlice } from "./apiSlice";
import { SUBJECT_URL } from "../constants";

export const subjectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ==========================================================
       Create Subject
       POST /api/subjects
       SUPER_ADMIN only
    ========================================================== */
    createSubject: builder.mutation({
      query: (data) => ({
        url: SUBJECT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subject"],
    }),

    /* ==========================================================
       Get Subjects
       GET /api/subjects

       Optional query parameters:
       code
       name
       shortName
       subjectType
       cbseSubjectCode
       isActive
    ========================================================== */
    getSubjects: builder.query({
      query: (params = {}) => ({
        url: SUBJECT_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((subject) => ({
                type: "Subject",
                id: subject._id,
              })),
              {
                type: "Subject",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Subject",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Subject Details
       GET /api/subjects/:id
    ========================================================== */
    getSubjectDetails: builder.query({
      query: (subjectId) => ({
        url: `${SUBJECT_URL}/${subjectId}`,
      }),
      providesTags: (result, error, subjectId) => [
        {
          type: "Subject",
          id: subjectId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Update Subject
       PUT /api/subjects/:id
       SUPER_ADMIN only
    ========================================================== */
    updateSubject: builder.mutation({
      query: ({ subjectId, ...data }) => ({
        url: `${SUBJECT_URL}/${subjectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { subjectId }) => [
        {
          type: "Subject",
          id: subjectId,
        },
        {
          type: "Subject",
          id: "LIST",
        },
        "Subject",
      ],
    }),

    /* ==========================================================
       Update Subject Status
       PATCH /api/subjects/:id/status
       SUPER_ADMIN only
    ========================================================== */
    updateSubjectStatus: builder.mutation({
      query: ({ subjectId, isActive }) => ({
        url: `${SUBJECT_URL}/${subjectId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { subjectId }) => [
        {
          type: "Subject",
          id: subjectId,
        },
        {
          type: "Subject",
          id: "LIST",
        },
        "Subject",
      ],
    }),

    /* ==========================================================
       Delete Subject
       DELETE /api/subjects/:id
       SUPER_ADMIN only
    ========================================================== */
    deleteSubject: builder.mutation({
      query: (subjectId) => ({
        url: `${SUBJECT_URL}/${subjectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, subjectId) => [
        {
          type: "Subject",
          id: subjectId,
        },
        {
          type: "Subject",
          id: "LIST",
        },
        "Subject",
      ],
    }),
  }),
});

export const {
  useCreateSubjectMutation,
  useGetSubjectsQuery,
  useGetSubjectDetailsQuery,
  useUpdateSubjectMutation,
  useUpdateSubjectStatusMutation,
  useDeleteSubjectMutation,
} = subjectApiSlice;