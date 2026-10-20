import { apiSlice } from "./apiSlice";
import { SUBJECT_COMBINATION_URL } from "../constants";

export const subjectCombinationApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /* ==========================================================
         Create Subject Combination
         SUPER_ADMIN only

         Expected data:

         {
           stream,
           name,
           code,
           subjects: [
             {
               subject,
               type: "CORE"
             },
             {
               subject,
               type: "ELECTIVE"
             }
           ],
           minimumElectives,
           maximumElectives
         }
      ========================================================== */

      createSubjectCombination: builder.mutation({
        query: (data) => ({
          url: SUBJECT_COMBINATION_URL,
          method: "POST",
          body: data,
        }),

        invalidatesTags: [
          {
            type: "SubjectCombination",
            id: "LIST",
          },
        ],
      }),


      /* ==========================================================
         Get Subject Combinations

         Optional query parameters:

         stream
         isActive
         code
      ========================================================== */

      getSubjectCombinations: builder.query({
        query: (params = {}) => ({
          url: SUBJECT_COMBINATION_URL,
          params,
        }),

        providesTags: (result) =>
          result
            ? [
                ...result.map((combination) => ({
                  type: "SubjectCombination",
                  id: combination._id,
                })),

                {
                  type: "SubjectCombination",
                  id: "LIST",
                },
              ]
            : [
                {
                  type: "SubjectCombination",
                  id: "LIST",
                },
              ],

        keepUnusedDataFor: 5,
      }),


      /* ==========================================================
         Get Subject Combination By ID
      ========================================================== */

      getSubjectCombinationDetails: builder.query({
        query: (combinationId) => ({
          url: `${SUBJECT_COMBINATION_URL}/${combinationId}`,
        }),

        providesTags: (
          result,
          error,
          combinationId,
        ) => [
          {
            type: "SubjectCombination",
            id: combinationId,
          },

          ...(result?.stream?._id
            ? [
                {
                  type: "SubjectCombination",
                  id: `STREAM-${result.stream._id}`,
                },
              ]
            : []),
        ],

        keepUnusedDataFor: 5,
      }),


      /* ==========================================================
         Get Subject Combination By Stream

         A stream has one active subject combination.

         GET:
         /api/subject-combinations/stream/:streamId
      ========================================================== */

      getSubjectCombinationByStream: builder.query({
        query: (streamId) => ({
          url: `${SUBJECT_COMBINATION_URL}/stream/${streamId}`,
        }),

        providesTags: (
          result,
          error,
          streamId,
        ) =>
          result
            ? [
                {
                  type: "SubjectCombination",
                  id: result._id,
                },

                {
                  type: "SubjectCombination",
                  id: `STREAM-${streamId}`,
                },
              ]
            : [
                {
                  type: "SubjectCombination",
                  id: `STREAM-${streamId}`,
                },
              ],

        keepUnusedDataFor: 5,
      }),


      /* ==========================================================
         Update Subject Combination
         SUPER_ADMIN only

         Expected data:

         {
           subjectCombinationId,

           stream,
           name,
           code,

           subjects: [
             {
               subject,
               type: "CORE"
             },
             {
               subject,
               type: "ELECTIVE"
             }
           ],

           minimumElectives,
           maximumElectives
         }

         subjectCombinationId is used only for the URL.
      ========================================================== */

      updateSubjectCombination: builder.mutation({
        query: ({
          subjectCombinationId,
          ...data
        }) => ({
          url: `${SUBJECT_COMBINATION_URL}/${subjectCombinationId}`,
          method: "PUT",
          body: data,
        }),

        invalidatesTags: (
          result,
          error,
          {
            subjectCombinationId,
            stream,
          },
        ) => [
          {
            type: "SubjectCombination",
            id: subjectCombinationId,
          },

          {
            type: "SubjectCombination",
            id: "LIST",
          },

          ...(stream
            ? [
                {
                  type: "SubjectCombination",
                  id: `STREAM-${
                    typeof stream === "object"
                      ? stream._id
                      : stream
                  }`,
                },
              ]
            : []),

          ...(result?.stream?._id
            ? [
                {
                  type: "SubjectCombination",
                  id: `STREAM-${result.stream._id}`,
                },
              ]
            : []),
        ],
      }),


      /* ==========================================================
         Update Subject Combination Status
         SUPER_ADMIN only

         PATCH:
         /api/subject-combinations/:id/status

         Body:
         {
           isActive: true | false
         }
      ========================================================== */

      updateSubjectCombinationStatus: builder.mutation({
        query: ({
          subjectCombinationId,
          isActive,
        }) => ({
          url: `${SUBJECT_COMBINATION_URL}/${subjectCombinationId}/status`,
          method: "PATCH",
          body: {
            isActive,
          },
        }),

        invalidatesTags: (
          result,
          error,
          {
            subjectCombinationId,
          },
        ) => [
          {
            type: "SubjectCombination",
            id: subjectCombinationId,
          },

          {
            type: "SubjectCombination",
            id: "LIST",
          },

          ...(result?.stream?._id
            ? [
                {
                  type: "SubjectCombination",
                  id: `STREAM-${result.stream._id}`,
                },
              ]
            : []),
        ],
      }),
    }),
  });


export const {
  useCreateSubjectCombinationMutation,
  useGetSubjectCombinationsQuery,
  useGetSubjectCombinationDetailsQuery,
  useGetSubjectCombinationByStreamQuery,
  useUpdateSubjectCombinationMutation,
  useUpdateSubjectCombinationStatusMutation,
} = subjectCombinationApiSlice;
