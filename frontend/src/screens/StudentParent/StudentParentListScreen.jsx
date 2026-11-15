
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetStudentParentsQuery,
  useDeleteStudentParentMutation,
} from "../../slices/studentParentApiSlice";

import {
  useGetStudentsQuery,
} from "../../slices/studentApiSlice";

import {
  useGetParentsQuery,
} from "../../slices/parentApiSlice";

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  return [];
};

const StudentParentListScreen = () => {
  const navigate = useNavigate();

  // --------------------------------------------------
  // Filter State
  // --------------------------------------------------

  const [studentFilter, setStudentFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // --------------------------------------------------
  // Students Dropdown
  // --------------------------------------------------

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useGetStudentsQuery({
    isActive: true,
  });

  // --------------------------------------------------
  // Parents Dropdown
  // --------------------------------------------------

  const {
    data: parentsResponse,
    isLoading: parentsLoading,
    isError: parentsError,
  } = useGetParentsQuery({
    isActive: true,
  });

  const students = useMemo(
    () =>
      getArray(studentsResponse, [
        "students",
        "results",
      ]),
    [studentsResponse]
  );

  const parents = useMemo(
    () =>
      getArray(parentsResponse, [
        "parents",
        "results",
      ]),
    [parentsResponse]
  );

  // --------------------------------------------------
  // Build Filter Parameters
  // --------------------------------------------------

  const queryParams = useMemo(() => {
    const params = {};

    if (studentFilter) {
      params.student = studentFilter;
    }

    if (parentFilter) {
      params.parent = parentFilter;
    }

    return params;
  }, [studentFilter, parentFilter]);

  // --------------------------------------------------
  // Student Parent List
  // --------------------------------------------------

  const {
    data: relationshipsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetStudentParentsQuery(queryParams);

  const relationships = useMemo(
    () =>
      getArray(relationshipsResponse, [
        "relationships",
        "studentParents",
        "results",
      ]),
    [relationshipsResponse]
  );

  // --------------------------------------------------
  // Delete Mutation
  // --------------------------------------------------

  const [
    deleteStudentParent,
    { isLoading: isDeleting },
  ] = useDeleteStudentParentMutation();

  // --------------------------------------------------
  // Reset Filters
  // --------------------------------------------------

  const handleReset = () => {
    setStudentFilter("");
    setParentFilter("");
  };

  // --------------------------------------------------
  // View Handler
  // --------------------------------------------------

  const handleView = (id) => {
    navigate(`/student-parents/${id}`);
  };

  // --------------------------------------------------
  // Edit Handler
  // --------------------------------------------------

  const handleEdit = (id) => {
    navigate(`/student-parents/${id}/edit`);
  };

  // --------------------------------------------------
  // Delete Handler
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student-parent relationship?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteStudentParent(id).unwrap();

      toast.success(
        "Student-parent relationship deleted successfully"
      );

      // Refresh the list
      await refetch();

    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to delete student-parent relationship"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (studentsLoading || parentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-600">
          Loading students and parents...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Dropdown Loading Error
  // --------------------------------------------------

  if (studentsError || parentsError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Failed to load students or parents.
        Please refresh the page.
      </div>
    );
  }

  // --------------------------------------------------
  // Main Component
  // --------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">

      {/* -------------------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------------------- */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Student-Parent Relationships
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage student and parent associations.
        </p>
      </div>

      {/* -------------------------------------------- */}
      {/* Filters */}
      {/* -------------------------------------------- */}

      <div className="bg-white rounded-lg shadow p-5 mb-6">

        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Filter Relationships
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Student Filter */}

          <div>
            <label
              htmlFor="studentFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Student
            </label>

            <select
              id="studentFilter"
              value={studentFilter}
              onChange={(e) =>
                setStudentFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">
                All Students
              </option>

              {students.map((student) => (
                <option
                  key={student._id}
                  value={student._id}
                >
                  {student.user?.name || "Unnamed Student"}
                  {" - "}
                  {student.admissionNumber || "No Admission Number"}
                  {" - "}
                  {student.class?.name || ""}
                  {" "}
                  {student.section?.name || ""}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Filter */}

          <div>
            <label
              htmlFor="parentFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Parent
            </label>

            <select
              id="parentFilter"
              value={parentFilter}
              onChange={(e) =>
                setParentFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">
                All Parents
              </option>

              {parents.map((parent) => (
                <option
                  key={parent._id}
                  value={parent._id}
                >
                  {parent.user?.name || "Unnamed Parent"}
                  {" - "}
                  {parent.user?.phone || "No Phone"}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Buttons */}

        <div className="flex justify-end gap-3 mt-5">

          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isFetching ? "Loading..." : "Refresh"}
          </button>

        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* Relationship List */}
      {/* -------------------------------------------- */}

      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Relationship List
          </h2>

          <span className="text-sm text-gray-500">
            Total: {relationships.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Loading relationships...
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-600">
            {error?.data?.message ||
              "Failed to load student-parent relationships."}
          </div>
        ) : relationships.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No student-parent relationships found.
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Admission No.
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Parent
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Relationship
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Primary
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">

                {relationships.map((item, index) => {

                  const student = item.student;
                  const parent = item.parent;

                  const studentName =
                    student?.user?.name || "N/A";

                  const parentName =
                    parent?.user?.name || "N/A";

                  const phone =
                    parent?.user?.phone || "N/A";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50"
                    >

                      {/* Serial Number */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {index + 1}
                      </td>

                      {/* Student */}

                      <td className="px-4 py-4 text-sm font-medium text-gray-800">
                        {studentName}
                        <div className="text-xs text-gray-500">
                          {student?.class?.name || ""}
                          {" "}
                          {student?.section?.name || ""}
                        </div>
                      </td>

                      {/* Admission Number */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {student?.admissionNumber || "N/A"}
                      </td>

                      {/* Parent */}

                      <td className="px-4 py-4 text-sm text-gray-800">
                        {parentName}
                      </td>

                      {/* Phone */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {phone}
                      </td>

                      {/* Relationship */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {item.relationship}
                      </td>

                      {/* Primary */}

                      <td className="px-4 py-4 text-center">

                        {item.isPrimary ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                            Primary
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No
                          </span>
                        )}

                      </td>

                      {/* Status */}

                      <td className="px-4 py-4 text-center">

                        {item.isActive ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* Actions */}

                      <td className="px-4 py-4">

                        <div className="flex justify-center items-center gap-2">

                          <button
                            type="button"
                            onClick={() => handleView(item._id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(item._id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            disabled={
                              isDeleting &&
                              deletingId === item._id
                            }
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === item._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default StudentParentListScreen;
