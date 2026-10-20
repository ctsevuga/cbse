import { apiSlice } from "./apiSlice";
import { SCHOOL_URL } from "../constants";

export const schoolApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /*
    ======================================================
    Create School
    ======================================================
    */

    createSchool: builder.mutation({
      query: (data) => ({
        url: SCHOOL_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "School", id: "LIST" },
        "School",
      ],
    }),

    /*
    ======================================================
    Get All Schools
    ======================================================
    */

    getSchools: builder.query({
      query: () => ({
        url: SCHOOL_URL,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((school) => ({
                type: "School",
                id: school._id,
              })),
              { type: "School", id: "LIST" },
            ]
          : [{ type: "School", id: "LIST" }],

      keepUnusedDataFor: 5,
    }),

    /*
    ======================================================
    Get Active Schools
    ======================================================
    */

    getActiveSchools: builder.query({
      query: () => ({
        url: `${SCHOOL_URL}/active`,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map((school) => ({
                type: "School",
                id: school._id,
              })),
              { type: "School", id: "ACTIVE" },
            ]
          : [{ type: "School", id: "ACTIVE" }],

      keepUnusedDataFor: 5,
    }),

    /*
    ======================================================
    Get School By Slug
    ======================================================

    Used before authentication to identify the
    school/tenant.

    Example:
    /api/schools/slug/infowisdom-school
    */

    getSchoolBySlug: builder.query({
      query: (slug) => ({
        url: `${SCHOOL_URL}/slug/${encodeURIComponent(
          slug,
        )}`,
      }),

      providesTags: (result, error, slug) => [
        {
          type: "School",
          id: `SLUG-${slug}`,
        },
      ],

      keepUnusedDataFor: 300,
    }),

    /*
    ======================================================
    Get Logged-in User's School
    ======================================================
    */

    getMySchool: builder.query({
      query: () => ({
        url: `${SCHOOL_URL}/my-school`,
      }),

      providesTags: (result) =>
        result
          ? [
              { type: "School", id: result._id },
              { type: "School", id: "MY-SCHOOL" },
            ]
          : [{ type: "School", id: "MY-SCHOOL" }],

      keepUnusedDataFor: 5,
    }),

    /*
    ======================================================
    Get School Details
    ======================================================
    */

    getSchoolDetails: builder.query({
      query: (schoolId) => ({
        url: `${SCHOOL_URL}/${schoolId}`,
      }),

      providesTags: (result, error, schoolId) => [
        { type: "School", id: schoolId },
      ],

      keepUnusedDataFor: 5,
    }),

    /*
    ======================================================
    Update School
    ======================================================
    */

    updateSchool: builder.mutation({
      query: ({ schoolId, ...data }) => ({
        url: `${SCHOOL_URL}/${schoolId}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (
        result,
        error,
        { schoolId },
      ) => [
        { type: "School", id: schoolId },
        { type: "School", id: "LIST" },
        { type: "School", id: "ACTIVE" },
        "School",
      ],
    }),

    /*
    ======================================================
    Delete School
    ======================================================
    */

    deleteSchool: builder.mutation({
      query: (schoolId) => ({
        url: `${SCHOOL_URL}/${schoolId}`,
        method: "DELETE",
      }),

      invalidatesTags: (
        result,
        error,
        schoolId,
      ) => [
        { type: "School", id: schoolId },
        { type: "School", id: "LIST" },
        { type: "School", id: "ACTIVE" },
        "School",
      ],
    }),

    /*
    ======================================================
    Activate / Deactivate School
    ======================================================
    */

    updateSchoolStatus: builder.mutation({
      query: ({ schoolId, isActive }) => ({
        url: `${SCHOOL_URL}/${schoolId}/status`,
        method: "PATCH",
        body: { isActive },
      }),

      invalidatesTags: (
        result,
        error,
        { schoolId },
      ) => [
        { type: "School", id: schoolId },
        { type: "School", id: "LIST" },
        { type: "School", id: "ACTIVE" },
        "School",
      ],
    }),

    /*
    ======================================================
    Get School Users
    ======================================================
    */

    getSchoolUsers: builder.query({
      query: (schoolId) => ({
        url: `${SCHOOL_URL}/${schoolId}/users`,
      }),

      providesTags: (result, error, schoolId) => [
        {
          type: "SchoolUsers",
          id: schoolId,
        },
      ],

      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useCreateSchoolMutation,
  useGetSchoolsQuery,
  useGetActiveSchoolsQuery,
  useGetSchoolBySlugQuery,
  useGetMySchoolQuery,
  useGetSchoolDetailsQuery,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useUpdateSchoolStatusMutation,
  useGetSchoolUsersQuery,
} = schoolApiSlice;