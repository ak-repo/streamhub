import React, { useEffect, useState, useMemo } from "react";
import { ChannelContext, useAuth } from "./context";
import {
  getChannel,
  getMembers,
  getMsgHistory,
} from "../api/services/channelService";
import { listFilesByChannel } from "../api/services/fileService";

function ChannelProvider({ children }) {
  const { user } = useAuth();

  // --- State ---
  const [chanID, setChanID] = useState("");
  const [channel, setChannel] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);

  // --- Triggers ---
  const [refMsg, setRefMsg] = useState(false);
  const [refFile, setRefFile] = useState(false);
  const [refMem, setRefMem] = useState(false);

  const isOwner = useMemo(() => {
    return channel?.ownerId === user?.id;
  }, [channel, user?.id]);

  const isMember = useMemo(() => {
    return Array.isArray(members) && members.some((m) => m.userId === user?.id);
  }, [members, user?.id]);

  // --- 1. Reset State on Channel Change ---
  useEffect(() => {
    if (!chanID) {
      setChannel(null);
      setMembers([]);
      setMessages([]);
      setFiles([]);
    }
  }, [chanID]);

  // --- 2. Fetch Channel Details ---
  useEffect(() => {
    if (!chanID) return;

    const fetchChannelInfo = async () => {
      try {
        const data = await getChannel(chanID);
        setChannel(data?.channel || null);
      } catch (err) {
        console.error("Fetch Channel Error:", err);
        setChannel(null);
      }
    };

    fetchChannelInfo();
  }, [chanID]);

  // --- 3. Fetch Members (Triggered by chanID OR refMem) ---
  useEffect(() => {
    if (!chanID) return;

    const fetchMembersList = async () => {
      try {
        const data = await getMembers(chanID);
        setMembers(Array.isArray(data?.members) ? data.members : []);
      } catch (err) {
        console.error("Fetch Members Error:", err);
        setMembers([]);
      }
    };

    fetchMembersList();
  }, [chanID, refMem]);

  // --- 4. Fetch Messages (Triggered by chanID OR refMsg) ---
  useEffect(() => {
    if (!chanID) return;

    const fetchMessagesList = async () => {
      try {
        const data = await getMsgHistory(chanID);
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (err) {
        console.error("Fetch Messages Error:", err);
        setMessages([]);
      }
    };

    fetchMessagesList();
  }, [chanID, refMsg]);

  // --- 5. Fetch Files (Triggered by chanID OR refFile) ---
  useEffect(() => {
    if (!chanID || !user?.id) return;

    const fetchFilesList = async () => {
      try {
        const data = await listFilesByChannel(chanID);
        setFiles(Array.isArray(data?.files) ? data.files : []);
      } catch (err) {
        console.error("Fetch Files Error:", err);
        setFiles([]);
      }
    };

    fetchFilesList();
  }, [chanID, refFile, user?.id]);

  return (
    <ChannelContext.Provider
      value={{
        // State
        chanID,
        channel,
        members,
        messages,
        files,
        isOwner,
        isMember,

        // Setters
        setChanID,
        setMessages,
        setFiles,
        setMembers,

        // Triggers
        refMsg,
        setRefMsg,
        refFile,
        setRefFile,
        refMem,
        setRefMem,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export default ChannelProvider;
