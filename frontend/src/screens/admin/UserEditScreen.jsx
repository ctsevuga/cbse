
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../slices/usersApiSlice";

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const { data: user, isLoading, error } =
    useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] =
    useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setPhone(user.phone || "");
      setIsActive(user.isActive ?? true);
      setMustChangePassword(user.mustChangePassword ?? false);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !role) {
      toast.error("Name, phone number and role are required");
      return;
    }

    try {
      await updateUser({
        userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        isActive,
        mustChangePassword,
      }).unwrap();

      toast.success("User updated successfully");

      navigate("/admin/userlist");
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "User update failed";

      if (message === "User not found") {
        toast.error("User does not belong to this school.");
      } else if (
        message === "Cannot remove the last school administrator"
      ) {
        toast.error(
          "Cannot remove the last school administrator. Create another administrator before changing this role.",
        );
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/admin/userlist"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white shadow hover:bg-blue-50 text-blue-600 transition"
        >
          ← Back to Users
        </Link>

        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/30 p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Edit User
            </h1>

            <p className="text-gray-500 mt-2">
              Update school user information
            </p>
          </div>

          {loadingUpdate && (
            <div className="mb-6 rounded-xl bg-blue-100 text-blue-700 p-4 text-center">
              Updating user...
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10 text-gray-600">
              Loading user details...
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-100 text-red-700 p-4 text-center">
              {error?.data?.message || error?.error}
            </div>
          ) : (
            <form
              onSubmit={submitHandler}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                >
                  <option value="">Select Role</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                  <option value="HM">Headmaster</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Account Status
                </label>

                <select
                  value={isActive}
                  onChange={(e) =>
                    setIsActive(e.target.value === "true")
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Password Status
                </label>

                <select
                  value={mustChangePassword}
                  onChange={(e) =>
                    setMustChangePassword(
                      e.target.value === "true",
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                >
                  <option value="false">
                    Normal Login
                  </option>
                  <option value="true">
                    Require Password Change
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {loadingUpdate ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEditScreen;

