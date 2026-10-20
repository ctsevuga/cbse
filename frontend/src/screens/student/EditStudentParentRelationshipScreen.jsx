import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  HeartHandshake,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  useGetStudentParentDetailsQuery,
  useUpdateStudentParentMutation,
} from "../../slices/studentParentApiSlice";

/*
  Edit ONE student-parent relationship.

  Route:
  /admin/student-parents/:id/edit

  :id = StudentParent relationship ID

  Student is READ-ONLY because this screen only modifies
  the parent/guardian relationship.
*/

const EditStudentParentRelationshipScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: relationship,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetStudentParentDetailsQuery(id, {
    skip: !id,
  });

  const [
    updateStudentParent,
    { isLoading: isUpdating },
  ] = useUpdateStudentParentMutation();

  const [formData, setFormData] = useState({
    parent: "",
    relationship: "OTHER",
    isPrimary: false,
    isActive: true,
  });

  /*
    Populate form when relationship data is loaded.
  */
  useEffect(() => {
    if (!relationship) {
      return;
    }

    setFormData({
      parent:
        relationship.parent?._id ||
        relationship.parent ||
        "",

      relationship:
        relationship.relationship || "OTHER",

      isPrimary: Boolean(
        relationship.isPrimary,
      ),

      isActive:
        relationship.isActive !== false,
    });
  }, [relationship]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
    Return to the Student Details page.
  */
  const handleCancel = () => {
    const studentId =
      relationship?.student?._id ||
      relationship?.student;

    if (studentId) {
      navigate(`/admin/students/${studentId}`);
      return;
    }

    navigate("/admin/students");
  };

  /*
    Save relationship changes.
  */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!relationship?._id) {
      toast.error(
        "Student-parent relationship could not be identified.",
      );
      return;
    }

    if (!formData.parent) {
      toast.error("Parent / Guardian is required.");
      return;
    }

    if (!formData.relationship) {
      toast.error(
        "Please select a relationship type.",
      );
      return;
    }

    const payload = {
      id: relationship._id,
      parent: formData.parent,
      relationship: formData.relationship,
      isPrimary: formData.isPrimary,
      isActive: formData.isActive,
    };

    try {
      await updateStudentParent(payload).unwrap();

      toast.success(
        "Parent relationship updated successfully.",
      );

      const studentId =
        relationship.student?._id ||
        relationship.student;

      if (studentId) {
        navigate(`/admin/students/${studentId}`);
      } else {
        navigate("/admin/students");
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update parent relationship.",
      );
    }
  };

  /*
    Loading state
  */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading relationship...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
    Error state
  */
  if (isError || !relationship) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Unable to load relationship
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {error?.data?.message ||
                error?.error ||
                "The student-parent relationship could not be loaded."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/students")
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const student = relationship.student;
  const parent = relationship.parent;

  const studentName =
    student?.user?.name ||
    student?.name ||
    "Unnamed Student";

  const parentName =
    parent?.user?.name ||
    parent?.name ||
    "Unnamed Parent";

  const relationshipOptions = [
    {
      value: "FATHER",
      label: "Father",
    },
    {
      value: "MOTHER",
      label: "Mother",
    },
    {
      value: "GUARDIAN",
      label: "Guardian",
    },
    {
      value: "GRANDFATHER",
      label: "Grandfather",
    },
    {
      value: "GRANDMOTHER",
      label: "Grandmother",
    },
    {
      value: "UNCLE",
      label: "Uncle",
    },
    {
      value: "AUNT",
      label: "Aunt",
    },
    {
      value: "OTHER",
      label: "Other",
    },
  ];

  const selectedRelationshipLabel =
    relationshipOptions.find(
      (option) =>
        option.value ===
        formData.relationship,
    )?.label ||
    formData.relationship;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">

        {/* PAGE HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Student Details
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <HeartHandshake className="h-7 w-7 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Edit Parent Relationship
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Update the relationship between the
                student and parent/guardian.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          <div className="border-b border-gray-100 bg-indigo-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Relationship Details
                </h2>

                <p className="text-xs text-gray-500">
                  Configure the parent/guardian relationship.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">

            {/* STUDENT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Student
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {studentName}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Student cannot be changed from this screen.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  Locked
                </span>
              </div>
            </div>

            {/* PARENT */}

            <div>
              <label
                htmlFor="parent"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Parent / Guardian
              </label>

              <div className="relative">
                <select
                  id="parent"
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                  disabled
                  className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-gray-100 px-4 pr-10 text-sm font-medium text-gray-700 outline-none disabled:cursor-not-allowed disabled:opacity-90"
                >
                  <option value={formData.parent}>
                    {parentName}
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Parent switching is disabled because the
                relationship details endpoint does not provide
                a selectable parent list.
              </p>
            </div>

            {/* RELATIONSHIP */}

            <div>
              <label
                htmlFor="relationship"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Relationship
              </label>

              <div className="relative">
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  disabled={isUpdating}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  {relationshipOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* PRIMARY */}

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  disabled={isUpdating}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />

                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    Primary guardian
                  </span>

                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                    Mark this parent/guardian as the primary
                    contact for the student.
                  </span>
                </span>
              </label>
            </div>

            {/* ACTIVE STATUS */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800">
                  Relationship Status
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Controls whether this relationship is
                  currently active.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* ACTIVE */}

                <label
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    formData.isActive
                      ? "border-green-300 bg-green-50 ring-2 ring-green-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={
                      formData.isActive === true
                    }
                    onChange={() =>
                      setFormData((current) => ({
                        ...current,
                        isActive: true,
                      }))
                    }
                    disabled={isUpdating}
                    className="sr-only"
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Active
                      </p>

                      <p className="text-xs text-gray-500">
                        Relationship is enabled.
                      </p>
                    </div>
                  </div>
                </label>

                {/* INACTIVE */}

                <label
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    formData.isActive === false
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    checked={
                      formData.isActive === false
                    }
                    onChange={() =>
                      setFormData((current) => ({
                        ...current,
                        isActive: false,
                      }))
                    }
                    disabled={isUpdating}
                    className="sr-only"
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <UserX className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Inactive
                      </p>

                      <p className="text-xs text-gray-500">
                        Relationship is disabled.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Current Relationship
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-gray-800">
                  {studentName}
                </span>

                <span className="text-gray-400">
                  →
                </span>

                <span className="font-semibold text-gray-800">
                  {parentName}
                </span>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  {selectedRelationshipLabel}
                </span>

                {formData.isPrimary && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Primary
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    formData.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {formData.isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <UserX className="h-3.5 w-3.5" />
                  )}

                  {formData.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating || isFetching}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Student information is locked because this
          relationship is being edited from the Student
          Details page.
        </p>
      </div>
    </div>
  );
};

export default EditStudentParentRelationshipScreen;
