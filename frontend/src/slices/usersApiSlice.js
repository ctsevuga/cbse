import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ======================================================
    // AUTHENTICATION
    // ======================================================

    login: builder.mutation({
      query: ({ phone, password, schoolSlug }) => ({
        url: `${USERS_URL}/${encodeURIComponent(schoolSlug)}/auth`,
        method: "POST",
        body: {
          phone,
          password,
        },
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation({
      query: ({ slug, phone }) => ({
        url: `${USERS_URL}/${encodeURIComponent(slug)}/users/forgot-password`,
        method: "POST",
        body: {
          phone,
        },
      }),
      invalidatesTags: [
        { type: "User", id: "FORGOT_PASSWORD" },
      ],
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/change-password`,
        method: "PUT",
        body: data,
      }),
    }),

    // ======================================================
    // PASSWORD RESET MANAGEMENT
    // ======================================================

    getForgotPasswordUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}/forgot-password/users`,
      }),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map((user) => ({
                type: "User",
                id: user._id,
              })),
              {
                type: "User",
                id: "FORGOT_PASSWORD",
              },
            ]
          : [
              {
                type: "User",
                id: "FORGOT_PASSWORD",
              },
            ],
      keepUnusedDataFor: 5,
    }),

    // ======================================================
    // USER MANAGEMENT
    // ======================================================

    register: builder.mutation({
      query: (data) => ({
        url: USERS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        "User",
      ],
    }),

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((user) => ({
                type: "User",
                id: user._id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
      keepUnusedDataFor: 5,
    }),

    getUserDetails: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
      }),
      providesTags: (result, error, userId) => [
        { type: "User", id: userId },
      ],
      keepUnusedDataFor: 5,
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `${USERS_URL}/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "User",
      ],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "User",
      ],
    }),

    // ======================================================
    // LOGGED-IN USER PROFILE
    // ======================================================

    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGetForgotPasswordUsersQuery,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;