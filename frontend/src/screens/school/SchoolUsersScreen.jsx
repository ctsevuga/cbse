import React, { useMemo, useState } from "react";
import {
  Users,
  Search,
  UserCircle2,
  ShieldCheck,
  GraduationCap,
  UserCog,
  UserRound,
  Building2,
  Mail,
  Phone,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

import { useParams } from "react-router-dom";

import { useGetSchoolUsersQuery } from "../../slices/schoolApiSlice";

const SchoolUsersScreen = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSchoolUsersQuery(id);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search);

      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (counts, user) => {
        const role = user.role || "OTHER";

        counts[role] = (counts[role] || 0) + 1;

        return counts;
      },
      {},
    );
  }, [users]);

  const getRoleConfig = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          icon: ShieldCheck,
          classes:
            "bg-red-50 text-red-700 border-red-100",
        };

      case "SCHOOL_ADMIN":
        return {
          label: "School Admin",
          icon: UserCog,
          classes:
            "bg-purple-50 text-purple-700 border-purple-100",
        };

      case "HM":
        return {
          label: "Headmaster",
          icon: Building2,
          classes:
            "bg-blue-50 text-blue-700 border-blue-100",
        };

      case "TEACHER":
        return {
          label: "Teacher",
          icon: GraduationCap,
          classes:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
        };

      case "STUDENT":
        return {
          label: "Student",
          icon: UserRound,
          classes:
            "bg-amber-50 text-amber-700 border-amber-100",
        };

      case "PARENT":
        return {
          label: "Parent",
          icon: Users,
          classes:
            "bg-cyan-50 text-cyan-700 border-cyan-100",
        };

      default:
        return {
          label: role || "User",
          icon: UserCircle2,
          classes:
            "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-40 rounded-2xl bg-white shadow-sm" />

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="h-20 rounded-2xl bg-white shadow-sm" />

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-16 rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load School Users
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "We could not load the users for this school."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-8 sm:px-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute bottom-0 right-40 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <Users className="h-8 w-8 text-red-600" />
                </div>

                <div>
                  <p className="text-sm font-medium text-red-100">
                    School Management
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    School Users
                  </h1>

                  <p className="mt-1 text-sm text-red-100">
                    Manage and view users associated with this school.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />

                <div>
                  <p className="text-xs text-red-100">
                    Total Users
                  </p>

                  <p className="text-xl font-bold text-white">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Users"
            value={users.length}
            iconClass="bg-red-50 text-red-600"
          />

          <StatCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Administrators"
            value={
              (roleCounts.SUPER_ADMIN || 0) +
              (roleCounts.SCHOOL_ADMIN || 0) +
              (roleCounts.HM || 0)
            }
            iconClass="bg-purple-50 text-purple-600"
          />

          <StatCard
            icon={<GraduationCap className="h-5 w-5" />}
            label="Teachers"
            value={roleCounts.TEACHER || 0}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={<UserRound className="h-5 w-5" />}
            label="Students"
            value={roleCounts.STUDENT || 0}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone or role..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={roleFilter === "ALL"}
                onClick={() => setRoleFilter("ALL")}
                label={`All (${users.length})`}
              />

              {Object.entries(roleCounts).map(
                ([role, count]) => {
                  const config = getRoleConfig(role);

                  return (
                    <FilterButton
                      key={role}
                      active={roleFilter === role}
                      onClick={() => setRoleFilter(role)}
                      label={`${config.label} (${count})`}
                    />
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {(searchTerm || roleFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("ALL");
                }}
                className="inline-flex items-center justify-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No Users Found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                No users match the current search or role filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const roleConfig = getRoleConfig(
                        user.role,
                      );

                      const RoleIcon = roleConfig.icon;

                      return (
                        <tr
                          key={user._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                                {getInitials(user.name)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {user.name || "Unnamed User"}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${roleConfig.classes}`}
                            >
                              <RoleIcon className="h-3.5 w-3.5" />
                              {roleConfig.label}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {user.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span>{user.email}</span>
                                </div>
                              )}

                              {user.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{user.phone}</span>
                                </div>
                              )}

                              {!user.email && !user.phone && (
                                <span className="text-xs text-slate-400">
                                  No contact details
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                user.isActive === false
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.isActive === false
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                }`}
                              />

                              {user.isActive === false
                                ? "Inactive"
                                : "Active"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(user)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);

                  const RoleIcon = roleConfig.icon;

                  return (
                    <div
                      key={user._id}
                      className="p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2">
                            <div>
                              <h3 className="truncate text-sm font-bold text-slate-800">
                                {user.name || "Unnamed User"}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {user.email || "No email"}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${roleConfig.classes}`}
                            >
                              <RoleIcon className="h-3.5 w-3.5" />
                              {roleConfig.label}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            {user.email && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">
                                  {user.email}
                                </span>
                              </div>
                            )}

                            {user.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                user.isActive === false
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.isActive === false
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                }`}
                              />

                              {user.isActive === false
                                ? "Inactive"
                                : "Active"}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(user)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-lg font-bold text-red-600 shadow-sm">
                    {getInitials(selectedUser.name)}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedUser.name || "Unnamed User"}
                    </h2>

                    <p className="mt-1 text-sm text-red-100">
                      User Details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-2 text-white transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Role
                </p>

                <div className="mt-2">
                  {(() => {
                    const config = getRoleConfig(
                      selectedUser.role,
                    );

                    const RoleIcon = config.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.classes}`}
                      >
                        <RoleIcon className="h-4 w-4" />
                        {config.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <DetailRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={selectedUser.email}
              />

              <DetailRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={selectedUser.phone}
              />

              <DetailRow
                icon={<UserCircle2 className="h-4 w-4" />}
                label="User ID"
                value={selectedUser._id}
              />

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Account Status
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    selectedUser.isActive === false
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedUser.isActive === false
                    ? "Inactive"
                    : "Active"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-800">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
};

const FilterButton = ({
  active,
  onClick,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-red-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
};

export default SchoolUsersScreen;