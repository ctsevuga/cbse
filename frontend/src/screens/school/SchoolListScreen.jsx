
import {
  useDeleteSchoolMutation,
  useGetSchoolsQuery,
  useUpdateSchoolStatusMutation,
} from "../../slices/schoolApiSlice";

import { toast } from "react-toastify";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const SchoolListScreen = () => {
  const navigate = useNavigate();

  const {
    data: schools,
    refetch,
    isLoading,
    error,
  } = useGetSchoolsQuery();

  const [deleteSchool] = useDeleteSchoolMutation();
  const [updateSchoolStatus, { isLoading: loadingStatus }] =
    useUpdateSchoolStatusMutation();

  const deleteHandler = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this school? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteSchool(id).unwrap();

      toast.success("School deleted successfully");
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to delete school",
      );
    }
  };

  const statusHandler = async (school) => {
    try {
      await updateSchoolStatus({
        id: school._id,
        isActive: !school.isActive,
      }).unwrap();

      toast.success(
        `School ${
          school.isActive ? "deactivated" : "activated"
        } successfully`,
      );

      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update school status",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
              School Management
            </h1>

            <p className="mt-2 text-gray-500">
              Manage schools and their administrator accounts
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/school/create")}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700"
          >
            + Create School
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-10 text-center text-gray-600">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              Loading schools...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="rounded-xl bg-red-100 p-4 text-red-700">
                {error?.data?.message ||
                  error?.error ||
                  "Failed to load schools"}
              </div>
            </div>
          ) : schools?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 text-5xl">🏫</div>

              <h2 className="text-xl font-bold text-gray-800">
                No Schools Found
              </h2>

              <p className="mt-2 text-gray-500">
                Create your first school to get started.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/school/create")
                }
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Create School
              </button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        School
                      </th>

                      <th className="px-6 py-4 text-left">
                        Code
                      </th>

                      <th className="px-6 py-4 text-left">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left">
                        Administrator
                      </th>

                      <th className="px-6 py-4 text-center">
                        Status
                      </th>

                      <th className="px-6 py-4 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {schools.map((school) => (
                      <tr
                        key={school._id}
                        className="border-b border-gray-100 transition hover:bg-blue-50"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <div className="font-bold text-gray-800">
                              {school.name}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              {school.slug}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {school.code}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          <div>
                            {school.contactDetails?.phone ||
                              "N/A"}
                          </div>

                          <div className="mt-1">
                            {school.contactDetails?.email ||
                              "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-700">
                            {school.createdBy?.name || "N/A"}
                          </div>

                          <div className="mt-1 text-sm text-gray-500">
                            {school.createdBy?.phone || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              school.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {school.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/admin/school/${school._id}`}
                              title="View School"
                              className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-600 hover:text-white"
                            >
                              <FaEye />
                            </Link>

                            <Link
                              to={`/admin/school/${school._id}/edit`}
                              title="Edit School"
                              className="rounded-lg bg-indigo-100 p-2 text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
                            >
                              <FaEdit />
                            </Link>

                            <button
                              type="button"
                              title={
                                school.isActive
                                  ? "Deactivate School"
                                  : "Activate School"
                              }
                              disabled={loadingStatus}
                              onClick={() =>
                                statusHandler(school)
                              }
                              className={`rounded-lg p-2 transition ${
                                school.isActive
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white"
                                  : "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {school.isActive ? (
                                <FaToggleOn />
                              ) : (
                                <FaToggleOff />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Delete School"
                              onClick={() =>
                                deleteHandler(school._id)
                              }
                              className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-600 hover:text-white"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-5 p-4 lg:hidden">
                {schools.map((school) => (
                  <div
                    key={school._id}
                    className="rounded-2xl border bg-white p-5 shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {school.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {school.slug}
                        </p>
                      </div>

                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          school.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {school.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">
                          Code:
                        </span>{" "}
                        {school.code}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Phone:
                        </span>{" "}
                        {school.contactDetails?.phone ||
                          "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Email:
                        </span>{" "}
                        {school.contactDetails?.email ||
                          "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Administrator:
                        </span>{" "}
                        {school.createdBy?.name || "N/A"}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Link
                        to={`/admin/school/${school._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <FaEye />
                        View
                      </Link>

                      <Link
                        to={`/admin/school/${school._id}/edit`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        <FaEdit />
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={loadingStatus}
                        onClick={() =>
                          statusHandler(school)
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${
                          school.isActive
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-600 hover:bg-green-700"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {school.isActive ? (
                          <FaToggleOff />
                        ) : (
                          <FaToggleOn />
                        )}

                        {school.isActive
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteHandler(school._id)
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
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

export default SchoolListScreen;

