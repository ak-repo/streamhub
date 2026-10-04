import React, { useEffect, useState } from "react";
import {
  listUsers,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
} from "../../api/services/userService";

// Format timestamp (handles seconds or ms)
const formatDate = (timestamp) => {
  try {
    const ts = Number(timestamp);
    const date =
      ts.toString().length <= 10 ? new Date(ts * 1000) : new Date(ts);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case "super-admin":
      return "bg-red-100 text-red-800";
    case "admin":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // pagination (same as File Manager)
  const [page, setPage] = useState(1);
  const limit = 9;

  const [editForm, setEditForm] = useState({
    role: "",
    isBanned: false,
    banReason: "",
  });

  // ==========================
  // FETCH USERS
  // ==========================
  const fetchUsers = async (searchValue = searchTerm, pageValue = page) => {
    try {
      setLoading(true);

      // EXACT FILE MANAGER STYLE: limit + offset
      const offset = limit * (pageValue - 1);
      const data = await listUsers(searchValue, limit, offset);

      setUsers(data?.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // reload on search or page change
  useEffect(() => {
    fetchUsers(searchTerm, page);
  }, [searchTerm, page]);

  // ==========================
  // FILTER USERS (client-side)
  // ==========================
  const filteredUsers = users.filter((user) => {
    const s = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(s) ||
      user.email.toLowerCase().includes(s)
    );
  });

  // ==========================
  // Details Modal
  // ==========================
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // ==========================
  // Edit Modal
  // ==========================
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role || "user",
      isBanned: !!user.isBanned,
      banReason: user.banReason || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      const updates = {};

      if (editingUser.role !== editForm.role) {
        await updateUserRole(editingUser.id, editForm.role);
        updates.role = editForm.role;
      }

      if (editingUser.isBanned !== editForm.isBanned) {
        if (editForm.isBanned) {
          await banUser(editingUser.id, editForm.banReason);
          updates.isBanned = true;
          updates.banReason = editForm.banReason;
        } else {
          await unbanUser(editingUser.id);
          updates.isBanned = false;
          updates.banReason = "";
        }
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updates } : u))
      );

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log(users);
  // ==========================
  // Delete User
  // ==========================
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;

    try {
      setLoading(true);
      await deleteUser(userId);

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600">Showing {users.length} users</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading...</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-gray-500">{user.email}</div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {user.isEmailVerified ? "Verified" : "Unverified"}
                        {user.isBanned && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            Banned
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 flex space-x-3">
                        <button
                          className="text-blue-600"
                          onClick={() => handleViewDetails(user)}
                        >
                          View
                        </button>

                        <button
                          className="text-green-600"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-600"
                          disabled={user.role === "super-admin"}
                          onClick={() =>
                            handleDeleteUser(user.id, user.username)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination identical to File Manager */}
            <Pagination
              page={page}
              setPage={setPage}
              len={users.length}
              limit={limit}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showDetailsModal && selectedUser && (
        <DetailedUser
          setShowDetailsModal={setShowDetailsModal}
          selectedUser={selectedUser}
          handleEditUser={handleEditUser}
        />
      )}

      {showEditModal && editingUser && (
        <EditUser
          setShowEditModal={setShowEditModal}
          handleSaveEdit={handleSaveEdit}
          setEditForm={setEditForm}
          editingUser={editingUser}
          editForm={editForm}
        />
      )}
    </div>
  );
}

function Pagination({ page, setPage, len, limit }) {
  return (
    <div className="flex justify-between items-center p-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-gray-700">Page {page}</span>

      <button
        disabled={len < limit}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default UsersManagement;

/* ------------------------------------------------------------------
   MODALS (unchanged from your structure — only formatting optimized)
------------------------------------------------------------------- */

/**
 * Detailed User View Modal
 */
const DetailedUser = ({
  setShowDetailsModal,
  selectedUser,
  handleEditUser,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-4 rounded-full">
                  <svg
                    className="h-16 w-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedUser.username}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </h4>
                  <p className="text-gray-800 font-mono text-sm">
                    {selectedUser.id}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Email Status
                  </h4>
                  <div className="flex items-center">
                    {selectedUser.isEmailVerified ? (
                      <>
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 text-red-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-red-600">Unverified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Account Status
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.isBanned
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedUser.isBanned ? "Banned" : "Active"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role || "user"}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Joined Date
                  </h4>
                  <div className="flex items-center text-gray-800">
                    <svg
                      className="h-5 w-5 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {selectedUser.lastLogin && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Last Login
                </h4>
                <p className="text-gray-800">
                  {formatDate(selectedUser.lastLogin)}
                </p>
              </div>
            )}
            {selectedUser.isBanned && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Ban Reason
                </h4>
                <p className="text-red-800 font-semibold">
                  {selectedUser.banReason || "Not specified."}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditUser(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Edit User
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Edit User Modal
 */
const EditUser = ({
  setShowEditModal,
  setEditForm,
  editingUser,
  editForm,
  handleSaveEdit,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Edit User: {editingUser.username}
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={editingUser.role === "super-admin"} // Prevent editing super-admin role
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>

            {/* Ban Status */}
            <div>
              <label className="flex items-center space-x-3 mb-2">
                <input
                  type="checkbox"
                  checked={editForm.isBanned}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isBanned: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ban User Account
                </span>
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </label>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Banned users cannot log in or access their account.
              </p>

              {/* Ban Reason Input (Visible only if user is being banned) */}
              {editForm.isBanned && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Reason (Required)
                  </label>
                  <textarea
                    value={editForm.banReason}
                    onChange={(e) =>
                      setEditForm({ ...editForm, banReason: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter the reason for banning this user..."
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                disabled={editForm.isBanned && !editForm.banReason} // Disable save if banning without a reason
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
