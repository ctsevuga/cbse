import { apiSlice } from "./apiSlice";
import { STUDENT_SUBJECT_URL } from "../constants";

export const studentSubjectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ==========================================================
       Create Student Subject
    ========================================================== */
    createStudentSubject: builder.mutation({
      query: (data) => ({
        url: STUDENT_SUBJECT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentSubject"],
    }),

    /* ==========================================================
       Get Student Subjects
       
       Query parameters:
       student
       academicYear
       class
       section
       stream
       subjectCombination
       subject
       subjectType
       isCompulsory
       isAdditional
       isActive
    ========================================================== */
    getStudentSubjects: builder.query({
      query: (params = {}) => ({
        url: STUDENT_SUBJECT_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((studentSubject) => ({
                type: "StudentSubject",
                id: studentSubject._id,
              })),
              {
                type: "StudentSubject",
                id: "LIST",
              },
            ]
          : [
              {
                type: "StudentSubject",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Student Subject By ID
    ========================================================== */
    getStudentSubjectDetails: builder.query({
      query: (studentSubjectId) => ({
        url: `${STUDENT_SUBJECT_URL}/${studentSubjectId}`,
      }),
      providesTags: (result, error, studentSubjectId) => [
        {
          type: "StudentSubject",
          id: studentSubjectId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Subjects By Student
    ========================================================== */
    getSubjectsByStudent: builder.query({
      query: (studentId) => ({
        url: `${STUDENT_SUBJECT_URL}/student/${studentId}`,
      }),
      providesTags: (result, error, studentId) =>
        result
          ? [
              ...result.map((studentSubject) => ({
                type: "StudentSubject",
                id: studentSubject._id,
              })),
              {
                type: "StudentSubject",
                id: `STUDENT-${studentId}`,
              },
            ]
          : [
              {
                type: "StudentSubject",
                id: `STUDENT-${studentId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get My Subjects
       
       Used by logged-in STUDENT
    ========================================================== */
    getMySubjects: builder.query({
      query: () => ({
        url: `${STUDENT_SUBJECT_URL}/my-subjects`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((studentSubject) => ({
                type: "StudentSubject",
                id: studentSubject._id,
              })),
              {
                type: "StudentSubject",
                id: "MY-SUBJECTS",
              },
            ]
          : [
              {
                type: "StudentSubject",
                id: "MY-SUBJECTS",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Subjects By Academic Year
    ========================================================== */
    getSubjectsByAcademicYear: builder.query({
      query: (academicYearId) => ({
        url: `${STUDENT_SUBJECT_URL}/academic-year/${academicYearId}`,
      }),
      providesTags: (result, error, academicYearId) =>
        result
          ? [
              ...result.map((studentSubject) => ({
                type: "StudentSubject",
                id: studentSubject._id,
              })),
              {
                type: "StudentSubject",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ]
          : [
              {
                type: "StudentSubject",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Subjects By Stream
    ========================================================== */
    getSubjectsByStream: builder.query({
      query: (streamId) => ({
        url: `${STUDENT_SUBJECT_URL}/stream/${streamId}`,
      }),
      providesTags: (result, error, streamId) =>
        result
          ? [
              ...result.map((studentSubject) => ({
                type: "StudentSubject",
                id: studentSubject._id,
              })),
              {
                type: "StudentSubject",
                id: `STREAM-${streamId}`,
              },
            ]
          : [
              {
                type: "StudentSubject",
                id: `STREAM-${streamId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Update Student Subject
       
       studentSubjectId is used for the URL and is not
       included in the request body.
    ========================================================== */
    updateStudentSubject: builder.mutation({
      query: ({ studentSubjectId, ...data }) => ({
        url: `${STUDENT_SUBJECT_URL}/${studentSubjectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (
        result,
        error,
        { studentSubjectId }
      ) => [
        {
          type: "StudentSubject",
          id: studentSubjectId,
        },
        {
          type: "StudentSubject",
          id: "LIST",
        },
        "StudentSubject",
      ],
    }),

    /* ==========================================================
       Update Student Subject Status
    ========================================================== */
    updateStudentSubjectStatus: builder.mutation({
      query: ({ studentSubjectId, isActive }) => ({
        url: `${STUDENT_SUBJECT_URL}/${studentSubjectId}/status`,
        method: "PATCH",
        body: {
          isActive,
        },
      }),
      invalidatesTags: (
        result,
        error,
        { studentSubjectId }
      ) => [
        {
          type: "StudentSubject",
          id: studentSubjectId,
        },
        {
          type: "StudentSubject",
          id: "LIST",
        },
        {
          type: "StudentSubject",
          id: "MY-SUBJECTS",
        },
        "StudentSubject",
      ],
    }),

    /* ==========================================================
       Delete Student Subject
    ========================================================== */
    deleteStudentSubject: builder.mutation({
      query: (studentSubjectId) => ({
        url: `${STUDENT_SUBJECT_URL}/${studentSubjectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        result,
        error,
        studentSubjectId
      ) => [
        {
          type: "StudentSubject",
          id: studentSubjectId,
        },
        {
          type: "StudentSubject",
          id: "LIST",
        },
        {
          type: "StudentSubject",
          id: "MY-SUBJECTS",
        },
        "StudentSubject",
      ],
    }),
  }),
});

export const {
  useCreateStudentSubjectMutation,
  useGetStudentSubjectsQuery,
  useGetStudentSubjectDetailsQuery,
  useGetSubjectsByStudentQuery,
  useGetMySubjectsQuery,
  useGetSubjectsByAcademicYearQuery,
  useGetSubjectsByStreamQuery,
  useUpdateStudentSubjectMutation,
  useUpdateStudentSubjectStatusMutation,
  useDeleteStudentSubjectMutation,
} = studentSubjectApiSlice;