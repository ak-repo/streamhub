import { useEffect, useState } from "react";
import {
  userInvites,
  updateRequstStatus,
} from "../../api/services/channelService";

function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserReq = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userInvites();
        console.log("user invites data: ", data);
        setRequests(data?.requests || []);
      } catch (e) {
        console.log(e);
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserReq();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await updateRequstStatus(requestId, "accepted");
      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === requestId ? { ...req, status: "accepted" } : req
        )
      );
    } catch (err) {
      console.log(err);
      setError("Failed to accept request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateRequstStatus(requestId, "rejected");
      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === requestId ? { ...req, status: "rejected" } : req
        )
      );
    } catch (err) {
      console.log(err);
      setError("Failed to reject request. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "rejected":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Channel Invite Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your channel invitations and access requests
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 dark:text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Stats Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  All Requests
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
                  total
                </p>
              </div>
              <div className="flex space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    "pending"
                  )}`}
                >
                  {requests.filter((r) => r.status === "pending").length}{" "}
                  Pending
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    "accepted"
                  )}`}
                >
                  {requests.filter((r) => r.status === "accepted").length}{" "}
                  Accepted
                </span>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request.requestId}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Channel Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            Channel Invitation
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            <span>
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          You've been invited to join a channel
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            •
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Request ID:</span>{" "}
                            {request.requestId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                      {request.status === "pending" ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAccept(request.requestId)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
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
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(request.requestId)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
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
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span>
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Requests Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You don't have any channel invitations or access requests at
                  the moment. New requests will appear here when someone invites
                  you to join their channel.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {requests.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Showing all {requests.length} requests</span>
                <span className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Click on actions to manage requests</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserRequests;
