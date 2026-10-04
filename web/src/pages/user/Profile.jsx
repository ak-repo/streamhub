import React, { useState } from "react";
import { useAuth } from "../../context/context";
import {
  changePassword,
  profileUpdate,
  UploadProfile,
} from "../../api/services/userService";
import toast from "react-hot-toast";

// --- PASTE AvatarUploader COMPONENT DEFINITION HERE ---
// (The full component from the section above)
const MOCK_API_ENDPOINT = "http://localhost:8080/api/v1/auth/upload-profile";

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
      // console.log("url:,", data);

      const newUrl = data.avatarUrl;

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
    <div className="flex flex-col items-center">
      <input
        id="avatar-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={file ? () => uploadAvatar(file) : handleUploadClick}
        disabled={loading}
        className="mt-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg px-3 py-1.5 transition duration-200 disabled:opacity-50"
      >
        {loading
          ? "Uploading..."
          : file
          ? `Upload: ${file.name}`
          : "Change Avatar"}
      </button>

      {file && !loading && (
        <button
          type="button"
          onClick={() => setFile(null)}
          className="mt-1 text-xs text-red-500 hover:text-red-600"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
// --- END of AvatarUploader ---

// --- Component 1: Edit Profile Modal (No Change) ---
const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();

  const [input, setInput] = useState({
    username: user?.username,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await profileUpdate(input?.username);
      if (data?.user) {
        // Update user state in context with new details
        setUser((pre) => ({
          ...pre,
          username: data?.user?.username,
        }));
      }
      if (data) {
        onClose();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;
  // ... rest of EditProfileModal JSX (omitted for brevity)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

        <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              value={input?.username}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              type="button" // Important: set type to button to prevent form submission
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Component 2: Change Password Modal (No Change) ---
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
      onClose();
    } catch (e) {
      console.log(e);
    }
  };
  if (!isOpen) return null;

  // ... rest of ChangePasswordModal JSX (omitted for brevity)
  return (
    // CHANGED: Removed 'bg-black bg-opacity-50', changed 'backdrop-blur-sm' to 'backdrop-blur-md'
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Change Password
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

        <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              value={input?.password}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, password: e.target.value }))
              }
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              value={input?.new_password}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, new_password: e.target.value }))
              }
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              type="button" // Important: set type to button to prevent form submission
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Profile Component ---
const Profile = () => {
  const { user, setUser } = useAuth();
  // New state to manage the temporary display of the avatar URL
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user?.avatar_url);
  console.log("user: ", user);

  React.useEffect(() => {
    setCurrentAvatarUrl(user?.avatar_url);
  }, [user?.avatar_url]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Handler passed to AvatarUploader to update the display URL upon success
  const handleAvatarUploadSuccess = (newUrl) => {
    setCurrentAvatarUrl(newUrl);
    // OPTIONAL: Also update the user context directly if your backend doesn't send a full user update
    setUser((prevUser) => ({
      ...prevUser,
      avatar_url: newUrl,
    }));
  };

  // Determine the final URL to display
  const avatarToDisplay = currentAvatarUrl || user?.avatar_url;

  const defaultAvatar = (
    <svg
      className="h-12 w-12 sm:h-16 sm:w-16 text-white"
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

  return (
    <div className="max-w-3xl mx-auto w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 relative">
      {/* Header (No Change) */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
          Your Profile
        </h1>
        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition duration-200">
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
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
        </button>
      </div>

      {user ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Profile Card (MODIFIED) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Avatar Display */}
              <div className="flex-shrink-0">
                {avatarToDisplay ? (
                  <img
                    src={avatarToDisplay}
                    alt="User Avatar"
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-4 border-blue-600 dark:border-blue-500"
                  />
                ) : (
                  <div className="bg-blue-600 dark:bg-blue-500 p-3 sm:p-4 rounded-full">
                    {defaultAvatar}
                  </div>
                )}
              </div>

              {/* User Info & Avatar Uploader */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                  {user.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-2">
                  Active Member
                </p>

                {/* --- Avatar Uploader Integration --- */}
                <AvatarUploader
                  userId={user.id}
                  onSuccess={handleAvatarUploadSuccess}
                />
              </div>
            </div>
          </div>

          {/* User Details Grid (No Change) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Email Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-sm dark:hover:shadow-gray-800 transition duration-200">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-1.5 sm:p-2 rounded-lg">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Email Address
                </h3>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg pl-8 sm:pl-11 truncate">
                {user.email}
              </p>
            </div>

            {/* User ID Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-sm dark:hover:shadow-gray-800 transition duration-200">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-green-100 dark:bg-green-900 p-1.5 sm:p-2 rounded-lg">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  User ID
                </h3>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg pl-8 sm:pl-11 font-mono truncate">
                {user.id}
              </p>
            </div>
          </div>

          {/* Action Buttons (No Change) */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 flex-1"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsPasswordOpen(true)}
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 flex-1"
            >
              Change Password
            </button>
          </div>
        </div>
      ) : (
        // No User State (No Change)
        <div className="text-center py-8 sm:py-12">
          <div className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No User input
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base">
            Please sign in to view your profile
          </p>
        </div>
      )}

      {/* Render Separate Bool Components (Modals) (No Change) */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />
    </div>
  );
};

export default Profile;
