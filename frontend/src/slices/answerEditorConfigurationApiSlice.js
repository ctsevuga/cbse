import { apiSlice } from "./apiSlice";
import { ANSWER_EDITOR_CONFIGURATION_URL } from "../constants";

export const answerEditorConfigurationApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /* ==========================================================
         Create Answer Editor Configuration
         POST /api/answer-editor-configurations
         SUPER_ADMIN only
      ========================================================== */
      createAnswerEditorConfiguration:
        builder.mutation({
          query: (data) => ({
            url: ANSWER_EDITOR_CONFIGURATION_URL,
            method: "POST",
            body: data,
          }),
          invalidatesTags: [
            "AnswerEditorConfiguration",
          ],
        }),

      /* ==========================================================
         Get All Answer Editor Configurations
         GET /api/answer-editor-configurations
      ========================================================== */
      getAnswerEditorConfigurations:
        builder.query({
          query: (params = {}) => ({
            url: ANSWER_EDITOR_CONFIGURATION_URL,
            params,
          }),
          providesTags: (result) =>
            result
              ? [
                  ...result.map(
                    (configuration) => ({
                      type:
                        "AnswerEditorConfiguration",
                      id: configuration._id,
                    }),
                  ),
                  {
                    type:
                      "AnswerEditorConfiguration",
                    id: "LIST",
                  },
                ]
              : [
                  {
                    type:
                      "AnswerEditorConfiguration",
                    id: "LIST",
                  },
                ],
          keepUnusedDataFor: 5,
        }),

      /* ==========================================================
         Get Answer Editor Configurations By Subject
         GET /api/answer-editor-configurations/subject/:subjectId
      ========================================================== */
      getAnswerEditorConfigurationsBySubject:
        builder.query({
          query: (subjectId) => ({
            url: `${ANSWER_EDITOR_CONFIGURATION_URL}/subject/${subjectId}`,
          }),
          providesTags: (result, error, subjectId) =>
            result
              ? [
                  ...result.map(
                    (configuration) => ({
                      type:
                        "AnswerEditorConfiguration",
                      id: configuration._id,
                    }),
                  ),
                  {
                    type:
                      "AnswerEditorConfiguration",
                    id: `SUBJECT-${subjectId}`,
                  },
                ]
              : [
                  {
                    type:
                      "AnswerEditorConfiguration",
                    id: `SUBJECT-${subjectId}`,
                  },
                ],
          keepUnusedDataFor: 5,
        }),

      /* ==========================================================
         Get Answer Editor Configuration By ID
         GET /api/answer-editor-configurations/:id
      ========================================================== */
      getAnswerEditorConfigurationDetails:
        builder.query({
          query: (configurationId) => ({
            url: `${ANSWER_EDITOR_CONFIGURATION_URL}/${configurationId}`,
          }),
          providesTags: (
            result,
            error,
            configurationId,
          ) => [
            {
              type:
                "AnswerEditorConfiguration",
              id: configurationId,
            },
          ],
          keepUnusedDataFor: 5,
        }),

      /* ==========================================================
         Update Answer Editor Configuration
         PUT /api/answer-editor-configurations/:id
         SUPER_ADMIN only
      ========================================================== */
      updateAnswerEditorConfiguration:
        builder.mutation({
          query: ({
            configurationId,
            ...data
          }) => ({
            url: `${ANSWER_EDITOR_CONFIGURATION_URL}/${configurationId}`,
            method: "PUT",
            body: data,
          }),
          invalidatesTags: (
            result,
            error,
            { configurationId },
          ) => [
            {
              type:
                "AnswerEditorConfiguration",
              id: configurationId,
            },
            {
              type:
                "AnswerEditorConfiguration",
              id: "LIST",
            },
            "AnswerEditorConfiguration",
          ],
        }),

      /* ==========================================================
         Update Status
         PATCH /api/answer-editor-configurations/:id/status
         SUPER_ADMIN only
      ========================================================== */
      updateAnswerEditorConfigurationStatus:
        builder.mutation({
          query: ({
            configurationId,
            isActive,
          }) => ({
            url: `${ANSWER_EDITOR_CONFIGURATION_URL}/${configurationId}/status`,
            method: "PATCH",
            body: { isActive },
          }),
          invalidatesTags: (
            result,
            error,
            { configurationId },
          ) => [
            {
              type:
                "AnswerEditorConfiguration",
              id: configurationId,
            },
            {
              type:
                "AnswerEditorConfiguration",
              id: "LIST",
            },
            "AnswerEditorConfiguration",
          ],
        }),

      /* ==========================================================
         Delete Answer Editor Configuration
         DELETE /api/answer-editor-configurations/:id
         SUPER_ADMIN only
      ========================================================== */
      deleteAnswerEditorConfiguration:
        builder.mutation({
          query: (configurationId) => ({
            url: `${ANSWER_EDITOR_CONFIGURATION_URL}/${configurationId}`,
            method: "DELETE",
          }),
          invalidatesTags: (
            result,
            error,
            configurationId,
          ) => [
            {
              type:
                "AnswerEditorConfiguration",
              id: configurationId,
            },
            {
              type:
                "AnswerEditorConfiguration",
              id: "LIST",
            },
            "AnswerEditorConfiguration",
          ],
        }),
    }),
  });

export const {
  useCreateAnswerEditorConfigurationMutation,
  useGetAnswerEditorConfigurationsQuery,
  useGetAnswerEditorConfigurationsBySubjectQuery,
  useGetAnswerEditorConfigurationDetailsQuery,
  useUpdateAnswerEditorConfigurationMutation,
  useUpdateAnswerEditorConfigurationStatusMutation,
  useDeleteAnswerEditorConfigurationMutation,
} = answerEditorConfigurationApiSlice;