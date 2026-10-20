import { apiSlice } from "./apiSlice";
import { CLASS_URL } from "../constants";

export const classApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClass: builder.mutation({
      query: (data) => ({
        url: CLASS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Class"],
    }),

    getClasses: builder.query({
      query: (params = {}) => ({
        url: CLASS_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((classItem) => ({
                type: "Class",
                id: classItem._id,
              })),
              {
                type: "Class",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Class",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getClassDetails: builder.query({
      query: (classId) => ({
        url: `${CLASS_URL}/${classId}`,
      }),
      providesTags: (result, error, classId) => [
        {
          type: "Class",
          id: classId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getClassesBySchool: builder.query({
      query: (schoolId) => ({
        url: `${CLASS_URL}/school/${schoolId}`,
      }),
      providesTags: (result, error, schoolId) =>
        result
          ? [
              ...result.map((classItem) => ({
                type: "Class",
                id: classItem._id,
              })),
              {
                type: "Class",
                id: `SCHOOL-${schoolId}`,
              },
            ]
          : [
              {
                type: "Class",
                id: `SCHOOL-${schoolId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateClass: builder.mutation({
      query: ({ classId, ...data }) => ({
        url: `${CLASS_URL}/${classId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { classId }) => [
        {
          type: "Class",
          id: classId,
        },
        {
          type: "Class",
          id: "LIST",
        },
        "Class",
      ],
    }),

    updateClassStatus: builder.mutation({
      query: ({ classId, isActive }) => ({
        url: `${CLASS_URL}/${classId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { classId }) => [
        {
          type: "Class",
          id: classId,
        },
        {
          type: "Class",
          id: "LIST",
        },
        "Class",
      ],
    }),

    deleteClass: builder.mutation({
      query: (classId) => ({
        url: `${CLASS_URL}/${classId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, classId) => [
        {
          type: "Class",
          id: classId,
        },
        {
          type: "Class",
          id: "LIST",
        },
        "Class",
      ],
    }),
  }),
});

export const {
  useCreateClassMutation,
  useGetClassesQuery,
  useGetClassDetailsQuery,
  useGetClassesBySchoolQuery,
  useUpdateClassMutation,
  useUpdateClassStatusMutation,
  useDeleteClassMutation,
} = classApiSlice;