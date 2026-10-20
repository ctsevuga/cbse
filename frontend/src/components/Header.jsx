import { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import logo from "../assets/logo.png";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (error) {
      console.error(error);
    }

    setRoleMenuOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);

    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }

      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-red-700 shadow-md">
        <div className="mx-auto flex h-16 items-center justify-between px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="text-white sm:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <FaBars size={22} />
            </button>

            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate("/home")}
            >
              <img src={logo} alt="logo" className="h-8" />
              <span className="text-xl font-bold text-white">
                CBSE Practice Exam
              </span>
            </div>
          </div>
          <button
            className="hidden sm:block rounded px-3 py-2 text-white hover:bg-red-800"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          {/* Desktop Menu */}
          <div className="hidden items-center gap-4 sm:flex">
            {/* Super Admin Menu */}
            {/* Role Menu */}
            {userInfo?.role === "superAdmin" && (
              <div className="relative" ref={roleMenuRef}>
                <button
                  className="rounded px-3 py-2 text-white hover:bg-red-800"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                >
                  Super Admin
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded bg-white py-2 shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/coaching-centers");
                        setRoleMenuOpen(false);
                      }}
                    >
                      Coaching Centers
                    </button>

                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/admin/userlist");
                        setRoleMenuOpen(false);
                      }}
                    >
                      User Management
                    </button>
                  </div>
                )}
              </div>
            )}
            {/*  Admin Menu */}

            {userInfo?.role === "admin" && (
              <div className="relative" ref={roleMenuRef}>
                <button
                  className="rounded px-3 py-2 text-white hover:bg-red-800"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                >
                  Admin
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded bg-white py-2 shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/subjects");
                        setRoleMenuOpen(false);
                      }}
                    >
                      Subjects
                    </button>

                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/quizzes");
                        setRoleMenuOpen(false);
                      }}
                    >
                      Quizzes
                    </button>

                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/excel-upload");
                        setRoleMenuOpen(false);
                      }}
                    >
                      Excel Upload
                    </button>
                  </div>
                )}
              </div>
            )}

            {userInfo?.role === "student" && (
              <div className="relative" ref={roleMenuRef}>
                <button
                  className="rounded px-3 py-2 text-white hover:bg-red-800"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                >
                  Student
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded bg-white py-2 shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/quiz-attempts/my");
                        setRoleMenuOpen(false);
                      }}
                    >
                      My Attempts
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            {userInfo ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 rounded px-2 py-1 text-white hover:bg-red-800"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-red-700">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>

                  <span>{userInfo.name}</span>
                  <span className="rounded bg-red-800 px-2 py-1 text-xs uppercase text-white">
                    {userInfo.role}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded bg-white py-2 shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={logoutHandler}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="rounded px-3 py-2 text-white hover:bg-red-800"
                onClick={() => navigate("/")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <span className="text-lg font-bold">Menu</span>

              <button onClick={() => setMobileOpen(false)} className="text-2xl">
                ×
              </button>
            </div>

            <div className="flex flex-col">
              {userInfo?.role === "superAdmin" && (
                <>
                  <button
                    className="border-b px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      navigate("/coaching-centers");
                      setMobileOpen(false);
                    }}
                  >
                    Coaching Centers
                  </button>

                  <button
                    className="border-b px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      navigate("/admin/userlist");
                      setMobileOpen(false);
                    }}
                  >
                    User Management
                  </button>
                </>
              )}

              {userInfo?.role === "admin" && (
                <>
                  <button
                    className="border-b px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      navigate("/subjects");
                      setMobileOpen(false);
                    }}
                  >
                    Subjects
                  </button>

                  <button
                    className="border-b px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      navigate("/quizzes");
                      setMobileOpen(false);
                    }}
                  >
                    Quizzes
                  </button>

                  <button
                    className="border-b px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      navigate("/excel-upload");
                      setMobileOpen(false);
                    }}
                  >
                    Excel Upload
                  </button>
                </>
              )}

              {userInfo?.role === "student" && (
                <button
                  className="border-b px-4 py-3 text-left hover:bg-gray-100"
                  onClick={() => {
                    navigate("/quiz-attempts/my");
                    setMobileOpen(false);
                  }}
                >
                  My Attempts
                </button>
              )}

              {userInfo ? (
                <button
                  className="border-b px-4 py-3 text-left hover:bg-gray-100"
                  onClick={() => {
                    logoutHandler();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="border-b px-4 py-3 text-left hover:bg-gray-100"
                  onClick={() => {
                    navigate("/");
                    setMobileOpen(false);
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
