
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetStudentParentDetailsQuery,
} from "../../slices/studentParentApiSlice";

// ------------------------------------------------------
// Helper: Format Date
// ------------------------------------------------------

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ------------------------------------------------------
// Reusable Detail Row
// ------------------------------------------------------

const DetailRow = ({ label, value }) => (
  <div className="py-3 border-b border-gray-100">
    <p className="text-sm text-gray-500 mb-1">
      {label}
    </p>

    <p className="text-sm font-medium text-gray-800">
      {value || "N/A"}
    </p>
  </div>
);

// ------------------------------------------------------
// Reusable Section Card
// ------------------------------------------------------

const DetailCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
    <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-3 border-b">
      {title}
    </h2>

    {children}
  </div>
);

// ------------------------------------------------------
// Student Parent Details Screen
// ------------------------------------------------------

const StudentParentDetailsScreen = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  // ----------------------------------------------------
  // RTK Query
  // ----------------------------------------------------

  const {
    data: relationship,
    isLoading,
    isError,
    error,
  } = useGetStudentParentDetailsQuery(id, {
    skip: !id,
  });

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
              "Failed to load student-parent details."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // No Data
  // ----------------------------------------------------

  if (!relationship) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">
          Student-parent relationship not found.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Back
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // Extract Data
  // ----------------------------------------------------

  const student = relationship.student || {};
  const parent = relationship.parent || {};

  const studentUser = student.user || {};
  const parentUser = parent.user || {};

  // ----------------------------------------------------
  // Main Render
  // ----------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">

      {/* -------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------- */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student-Parent Relationship Details
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View student, parent and relationship information.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/student-parents/${id}/edit`)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>

        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* Relationship Status */}
      {/* -------------------------------------------- */}

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 mb-6">

        <div className="flex flex-wrap items-center gap-3">

          <span className="text-sm text-gray-500">
            Relationship:
          </span>

          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            {relationship.relationship || "N/A"}
          </span>

          {relationship.isPrimary && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
              Primary Parent
            </span>
          )}

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              relationship.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {relationship.isActive ? "Active" : "Inactive"}
          </span>

        </div>

      </div>

      {/* -------------------------------------------- */}
      {/* Details Grid */}
      {/* -------------------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========================================== */}
        {/* Student Information */}
        {/* ========================================== */}

        <DetailCard title="Student Information">

          <DetailRow
            label="Student Name"
            value={studentUser.name}
          />

          <DetailRow
            label="Admission Number"
            value={student.admissionNumber}
          />

          <DetailRow
            label="Phone Number"
            value={studentUser.phone}
          />

          <DetailRow
            label="Date of Birth"
            value={formatDate(student.dateOfBirth)}
          />

          <DetailRow
            label="Gender"
            value={student.gender}
          />

          <DetailRow
            label="Academic Year"
            value={
              student.academicYear?.name ||
              student.academicYear?.year
            }
          />

          <DetailRow
            label="Class"
            value={student.class?.name}
          />

          <DetailRow
            label="Section"
            value={student.section?.name}
          />

          <DetailRow
            label="Stream"
            value={student.stream?.name}
          />

        </DetailCard>

        {/* ========================================== */}
        {/* Parent Information */}
        {/* ========================================== */}

        <DetailCard title="Parent / Guardian Information">

          <DetailRow
            label="Parent Name"
            value={parentUser.name}
          />

          <DetailRow
            label="Phone Number"
            value={parentUser.phone}
          />

          <DetailRow
            label="Email"
            value={parentUser.email}
          />

          <DetailRow
            label="Relationship"
            value={relationship.relationship}
          />

          <DetailRow
            label="Primary Parent"
            value={
              relationship.isPrimary ? "Yes" : "No"
            }
          />

          <DetailRow
            label="Parent Account Status"
            value={
              parent.isActive ? "Active" : "Inactive"
            }
          />

        </DetailCard>

      </div>

      {/* -------------------------------------------- */}
      {/* Relationship Audit Information */}
      {/* -------------------------------------------- */}

      <div className="mt-6">

        <DetailCard title="Relationship Information">

          <DetailRow
            label="Relationship ID"
            value={relationship._id}
          />

          <DetailRow
            label="Created On"
            value={formatDate(relationship.createdAt)}
          />

          <DetailRow
            label="Last Updated"
            value={formatDate(relationship.updatedAt)}
          />

        </DetailCard>

      </div>

    </div>
  );
};

export default StudentParentDetailsScreen;
