import { apiSlice } from "./apiSlice";
import { ACADEMIC_YEAR_URL } from "../constants";

export const academicYearApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAcademicYear: builder.mutation({
      query: (data) => ({
        url: ACADEMIC_YEAR_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AcademicYear"],
    }),

    getAcademicYears: builder.query({
      query: (params = {}) => ({
        url: ACADEMIC_YEAR_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((academicYear) => ({
                type: "AcademicYear",
                id: academicYear._id,
              })),
              { type: "AcademicYear", id: "LIST" },
            ]
          : [{ type: "AcademicYear", id: "LIST" }],
      keepUnusedDataFor: 5,
    }),

    getCurrentAcademicYear: builder.query({
      query: () => ({
        url: `${ACADEMIC_YEAR_URL}/current`,
      }),
      providesTags: (result) =>
        result
          ? [{ type: "AcademicYear", id: result._id }, "AcademicYear"]
          : ["AcademicYear"],
      keepUnusedDataFor: 5,
    }),

    getAcademicYearDetails: builder.query({
      query: (academicYearId) => ({
        url: `${ACADEMIC_YEAR_URL}/${academicYearId}`,
      }),
      providesTags: (result, error, academicYearId) => [
        { type: "AcademicYear", id: academicYearId },
      ],
      keepUnusedDataFor: 5,
    }),

    updateAcademicYear: builder.mutation({
      query: ({ academicYearId, ...data }) => ({
        url: `${ACADEMIC_YEAR_URL}/${academicYearId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { academicYearId }) => [
        { type: "AcademicYear", id: academicYearId },
        { type: "AcademicYear", id: "LIST" },
        "AcademicYear",
      ],
    }),

    setCurrentAcademicYear: builder.mutation({
      query: (academicYearId) => ({
        url: `${ACADEMIC_YEAR_URL}/${academicYearId}/current`,
        method: "PATCH",
      }),
      invalidatesTags: ["AcademicYear"],
    }),

    updateAcademicYearStatus: builder.mutation({
      query: ({ academicYearId, isActive }) => ({
        url: `${ACADEMIC_YEAR_URL}/${academicYearId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { academicYearId }) => [
        { type: "AcademicYear", id: academicYearId },
        { type: "AcademicYear", id: "LIST" },
        "AcademicYear",
      ],
    }),

    deleteAcademicYear: builder.mutation({
      query: (academicYearId) => ({
        url: `${ACADEMIC_YEAR_URL}/${academicYearId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, academicYearId) => [
        { type: "AcademicYear", id: academicYearId },
        { type: "AcademicYear", id: "LIST" },
        "AcademicYear",
      ],
    }),
  }),
});

export const {
  useCreateAcademicYearMutation,
  useGetAcademicYearsQuery,
  useGetCurrentAcademicYearQuery,
  useGetAcademicYearDetailsQuery,
  useUpdateAcademicYearMutation,
  useSetCurrentAcademicYearMutation,
  useUpdateAcademicYearStatusMutation,
  useDeleteAcademicYearMutation,
} = academicYearApiSlice;