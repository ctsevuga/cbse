import { apiSlice } from "./apiSlice";
import { STUDENT_PARENT_URL } from "../constants";

export const studentParentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ==========================================================
       Create Student-Parent Relationship

       POST /student-parents

       Body:
       {
         student,
         parent,
         relationship,
         isPrimary
       }
    ========================================================== */
    createStudentParent: builder.mutation({
      query: (data) => ({
        url: STUDENT_PARENT_URL,
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        "StudentParent",
        "Student",
      ],
    }),

    /* ==========================================================
       Get Student-Parent Relationships

       GET /student-parents

       Optional query params:
       - student
       - parent
       - relationship
       - isPrimary
       - isActive
    ========================================================== */
    getStudentParents: builder.query({
      query: (params = {}) => ({
        url: STUDENT_PARENT_URL,
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((relationship) => ({
                type: "StudentParent",
                id: relationship._id,
              })),

              {
                type: "StudentParent",
                id: "LIST",
              },
            ]
          : [
              {
                type: "StudentParent",
                id: "LIST",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Student-Parent Relationship By ID

       GET /student-parents/:id
    ========================================================== */
    getStudentParentDetails: builder.query({
      query: (studentParentId) => ({
        url: `${STUDENT_PARENT_URL}/${studentParentId}`,
        method: "GET",
      }),

      providesTags: (result, error, studentParentId) => [
        {
          type: "StudentParent",
          id: studentParentId,
        },
      ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Parents By Student

       GET /student-parents/student/:studentId

       Used by Student Details page.
    ========================================================== */
    getParentsByStudent: builder.query({
      query: (studentId) => ({
        url: `${STUDENT_PARENT_URL}/student/${studentId}`,
        method: "GET",
      }),

      providesTags: (result, error, studentId) =>
        result
          ? [
              ...result.map((relationship) => ({
                type: "StudentParent",
                id: relationship._id,
              })),

              {
                type: "StudentParent",
                id: `STUDENT-${studentId}`,
              },
            ]
          : [
              {
                type: "StudentParent",
                id: `STUDENT-${studentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get Students By Parent

       GET /student-parents/parent/:parentId
    ========================================================== */
    getStudentsByParent: builder.query({
      query: (parentId) => ({
        url: `${STUDENT_PARENT_URL}/parent/${parentId}`,
        method: "GET",
      }),

      providesTags: (result, error, parentId) =>
        result
          ? [
              ...result.map((relationship) => ({
                type: "StudentParent",
                id: relationship._id,
              })),

              {
                type: "StudentParent",
                id: `PARENT-${parentId}`,
              },
            ]
          : [
              {
                type: "StudentParent",
                id: `PARENT-${parentId}`,
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Get My Children

       GET /student-parents/me/children

       Used by logged-in PARENT.
    ========================================================== */
    getMyChildren: builder.query({
      query: () => ({
        url: `${STUDENT_PARENT_URL}/me/children`,
        method: "GET",
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((relationship) => ({
                type: "StudentParent",
                id: relationship._id,
              })),

              {
                type: "StudentParent",
                id: "MY-CHILDREN",
              },
            ]
          : [
              {
                type: "StudentParent",
                id: "MY-CHILDREN",
              },
            ],

      keepUnusedDataFor: 5,
    }),

    /* ==========================================================
       Update Student-Parent Relationship

       PUT /student-parents/:id

       Supported body:

       {
         student?: "studentId",
         parent?: "parentId",
         relationship?: "FATHER",
         isPrimary?: true,
         isActive?: true
       }

       IMPORTANT:

       When editing from Student Details, do NOT send `student`.
       The existing student remains unchanged.

       Example:

       {
         parent: "parentId",
         relationship: "FATHER",
         isPrimary: true,
         isActive: true
       }
    ========================================================== */
    updateStudentParent: builder.mutation({
      query: ({
        studentParentId,
        student,
        parent,
        relationship,
        isPrimary,
        isActive,
      }) => {
        const body = {};

        /*
          Student is optional.

          If this mutation is used from a generic
          relationship-management screen, `student`
          can be supplied.

          If used from Student Details, simply omit it.
        */
        if (student !== undefined) {
          body.student = student;
        }

        if (parent !== undefined) {
          body.parent = parent;
        }

        if (relationship !== undefined) {
          body.relationship = relationship;
        }

        if (isPrimary !== undefined) {
          body.isPrimary = isPrimary;
        }

        if (isActive !== undefined) {
          body.isActive = isActive;
        }

        return {
          url: `${STUDENT_PARENT_URL}/${studentParentId}`,
          method: "PUT",
          body,
        };
      },

      invalidatesTags: (
        result,
        error,
        {
          studentParentId,
          student,
          parent,
        },
      ) => {
        const tags = [
          {
            type: "StudentParent",
            id: studentParentId,
          },

          {
            type: "StudentParent",
            id: "LIST",
          },

          {
            type: "StudentParent",
            id: "MY-CHILDREN",
          },

          "StudentParent",
        ];

        /*
          Invalidate the old/new student relationship list
          when student is supplied.
        */
        if (student) {
          tags.push({
            type: "StudentParent",
            id: `STUDENT-${student}`,
          });
        }

        /*
          Invalidate the parent relationship list
          when parent is supplied.
        */
        if (parent) {
          tags.push({
            type: "StudentParent",
            id: `PARENT-${parent}`,
          });
        }

        return tags;
      },
    }),

    /* ==========================================================
       Update Student-Parent Relationship Status

       PATCH /student-parents/:id/status

       Body:
       {
         isActive: true
       }

       This endpoint is useful for quick Activate /
       Deactivate actions from Student Details.
    ========================================================== */
    updateStudentParentStatus: builder.mutation({
      query: ({
        studentParentId,
        isActive,
      }) => ({
        url: `${STUDENT_PARENT_URL}/${studentParentId}/status`,
        method: "PATCH",
        body: {
          isActive,
        },
      }),

      invalidatesTags: (
        result,
        error,
        { studentParentId },
      ) => [
        {
          type: "StudentParent",
          id: studentParentId,
        },

        {
          type: "StudentParent",
          id: "LIST",
        },

        {
          type: "StudentParent",
          id: "MY-CHILDREN",
        },

        "StudentParent",
      ],
    }),

    /* ==========================================================
       Delete Student-Parent Relationship

       DELETE /student-parents/:id
    ========================================================== */
    deleteStudentParent: builder.mutation({
      query: (studentParentId) => ({
        url: `${STUDENT_PARENT_URL}/${studentParentId}`,
        method: "DELETE",
      }),

      invalidatesTags: (
        result,
        error,
        studentParentId,
      ) => [
        {
          type: "StudentParent",
          id: studentParentId,
        },

        {
          type: "StudentParent",
          id: "LIST",
        },

        {
          type: "StudentParent",
          id: "MY-CHILDREN",
        },

        "StudentParent",
      ],
    }),
  }),
});

export const {
  useCreateStudentParentMutation,
  useGetStudentParentsQuery,
  useGetStudentParentDetailsQuery,
  useGetParentsByStudentQuery,
  useGetStudentsByParentQuery,
  useGetMyChildrenQuery,
  useUpdateStudentParentMutation,
  useUpdateStudentParentStatusMutation,
  useDeleteStudentParentMutation,
} = studentParentApiSlice;
