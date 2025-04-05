import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, adminLogout } from "../../redux/slices/authSlice";
import {
  toggleTheme,
  selectTheme,
  selectNotifications,
} from "../../redux/slices/uiSlice";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, isAdmin } = useSelector((state) => state.auth);
  const theme = useSelector(selectTheme);
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    if (isAdmin) {
      dispatch(adminLogout());
      navigate("/admin/login");
    } else {
      dispatch(logout());
      navigate("/login");
    }
    setIsDropdownOpen(false);
  }, [isAdmin, dispatch, navigate]);

  const handleThemeToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  // Memoize derived values
  const hasUnreadNotifications = useMemo(
    () => notifications.length > 0,
    [notifications]
  );

  // Check if a link is active
  const isActive = useCallback(
    (path) => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  return (
    <nav
      className={`${
        theme === "dark"
          ? "bg-gradient-to-r from-gray-800 to-gray-900"
          : "bg-gradient-to-r from-blue-600 to-blue-800"
      } text-white shadow-md`}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
            aria-label="Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xl font-bold">Resume Builder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to="/applications"
                  className={`hover:text-blue-200 transition-colors duration-300 ${
                    isActive("/applications")
                      ? "border-b-2 border-white font-medium"
                      : ""
                  }`}
                  aria-current={isActive("/applications") ? "page" : undefined}
                >
                  Applications
                </Link>
                <Link
                  to="/analytics"
                  className={`hover:text-blue-200 transition-colors duration-300 ${
                    isActive("/analytics")
                      ? "border-b-2 border-white font-medium"
                      : ""
                  }`}
                  aria-current={isActive("/analytics") ? "page" : undefined}
                >
                  Analytics
                </Link>
                <Link
                  to="/jobs"
                  className={`hover:text-blue-200 transition-colors duration-300 ${
                    isActive("/jobs")
                      ? "border-b-2 border-white font-medium"
                      : ""
                  }`}
                  aria-current={isActive("/jobs") ? "page" : undefined}
                >
                  Jobs
                </Link>
                <Link
                  to="/resumes"
                  className={`hover:text-blue-200 transition-colors duration-300 ${
                    isActive("/resumes")
                      ? "border-b-2 border-white font-medium"
                      : ""
                  }`}
                  aria-current={isActive("/resumes") ? "page" : undefined}
                >
                  Resumes
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`hover:text-blue-200 transition-colors duration-300 ${
                  isActive("/admin/dashboard")
                    ? "border-b-2 border-white font-medium"
                    : ""
                }`}
                aria-current={isActive("/admin/dashboard") ? "page" : undefined}
              >
                Admin Dashboard
              </Link>
            )}

            {/* Theme toggle button */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-colors duration-300"
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
            >
              {theme === "light" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    {hasUnreadNotifications && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span>{user?.name || "User"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-fade-in"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-100 transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    {hasUnreadNotifications && (
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-100 transition-colors duration-300 items-center justify-between"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        Notifications
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {notifications.length}
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 transition-colors duration-300"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md border border-white hover:bg-white hover:text-blue-700 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-white text-blue-700 hover:bg-blue-100 transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden mt-4 pb-2 mobile-menu transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to="/applications"
                className={`block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 ${
                  isActive("/applications") ? "bg-blue-700 font-medium" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/applications") ? "page" : undefined}
              >
                Applications
              </Link>
              <Link
                to="/analytics"
                className={`block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 ${
                  isActive("/analytics") ? "bg-blue-700 font-medium" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/analytics") ? "page" : undefined}
              >
                Analytics
              </Link>
              <Link
                to="/jobs"
                className={`block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 ${
                  isActive("/jobs") ? "bg-blue-700 font-medium" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/jobs") ? "page" : undefined}
              >
                Jobs
              </Link>
              <Link
                to="/resumes"
                className={`block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 ${
                  isActive("/resumes") ? "bg-blue-700 font-medium" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/resumes") ? "page" : undefined}
              >
                Resumes
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 ${
                isActive("/admin/dashboard") ? "bg-blue-700 font-medium" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-current={isActive("/admin/dashboard") ? "page" : undefined}
            >
              Admin Dashboard
            </Link>
          )}

          {/* Theme toggle in mobile menu */}
          <button
            onClick={handleThemeToggle}
            className="flex items-center w-full py-2 px-2 hover:bg-blue-700 rounded transition-colors duration-300"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Light Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="block py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              {hasUnreadNotifications && (
                <Link
                  to="/notifications"
                  className="py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300 flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Notifications</span>
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {notifications.length}
                  </span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 hover:bg-blue-700 px-2 rounded transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                className="block py-2 text-center rounded-md border border-white hover:bg-white hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 text-center rounded-md bg-white text-blue-700 hover:bg-blue-100 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
