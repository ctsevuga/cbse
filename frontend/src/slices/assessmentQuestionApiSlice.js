import { apiSlice } from "./apiSlice";
import { ASSESSMENT_QUESTION_URL } from "../constants";

export const assessmentQuestionApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /*
      ======================================================
      Create Assessment Question
      ======================================================
      
      School is NOT sent from the client.

      Backend determines the school from:
        req.schoolId

      Allowed roles:
        SCHOOL_ADMIN
        HM
        TEACHER
      */
      createAssessmentQuestion:
        builder.mutation({
          query: (data) => {
            // Prevent the client from sending a school
            // value to the controller.
            const {
              school,
              ...payload
            } = data;

            return {
              url: ASSESSMENT_QUESTION_URL,
              method: "POST",
              body: payload,
            };
          },

          invalidatesTags: [
            {
              type: "AssessmentQuestion",
              id: "LIST",
            },
            "AssessmentQuestion",
          ],
        }),

      /*
      ======================================================
      Get Assessment Questions
      ======================================================
      
      Optional supported query parameters:
        assessment
        section
        question
        questionGroup
        choiceGroup

      Do NOT send:
        school

      School is determined by the authenticated user.
      */
      getAssessmentQuestions:
        builder.query({
          query: (params = {}) => {
            const {
              school,
              ...safeParams
            } = params;

            return {
              url: ASSESSMENT_QUESTION_URL,
              params: safeParams,
            };
          },

          providesTags: (result) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: "LIST",
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: "LIST",
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Assessment Question By ID
      ======================================================
      */
      getAssessmentQuestionDetails:
        builder.query({
          query: (
            assessmentQuestionId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/${assessmentQuestionId}`,
          }),

          providesTags: (
            result,
            error,
            assessmentQuestionId,
          ) => [
            {
              type:
                "AssessmentQuestion",
              id:
                assessmentQuestionId,
            },
          ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Assessment
      ======================================================
      */
      getQuestionsByAssessment:
        builder.query({
          query: (assessmentId) => ({
            url: `${ASSESSMENT_QUESTION_URL}/assessment/${assessmentId}`,
          }),

          providesTags: (
            result,
            error,
            assessmentId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: `ASSESSMENT-${assessmentId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Section
      ======================================================
      */
      getQuestionsBySection:
        builder.query({
          query: (sectionId) => ({
            url: `${ASSESSMENT_QUESTION_URL}/section/${sectionId}`,
          }),

          providesTags: (
            result,
            error,
            sectionId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: `SECTION-${sectionId}`,
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: `SECTION-${sectionId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Question Group
      ======================================================
      */
      getQuestionsByQuestionGroup:
        builder.query({
          query: (
            questionGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/question-group/${questionGroupId}`,
          }),

          providesTags: (
            result,
            error,
            questionGroupId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: `QUESTION-GROUP-${questionGroupId}`,
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: `QUESTION-GROUP-${questionGroupId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Choice Group
      ======================================================
      */
      getQuestionsByChoiceGroup:
        builder.query({
          query: (
            choiceGroupId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/choice-group/${choiceGroupId}`,
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
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: `CHOICE-GROUP-${choiceGroupId}`,
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: `CHOICE-GROUP-${choiceGroupId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Get Questions By Question Type
      ======================================================
      */
      getQuestionsByQuestionType:
        builder.query({
          query: (questionType) => ({
            url: `${ASSESSMENT_QUESTION_URL}/question-type/${questionType}`,
          }),

          providesTags: (
            result,
            error,
            questionType,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessmentQuestion) => ({
                      type:
                        "AssessmentQuestion",
                      id:
                        assessmentQuestion._id,
                    }),
                  ),
                  {
                    type:
                      "AssessmentQuestion",
                    id: `QUESTION-TYPE-${questionType}`,
                  },
                ]
              : [
                  {
                    type:
                      "AssessmentQuestion",
                    id: `QUESTION-TYPE-${questionType}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ======================================================
      Update Assessment Question
      ======================================================
      
      School is NOT accepted as an update field.

      The backend always keeps:
        assessmentQuestion.school
          ===
        req.schoolId
      */
      updateAssessmentQuestion:
        builder.mutation({
          query: ({
            assessmentQuestionId,
            ...data
          }) => {
            // Prevent accidental school modification
            // from the frontend.
            const {
              school,
              ...payload
            } = data;

            return {
              url: `${ASSESSMENT_QUESTION_URL}/${assessmentQuestionId}`,
              method: "PUT",
              body: payload,
            };
          },

          invalidatesTags: (
            result,
            error,
            {
              assessmentQuestionId,
            },
          ) => {
            const tags = [
              {
                type:
                  "AssessmentQuestion",
                id:
                  assessmentQuestionId,
              },
              {
                type:
                  "AssessmentQuestion",
                id: "LIST",
              },
              "AssessmentQuestion",
            ];

            /*
             * If the updated record is returned,
             * invalidate its related collection caches.
             */
            if (result) {
              if (
                result.assessment?._id
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `ASSESSMENT-${result.assessment._id}`,
                });
              }

              if (
                result.section?._id
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `SECTION-${result.section._id}`,
                });
              }

              if (
                result.questionGroup?._id
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `QUESTION-GROUP-${result.questionGroup._id}`,
                });
              }

              if (
                result.choiceGroup?._id
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `CHOICE-GROUP-${result.choiceGroup._id}`,
                });
              }

              if (
                result.questionType
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `QUESTION-TYPE-${result.questionType}`,
                });
              }

              if (
                result.question?.questionType
              ) {
                tags.push({
                  type:
                    "AssessmentQuestion",
                  id: `QUESTION-TYPE-${result.question.questionType}`,
                });
              }
            }

            return tags;
          },
        }),

      /*
      ======================================================
      Delete Assessment Question
      ======================================================
      */
      deleteAssessmentQuestion:
        builder.mutation({
          query: (
            assessmentQuestionId,
          ) => ({
            url: `${ASSESSMENT_QUESTION_URL}/${assessmentQuestionId}`,
            method: "DELETE",
          }),

          invalidatesTags: (
            result,
            error,
            assessmentQuestionId,
          ) => [
            {
              type:
                "AssessmentQuestion",
              id:
                assessmentQuestionId,
            },
            {
              type:
                "AssessmentQuestion",
              id: "LIST",
            },
            "AssessmentQuestion",
          ],
        }),
    }),
  });

export const {
  useCreateAssessmentQuestionMutation,
  useGetAssessmentQuestionsQuery,
  useGetAssessmentQuestionDetailsQuery,
  useGetQuestionsByAssessmentQuery,
  useGetQuestionsBySectionQuery,
  useGetQuestionsByQuestionGroupQuery,
  useGetQuestionsByChoiceGroupQuery,
  useGetQuestionsByQuestionTypeQuery,
  useUpdateAssessmentQuestionMutation,
  useDeleteAssessmentQuestionMutation,
} = assessmentQuestionApiSlice;
