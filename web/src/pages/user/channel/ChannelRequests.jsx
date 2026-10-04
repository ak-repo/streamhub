import { useEffect, useState } from "react";
import { useChannel } from "../../../context/context";
import {
  channelJoins,
  updateRequstStatus,
} from "../../../api/services/channelService";

function ChannelRequests() {
  const { chanID } = useChannel();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------
     LOAD JOIN REQUESTS
  ------------------------------------------------------------- */
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await channelJoins(chanID);
        console.log("Channel Join Requests (raw): ", data);

        // NORMALIZE BACKEND RESPONSE
        const normalized = (data?.requests || []).map((req) => ({
          requestId: req.requestId,
          channelId: req.channelId,
          userId: req.userId,
          status: req.status,
          type: req.type,
          createdAt: Number(req.createdAt) * 1000, // convert seconds -> ms
        }));

        setRequests(normalized);
      } catch (err) {
        console.log(err);
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (chanID) fetchRequests();
  }, [chanID]);

  /* -------------------------------------------------------------
     ACTIONS: ACCEPT / REJECT
  ------------------------------------------------------------- */
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

  /* -------------------------------------------------------------
     UI HELPERS
  ------------------------------------------------------------- */
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

  /* -------------------------------------------------------------
     LOADING UI
  ------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading channel requests...
      </div>
    );
  }

  /* -------------------------------------------------------------
     MAIN UI
  ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Channel Join Requests
        </h1>

        {error && (
          <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          
          {requests.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No requests found.
            </div>
          )}

          {requests.map((req) => (
            <div key={req.requestId} className="p-6 flex items-center justify-between">
              
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Join Request
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  User wants to join this channel.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Request ID: {req.requestId}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {getStatusIcon(req.status)}
                    {req.status.toUpperCase()}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChannelRequests;
