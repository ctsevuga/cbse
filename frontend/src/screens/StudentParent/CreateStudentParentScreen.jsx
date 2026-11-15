import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useCreateStudentParentMutation,
} from "../../slices/studentParentApiSlice";

import {
  useGetStudentsQuery,
} from "../../slices/studentApiSlice";

import {
  useGetParentsQuery,
} from "../../slices/parentApiSlice";

const initialFormData = {
  student: "",
  parent: "",
  relationship: "",
  isPrimary: false,
};

// ------------------------------------------------------
// Helper: Extract array from API response
// ------------------------------------------------------

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

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

const CreateStudentParentScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  // ----------------------------------------------------
  // RTK Queries
  // ----------------------------------------------------

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useGetStudentsQuery({
    isActive: true,
  });

  const {
    data: parentsResponse,
    isLoading: parentsLoading,
    isError: parentsError,
  } = useGetParentsQuery({
    isActive: true,
  });

  // ----------------------------------------------------
  // RTK Mutation
  // ----------------------------------------------------

  const [
    createStudentParent,
    { isLoading: isCreating },
  ] = useCreateStudentParentMutation();

  // ----------------------------------------------------
  // Extract Students and Parents
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // Relationship Options
  // ----------------------------------------------------

  const relationshipOptions = [
    { value: "FATHER", label: "Father" },
    { value: "MOTHER", label: "Mother" },
    { value: "GUARDIAN", label: "Guardian" },
    { value: "GRANDFATHER", label: "Grandfather" },
    { value: "GRANDMOTHER", label: "Grandmother" },
    { value: "OTHER", label: "Other" },
  ];

  // ----------------------------------------------------
  // Input Handler
  // ----------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  // ----------------------------------------------------
  // Submit Handler
  // ----------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.student) {
      toast.error("Please select a student");
      return;
    }

    if (!formData.parent) {
      toast.error("Please select a parent");
      return;
    }

    if (!formData.relationship) {
      toast.error("Please select the relationship");
      return;
    }

    try {
      const payload = {
        student: formData.student,
        parent: formData.parent,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
      };

      await createStudentParent(payload).unwrap();

      toast.success(
        "Student-parent relationship created successfully"
      );

      setFormData(initialFormData);

      navigate(-1);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to create student-parent relationship"
      );
    }
  };

  // ----------------------------------------------------
  // Loading State
  // ----------------------------------------------------

  if (studentsLoading || parentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-600">
          Loading students and parents...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // Error State
  // ----------------------------------------------------

  if (studentsError || parentsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">
          Failed to load students or parents.
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">

      {/* Page Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Student-Parent Relationship
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Associate a parent or guardian with a student.
        </p>
      </div>

      {/* Form Card */}

      <div className="bg-white shadow-md rounded-lg p-5 md:p-7">

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Student Dropdown */}

            <div>
              <label
                htmlFor="student"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Student
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                id="student"
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  -- Select Student --
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
                    {student.class?.name || "No Class"}
                    {" / "}
                    {student.section?.name || "No Section"}
                  </option>
                ))}
              </select>

              {students.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No active students available.
                </p>
              )}
            </div>

            {/* Parent Dropdown */}

            <div>
              <label
                htmlFor="parent"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Parent
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                id="parent"
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  -- Select Parent --
                </option>

                {parents.map((parent) => (
                  <option
                    key={parent._id}
                    value={parent._id}
                  >
                    {parent.user?.name || "Unnamed Parent"}
                    {" - "}
                    {parent.user?.phone || "No Phone Number"}
                  </option>
                ))}
              </select>

              {parents.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No active parents available.
                </p>
              )}
            </div>

            {/* Relationship Dropdown */}

            <div>
              <label
                htmlFor="relationship"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Relationship
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  -- Select Relationship --
                </option>

                {relationshipOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Parent Checkbox */}

            <div className="flex items-center pt-7">
              <input
                type="checkbox"
                id="isPrimary"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />

              <label
                htmlFor="isPrimary"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Set as Primary Parent
              </label>
            </div>

          </div>

          {/* Primary Parent Information */}

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A student can have multiple
              parents or guardians. Only one active relationship
              can be designated as the primary parent. Selecting
              this option will remove the primary designation
              from the student's existing primary parent.
            </p>
          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3 mt-8">

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isCreating}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isCreating ||
                students.length === 0 ||
                parents.length === 0
              }
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isCreating
                ? "Creating..."
                : "Create Relationship"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateStudentParentScreen;