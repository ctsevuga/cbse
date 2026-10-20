import { apiSlice } from "./apiSlice";
import { SECTION_URL } from "../constants";

export const sectionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSection: builder.mutation({
      query: (data) => ({
        url: SECTION_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Section"],
    }),

    getSections: builder.query({
      query: (params = {}) => ({
        url: SECTION_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((section) => ({
                type: "Section",
                id: section._id,
              })),
              {
                type: "Section",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Section",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getSectionDetails: builder.query({
      query: (sectionId) => ({
        url: `${SECTION_URL}/${sectionId}`,
      }),
      providesTags: (result, error, sectionId) => [
        {
          type: "Section",
          id: sectionId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    getSectionsByClass: builder.query({
      query: ({ classId, ...params }) => ({
        url: `${SECTION_URL}/class/${classId}`,
        params,
      }),
      providesTags: (result, error, { classId }) =>
        result
          ? [
              ...result.map((section) => ({
                type: "Section",
                id: section._id,
              })),
              {
                type: "Section",
                id: `CLASS-${classId}`,
              },
            ]
          : [
              {
                type: "Section",
                id: `CLASS-${classId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getSectionsByAcademicYear: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: `${SECTION_URL}/academic-year/${academicYearId}`,
        params,
      }),
      providesTags: (result, error, { academicYearId }) =>
        result
          ? [
              ...result.map((section) => ({
                type: "Section",
                id: section._id,
              })),
              {
                type: "Section",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ]
          : [
              {
                type: "Section",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    updateSection: builder.mutation({
      query: ({ sectionId, ...data }) => ({
        url: `${SECTION_URL}/${sectionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { sectionId }) => [
        {
          type: "Section",
          id: sectionId,
        },
        {
          type: "Section",
          id: "LIST",
        },
        "Section",
      ],
    }),

    updateSectionStatus: builder.mutation({
      query: ({ sectionId, isActive }) => ({
        url: `${SECTION_URL}/${sectionId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { sectionId }) => [
        {
          type: "Section",
          id: sectionId,
        },
        {
          type: "Section",
          id: "LIST",
        },
        "Section",
      ],
    }),

    deleteSection: builder.mutation({
      query: (sectionId) => ({
        url: `${SECTION_URL}/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, sectionId) => [
        {
          type: "Section",
          id: sectionId,
        },
        {
          type: "Section",
          id: "LIST",
        },
        "Section",
      ],
    }),
  }),
});

export const {
  useCreateSectionMutation,
  useGetSectionsQuery,
  useGetSectionDetailsQuery,
  useGetSectionsByClassQuery,
  useGetSectionsByAcademicYearQuery,
  useUpdateSectionMutation,
  useUpdateSectionStatusMutation,
  useDeleteSectionMutation,
} = sectionApiSlice;