import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useCreateTeacherMutation } from "../../slices/teacherApiSlice";

// Change these imports to match your project.
import { useGetUsersQuery } from "../../slices/usersApiSlice";
import { useGetSchoolsQuery } from "../../slices/schoolApiSlice";

const CreateTeacherScreen = () => {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const [user, setUser] = useState("");
  const [school, setSchool] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [qualification, setQualification] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [showUserList, setShowUserList] = useState(false);

  const [createTeacher, { isLoading }] =
    useCreateTeacherMutation();

  /*
   * ------------------------------------------------------------------
   * Users
   * ------------------------------------------------------------------
   *
   * Adjust the query arguments according to your usersApiSlice.
   *
   * Ideally this endpoint should return users having:
   * role = "TEACHER"
   *
   * and users belonging to the selected school.
   */
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetUsersQuery({
    role: "TEACHER",
    school,
  });

  /*
   * ------------------------------------------------------------------
   * Schools
   * ------------------------------------------------------------------
   */
  const {
    data: schoolsData,
    isLoading: isSchoolsLoading,
    isError: isSchoolsError,
  } = useGetSchoolsQuery();

  const users = useMemo(() => {
    if (Array.isArray(usersData)) {
      return usersData;
    }

    return (
      usersData?.users ||
      usersData?.data ||
      []
    );
  }, [usersData]);

  const schools = useMemo(() => {
    if (Array.isArray(schoolsData)) {
      return schoolsData;
    }

    return (
      schoolsData?.schools ||
      schoolsData?.data ||
      []
    );
  }, [schoolsData]);

  /*
   * If your application allows a user to create teachers only
   * inside their own school, automatically select that school.
   */
  useEffect(() => {
    if (
      userInfo?.school &&
      !school
    ) {
      const schoolId =
        typeof userInfo.school === "object"
          ? userInfo.school._id
          : userInfo.school;

      if (schoolId) {
        setSchool(String(schoolId));
      }
    }
  }, [userInfo, school]);

  /*
   * Filter teacher users using the search text.
   */
  const filteredUsers = useMemo(() => {
    const search = userSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((item) => {
      const name = item?.name || "";
      const email = item?.email || "";
      const phone = item?.phone || "";

      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        phone.toLowerCase().includes(search)
      );
    });
  }, [users, userSearch]);

  const selectedUser = useMemo(() => {
    return users.find(
      (item) =>
        String(item._id) === String(user),
    );
  }, [users, user]);

  const selectedSchool = useMemo(() => {
    return schools.find(
      (item) =>
        String(item._id) === String(school),
    );
  }, [schools, school]);

  const selectUser = (selected) => {
    setUser(selected._id);
    setUserSearch(
      selected.name ||
        selected.phone ||
        selected.email ||
        "",
    );
    setShowUserList(false);
  };

  const resetForm = () => {
    setUser("");
    setUserSearch("");
    setEmployeeCode("");
    setQualification("");
    setShowUserList(false);

    /*
     * Keep automatically selected school.
     */
    if (!userInfo?.school) {
      setSchool("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const normalizedEmployeeCode =
      employeeCode.trim().toUpperCase();

    const normalizedQualification =
      qualification.trim();

    if (!user) {
      toast.error(
        "Please select a teacher user",
      );
      return;
    }

    if (!school) {
      toast.error("Please select a school");
      return;
    }

    if (!normalizedEmployeeCode) {
      toast.error(
        "Please enter an employee code",
      );
      return;
    }

    try {
      await createTeacher({
        user,
        school,
        employeeCode:
          normalizedEmployeeCode,
        qualification:
          normalizedQualification || undefined,
      }).unwrap();

      toast.success(
        "Teacher created successfully",
      );

      resetForm();

      /*
       * Change this route if your application
       * uses a different teacher list route.
       */
      navigate("/teachers");
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Unable to create teacher";

      switch (message) {
        case "Teacher profile already exists for this user":
          toast.error(
            "A teacher profile already exists for this user.",
          );
          break;

        case "Employee code already exists in this school":
          toast.error(
            "This employee code is already used in this school.",
          );
          break;

        case "User does not belong to the selected school":
          toast.error(
            "The selected user does not belong to this school.",
          );
          break;

        case "Selected user must have TEACHER role":
          toast.error(
            "Please select a user with the TEACHER role.",
          );
          break;

        case "School is inactive":
          toast.error(
            "The selected school is inactive.",
          );
          break;

        default:
          toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8 sm:py-10">
      <div className="w-full max-w-sm sm:max-w-xl lg:max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-5 sm:px-8 lg:px-10 py-7 sm:py-9">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 14c3.314 0 6-2.239 6-5s-2.686-5-6-5-6 2.239-6 5 2.686 5 6 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 21c.8-3.5 4.2-5 9-5s8.2 1.5 9 5"
              />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Create Teacher
          </h2>

          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Add a teacher profile to your school
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >

          {/* School */}
          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <label
              htmlFor="school"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              School
            </label>

            <select
              id="school"
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setUser("");
                setUserSearch("");
                setShowUserList(false);
              }}
              disabled={
                isSchoolsLoading ||
                Boolean(userInfo?.school)
              }
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">
                {isSchoolsLoading
                  ? "Loading schools..."
                  : "Select school"}
              </option>

              {schools.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                  {item.code
                    ? ` (${item.code})`
                    : ""}
                </option>
              ))}
            </select>

            {userInfo?.school && (
              <p className="text-xs text-indigo-100/70">
                Your school is selected automatically.
              </p>
            )}

            {isSchoolsError && (
              <p className="text-xs text-red-200">
                Unable to load schools.
              </p>
            )}
          </div>

          {/* Teacher User */}
          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm relative">
            <label
              htmlFor="teacher-user"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Teacher User
            </label>

            <div className="relative">
              <input
                id="teacher-user"
                type="text"
                placeholder={
                  school
                    ? "Search teacher by name, phone or email"
                    : "Select a school first"
                }
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUser("");
                  setShowUserList(true);
                }}
                onFocus={() => {
                  if (school) {
                    setShowUserList(true);
                  }
                }}
                disabled={!school}
                autoComplete="off"
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
              />

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"
                />
              </svg>

              {showUserList &&
                school && (
                  <div className="absolute z-30 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl bg-white shadow-2xl border border-gray-200">

                    {isUsersLoading && (
                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                        Loading teacher users...
                      </div>
                    )}

                    {isUsersError && (
                      <div className="px-4 py-4 text-sm text-red-500 text-center">
                        Unable to load teacher users.
                      </div>
                    )}

                    {!isUsersLoading &&
                      !isUsersError &&
                      filteredUsers.length ===
                        0 && (
                        <div className="px-4 py-5 text-sm text-gray-500 text-center">
                          No teacher users found.
                        </div>
                      )}

                    {!isUsersLoading &&
                      filteredUsers.map(
                        (item) => (
                          <button
                            type="button"
                            key={item._id}
                            onClick={() =>
                              selectUser(item)
                            }
                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-800">
                              {item.name ||
                                "Unnamed user"}
                            </div>

                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                              {item.phone && (
                                <span>
                                  {item.phone}
                                </span>
                              )}

                              {item.email && (
                                <span>
                                  {item.email}
                                </span>
                              )}
                            </div>
                          </button>
                        ),
                      )}
                  </div>
                )}
            </div>

            {selectedUser && (
              <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-emerald-500/10 border border-emerald-300/20">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  {(
                    selectedUser.name ||
                    "T"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {selectedUser.name}
                  </p>

                  <p className="text-xs text-white/60 truncate">
                    {selectedUser.email ||
                      selectedUser.phone}
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-emerald-300">
                  Selected
                </span>
              </div>
            )}

            <p className="text-xs text-indigo-100/60">
              Only users with the TEACHER role belonging
              to the selected school can be assigned.
            </p>
          </div>

          {/* Employee Code */}
          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <label
              htmlFor="employee-code"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Employee Code
            </label>

            <input
              id="employee-code"
              type="text"
              placeholder="e.g. TCH001"
              value={employeeCode}
              onChange={(e) =>
                setEmployeeCode(
                  e.target.value.toUpperCase(),
                )
              }
              maxLength={30}
              autoComplete="off"
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm uppercase"
            />

            <p className="text-xs text-indigo-100/60">
              This code must be unique within the school.
            </p>
          </div>

          {/* Qualification */}
          <div className="flex flex-col gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <label
              htmlFor="qualification"
              className="text-sm font-medium text-indigo-100 tracking-wide"
            >
              Qualification
              <span className="text-white/50">
                {" "}
                (Optional)
              </span>
            </label>

            <input
              id="qualification"
              type="text"
              placeholder="e.g. M.Sc, B.Ed"
              value={qualification}
              onChange={(e) =>
                setQualification(e.target.value)
              }
              maxLength={100}
              className="w-full h-11 sm:h-12 px-4 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm"
            />
          </div>

          {/* Summary */}
          {(selectedUser || selectedSchool) && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Teacher Profile Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/50">
                    Teacher
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {selectedUser?.name ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    School
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {selectedSchool?.name ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    Employee Code
                  </p>
                  <p className="text-sm text-white font-medium">
                    {employeeCode.trim()
                      ? employeeCode
                          .trim()
                          .toUpperCase()
                      : "Not entered"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50">
                    Qualification
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {qualification.trim() ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse tracking-wide">
                  Creating Teacher...
                </span>
              ) : (
                "Create Teacher"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/teachers")
              }
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-white/60 text-xs sm:text-sm">
          Teacher profiles are linked to an existing
          teacher user account.
        </div>
      </div>
    </div>
  );
};

export default CreateTeacherScreen;
