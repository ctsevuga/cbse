
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetStudentParentDetailsQuery,
  useUpdateStudentParentMutation,
} from "../../slices/studentParentApiSlice";

// ------------------------------------------------------
// Initial Form State
// ------------------------------------------------------

const initialFormData = {
  relationship: "",
  isPrimary: false,
  isActive: true,
};

// ------------------------------------------------------
// Relationship Options
// ------------------------------------------------------

const relationshipOptions = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "GRANDFATHER", label: "Grandfather" },
  { value: "GRANDMOTHER", label: "Grandmother" },
  { value: "OTHER", label: "Other" },
];

// ------------------------------------------------------
// Edit Student Parent Screen
// ------------------------------------------------------

const EditStudentParentScreen = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  // ----------------------------------------------------
  // Form State
  // ----------------------------------------------------

  const [formData, setFormData] = useState(initialFormData);

  // ----------------------------------------------------
  // Get Student Parent Details
  // ----------------------------------------------------

  const {
    data: relationshipData,
    isLoading,
    isError,
    error,
  } = useGetStudentParentDetailsQuery(id, {
    skip: !id,
  });

  // ----------------------------------------------------
  // Update Mutation
  // ----------------------------------------------------

  const [
    updateStudentParent,
    { isLoading: isUpdating },
  ] = useUpdateStudentParentMutation();

  // ----------------------------------------------------
  // Populate Form When Data Is Loaded
  // ----------------------------------------------------

  useEffect(() => {
    if (relationshipData) {
      setFormData({
        relationship:
          relationshipData.relationship || "",

        isPrimary:
          relationshipData.isPrimary ?? false,

        isActive:
          relationshipData.isActive ?? true,
      });
    }
  }, [relationshipData]);

  // ----------------------------------------------------
  // Input Change Handler
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

    if (!formData.relationship) {
      toast.error("Please select a relationship");
      return;
    }

    if (!formData.isActive && formData.isPrimary) {
      toast.error(
        "An inactive relationship cannot be a primary parent"
      );
      return;
    }

    try {
      const payload = {
        studentParentId: id,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
        isActive: formData.isActive,
      };

      await updateStudentParent(payload).unwrap();

      toast.success(
        "Student-parent relationship updated successfully"
      );

      navigate(`/student-parents/${id}`);

    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update student-parent relationship"
      );
    }
  };

  // ----------------------------------------------------
  // Loading State
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-600">
          Loading student-parent details...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // Error State
  // ----------------------------------------------------

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">

          <p className="text-red-600">
            {error?.data?.message ||
              "Failed to load student-parent details"}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back
          </button>

        </div>
      </div>
    );
  }

  if (!relationshipData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">
          Student-parent relationship not found.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Back
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // Extract Student and Parent Details
  // ----------------------------------------------------

  const student = relationshipData.student || {};
  const parent = relationshipData.parent || {};

  const studentName =
    student.user?.name || "N/A";

  const parentName =
    parent.user?.name || "N/A";

  // ----------------------------------------------------
  // Main Render
  // ----------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">

      {/* -------------------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------------------- */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Edit Student-Parent Relationship
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Update parent relationship and status.
        </p>

      </div>

      {/* -------------------------------------------- */}
      {/* Student and Parent Information */}
      {/* -------------------------------------------- */}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-5 mb-6">

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Relationship Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-gray-500">
              Student Name
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {studentName}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Admission Number:{" "}
              {student.admissionNumber || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Parent Name
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {parentName}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Phone: {parent.user?.phone || "N/A"}
            </p>
          </div>

        </div>

      </div>

      {/* -------------------------------------------- */}
      {/* Edit Form */}
      {/* -------------------------------------------- */}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-5 md:p-7">

        <form onSubmit={handleSubmit}>

          <div className="space-y-6">

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
                disabled={isUpdating}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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

            {/* Primary Parent */}

            <div className="border border-gray-200 rounded-md p-4">

              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  id="isPrimary"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  disabled={
                    isUpdating || !formData.isActive
                  }
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                <div>
                  <label
                    htmlFor="isPrimary"
                    className="text-sm font-medium text-gray-800"
                  >
                    Set as Primary Parent
                  </label>

                  <p className="text-xs text-gray-500 mt-1">
                    Only one active primary parent is
                    allowed per student. Selecting this
                    option will remove the primary
                    designation from the existing parent.
                  </p>
                </div>

              </div>

            </div>

            {/* Active Status */}

            <div className="border border-gray-200 rounded-md p-4">

              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                      isPrimary: checked
                        ? prev.isPrimary
                        : false,
                    }));
                  }}
                  disabled={isUpdating}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                <div>
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-800"
                  >
                    Active Relationship
                  </label>

                  <p className="text-xs text-gray-500 mt-1">
                    Uncheck to deactivate this
                    student-parent relationship.
                    Deactivating a primary relationship
                    will also remove its primary status.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* ---------------------------------------- */}
          {/* Buttons */}
          {/* ---------------------------------------- */}

          <div className="flex justify-end gap-3 mt-8">

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isUpdating}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isUpdating
                ? "Updating..."
                : "Update Relationship"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditStudentParentScreen;
