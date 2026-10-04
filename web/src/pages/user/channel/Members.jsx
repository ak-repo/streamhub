import { useState, useMemo } from "react";
import { leaveChannel, sendInvite } from "../../../api/services/channelService";
import { useChannel, useAuth } from "../../../context/context";

export default function Members() {
  const { user } = useAuth();
  const { members, isOwner, chanID, setRefMem } = useChannel();

  const [showAddInput, setShowAddInput] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Derived State: Filter Members ---
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m) =>
      m.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // --- Handlers ---

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    setIsSubmitting(true);
    try {
      await sendInvite(chanID, targetUserId);
      // setRefMem((prev) => !prev); // Refresh list
      setTargetUserId("");
      setShowAddInput(false);
    } catch (e) {
      console.error("failed to invite user:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await leaveChannel(chanID, memberId);
      setRefMem((prev) => !prev); // Refresh list
    } catch (e) {
      console.error("Remove member failed:", e);
      alert("Failed to remove member.");
    }
  };

  // Helper for Avatar Colors
  const getInitials = (name) => name?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Channel Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {members?.length || 0} people in this channel
            </p>
          </div>

          {/* Add Member Toggle */}
          <button
            onClick={() => setShowAddInput(!showAddInput)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAddInput
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {showAddInput ? "Cancel" : "Invite Member"}
          </button>
        </div>

        {/* Add Member Input Form */}
        {showAddInput && (
          <form
            onSubmit={handleInviteMember}
            className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter User ID or Email..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !targetUserId.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? "Adding..." : "Invite"}
              </button>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {filteredMembers.length > 0 ? (
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const isMe = String(member.userId) === String(user?.id);

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {getInitials(member.username)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {member.username}
                        </p>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 uppercase tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                        ID: {member.userId}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner && !isMe && (
                    <button
                      onClick={() => handleDeleteMember(member.userId)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Remove member"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p>No members found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
