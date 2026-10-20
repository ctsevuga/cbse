import { apiSlice } from "./apiSlice";
import { ASSESSMENT_QUESTION_URL } from "../constants";

export const assessmentChoiceGroupApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /*
      ======================================================
      Create Assessment Choice Group
      ======================================================
      POST /api/assessment-questions/choice-groups
      */

      createAssessmentChoiceGroup:
        builder.mutation({
          query: (data) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups`,
            method: "POST",
            body: data,
          }),

          invalidatesTags: [
            "AssessmentChoiceGroup",
            "AssessmentQuestion",
          ],
        }),

      /*
      ======================================================
      Get Assessment Choice Groups
      ======================================================
      GET /api/assessment-questions/choice-groups
      */

      getAssessmentChoiceGroups:
        builder.query({
          query: (params = {}) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups`,
            params,
          }),

          providesTags: (result) =>
            result
              ? [
                  ...result.map(
                    (choiceGroup) => ({
                      type: "AssessmentChoiceGroup",
                      id: choiceGroup._id,
                    }),
                  ),
                  {
                    type: "AssessmentChoiceGroup",
                    id: "LIST",
                  },
                ]
              : [
                  {
                    type: "AssessmentChoiceGroup",
                    id: "LIST",
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Assessment Choice Group Details
      ======================================================
      GET /api/assessment-questions/choice-groups/:id
      */

      getAssessmentChoiceGroupDetails:
        builder.query({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}`,
          }),

          providesTags: (
            result,
            error,
            choiceGroupId,
          ) => [
            {
              type: "AssessmentChoiceGroup",
              id: choiceGroupId,
            },
          ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Choice Groups By Assessment
      ======================================================
      GET
      /api/assessment-questions/choice-groups/assessment/:assessmentId
      */

      getChoiceGroupsByAssessment:
        builder.query({
          query: (
            assessmentId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/assessment/${assessmentId}`,
          }),

          providesTags: (
            result,
            error,
            assessmentId,
          ) =>
            result
              ? [
                  ...result.map(
                    (choiceGroup) => ({
                      type: "AssessmentChoiceGroup",
                      id: choiceGroup._id,
                    }),
                  ),
                  {
                    type: "AssessmentChoiceGroup",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                ]
              : [
                  {
                    type: "AssessmentChoiceGroup",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Choice Groups By Section
      ======================================================
      GET
      /api/assessment-questions/choice-groups/section/:sectionId
      */

      getChoiceGroupsBySection:
        builder.query({
          query: (
            sectionId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/section/${sectionId}`,
          }),

          providesTags: (
            result,
            error,
            sectionId,
          ) =>
            result
              ? [
                  ...result.map(
                    (choiceGroup) => ({
                      type: "AssessmentChoiceGroup",
                      id: choiceGroup._id,
                    }),
                  ),
                  {
                    type: "AssessmentChoiceGroup",
                    id: `SECTION-${sectionId}`,
                  },
                ]
              : [
                  {
                    type: "AssessmentChoiceGroup",
                    id: `SECTION-${sectionId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Choice Group
      ======================================================
      GET
      /api/assessment-questions/choice-groups/:id/questions
      */

      getQuestionsByChoiceGroup:
        builder.query({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}/questions`,
          }),

          providesTags: (
            result,
            error,
            choiceGroupId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type: "AssessmentQuestion",
                      id: assessmentQuestion._id,
                    }),
                  ),
                  {
                    type: "AssessmentChoiceGroup",
                    id: `QUESTIONS-${choiceGroupId}`,
                  },
                ]
              : [
                  {
                    type: "AssessmentChoiceGroup",
                    id: `QUESTIONS-${choiceGroupId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Update Assessment Choice Group
      ======================================================
      PUT /api/assessment-questions/choice-groups/:id
      */

      updateAssessmentChoiceGroup:
        builder.mutation({
          query: ({
            choiceGroupId,
            ...data
          }) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}`,
            method: "PUT",
            body: data,
          }),

          invalidatesTags: (
            result,
            error,
            {
              choiceGroupId,
            },
          ) => [
            {
              type: "AssessmentChoiceGroup",
              id: choiceGroupId,
            },
            {
              type: "AssessmentChoiceGroup",
              id: "LIST",
            },
            "AssessmentChoiceGroup",
            "AssessmentQuestion",
          ],
        }),

      /*
      ======================================================
      Delete Assessment Choice Group
      ======================================================
      DELETE /api/assessment-questions/choice-groups/:id
      */

      deleteAssessmentChoiceGroup:
        builder.mutation({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}`,
            method: "DELETE",
          }),

          invalidatesTags: (
            result,
            error,
            choiceGroupId,
          ) => [
            {
              type: "AssessmentChoiceGroup",
              id: choiceGroupId,
            },
            {
              type: "AssessmentChoiceGroup",
              id: "LIST",
            },
            "AssessmentChoiceGroup",
            "AssessmentQuestion",
          ],
        }),

      /*
      ======================================================
      Activate Choice Group
      ======================================================
      PATCH
      /api/assessment-questions/choice-groups/:id/activate
      */

      activateAssessmentChoiceGroup:
        builder.mutation({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}/activate`,
            method: "PATCH",
          }),

          invalidatesTags: (
            result,
            error,
            choiceGroupId,
          ) => [
            {
              type: "AssessmentChoiceGroup",
              id: choiceGroupId,
            },
            {
              type: "AssessmentChoiceGroup",
              id: "LIST",
            },
            "AssessmentChoiceGroup",
          ],
        }),

      /*
      ======================================================
      Deactivate Choice Group
      ======================================================
      PATCH
      /api/assessment-questions/choice-groups/:id/deactivate
      */

      deactivateAssessmentChoiceGroup:
        builder.mutation({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-groups/${choiceGroupId}/deactivate`,
            method: "PATCH",
          }),

          invalidatesTags: (
            result,
            error,
            choiceGroupId,
          ) => [
            {
              type: "AssessmentChoiceGroup",
              id: choiceGroupId,
            },
            {
              type: "AssessmentChoiceGroup",
              id: "LIST",
            },
            "AssessmentChoiceGroup",
            "AssessmentQuestion",
          ],
        }),
    }),
  });

export const {
  useCreateAssessmentChoiceGroupMutation,
  useGetAssessmentChoiceGroupsQuery,
  useGetAssessmentChoiceGroupDetailsQuery,
  useGetChoiceGroupsByAssessmentQuery,
  useGetChoiceGroupsBySectionQuery,
  useGetQuestionsByChoiceGroupQuery,
  useUpdateAssessmentChoiceGroupMutation,
  useDeleteAssessmentChoiceGroupMutation,
  useActivateAssessmentChoiceGroupMutation,
  useDeactivateAssessmentChoiceGroupMutation,
} = assessmentChoiceGroupApiSlice;
