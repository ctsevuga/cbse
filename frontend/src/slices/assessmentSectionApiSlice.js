import { apiSlice } from "./apiSlice";
import { ASESSMENT_SECTION_URL } from "../constants";

export const assessmentSectionApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      createAssessmentSection:
        builder.mutation({
          query: (data) => ({
            url: ASESSMENT_SECTION_URL,
            method: "POST",
            body: data,
          }),
          invalidatesTags: (
            result,
            error,
            data,
          ) => [
            {
              type: "AssessmentSection",
              id: "LIST",
            },
            "AssessmentSection",
            ...(data?.assessment
              ? [
                  {
                    type: "AssessmentSection",
                    id: `ASSESSMENT-${data.assessment}`,
                  },
                ]
              : []),
          ],
        }),

      getAssessmentSections:
        builder.query({
          query: (params = {}) => ({
            url: ASESSMENT_SECTION_URL,
            params,
          }),
          providesTags: (
            result,
            error,
            params = {},
          ) => {
            const tags = [
              {
                type: "AssessmentSection",
                id: "LIST",
              },
            ];

            if (result) {
              tags.push(
                ...result.map(
                  (section) => ({
                    type: "AssessmentSection",
                    id: section._id,
                  }),
                ),
              );
            }

            if (params.assessment) {
              tags.push({
                type: "AssessmentSection",
                id: `ASSESSMENT-${params.assessment}`,
              });
            }

            if (params.questionType) {
              tags.push({
                type: "AssessmentSection",
                id: `QUESTION-TYPE-${params.questionType}`,
              });
            }

            return tags;
          },
          keepUnusedDataFor: 5,
        }),

      getAssessmentSectionDetails:
        builder.query({
          query: (
            assessmentSectionId,
          ) => ({
            url: `${ASESSMENT_SECTION_URL}/${assessmentSectionId}`,
          }),
          providesTags: (
            result,
            error,
            assessmentSectionId,
          ) => {
            const tags = [
              {
                type: "AssessmentSection",
                id: assessmentSectionId,
              },
            ];

            if (result?.assessment?._id) {
              tags.push({
                type: "AssessmentSection",
                id: `ASSESSMENT-${result.assessment._id}`,
              });
            } else if (
              typeof result?.assessment ===
              "string"
            ) {
              tags.push({
                type: "AssessmentSection",
                id: `ASSESSMENT-${result.assessment}`,
              });
            }

            return tags;
          },
          keepUnusedDataFor: 5,
        }),

      getAssessmentSectionsByAssessment:
        builder.query({
          query: (assessmentId) => ({
            url: `${ASESSMENT_SECTION_URL}/assessment/${assessmentId}`,
          }),
          providesTags: (
            result,
            error,
            assessmentId,
          ) =>
            result
              ? [
                  ...result.map(
                    (section) => ({
                      type: "AssessmentSection",
                      id: section._id,
                    }),
                  ),
                  {
                    type: "AssessmentSection",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                  {
                    type: "AssessmentSection",
                    id: "LIST",
                  },
                ]
              : [
                  {
                    type: "AssessmentSection",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                  {
                    type: "AssessmentSection",
                    id: "LIST",
                  },
                ],
          keepUnusedDataFor: 5,
        }),

      getAssessmentSectionsByQuestionType:
        builder.query({
          query: (questionType) => ({
            url: `${ASESSMENT_SECTION_URL}/question-type/${questionType}`,
          }),
          providesTags: (
            result,
            error,
            questionType,
          ) =>
            result
              ? [
                  ...result.map(
                    (section) => ({
                      type: "AssessmentSection",
                      id: section._id,
                    }),
                  ),
                  {
                    type: "AssessmentSection",
                    id: `QUESTION-TYPE-${questionType}`,
                  },
                  {
                    type: "AssessmentSection",
                    id: "LIST",
                  },
                ]
              : [
                  {
                    type: "AssessmentSection",
                    id: `QUESTION-TYPE-${questionType}`,
                  },
                  {
                    type: "AssessmentSection",
                    id: "LIST",
                  },
                ],
          keepUnusedDataFor: 5,
        }),

      updateAssessmentSection:
        builder.mutation({
          query: ({
            assessmentSectionId,
            ...data
          }) => ({
            url: `${ASESSMENT_SECTION_URL}/${assessmentSectionId}`,
            method: "PUT",
            body: data,
          }),
          invalidatesTags: (
            result,
            error,
            {
              assessmentSectionId,
              assessment,
            },
          ) => [
            {
              type: "AssessmentSection",
              id: assessmentSectionId,
            },
            {
              type: "AssessmentSection",
              id: "LIST",
            },
            ...(assessment
              ? [
                  {
                    type: "AssessmentSection",
                    id: `ASSESSMENT-${assessment}`,
                  },
                ]
              : []),
            "AssessmentSection",
          ],
        }),

      deleteAssessmentSection:
        builder.mutation({
          query: (
            assessmentSectionId,
          ) => ({
            url: `${ASESSMENT_SECTION_URL}/${assessmentSectionId}`,
            method: "DELETE",
          }),
          invalidatesTags: (
            result,
            error,
            assessmentSectionId,
          ) => [
            {
              type: "AssessmentSection",
              id: assessmentSectionId,
            },
            {
              type: "AssessmentSection",
              id: "LIST",
            },
            "AssessmentSection",
          ],
        }),
    }),
  });

export const {
  useCreateAssessmentSectionMutation,
  useGetAssessmentSectionsQuery,
  useGetAssessmentSectionDetailsQuery,
  useGetAssessmentSectionsByAssessmentQuery,
  useGetAssessmentSectionsByQuestionTypeQuery,
  useUpdateAssessmentSectionMutation,
  useDeleteAssessmentSectionMutation,
} =
  assessmentSectionApiSlice;
