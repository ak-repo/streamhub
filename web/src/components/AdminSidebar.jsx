import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkClass =
    "block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition";

  return (
    <div className="w-64 h-screen bg-sky-950 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6 text-center">Admin Panel</h2>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-gray-700 text-white` : linkClass
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-gray-700 text-white` : linkClass
          }
        >
          Users Management
        </NavLink>

        <NavLink
          to="/admin/channels"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-gray-700 text-white` : linkClass
          }
        >
          Channels Management
        </NavLink>

        <NavLink
          to="/admin/files"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-gray-700 text-white` : linkClass
          }
        >
          Files
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-gray-700 text-white` : linkClass
          }
        >
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
