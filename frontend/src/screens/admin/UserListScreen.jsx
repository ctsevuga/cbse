
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "../../slices/usersApiSlice";

import { toast } from "react-toastify";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();

        refetch();

        toast.success("User deleted successfully");
      } catch (err) {
        toast.error(
          err?.data?.message || err?.error || "Failed to delete user",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            School User Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage users belonging to your school
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">
              Loading school users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              {error?.data?.message || error?.error}
            </div>
          ) : users?.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No users found for this school.
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b hover:bg-blue-50 transition"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-800">
                          {user.name}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {user.email || "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          {user.phone || "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-red-100 text-red-700"
                                : user.role === "SCHOOL_ADMIN"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "HM"
                                    ? "bg-blue-100 text-blue-700"
                                    : user.role === "TEACHER"
                                      ? "bg-green-100 text-green-700"
                                      : user.role === "STUDENT"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {user.role !== "SCHOOL_ADMIN" &&
                            user.role !== "SUPER_ADMIN" && (
                              <div className="flex justify-center gap-3">
                                <Link
                                  to={`/admin/user/${user._id}/edit`}
                                  className="bg-blue-100 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"
                                >
                                  <FaEdit />
                                </Link>

                                <button
                                  onClick={() => deleteHandler(user._id)}
                                  className="bg-red-100 hover:bg-red-600 hover:text-white p-2 rounded-lg transition"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden p-4 space-y-5">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white rounded-2xl shadow-md border p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="font-bold text-lg text-gray-800">
                        {user.name}
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-red-100 text-red-700"
                            : user.role === "SCHOOL_ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "HM"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "TEACHER"
                                  ? "bg-green-100 text-green-700"
                                  : user.role === "STUDENT"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {user.email || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {user.phone || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>

                    {user.role !== "SCHOOL_ADMIN" &&
                      user.role !== "SUPER_ADMIN" && (
                        <div className="flex justify-end gap-3 mt-5">
                          <Link
                            to={`/admin/user/${user._id}/edit`}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
                          >
                            <FaEdit />
                            Edit
                          </Link>

                          <button
                            onClick={() => deleteHandler(user._id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListScreen;

