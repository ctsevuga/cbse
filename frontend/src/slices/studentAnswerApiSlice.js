import { apiSlice } from "./apiSlice";
import { STUDENT_ANSWER_URL } from "../constants";

export const studentAnswerApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      /*
      ============================================================
      SAVE STUDENT ANSWER
      POST /api/student-answers/save
      ============================================================

      Body:
      {
        attemptId,
        assessmentQuestionId,
        answerMode,
        answer,
        selectedOption,
        attachments
      }

      School and student are NOT sent from the client.
      They are derived/validated by the backend from the
      authenticated user and attempt.
      */
      saveStudentAnswer: builder.mutation({
        query: (data) => ({
          url: `${STUDENT_ANSWER_URL}/save`,
          method: "POST",
          body: data,
        }),

        invalidatesTags: (
          result,
          error,
          data,
        ) => [
          {
            type: "StudentAnswer",
            id: result?._id,
          },

          {
            type: "StudentAnswer",
            id: "MY",
          },

          {
            type: "StudentAnswer",
            id: "LIST",
          },

          {
            type: "StudentAnswer",
            id: `ATTEMPT-${data?.attemptId}`,
          },

          {
            type: "StudentAnswer",
            id: `QUESTION-${data?.assessmentQuestionId}`,
          },
        ],
      }),


      /*
      ============================================================
      GET MY STUDENT ANSWERS
      GET /api/student-answers/my

      Optional query params:
        ?attemptId=...
        ?status=SAVED
        ?status=SUBMITTED
      ============================================================
      */
      getMyStudentAnswers: builder.query({
        query: (params = {}) => ({
          url: `${STUDENT_ANSWER_URL}/my`,
          params,
        }),

        providesTags: (
          result,
          error,
          params,
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: "MY",
            },
          ];

          if (result) {
            tags.push(
              ...result.map(
                (answer) => ({
                  type: "StudentAnswer",
                  id: answer._id,
                }),
              ),
            );
          }

          /*
           * If this query is filtered by attempt,
           * create an attempt-specific cache tag.
           */
          if (params?.attemptId) {
            tags.push({
              type: "StudentAnswer",
              id: `ATTEMPT-${params.attemptId}`,
            });
          }

          tags.push({
            type: "StudentAnswer",
            id: "LIST",
          });

          return tags;
        },

        keepUnusedDataFor: 5,
      }),


      /*
      ============================================================
      GET ANSWERS BY ATTEMPT
      GET /api/student-answers/attempt/:attemptId
      ============================================================
      */
      getAnswersByAttempt: builder.query({
        query: (attemptId) => ({
          url: `${STUDENT_ANSWER_URL}/attempt/${attemptId}`,
        }),

        providesTags: (
          result,
          error,
          attemptId,
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: `ATTEMPT-${attemptId}`,
            },
          ];

          if (result) {
            tags.push(
              ...result.map(
                (answer) => ({
                  type: "StudentAnswer",
                  id: answer._id,
                }),
              ),
            );
          }

          return tags;
        },

        keepUnusedDataFor: 5,
      }),


      /*
      ============================================================
      GET ANSWER BY ASSESSMENT QUESTION
      GET /api/student-answers/attempt/:attemptId/question/:assessmentQuestionId
      ============================================================
      */
      getAnswerByAssessmentQuestion:
        builder.query({
          query: ({
            attemptId,
            assessmentQuestionId,
          }) => ({
            url:
              `${STUDENT_ANSWER_URL}` +
              `/attempt/${attemptId}` +
              `/question/${assessmentQuestionId}`,
          }),

          providesTags: (
            result,
            error,
            {
              attemptId,
              assessmentQuestionId,
            },
          ) => [
            {
              type: "StudentAnswer",
              id:
                result?._id ||
                `QUESTION-${assessmentQuestionId}`,
            },

            {
              type: "StudentAnswer",
              id: `ATTEMPT-${attemptId}`,
            },

            {
              type: "StudentAnswer",
              id: `QUESTION-${assessmentQuestionId}`,
            },
          ],

          keepUnusedDataFor: 5,
        }),


      /*
      ============================================================
      GET STUDENT ANSWERS
      GET /api/student-answers

      Intended for:
        Teacher
        HM
        Admin

      Optional filters:
        ?attemptId=...
        ?studentId=...
        ?assessmentQuestionId=...
        ?status=...
      ============================================================
      */
      
getStudentAnswers: builder.query({
  query: (params = {}) => ({
    url: STUDENT_ANSWER_URL,
    params,
  }),

  providesTags: (result, error, params) => {
    const tags = [
      {
        type: "StudentAnswer",
        id: "LIST",
      },
    ];

    if (Array.isArray(result)) {
      tags.push(
        ...result.map((answer) => ({
          type: "StudentAnswer",
          id: answer._id,
        })),
      );
    }

    if (params?.attemptId) {
      tags.push({
        type: "StudentAnswer",
        id: `ATTEMPT-${params.attemptId}`,
      });
    }

    if (params?.studentId) {
      tags.push({
        type: "StudentAnswer",
        id: `STUDENT-${params.studentId}`,
      });
    }

    if (params?.assessmentQuestionId) {
      tags.push({
        type: "StudentAnswer",
        id: `QUESTION-${params.assessmentQuestionId}`,
      });
    }

    return tags;
  },

  keepUnusedDataFor: 5,
}),



      /*
      ============================================================
      GET STUDENT ANSWER BY ID
      GET /api/student-answers/:id
      ============================================================
      */
      getStudentAnswerDetails: builder.query({
        query: (answerId) => ({
          url:
            `${STUDENT_ANSWER_URL}/${answerId}`,
        }),

        providesTags: (
          result,
          error,
          answerId,
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: answerId,
            },
          ];

          if (result?.attempt?._id) {
            tags.push({
              type: "StudentAnswer",
              id:
                `ATTEMPT-${result.attempt._id}`,
            });
          }

          if (
            result?.assessmentQuestion?._id
          ) {
            tags.push({
              type: "StudentAnswer",
              id:
                `QUESTION-${result.assessmentQuestion._id}`,
            });
          }

          return tags;
        },

        keepUnusedDataFor: 5,
      }),


      /*
      ============================================================
      UPDATE STUDENT ANSWER
      PUT /api/student-answers/:id

      Body can contain:
        answerMode
        answer
        selectedOption
        attachments
      ============================================================
      */
      updateStudentAnswer: builder.mutation({
        query: ({
          answerId,
          ...data
        }) => ({
          url:
            `${STUDENT_ANSWER_URL}/${answerId}`,
          method: "PUT",
          body: data,
        }),

        invalidatesTags: (
          result,
          error,
          {
            answerId,
          },
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: answerId,
            },

            {
              type: "StudentAnswer",
              id: "MY",
            },

            {
              type: "StudentAnswer",
              id: "LIST",
            },
          ];

          if (result?.attempt?._id) {
            tags.push({
              type: "StudentAnswer",
              id:
                `ATTEMPT-${result.attempt._id}`,
            });
          }

          if (
            result?.assessmentQuestion?._id
          ) {
            tags.push({
              type: "StudentAnswer",
              id:
                `QUESTION-${result.assessmentQuestion._id}`,
            });
          }

          return tags;
        },
      }),


      /*
      ============================================================
      SUBMIT ONE STUDENT ANSWER
      PATCH /api/student-answers/:id/submit
      ============================================================
      */
      submitStudentAnswer: builder.mutation({
        query: (answerId) => ({
          url:
            `${STUDENT_ANSWER_URL}/${answerId}/submit`,
          method: "PATCH",
        }),

        invalidatesTags: (
          result,
          error,
          answerId,
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: answerId,
            },

            {
              type: "StudentAnswer",
              id: "MY",
            },

            {
              type: "StudentAnswer",
              id: "LIST",
            },
          ];

          if (result?.attempt?._id) {
            tags.push({
              type: "StudentAnswer",
              id:
                `ATTEMPT-${result.attempt._id}`,
            });
          }

          if (
            result?.assessmentQuestion?._id
          ) {
            tags.push({
              type: "StudentAnswer",
              id:
                `QUESTION-${result.assessmentQuestion._id}`,
            });
          }

          return tags;
        },
      }),


      /*
      ============================================================
      SUBMIT ALL ANSWERS FOR AN ATTEMPT
      PATCH /api/student-answers/attempt/:attemptId/submit-all
      ============================================================
      */
      submitAllStudentAnswers:
        builder.mutation({
          query: (attemptId) => ({
            url:
              `${STUDENT_ANSWER_URL}` +
              `/attempt/${attemptId}/submit-all`,
            method: "PATCH",
          }),

          invalidatesTags: (
            result,
            error,
            attemptId,
          ) => {
            const tags = [
              {
                type: "StudentAnswer",
                id:
                  `ATTEMPT-${attemptId}`,
              },

              {
                type: "StudentAnswer",
                id: "MY",
              },

              {
                type: "StudentAnswer",
                id: "LIST",
              },
            ];

            /*
             * If the controller returns submitted
             * answers, invalidate their individual
             * cache entries too.
             */
            if (Array.isArray(
              result?.answers,
            )) {
              tags.push(
                ...result.answers.map(
                  (answer) => ({
                    type: "StudentAnswer",
                    id: answer._id,
                  }),
                ),
              );
            }

            return tags;
          },
        }),


      /*
      ============================================================
      UPDATE ANSWER STATUS
      PATCH /api/student-answers/:id/status

      Staff only:
        Teacher
        HM
        Admin
      ============================================================
      */
      updateStudentAnswerStatus:
        builder.mutation({
          query: ({
            answerId,
            status,
          }) => ({
            url:
              `${STUDENT_ANSWER_URL}/${answerId}/status`,
            method: "PATCH",
            body: {
              status,
            },
          }),

          invalidatesTags: (
            result,
            error,
            {
              answerId,
            },
          ) => {
            const tags = [
              {
                type: "StudentAnswer",
                id: answerId,
              },

              {
                type: "StudentAnswer",
                id: "LIST",
              },

              {
                type: "StudentAnswer",
                id: "MY",
              },
            ];

            if (result?.attempt?._id) {
              tags.push({
                type: "StudentAnswer",
                id:
                  `ATTEMPT-${result.attempt._id}`,
              });
            }

            if (
              result?.assessmentQuestion?._id
            ) {
              tags.push({
                type: "StudentAnswer",
                id:
                  `QUESTION-${result.assessmentQuestion._id}`,
              });
            }

            return tags;
          },
        }),


      /*
      ============================================================
      DELETE STUDENT ANSWER
      DELETE /api/student-answers/:id
      ============================================================
      */
      deleteStudentAnswer: builder.mutation({
        query: (answerId) => ({
          url:
            `${STUDENT_ANSWER_URL}/${answerId}`,
          method: "DELETE",
        }),

        invalidatesTags: (
          result,
          error,
          answerId,
        ) => {
          const tags = [
            {
              type: "StudentAnswer",
              id: answerId,
            },

            {
              type: "StudentAnswer",
              id: "MY",
            },

            {
              type: "StudentAnswer",
              id: "LIST",
            },
          ];

          /*
           * The current delete controller only returns:
           *
           * {
           *   message,
           *   id
           * }
           *
           * Therefore the attempt ID is not available
           * from the mutation result.
           *
           * The LIST/MY invalidation handles the affected
           * collections.
           */
          return tags;
        },
      }),
    }),
  });


export const {
  useSaveStudentAnswerMutation,

  useGetMyStudentAnswersQuery,

  useGetAnswersByAttemptQuery,

  useGetAnswerByAssessmentQuestionQuery,

  useGetStudentAnswersQuery,

  useGetStudentAnswerDetailsQuery,

  useUpdateStudentAnswerMutation,

  useSubmitStudentAnswerMutation,

  useSubmitAllStudentAnswersMutation,

  useUpdateStudentAnswerStatusMutation,

  useDeleteStudentAnswerMutation,
} = studentAnswerApiSlice;
