import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  adminListChannels,
  adminFreezeChannel,
  adminUnfreezeChannel,
  adminDeleteChannel,
} from "../../api/services/channelService";

// Utility function to format Unix timestamp (in seconds)
const formatDate = (timestamp) => {
  try {
    const ms = Number(timestamp) * 1000;
    const date = new Date(ms);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return timestamp;
  }
};

function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezingChannel, setFreezingChannel] = useState(null);
  const [freezeReason, setFreezeReason] = useState("");

  const detailsModalRef = useRef(null);
  const freezeModalRef = useRef(null);

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow =
      showDetailsModal || showFreezeModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showDetailsModal, showFreezeModal]);

  // Escape handler
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setShowDetailsModal(false);
        setShowFreezeModal(false);
        setFreezingChannel(null);
        setFreezeReason("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  // ***** NORMALIZE BACKEND PAYLOAD HERE *****
  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await adminListChannels();

      const normalized = (data?.channels || []).map((item) => ({
        id: item.channel.id,
        name: item.channel.name,
        description: item.channel.description || "",
        visibility: item.channel.visibility,
        createdAt: item.channel.createdAt,
        ownerId: item.channel.ownerId,
        ownerName:
          item.members?.find((m) => m.role === "admin")?.username || "Unknown",
        isFrozen: item.channel.isFrozen,
        members: item.members || [],
      }));

      setChannels(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Search
  const filteredChannels = channels.filter((ch) => {
    const s = searchTerm.toLowerCase();
    return (
      ch.name.toLowerCase().includes(s) ||
      ch.ownerName.toLowerCase().includes(s) ||
      ch.id.toLowerCase().includes(s)
    );
  });

  // View details
  const handleViewDetails = (ch) => {
    setSelectedChannel(ch);
    setShowDetailsModal(true);
  };

  // Freeze modal
  const handleFreezeChannel = (ch) => {
    setFreezingChannel(ch);
    setShowFreezeModal(true);
  };

  const handleConfirmFreeze = async () => {
    if (!freezingChannel) return;

    try {
      if (freezingChannel.isFrozen) {
        await adminUnfreezeChannel(freezingChannel.id);
      } else {
        await adminFreezeChannel(freezingChannel.id, freezeReason);
      }

      // update local UI
      setChannels((prev) =>
        prev.map((c) =>
          c.id === freezingChannel.id ? { ...c, isFrozen: !c.isFrozen } : c
        )
      );

      setShowFreezeModal(false);
      setFreezeReason("");
      setFreezingChannel(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete
  const handleDeleteChannel = async (id) => {
    if (!window.confirm("Delete this channel permanently?")) return;

    try {
      await adminDeleteChannel(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

 

  const getStatusBadgeColor = useCallback(
    (f) => (f ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"),
    []
  );

  const getPrivacyBadgeColor = (p) =>
    p ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";

  const getMemberCountText = (m) => {
    const c = m?.length || 0;
    return `${c} member${c !== 1 ? "s" : ""}`;
  };

  const handleBackdropClick = (e, type) => {
    if (
      type === "details" &&
      detailsModalRef.current &&
      !detailsModalRef.current.contains(e.target)
    ) {
      setShowDetailsModal(false);
    }
    if (
      type === "freeze" &&
      freezeModalRef.current &&
      !freezeModalRef.current.contains(e.target)
    ) {
      setShowFreezeModal(false);
      setFreezingChannel(null);
      setFreezeReason("");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Channel Management
            </h1>
            <p className="text-gray-600">Total Channels: {channels.length}</p>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((ch) => (
                    <tr key={ch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{ch.name}</div>
                        <div className="text-gray-500 text-sm">
                          {getMemberCountText(ch.members)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>{ch.ownerName}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                            ch.isFrozen
                          )}`}
                        >
                          {ch.isFrozen ? "Frozen" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(ch.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-sm flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(ch)}
                          className="text-blue-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleFreezeChannel(ch)}
                          className={
                            ch.isFrozen ? "text-green-600" : "text-yellow-600"
                          }
                        >
                          {ch.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(ch.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {searchTerm ? "No matching channels." : "No channels."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedChannel && (
        <DetailedChannel
          ref={detailsModalRef}
          setShowDetailsModal={setShowDetailsModal}
          selectedChannel={selectedChannel}
          formatDate={formatDate}
          getPrivacyBadgeColor={getPrivacyBadgeColor}
          getMemberCountText={getMemberCountText}
          handleBackdropClick={handleBackdropClick}
        />
      )}

      {/* FREEZE MODAL */}
      {showFreezeModal && freezingChannel && (
        <FreezeChannelModal
          ref={freezeModalRef}
          setShowFreezeModal={setShowFreezeModal}
          freezingChannel={freezingChannel}
          freezeReason={freezeReason}
          setFreezeReason={setFreezeReason}
          handleConfirmFreeze={handleConfirmFreeze}
          handleBackdropClick={handleBackdropClick}
          setFreezingChannel={setFreezingChannel}
        />
      )}
    </>
  );
}

export default ChannelManagement;

/* --------------- DETAILS MODAL ---------------- */

const DetailedChannel = React.forwardRef(
  (
    {
      setShowDetailsModal,
      selectedChannel,
      formatDate,
      getPrivacyBadgeColor,
      getMemberCountText,
      handleBackdropClick,
    },
    ref
  ) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50"
      onClick={(e) => handleBackdropClick(e, "details")}
    >
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Channel Details</h2>
          <button onClick={() => setShowDetailsModal(false)}>X</button>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold">{selectedChannel.name}</h3>
            <p className="text-gray-600">
              {selectedChannel.description || "No description"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-500">Channel ID</h4>
              <p className="text-sm">{selectedChannel.id}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Privacy</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getPrivacyBadgeColor(
                  selectedChannel.visibility
                )}`}
              >
                {selectedChannel.visibility ? "Private" : "Public"}
              </span>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Status</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  selectedChannel.isFrozen ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {selectedChannel.isFrozen ? "Frozen" : "Active"}
              </span>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Owner</h4>
              <p className="font-medium">{selectedChannel.ownerName}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Created</h4>
              {formatDate(selectedChannel.createdAt)}
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Members</h4>
              {getMemberCountText(selectedChannel.members)}
            </div>
          </div>

          {selectedChannel.members.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Members</h4>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChannel.members.map((m, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{m.username}</td>
                        <td className="px-4 py-2">{m.role}</td>
                        <td className="px-4 py-2">{formatDate(m.joinedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

DetailedChannel.displayName = "DetailedChannel";

/* --------------- FREEZE MODAL ---------------- */

const FreezeChannelModal = React.forwardRef(
  (
    {
      setShowFreezeModal,
      freezingChannel,
      freezeReason,
      setFreezeReason,
      handleConfirmFreeze,
      handleBackdropClick,
      setFreezingChannel,
    },
    ref
  ) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50"
      onClick={(e) => handleBackdropClick(e, "freeze")}
    >
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {freezingChannel.isFrozen ? "Unfreeze Channel" : "Freeze Channel"}
        </h2>

        <p className="mb-4 text-gray-700">
          Channel: <strong>{freezingChannel.name}</strong>
        </p>

        {!freezingChannel.isFrozen && (
          <div className="mb-4">
            <label className="text-sm font-medium">Reason</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-lg"
              rows={3}
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
            />
          </div>
        )}

        <div
          className={`p-3 rounded-lg mb-4 text-sm ${
            freezingChannel.isFrozen
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {freezingChannel.isFrozen
            ? "Unfreezing will restore access for all members."
            : "Freezing will block all members from accessing this channel."}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className={`px-4 py-2 text-white rounded-lg ${
              freezingChannel.isFrozen ? "bg-green-600" : "bg-red-600"
            }`}
            onClick={handleConfirmFreeze}
          >
            {freezingChannel.isFrozen ? "Unfreeze" : "Freeze"}
          </button>

          <button
            onClick={() => {
              setShowFreezeModal(false);
              setFreezingChannel(null);
              setFreezeReason("");
            }}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
);

FreezeChannelModal.displayName = "FreezeChannelModal";
