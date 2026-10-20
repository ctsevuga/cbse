import { apiSlice } from "./apiSlice";
import { TEACHER_URL } from "../constants";

export const teacherApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ==========================================================
       Create Teacher
       POST /api/teachers
    ========================================================== */
    createTeacher: builder.mutation({
      query: (data) => ({
        url: TEACHER_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),

    /* ==========================================================
       Get Teachers
       GET /api/teachers

       Optional query parameters:
       school
       isActive
       employeeCode
    ========================================================== */
    getTeachers: builder.query({
      query: (params = {}) => ({
        url: TEACHER_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((teacher) => ({
                type: "Teacher",
                id: teacher._id,
              })),
              {
                type: "Teacher",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Teacher",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get My Teacher Profile
       GET /api/teachers/me
    ========================================================== */
    getMyTeacherProfile: builder.query({
      query: () => ({
        url: `${TEACHER_URL}/me`,
      }),
      providesTags: (result) =>
        result
          ? [
              {
                type: "Teacher",
                id: result._id,
              },
              {
                type: "Teacher",
                id: "ME",
              },
            ]
          : [
              {
                type: "Teacher",
                id: "ME",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Teacher By User
       GET /api/teachers/user/:userId
    ========================================================== */
    getTeacherByUser: builder.query({
      query: (userId) => ({
        url: `${TEACHER_URL}/user/${userId}`,
      }),
      providesTags: (result, error, userId) =>
        result
          ? [
              {
                type: "Teacher",
                id: result._id,
              },
              {
                type: "Teacher",
                id: `USER-${userId}`,
              },
            ]
          : [
              {
                type: "Teacher",
                id: `USER-${userId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Teacher Details
       GET /api/teachers/:id
    ========================================================== */
    getTeacherDetails: builder.query({
      query: (teacherId) => ({
        url: `${TEACHER_URL}/${teacherId}`,
      }),
      providesTags: (result, error, teacherId) => [
        {
          type: "Teacher",
          id: teacherId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Update Teacher
       PUT /api/teachers/:id

       Body:
       user
       employeeCode
       qualification
       isActive
    ========================================================== */
    updateTeacher: builder.mutation({
      query: ({ teacherId, ...data }) => ({
        url: `${TEACHER_URL}/${teacherId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (
        result,
        error,
        { teacherId },
      ) => [
        {
          type: "Teacher",
          id: teacherId,
        },
        {
          type: "Teacher",
          id: "LIST",
        },
        {
          type: "Teacher",
          id: "ME",
        },
        "Teacher",
      ],
    }),

    /* ==========================================================
       Update Teacher Status
       PATCH /api/teachers/:id/status
    ========================================================== */
    updateTeacherStatus: builder.mutation({
      query: ({ teacherId, isActive }) => ({
        url: `${TEACHER_URL}/${teacherId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (
        result,
        error,
        { teacherId },
      ) => [
        {
          type: "Teacher",
          id: teacherId,
        },
        {
          type: "Teacher",
          id: "LIST",
        },
        {
          type: "Teacher",
          id: "ME",
        },
        "Teacher",
      ],
    }),

    /* ==========================================================
       Delete Teacher
       DELETE /api/teachers/:id
    ========================================================== */
    deleteTeacher: builder.mutation({
      query: (teacherId) => ({
        url: `${TEACHER_URL}/${teacherId}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        result,
        error,
        teacherId,
      ) => [
        {
          type: "Teacher",
          id: teacherId,
        },
        {
          type: "Teacher",
          id: "LIST",
        },
        {
          type: "Teacher",
          id: "ME",
        },
        "Teacher",
      ],
    }),
  }),
});

export const {
  useCreateTeacherMutation,
  useGetTeachersQuery,
  useGetMyTeacherProfileQuery,
  useGetTeacherByUserQuery,
  useGetTeacherDetailsQuery,
  useUpdateTeacherMutation,
  useUpdateTeacherStatusMutation,
  useDeleteTeacherMutation,
} = teacherApiSlice;