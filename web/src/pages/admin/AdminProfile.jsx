import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/context";
import {
  profileUpdate,
  changePassword,
  UploadProfile,
} from "../../api/services/userService";
import toast from "react-hot-toast";

// --- START: AvatarUploader Component ---
/**
 * @param {string} userId - The ID of the user performing the upload.
 * @param {function(string): void} onSuccess - Callback function called with the new avatar URL upon success.
 */
const AvatarUploader = ({ userId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadAvatar = async (fileToUpload) => {
    if (!userId) {
      toast.error("User ID is missing.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const data = await UploadProfile(formData);
      const newUrl = data?.avatarUrl;

      toast.success("Avatar uploaded successfully!");
      onSuccess(newUrl);
      setFile(null);
    } catch (error) {
      console.error("Error during avatar upload:", error);
      toast.error(error.message || "Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      uploadAvatar(file);
    } else {
      document.getElementById("avatar-file-input").click();
    }
  };

  return (
    <div className="flex flex-col items-start pt-3">
      <input
        id="avatar-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: "none" }}
      />

      {/* Button Style: sky-500 background for the primary action */}
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={loading}
        // Modern, slightly larger button for primary action
        className="text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 transition duration-200 disabled:opacity-50"
      >
        {loading
          ? "Uploading..."
          : file
          ? `Upload ${file.name.substring(0, 10)}...`
          : "Change Avatar"}
      </button>

      {file && !loading && (
        <button
          type="button"
          onClick={() => setFile(null)}
          // Secondary button: Minimal style for "Cancel"
          className="mt-2 text-xs text-gray-500 hover:text-red-600 font-medium"
        >
          Cancel Selection
        </button>
      )}
    </div>
  );
};
// --- END: AvatarUploader Component ---

// --- START: Change Password Modal ---
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState({
    password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.confirm_password !== input.new_password) {
      toast.error("Confirm password not matching");
      return;
    }

    try {
      await changePassword(input.password, input.new_password);
      toast.success("Password changed successfully!");
      onClose();
    } catch (e) {
      console.log(e);
      toast.error("Failed to change password. Check current password.");
    }
  };
  if (!isOpen) return null;

  return (
    // Modal Background
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-50/50 transition-opacity">
      {/* Modal Content - Force White Background, Slightly rounded edges for modern feel */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <input
              value={input?.password}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, password: e.target.value }))
              }
              type="password"
              // Input style updated for modern, cleaner look
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none rounded-md transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              value={input?.new_password}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, new_password: e.target.value }))
              }
              type="password"
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none rounded-md transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              value={input?.confirm_password}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  confirm_password: e.target.value,
                }))
              }
              type="password"
              className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none rounded-md transition"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            {/* Cancel Button - Secondary, gray text/hover */}
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 transition rounded-md font-semibold"
            >
              Cancel
            </button>
            {/* Primary Button - sky-500 background */}
            <button className="flex-1 px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 transition rounded-md font-semibold">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- END: Change Password Modal ---

// --- Main Component: AdminProfile ---
const AdminProfile = () => {
  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user?.avatar_url);

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
  });

  // Fetch initial data and sync avatar
  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => {
        setUserStats({
          recentActivities: [], // Mock data
          lastLogin: user.lastLogin || new Date().toISOString(),
        });
        setLoading(false);
      }, 500);

      setEditForm({
        username: user.username || "",
        email: user.email || "",
      });
      setCurrentAvatarUrl(user.avatar_url);
    }
  }, [user]);

  // Handler to update the displayed avatar and context after a successful upload
  const handleAvatarUploadSuccess = (newUrl) => {
    setCurrentAvatarUrl(newUrl);
    setUser((prevUser) => ({
      ...prevUser,
      avatar_url: newUrl,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditForm({
        username: user?.username || "",
        email: user?.email || "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const data = await profileUpdate(editForm.email, editForm.username);
      setIsEditing(false);
      if (data?.user) {
        setUser(data?.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getRoleBadge = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "superadmin":
        // Use bolder color for Super Admin
        return "bg-purple-600 text-white";
      case "admin":
        // Use bolder color for Admin
        return "bg-red-600 text-white";
      case "moderator":
        // Match the primary color for consistency
        return "bg-sky-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Default avatar SVG
  const defaultAvatar = (
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
  );

  // The main component structure
  return (
    // Outer Container: Full Width/Height, Full White Background
    <div className="w-full h-full bg-white">
      {/* Inner Content Wrapper: Apply generous padding */}
      <div className="w-full h-full p-6 lg:p-10">
        {/* Main Content Area - Force White Background */}
        <div className="w-full bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                Admin Profile Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your profile, security, and activity logs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Edit/Cancel Button - Subtle but professional */}
              <button
                onClick={handleEditToggle}
                className={`p-2 font-semibold text-sm transition duration-200 ${
                  isEditing
                    ? "text-red-600 hover:bg-red-50"
                    : "text-sky-600 hover:bg-sky-50"
                } border border-gray-200 hover:border-sky-500 rounded-md`}
                title={isEditing ? "Cancel Edit" : "Edit Profile"}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading profile data...
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* Profile Summary Card - White Background, Rounded edges, Subtle shadow */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Avatar Image - Larger and modern border */}
                      {currentAvatarUrl ? (
                        <img
                          src={currentAvatarUrl}
                          alt="Admin Avatar"
                          className="h-24 w-24 rounded-full object-cover border-4 border-sky-500 ring-2 ring-sky-100"
                        />
                      ) : (
                        <div className="bg-sky-500 p-2 rounded-full h-24 w-24 flex items-center justify-center border-4 border-sky-500">
                          {defaultAvatar}
                        </div>
                      )}

                      {/* Role Badge - Bottom right, solid color, clean corners */}
                      {user?.role && (
                        <div
                          className={`absolute -bottom-1 -right-1 px-3 py-1 text-xs font-bold uppercase rounded-sm ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </div>
                      )}
                    </div>
                    {/* Uploader Button (below the image) */}
                    <AvatarUploader
                      userId={user.id}
                      onSuccess={handleAvatarUploadSuccess}
                    />
                  </div>

                  {/* Profile Details / Edit Form */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-sky-500">
                          Editing Profile
                        </h3>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            USERNAME
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={editForm.username}
                            onChange={handleInputChange}
                            // Input style updated for modern, cleaner look
                            className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none rounded-md transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            EMAIL
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none rounded-md transition"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1 truncate">
                          {user.username}
                        </h2>
                        <p className="text-lg text-gray-600 mb-3 truncate">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-500 pt-1 border-t border-gray-100">
                          Account created on:{" "}
                          <span className="font-medium text-gray-700">
                            {user.createdAt
                              ? formatDate(user.createdAt)
                              : "Unknown"}
                          </span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* Save Button for Edit Mode */}
                  {isEditing && (
                    <div className="flex-shrink-0 pt-4 sm:pt-0">
                      {/* Save Profile Button - sky-500 background */}
                      <button
                        onClick={handleSaveProfile}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-6 transition duration-200 w-full rounded-md shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details & Actions Grid - Clean and spaced-out */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Account Information Card */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center space-x-2">
                    <svg
                      className="h-6 w-6 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Account Overview</span>
                  </h3>
                  <div className="space-y-4">
                    {/* User ID */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-500">
                        User ID
                      </p>
                      <p className="text-sm text-gray-800 font-mono tracking-wider">
                        {user.id}
                      </p>
                    </div>
                    {/* Role */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-500">
                        Role
                      </p>
                      <p
                        className={`text-sm font-bold uppercase px-3 py-1 rounded-sm ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </p>
                    </div>
                    {/* Status */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-500">
                        Status
                      </p>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            user.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <p className="text-sm text-gray-800 font-medium capitalize">
                          {user.status || "Active"}
                        </p>
                      </div>
                    </div>
                    {/* Last Login */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-500">
                        Last Login
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {userStats?.lastLogin
                          ? formatDate(userStats.lastLogin)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Quick Actions Card */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center space-x-2">
                    <svg
                      className="h-6 w-6 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Quick Actions</span>
                  </h3>
                  <div className="space-y-3">
                    {/* Action Button 1: Change Password - Clear hover states */}
                    <button
                      onClick={() => setIsPasswordOpen(true)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition duration-200 rounded-md"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Change Password
                      </span>
                      <svg
                        className="h-5 w-5 text-sky-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </button>
                    {/* Action Button 2: View Activity Log */}
                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition duration-200 rounded-md">
                      <span className="text-sm font-medium text-gray-700">
                        View Activity Log
                      </span>
                      <svg
                        className="h-5 w-5 text-sky-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </button>
                    {/* Action Button 3: Log Out */}
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition duration-200 rounded-md"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Log Out
                      </span>
                      <svg
                        className="h-5 w-5 text-sky-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-5a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Session Expired State
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <div className="h-20 w-20 text-sky-500 mx-auto mb-4">
                {/* Icon for sign-in state */}
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Session Required
              </h3>
              <p className="text-gray-500 text-base mb-4">
                Please sign in to access the admin features and data.
              </p>
              {/* Sign In Button - sky-500 background */}
              <button className="mt-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 transition duration-200 rounded-md">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
      {
        <ChangePasswordModal
          isOpen={isPasswordOpen}
          onClose={() => setIsPasswordOpen(false)}
        />
      }
    </div>
  );
};

export default AdminProfile;
