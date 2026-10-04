import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/context";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "US";

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Theme Toggle */
  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light"
    );
  };

  return (
    <header className="flex items-center justify-between px-10 py-4  dark:bg-gray-900 sticky top-0 z-40 select-none">
      {/* Logo */}
      <div className="flex pl-50 items-center">
        <Logo />
      </div>

      <div className="flex items-center space-x-3">
        {/* Notification Button */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          onClick={() => navigate("/home/invites")}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.4 1 1 0 00-1.2-1.2 7.97 7.97 0 006.16 9.91 5.97 5.97 0 013.9-1.38 5.97 5.97 0 014.66 7.4 1 1 0 001.2 1.2 7.97 7.97 0 00-6.16-9.91z"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* Theme Toggle */}
        {/* <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button> */}

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            aria-haspopup="true"
            aria-expanded={showMenu}
            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>

            <svg
              className={`w-4 h-4 text-gray-600 dark:text-gray-300 transform transition ${
                showMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 animate-fadeIn z-50"
              role="menu"
            >
              {/* User Info */}
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user?.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Online
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => navigate("/home/profile")}
              >
                <span>Profile</span>
              </button>

              <button
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => navigate("/home/settings")}
              >
                <span>Settings</span>
              </button>

              <button
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => navigate("/home/invites")}
              >
                <span>Invites</span>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
