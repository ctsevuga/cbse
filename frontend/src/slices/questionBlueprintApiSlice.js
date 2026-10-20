
import { apiSlice } from "./apiSlice";
import { QUESTION_BLUEPRINT_URL } from "../constants";

const questionBlueprintTag = (id) => ({
  type: "QuestionBlueprint",
  id,
});

export const questionBlueprintApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      createQuestionBlueprint: builder.mutation({
        query: (data) => ({
          url: QUESTION_BLUEPRINT_URL,
          method: "POST",
          body: data,
        }),
        invalidatesTags: [
          {
            type: "QuestionBlueprint",
            id: "LIST",
          },
          {
            type: "QuestionBlueprint",
            id: "MY",
          },
        ],
      }),

      getQuestionBlueprints: builder.query({
        query: (params = {}) => {
          const {
            academicYear,
            class: classId,
            subject,
            stream,
            isActive,
          } = params;

          const queryParams = {};

          if (academicYear) {
            queryParams.academicYear = academicYear;
          }

          if (classId) {
            queryParams.class = classId;
          }

          if (subject) {
            queryParams.subject = subject;
          }

          if (stream) {
            queryParams.stream = stream;
          }

          if (isActive !== undefined) {
            queryParams.isActive = isActive;
          }

          return {
            url: QUESTION_BLUEPRINT_URL,
            params: queryParams,
          };
        },

        providesTags: (result) =>
          result
            ? [
                ...result.map((blueprint) =>
                  questionBlueprintTag(blueprint._id),
                ),
                {
                  type: "QuestionBlueprint",
                  id: "LIST",
                },
              ]
            : [
                {
                  type: "QuestionBlueprint",
                  id: "LIST",
                },
              ],

        keepUnusedDataFor: 5,
      }),

      getQuestionBlueprintDetails: builder.query({
        query: (questionBlueprintId) => ({
          url: `${QUESTION_BLUEPRINT_URL}/${questionBlueprintId}`,
        }),

        providesTags: (result, error, questionBlueprintId) => [
          questionBlueprintTag(questionBlueprintId),
        ],

        keepUnusedDataFor: 5,
      }),

      getQuestionBlueprintsByAcademicYear:
        builder.query({
          query: (academicYearId) => ({
            url: `${QUESTION_BLUEPRINT_URL}/academic-year/${academicYearId}`,
          }),

          providesTags: (
            result,
            error,
            academicYearId,
          ) =>
            result
              ? [
                  ...result.map((blueprint) =>
                    questionBlueprintTag(
                      blueprint._id,
                    ),
                  ),
                  {
                    type: "QuestionBlueprint",
                    id: `ACADEMIC-YEAR-${academicYearId}`,
                  },
                ]
              : [
                  {
                    type: "QuestionBlueprint",
                    id: `ACADEMIC-YEAR-${academicYearId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      getQuestionBlueprintsByClass:
        builder.query({
          query: (classId) => ({
            url: `${QUESTION_BLUEPRINT_URL}/class/${classId}`,
          }),

          providesTags: (
            result,
            error,
            classId,
          ) =>
            result
              ? [
                  ...result.map((blueprint) =>
                    questionBlueprintTag(
                      blueprint._id,
                    ),
                  ),
                  {
                    type: "QuestionBlueprint",
                    id: `CLASS-${classId}`,
                  },
                ]
              : [
                  {
                    type: "QuestionBlueprint",
                    id: `CLASS-${classId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      getQuestionBlueprintsBySubject:
        builder.query({
          query: (subjectId) => ({
            url: `${QUESTION_BLUEPRINT_URL}/subject/${subjectId}`,
          }),

          providesTags: (
            result,
            error,
            subjectId,
          ) =>
            result
              ? [
                  ...result.map((blueprint) =>
                    questionBlueprintTag(
                      blueprint._id,
                    ),
                  ),
                  {
                    type: "QuestionBlueprint",
                    id: `SUBJECT-${subjectId}`,
                  },
                ]
              : [
                  {
                    type: "QuestionBlueprint",
                    id: `SUBJECT-${subjectId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      getQuestionBlueprintsByStream:
        builder.query({
          query: (streamId) => ({
            url: `${QUESTION_BLUEPRINT_URL}/stream/${streamId}`,
          }),

          providesTags: (
            result,
            error,
            streamId,
          ) =>
            result
              ? [
                  ...result.map((blueprint) =>
                    questionBlueprintTag(
                      blueprint._id,
                    ),
                  ),
                  {
                    type: "QuestionBlueprint",
                    id: `STREAM-${streamId}`,
                  },
                ]
              : [
                  {
                    type: "QuestionBlueprint",
                    id: `STREAM-${streamId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      getMyQuestionBlueprints:
        builder.query({
          query: () => ({
            url: `${QUESTION_BLUEPRINT_URL}/my-blueprints`,
          }),

          providesTags: (result) =>
            result
              ? [
                  ...result.map((blueprint) =>
                    questionBlueprintTag(
                      blueprint._id,
                    ),
                  ),
                  {
                    type: "QuestionBlueprint",
                    id: "MY",
                  },
                ]
              : [
                  {
                    type: "QuestionBlueprint",
                    id: "MY",
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      updateQuestionBlueprint:
        builder.mutation({
          query: ({
            questionBlueprintId,
            ...data
          }) => ({
            url: `${QUESTION_BLUEPRINT_URL}/${questionBlueprintId}`,
            method: "PUT",
            body: data,
          }),

          invalidatesTags: (
            result,
            error,
            { questionBlueprintId },
          ) => [
            questionBlueprintTag(
              questionBlueprintId,
            ),
            {
              type: "QuestionBlueprint",
              id: "LIST",
            },
            {
              type: "QuestionBlueprint",
              id: "MY",
            },
          ],
        }),

      updateQuestionBlueprintStatus:
        builder.mutation({
          query: ({
            questionBlueprintId,
            isActive,
          }) => ({
            url: `${QUESTION_BLUEPRINT_URL}/${questionBlueprintId}/status`,
            method: "PATCH",
            body: {
              isActive,
            },
          }),

          invalidatesTags: (
            result,
            error,
            { questionBlueprintId },
          ) => [
            questionBlueprintTag(
              questionBlueprintId,
            ),
            {
              type: "QuestionBlueprint",
              id: "LIST",
            },
            {
              type: "QuestionBlueprint",
              id: "MY",
            },
          ],
        }),

      deleteQuestionBlueprint:
        builder.mutation({
          query: (questionBlueprintId) => ({
            url: `${QUESTION_BLUEPRINT_URL}/${questionBlueprintId}`,
            method: "DELETE",
          }),

          invalidatesTags: (
            result,
            error,
            questionBlueprintId,
          ) => [
            questionBlueprintTag(
              questionBlueprintId,
            ),
            {
              type: "QuestionBlueprint",
              id: "LIST",
            },
            {
              type: "QuestionBlueprint",
              id: "MY",
            },
          ],
        }),
    }),
  });

export const {
  useCreateQuestionBlueprintMutation,
  useGetQuestionBlueprintsQuery,
  useGetQuestionBlueprintDetailsQuery,
  useGetQuestionBlueprintsByAcademicYearQuery,
  useGetQuestionBlueprintsByClassQuery,
  useGetQuestionBlueprintsBySubjectQuery,
  useGetQuestionBlueprintsByStreamQuery,
  useGetMyQuestionBlueprintsQuery,
  useUpdateQuestionBlueprintMutation,
  useUpdateQuestionBlueprintStatusMutation,
  useDeleteQuestionBlueprintMutation,
} = questionBlueprintApiSlice;
