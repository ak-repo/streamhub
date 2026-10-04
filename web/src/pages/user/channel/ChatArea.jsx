import { useState, useEffect, useRef } from "react";
import { useAuth, useChannel } from "../../../context/context";

const GATEWAY_WS = "ws://localhost:8080/api/v1/ws";

/* -------------------------------------------------------------
   NORMALIZE MESSAGE FROM SERVER
------------------------------------------------------------- */
const normalizeMessage = (rawData) => {
  const objectEvent = rawData.Event;
  if (!objectEvent) return null;

  const msgData = objectEvent.MessageCreated;
  if (!msgData || !msgData.content) return null;

  return {
    serverId: msgData.id,
    content: msgData.content,

    // Unified timestamp
    createdAt: Number(
      msgData.created_at || objectEvent.timestamp || Date.now()
    ),

    userId: msgData.sender_id || msgData.user_id,
    channelId: objectEvent.channel_id || msgData.channel_id,
    username: msgData.username || "Unknown",

    isOptimistic: false,
  };
};

/* -------------------------------------------------------------
   CHAT AREA
------------------------------------------------------------- */
export default function ChatArea() {
  const { user } = useAuth();
  const { chanID, messages, setMessages, setRefMsg, members } = useChannel();

  const [inputMessage, setInputMessage] = useState("");
  const [status, setStatus] = useState("connected");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const safeMessages = Array.isArray(messages) ? messages : [];

  /* -------------------------------------------------------------
     INITIAL HISTORY LOAD
  ------------------------------------------------------------- */
  useEffect(() => {
    setRefMsg((p) => !p);
  }, [setRefMsg]);

  /* -------------------------------------------------------------
     CONNECT WEBSOCKET
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!chanID || !user?.id) return;

    if (socketRef.current) socketRef.current.close();

    const ws = new WebSocket(`${GATEWAY_WS}?userId=${user.id}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(
        JSON.stringify({
          type: "JOIN",
          channelId: chanID,
          userId: user.id,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const normalized = normalizeMessage(rawData);
        if (!normalized) return;

        setMessages((prev) => {
          if (!Array.isArray(prev)) return [normalized];

          // Replace optimistic if matches
          const optimisticIndex = prev.findIndex(
            (m) =>
              m.isOptimistic &&
              m.userId === normalized.userId &&
              m.content === normalized.content &&
              Math.abs(m.createdAt - normalized.createdAt) < 500
          );

          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = {
              ...normalized,
              isOptimistic: false,
            };
            return updated;
          }

          // Prevent duplicates
          const exists = prev.some(
            (m) =>
              !m.isOptimistic &&
              m.userId === normalized.userId &&
              m.content === normalized.content &&
              Math.abs(m.createdAt - normalized.createdAt) < 500
          );

          if (exists) return prev;

          return [...prev, normalized];
        });
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");

    return () => ws.close();
  }, [chanID, user?.id, setMessages]);

  /* -------------------------------------------------------------
     AUTO-SCROLL
  ------------------------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages]);

  /* -------------------------------------------------------------
     SEND MESSAGE + OPTIMISTIC UPDATE
  ------------------------------------------------------------- */
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || status !== "connected") return;

    const now = Date.now();

    const payload = {
      type: "MESSAGE",
      channelId: chanID,
      userId: user.id,
      username: user.username || user.email || "User",
      content: inputMessage,
      createdAt: now,
      localId: now,
    };

    socketRef.current?.send(JSON.stringify(payload));

    // optimistic add
    setMessages((prev) => [
      ...prev,
      {
        userId: payload.userId,
        username: payload.username,
        content: payload.content,
        createdAt: now,
        isOptimistic: true,
      },
    ]);

    setInputMessage("");
  };

  /* -------------------------------------------------------------
     Sort messages by time (ascending: oldest → newest)
  ------------------------------------------------------------- */
  const sortedMessages = [...safeMessages].sort(
    (a, b) => a.createdAt - b.createdAt
  );

  /* -------------------------------------------------------------
     RENDER
  ------------------------------------------------------------- */
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
          <div className="p-4 space-y-3">
            {sortedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-12">
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              sortedMessages.map((msg, idx) => {
                const senderId = msg.senderId ?? msg.userId;
                const isMe = String(senderId) === String(user?.id);

                let displayName = msg.username;
                if (!displayName || displayName === "Unknown") {
                  const m = members.find(
                    (x) => String(x.userId) === String(senderId)
                  );
                  displayName = m?.username || m?.user?.username || "Unknown";
                }

                return (
                  <div
                    key={msg.serverId || msg.createdAt || idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        isMe
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      } ${msg.isOptimistic ? "opacity-75" : ""}`}
                    >
                      {!isMe && (
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {displayName}
                        </div>
                      )}

                      <div className="text-sm break-words">
                        {msg.content}
                        {msg.isOptimistic && (
                          <span className="ml-1 text-xs text-gray-500">⏳</span>
                        )}
                      </div>

                      <div
                        className={`text-xs mt-1 ${
                          isMe
                            ? "text-gray-400 text-right"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {new Date(Number(msg.createdAt)).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-top border-gray-100 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-end space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              status === "connected" ? "Type a message..." : "Connecting..."
            }
            className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-1 focus:ring-gray-400 text-sm"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || status !== "connected"}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              inputMessage.trim() && status === "connected"
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
