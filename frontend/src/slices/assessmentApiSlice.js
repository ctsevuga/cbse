import { apiSlice } from "./apiSlice";
import { ASSESSMENT_URL } from "../constants";

export const assessmentApiSlice =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /*
      ==========================================================
      Create Assessment
      ==========================================================
      *
      * School is NOT sent by the client.
      * Backend resolves school from req.schoolId.
      */
      createAssessment: builder.mutation({
        query: (data) => {
          const {
            school,
            ...assessmentData
          } = data;

          return {
            url: ASSESSMENT_URL,
            method: "POST",
            body: assessmentData,
          };
        },
        invalidatesTags: ["Assessment"],
      }),

      /*
      ==========================================================
      Get Assessments
      ==========================================================
      *
      * School is NOT accepted as a query parameter.
      * Backend resolves school from req.schoolId.
      *
      * Supported filters:
      * - academicYear
      * - class
      * - section
      * - stream
      * - subject
      * - assessmentType
      * - status
      * - createdBy
      */
      getAssessments: builder.query({
        query: (params = {}) => {
          const {
            school,
            ...filters
          } = params;

          return {
            url: ASSESSMENT_URL,
            params: filters,
          };
        },

        providesTags: (result) =>
          result
            ? [
                ...result.map(
                  (assessment) => ({
                    type: "Assessment",
                    id: assessment._id,
                  }),
                ),
                {
                  type: "Assessment",
                  id: "LIST",
                },
              ]
            : [
                {
                  type: "Assessment",
                  id: "LIST",
                },
              ],

        keepUnusedDataFor: 5,
      }),

      /*
==========================================================
Get Student Eligible Assessments
==========================================================

GET /api/assessments/student/eligible

- Uses the authenticated student's profile.
- School is resolved by the backend.
- No class, section, stream, or subject IDs are
  accepted from the frontend.
- Returns assessments eligible for the student.
*/
getStudentEligibleAssessments: builder.query({
  query: () => ({
    url: `${ASSESSMENT_URL}/student/eligible`,
  }),

  providesTags: (result) =>
    result
      ? [
          ...result.map((assessment) => ({
            type: "Assessment",
            id: assessment._id,
          })),
          {
            type: "Assessment",
            id: "STUDENT-ELIGIBLE",
          },
        ]
      : [
          {
            type: "Assessment",
            id: "STUDENT-ELIGIBLE",
          },
        ],

  keepUnusedDataFor: 5,
}),

      /*
      ==========================================================
      Get Assessment Details
      ==========================================================
      */
      getAssessmentDetails: builder.query({
        query: (assessmentId) => ({
          url: `${ASSESSMENT_URL}/${assessmentId}`,
        }),

        providesTags: (
          result,
          error,
          assessmentId,
        ) => [
          {
            type: "Assessment",
            id: assessmentId,
          },
        ],

        keepUnusedDataFor: 5,
      }),

      /*
      ==========================================================
      Get Assessments By Academic Year
      ==========================================================
      */
      getAssessmentsByAcademicYear:
        builder.query({
          query: (academicYearId) => ({
            url: `${ASSESSMENT_URL}/academic-year/${academicYearId}`,
          }),

          providesTags: (
            result,
            error,
            academicYearId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessment) => ({
                      type: "Assessment",
                      id: assessment._id,
                    }),
                  ),
                  {
                    type: "Assessment",
                    id: `ACADEMIC-YEAR-${academicYearId}`,
                  },
                ]
              : [
                  {
                    type: "Assessment",
                    id: `ACADEMIC-YEAR-${academicYearId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ==========================================================
      Get Assessments By Class
      ==========================================================
      */
      getAssessmentsByClass:
        builder.query({
          query: (classId) => ({
            url: `${ASSESSMENT_URL}/class/${classId}`,
          }),

          providesTags: (
            result,
            error,
            classId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessment) => ({
                      type: "Assessment",
                      id: assessment._id,
                    }),
                  ),
                  {
                    type: "Assessment",
                    id: `CLASS-${classId}`,
                  },
                ]
              : [
                  {
                    type: "Assessment",
                    id: `CLASS-${classId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ==========================================================
      Get Assessments By Section
      ==========================================================
      */
      getAssessmentsBySection:
        builder.query({
          query: (sectionId) => ({
            url: `${ASSESSMENT_URL}/section/${sectionId}`,
          }),

          providesTags: (
            result,
            error,
            sectionId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessment) => ({
                      type: "Assessment",
                      id: assessment._id,
                    }),
                  ),
                  {
                    type: "Assessment",
                    id: `SECTION-${sectionId}`,
                  },
                ]
              : [
                  {
                    type: "Assessment",
                    id: `SECTION-${sectionId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ==========================================================
      Get Assessments By Subject
      ==========================================================
      *
      * Subject is a GLOBAL MASTER.
      * No school parameter is sent.
      */
      getAssessmentsBySubject:
        builder.query({
          query: (subjectId) => ({
            url: `${ASSESSMENT_URL}/subject/${subjectId}`,
          }),

          providesTags: (
            result,
            error,
            subjectId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessment) => ({
                      type: "Assessment",
                      id: assessment._id,
                    }),
                  ),
                  {
                    type: "Assessment",
                    id: `SUBJECT-${subjectId}`,
                  },
                ]
              : [
                  {
                    type: "Assessment",
                    id: `SUBJECT-${subjectId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ==========================================================
      Get Assessments By Stream
      ==========================================================
      */
      getAssessmentsByStream:
        builder.query({
          query: (streamId) => ({
            url: `${ASSESSMENT_URL}/stream/${streamId}`,
          }),

          providesTags: (
            result,
            error,
            streamId,
          ) =>
            result
              ? [
                  ...result.map(
                    (assessment) => ({
                      type: "Assessment",
                      id: assessment._id,
                    }),
                  ),
                  {
                    type: "Assessment",
                    id: `STREAM-${streamId}`,
                  },
                ]
              : [
                  {
                    type: "Assessment",
                    id: `STREAM-${streamId}`,
                  },
                ],

          keepUnusedDataFor: 5,
        }),

      /*
      ==========================================================
      Get My Assessments
      ==========================================================
      *
      * School is resolved from authenticated user context.
      */
      getMyAssessments: builder.query({
        query: () => ({
          url: `${ASSESSMENT_URL}/my-assessments`,
        }),

        providesTags: (result) =>
          result
            ? [
                ...result.map(
                  (assessment) => ({
                    type: "Assessment",
                    id: assessment._id,
                  }),
                ),
                {
                  type: "Assessment",
                  id: "MY",
                },
              ]
            : [
                {
                  type: "Assessment",
                  id: "MY",
                },
              ],

        keepUnusedDataFor: 5,
      }),

      /*
      ==========================================================
      Update Assessment
      ==========================================================
      *
      * assessmentId is used only for the URL.
      * School is NOT sent in the body.
      */
      updateAssessment: builder.mutation({
        query: ({
          assessmentId,
          ...data
        }) => {
          const {
            school,
            ...assessmentData
          } = data;

          return {
            url: `${ASSESSMENT_URL}/${assessmentId}`,
            method: "PUT",
            body: assessmentData,
          };
        },

        invalidatesTags: (
          result,
          error,
          { assessmentId },
        ) => [
          {
            type: "Assessment",
            id: assessmentId,
          },
          {
            type: "Assessment",
            id: "LIST",
          },
          {
            type: "Assessment",
            id: "MY",
          },
          "Assessment",
        ],
      }),

      /*
      ==========================================================
      Update Assessment Status
      ==========================================================
      *
      * Only status is sent.
      * School is resolved from req.schoolId.
      */
      updateAssessmentStatus:
        builder.mutation({
          query: ({
            assessmentId,
            status,
          }) => ({
            url: `${ASSESSMENT_URL}/${assessmentId}/status`,
            method: "PATCH",
            body: {
              status,
            },
          }),

          invalidatesTags: (
            result,
            error,
            { assessmentId },
          ) => [
            {
              type: "Assessment",
              id: assessmentId,
            },
            {
              type: "Assessment",
              id: "LIST",
            },
            {
              type: "Assessment",
              id: "MY",
            },
            "Assessment",
          ],
        }),

      /*
      ==========================================================
      Delete Assessment
      ==========================================================
      *
      * School is resolved from req.schoolId.
      */
      deleteAssessment: builder.mutation({
        query: (assessmentId) => ({
          url: `${ASSESSMENT_URL}/${assessmentId}`,
          method: "DELETE",
        }),

        invalidatesTags: (
          result,
          error,
          assessmentId,
        ) => [
          {
            type: "Assessment",
            id: assessmentId,
          },
          {
            type: "Assessment",
            id: "LIST",
          },
          {
            type: "Assessment",
            id: "MY",
          },
          "Assessment",
        ],
      }),
    }),
  });

export const {
  useCreateAssessmentMutation,
  useGetAssessmentsQuery,
  useGetStudentEligibleAssessmentsQuery,
  useGetAssessmentDetailsQuery,
  useGetAssessmentsByAcademicYearQuery,
  useGetAssessmentsByClassQuery,
  useGetAssessmentsBySectionQuery,
  useGetAssessmentsBySubjectQuery,
  useGetAssessmentsByStreamQuery,
  useGetMyAssessmentsQuery,
  useUpdateAssessmentMutation,
  useUpdateAssessmentStatusMutation,
  useDeleteAssessmentMutation,
} = assessmentApiSlice;
