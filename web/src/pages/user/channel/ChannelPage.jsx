import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useChannel, useAuth } from "../../../context/context";
import { useEffect, useState } from "react";
import {
  leaveChannel,
  deleteChannel,
} from "../../../api/services/channelService";

export default function ChannelPage() {
  const { channelId } = useParams();
  const { setChanID, channel, members, isOwner, isMember } = useChannel();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setChanID(channelId);
  }, [channelId]);

  const handleLeaveOrDelete = async () => {
    if (!user?.id || !channel) return;

    setIsLeaving(true);
    try {
      if (isOwner) {
        // Owner can delete the channel
        if (
          window.confirm(
            "Are you sure you want to delete this channel? This action cannot be undone."
          )
        ) {
          await deleteChannel(channel?.id);
          navigate("/home");
        }
      } else {
        // Member can leave the channel
        if (window.confirm("Are you sure you want to leave this channel?")) {
          await leaveChannel(channel?.id);
          navigate("/home");
        }
      }
    } catch (err) {
      console.error("Failed to leave/delete channel:", err);
      alert("Failed to leave channel. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}

        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          {/* Back Button */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 mb-4 w-full"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-medium">Back to Channels</span>
          </button>

          {/* Channel Info */}
          {/* Channel Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-sky-500 font-semibold text-sm">
                {channel?.name?.charAt(0).toUpperCase() || "C"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {channel?.name || "Loading..."}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {members?.length || 0} members
                {isOwner && " • You are owner"}
              </p>

              {/* Channel ID with small copy button */}
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {channel?.id || "Loading..."}
                </p>

                {/* Copy Button */}
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(channel?.id || "")
                  }
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Copy Channel ID"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to=""
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Chat</span>
          </NavLink>

          <NavLink
            to="members"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span>Members</span>
          </NavLink>

          <NavLink
            to="files"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <span>Files</span>
          </NavLink>

          {/* <NavLink
            to="board"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <span>Board</span>
          </NavLink> */}
          <NavLink
            to="requests"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <span>Requests</span>
          </NavLink>
          {/* <NavLink
            to="payment"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <span>Payment</span>
          </NavLink> */}
          <NavLink
            to="subscription"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-750"
              }`
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <span>Subscription</span>
          </NavLink>
        </nav>

        {/* Leave/Delete Button */}
        {isMember && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLeaveOrDelete}
              disabled={isLeaving}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isOwner
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              } ${isLeaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLeaving ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-7.364l-2.828 2.828M7.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M7.464 6.464L4.636 3.636"
                  />
                </svg>
              ) : isOwner ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              )}
              <span>
                {isLeaving
                  ? "Processing..."
                  : isOwner
                  ? "Delete Channel"
                  : "Leave Channel"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
