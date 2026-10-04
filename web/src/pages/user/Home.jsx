import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/context";
// Ensure searchChannels is imported from your service
import {
  createChannel,
  listChannels,
  searchChannels,
  sendJoin,
} from "../../api/services/channelService";
import { searchUsers } from "../../api/services/userService";

const ITEMS_PER_PAGE = 6;

// TAB 1: MY CHANNELS (Dashboard)
const ChannelsView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [totalChannels, setTotalChannels] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inputForm, setInputForm] = useState({
    name: "",
    description: "",
    visibility: "public",
  });
  console.log("channels: ", channels);

  const totalPages = Math.ceil(totalChannels / ITEMS_PER_PAGE);
  // TODO -> pagination
  const fetchChannels = async (page) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const data = await listChannels(ITEMS_PER_PAGE, offset);
      setChannels(data?.channels || []);
      setTotalChannels(data?.channels?.length || 0);
      setCurrentPage(page);
    } catch (err) {
      toast.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchChannels(1);
  }, [user?.id]);

  const handleCreate = async () => {
    if (!inputForm.name.trim()) return toast.error("Enter a channel name");
    try {
      await createChannel(
        inputForm.name,
        inputForm.description,
        inputForm.visibility
      );
      setInputForm({ name: "", description: "", visibility: "public" });
      fetchChannels(1);
      toast.success("Channel created!");
    } catch (err) {
      toast.error("Failed to create channel");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Create Card */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-6 h-6 text-sky-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Workspace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={inputForm.name}
                onChange={(e) =>
                  setInputForm({ ...inputForm, name: e.target.value })
                }
                placeholder="Channel Name"
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              />
              <select
                value={inputForm.visibility}
                onChange={(e) =>
                  setInputForm({ ...inputForm, visibility: e.target.value })
                }
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:bg-white/20 focus:outline-none [&>option]:text-gray-900"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <input
                value={inputForm.description}
                onChange={(e) =>
                  setInputForm({ ...inputForm, description: e.target.value })
                }
                placeholder="Description (Optional)"
                className="col-span-1 md:col-span-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 focus:bg-white/20 focus:outline-none transition"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="w-full md:w-auto px-8 py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition shadow-lg whitespace-nowrap"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white px-1">
          My Channels ({totalChannels})
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {channels.map((ch) => (
              <div
                key={ch?.id}
                onClick={() => !ch.isFrozen && navigate(`/channel/${ch?.id}`)}
                className={`group relative p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300
                  ${
                    ch.isFrozen
                      ? "border-red-100 dark:border-red-900/20 opacity-70 cursor-not-allowed"
                      : "border-gray-100 dark:border-gray-700 hover:border-sky-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 font-bold text-lg">
                    {ch.name[0].toUpperCase()}
                  </div>
                  {ch.visibility === "private" && (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-medium">
                      Private
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                  {ch.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {ch.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No channels yet. Create one above!</p>
          </div>
        )}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchChannels}
        />
      </div>
    </div>
  );
};

// ==========================================
// TAB 2: FIND USERS
// ==========================================

// ==========================================
// TAB 3: FIND CHANNELS (Fixed Logic)
// ==========================================
const ChannelSearchView = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = results.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchChannels(query);
      setResults(data?.channels || []);
      setCurrentPage(1);
    } catch {
      toast.error("Channel search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequest = async (channelId) => {
    try {
      await sendJoin(channelId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Discover Workspaces
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Find public channels to join
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8 max-w-xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for channels..."
          className="w-full pl-6 pr-32 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-2 bottom-2 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {paginatedResults.map((ch) => (
          <div
            key={ch.id}
            className="flex justify-between items-center p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-sky-200 transition group"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-sky-600 transition">
                  {ch.name}
                </h4>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {ch.description || "No description provided."}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRequest(ch?.id)}
              className="px-5 py-2.5  bg-sky-500 text-white tezr font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-gray-200 dark:shadow-none whitespace-nowrap"
            >
              Join Request
            </button>
          </div>
        ))}
      </div>

      {results.length === 0 && query && !isSearching && (
        <div className="text-center text-gray-400 py-10">
          No channels found matching "{query}"
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

// ==========================================
// MAIN HOME PAGE
// ==========================================
export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "My Channels" },
    { id: "users", label: "Find Users" },
    { id: "channels", label: "Find Channels" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl inline-flex shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm scale-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px] transition-all">
        {activeTab === "dashboard" && <ChannelsView />}
        {activeTab === "users" && <UserSearchView />}
        {activeTab === "channels" && <ChannelSearchView />}
      </div>
    </div>
  );
}

// ==========================================
// SHARED: PAGINATION CONTROLS
// ==========================================
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="flex justify-center items-center space-x-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex space-x-1">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
              page === currentPage
                ? "bg-sky-600 text-white shadow-md scale-105"
                : "bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

// ==========================================
// SHARED: USER PROFILE MODAL
// ==========================================
const UserProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Helper to format date
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* --- Header Background --- */}
        <div className="h-24 bg-gradient-to-r from-sky-300 via-sky-500 to-sky-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* --- Profile Content --- */}
        <div className="px-6 pb-8 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex justify-between items-end">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1.5 shadow-lg">
              <div className="flex-shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user?.avatarUrl}
                    alt="User Avatar"
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-4 border-blue-600 dark:border-blue-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Role Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${
                user.role === "admin"
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
              }`}
            >
              {user.role || "Member"}
            </div>
          </div>

          {/* Name & Email */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {user.username}
              {user.emailVerified && (
                <svg
                  className="w-5 h-5 text-sky-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {user.email}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {/* User ID Box */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 flex items-center justify-between group hover:border-sky-300 transition-colors">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">
                  User ID
                </p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                  {user.id}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  toast.success("ID Copied!");
                }}
                className="p-2 text-gray-400 hover:text-sky-600 bg-white dark:bg-gray-600 rounded-lg shadow-sm transition"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Joined Date */}
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg mr-3">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Joined Platform
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {joinDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserSearchView = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = results.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchUsers(query);
      setResults(data?.users || []);
      setCurrentPage(1);
    } catch {
      toast.error("Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Find People
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Search for colleagues to connect with
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8 max-w-xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full pl-6 pr-32 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-2 bottom-2 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedResults.map((u) => (
          <div
            key={u.id}
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg shadow-inner">
              {u.username[0].toUpperCase()}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-white truncate">
                {u.username}
              </h4>
              <p className="text-sm text-gray-500 truncate">{u.email}</p>
            </div>
            <button
              onClick={() => setSelectedUser(u)}
              className="ml-2 px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 rounded-lg transition"
            >
              Profile
            </button>
          </div>
        ))}
      </div>

      {results.length === 0 && query && !isSearching && (
        <div className="text-center text-gray-400 py-10">
          No users found matching "{query}"
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <UserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};
