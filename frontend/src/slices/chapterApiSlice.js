import { apiSlice } from "./apiSlice";
import { CHAPTER_URL } from "../constants";

export const chapterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChapter: builder.mutation({
      query: (data) => ({
        url: CHAPTER_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chapter"],
    }),

    getChapters: builder.query({
      query: (params = {}) => ({
        url: CHAPTER_URL,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((chapter) => ({
                type: "Chapter",
                id: chapter._id,
              })),
              {
                type: "Chapter",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Chapter",
                id: "LIST",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getChaptersBySubject: builder.query({
      query: ({ subjectId, academicYear, isActive } = {}) => ({
        url: `${CHAPTER_URL}/subject/${subjectId}`,
        params: {
          ...(academicYear && { academicYear }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
      providesTags: (result, error, { subjectId }) =>
        result
          ? [
              ...result.map((chapter) => ({
                type: "Chapter",
                id: chapter._id,
              })),
              {
                type: "Chapter",
                id: `SUBJECT-${subjectId}`,
              },
            ]
          : [
              {
                type: "Chapter",
                id: `SUBJECT-${subjectId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getChaptersByAcademicYear: builder.query({
      query: (academicYearId) => ({
        url: `${CHAPTER_URL}/academic-year/${academicYearId}`,
      }),
      providesTags: (result, error, academicYearId) =>
        result
          ? [
              ...result.map((chapter) => ({
                type: "Chapter",
                id: chapter._id,
              })),
              {
                type: "Chapter",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ]
          : [
              {
                type: "Chapter",
                id: `ACADEMIC-YEAR-${academicYearId}`,
              },
            ],
      keepUnusedDataFor: 5,
    }),

    getChapterDetails: builder.query({
      query: (chapterId) => ({
        url: `${CHAPTER_URL}/${chapterId}`,
      }),
      providesTags: (result, error, chapterId) => [
        {
          type: "Chapter",
          id: chapterId,
        },
      ],
      keepUnusedDataFor: 5,
    }),

    updateChapter: builder.mutation({
      query: ({ chapterId, ...data }) => ({
        url: `${CHAPTER_URL}/${chapterId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { chapterId }) => [
        {
          type: "Chapter",
          id: chapterId,
        },
        {
          type: "Chapter",
          id: "LIST",
        },
        "Chapter",
      ],
    }),

    updateChapterStatus: builder.mutation({
      query: ({ chapterId, isActive }) => ({
        url: `${CHAPTER_URL}/${chapterId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { chapterId }) => [
        {
          type: "Chapter",
          id: chapterId,
        },
        {
          type: "Chapter",
          id: "LIST",
        },
        "Chapter",
      ],
    }),

    deleteChapter: builder.mutation({
      query: (chapterId) => ({
        url: `${CHAPTER_URL}/${chapterId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, chapterId) => [
        {
          type: "Chapter",
          id: chapterId,
        },
        {
          type: "Chapter",
          id: "LIST",
        },
        "Chapter",
      ],
    }),
  }),
});

export const {
  useCreateChapterMutation,
  useGetChaptersQuery,
  useGetChaptersBySubjectQuery,
  useGetChaptersByAcademicYearQuery,
  useGetChapterDetailsQuery,
  useUpdateChapterMutation,
  useUpdateChapterStatusMutation,
  useDeleteChapterMutation,
} = chapterApiSlice;