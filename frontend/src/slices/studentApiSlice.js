import { apiSlice } from "./apiSlice";
import { STUDENT_URL } from "../constants";

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ==========================================================
       Create Student
       POST /api/students

       Expected subject structure:

       subjects: [
         {
           subject: "<subjectId>",
           type: "CORE",
         },
         {
           subject: "<subjectId>",
           type: "ELECTIVE",
         },
       ]
    ========================================================== */
    createStudent: builder.mutation({
      query: (data) => ({
        url: STUDENT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        {
          type: "Student",
          id: "LIST",
        },
      ],
    }),

    /* ==========================================================
       Get All Students
       GET /api/students

       Optional query parameters:
       - school
       - academicYear
       - class
       - section
       - stream
       - isActive
    ========================================================== */
    getStudents: builder.query({
      query: (params = {}) => ({
        url: STUDENT_URL,
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((student) => ({
                type: "Student",
                id: student._id,
              })),
              {
                type: "Student",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Student",
                id: "LIST",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Logged-in Student Profile
       GET /api/students/me

       Response now contains:
       subjects: [
         {
           _id: "...",
           name: "...",
           code: "...",
         }
       ]
    ========================================================== */
    getMyStudentProfile: builder.query({
      query: () => ({
        url: `${STUDENT_URL}/me`,
      }),

      providesTags: (result) =>
        result
          ? [
              {
                type: "Student",
                id: result._id,
              },
              {
                type: "Student",
                id: "ME",
              },
            ]
          : [
              {
                type: "Student",
                id: "ME",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Student By User
       GET /api/students/user/:userId
    ========================================================== */
    getStudentByUser: builder.query({
      query: (userId) => ({
        url: `${STUDENT_URL}/user/${userId}`,
      }),

      providesTags: (result, error, userId) =>
        result
          ? [
              {
                type: "Student",
                id: result._id,
              },
              {
                type: "Student",
                id: `USER-${userId}`,
              },
            ]
          : [
              {
                type: "Student",
                id: `USER-${userId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Student Details
       GET /api/students/:id
    ========================================================== */
    getStudentDetails: builder.query({
      query: (studentId) => ({
        url: `${STUDENT_URL}/${studentId}`,
      }),

      providesTags: (result, error, studentId) => [
        {
          type: "Student",
          id: studentId,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Update Student
       PUT /api/students/:id

       Expected payload:

       {
         admissionNumber,
         dateOfBirth,
         gender,
         academicYear,
         class,
         section,
         stream,
         subjects: [
           {
             subject: "<subjectId>",
             type: "CORE",
           },
           {
             subject: "<subjectId>",
             type: "ELECTIVE",
           }
         ],
         isActive
       }

       IMPORTANT:
       Do NOT send subjectCombination.
    ========================================================== */
    updateStudent: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `${STUDENT_URL}/${studentId}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { studentId }) => [
        {
          type: "Student",
          id: studentId,
        },
        {
          type: "Student",
          id: "LIST",
        },
        {
          type: "Student",
          id: "ME",
        },
      ],
    }),

    /* ==========================================================
       Update Student Status
       PATCH /api/students/:id/status

       Body:
       {
         isActive: true | false
       }
    ========================================================== */
    updateStudentStatus: builder.mutation({
      query: ({ studentId, isActive }) => ({
        url: `${STUDENT_URL}/${studentId}/status`,
        method: "PATCH",
        body: {
          isActive,
        },
      }),

      invalidatesTags: (result, error, { studentId }) => [
        {
          type: "Student",
          id: studentId,
        },
        {
          type: "Student",
          id: "LIST",
        },
        {
          type: "Student",
          id: "ME",
        },
      ],
    }),

    /* ==========================================================
       Delete Student
       DELETE /api/students/:id
    ========================================================== */
    deleteStudent: builder.mutation({
      query: (studentId) => ({
        url: `${STUDENT_URL}/${studentId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, studentId) => [
        {
          type: "Student",
          id: studentId,
        },
        {
          type: "Student",
          id: "LIST",
        },
        {
          type: "Student",
          id: "ME",
        },
      ],
    }),
  }),
});

export const {
  useCreateStudentMutation,
  useGetStudentsQuery,
  useGetMyStudentProfileQuery,
  useGetStudentByUserQuery,
  useGetStudentDetailsQuery,
  useUpdateStudentMutation,
  useUpdateStudentStatusMutation,
  useDeleteStudentMutation,
} = studentApiSlice;
