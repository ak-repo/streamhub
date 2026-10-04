import api, { handleError, handleSuccess } from "../api";

/* --------------------------------------------------------
   CREATE CHANNEL
---------------------------------------------------------*/
export const createChannel = async (name, description, visibility) => {
  if (!name) return;
  try {
    const res = await api.post("/channels/create", {
      name,
      description,
      visibility,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LIST USER CHANNELS
---------------------------------------------------------*/
export const listChannels = async () => {
  try {
    const res = await api.get(`/channels`);

    console.log("list channel: ", res?.data); // TODO remove

    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   GET CHANNEL DETAILS
---------------------------------------------------------*/
export const getChannel = async (channelId) => {
  try {
    const res = await api.get(`/channels/channel/${channelId}`);
    console.log("channel: ", res?.data);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LIST CHANNEL MEMBERS
---------------------------------------------------------*/
export const getMembers = async (channelId) => {
  try {
    const res = await api.get(`/channels/members/${channelId}`);
    console.log("memevers listing: ", res?.data); // TODO remove

    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LIST MESSAGE HISTORY
---------------------------------------------------------*/
export const getMsgHistory = async (channelId, limit = 50, offset = 0) => {
  try {
    const res = await api.get(
      `/channels/${channelId}/history?limit=${limit}&offset=${offset}`
    );
    console.log("msg history: ", res?.data); // TODO remove
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LEAVE CHANNEL
---------------------------------------------------------*/
export const leaveChannel = async (channelId) => {
  try {
    console.log("if", channelId);
    const res = await api.delete(`/channels/leave/${channelId}`);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   DELETE CHANNEL (correct query names)
---------------------------------------------------------*/
export const deleteChannel = async (channelId) => {
  try {
    const res = await api.delete(`/channels/${channelId}`);
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   SEND JOIN REQUEST
---------------------------------------------------------*/
export const sendJoin = async (channelId) => {
  try {
    const res = await api.post("/channels/sendjoin", {
      channel_id: channelId,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   SEND INVITE
   backend expects: 

---------------------------------------------------------*/
export const sendInvite = async (channelId, targetUserId) => {
  try {
    const res = await api.post("/channels/sendinvite", {
      channel_id: channelId,
      target_user_id: targetUserId,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LIST USER INVITES
---------------------------------------------------------*/
export const userInvites = async () => {
  try {
    const res = await api.get("/channels/invites");
    console.log("list user invites:", res); //TODO remove
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   LIST CHANNEL JOIN REQUESTS
---------------------------------------------------------*/
export const channelJoins = async (channelId) => {
  try {
    const res = await api.get(`/channels/joins/${channelId}`);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   UPDATE REQUEST STATUS
   backend expects: { requestId, status }
---------------------------------------------------------*/
export const updateRequstStatus = async (reqId, status) => {
  try {
    const res = await api.post("/channels/updatereq", {
      request_id: reqId,
      status: status,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

//------------------------------------ADMIN only --------------------------------------------------
export const adminListChannels = async (limit, offset) => {
  try {
    const res = await api.get(
      `/admin/channels?limit=${limit}&offset=${offset}`
    );
    console.log("admin channel list", res.data); //TODO remove
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   ADMIN: FREEZE CHANNEL
---------------------------------------------------------*/
export const adminFreezeChannel = async (channelId, reason) => {
  try {
    const res = await api.post("/admin/channels/freeze", {
      channel_id: channelId,
      reason: reason,
      freeze: true,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/* --------------------------------------------------------
   ADMIN: UNFREEZE CHANNEL
---------------------------------------------------------*/
export const adminUnfreezeChannel = async (channelId, reason) => {
  try {
    const res = await api.post("/admin/channels/unfreeze", {
      channel_id: channelId,
      reason: reason,
      freeze: false,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const adminDeleteChannel = async (channelId) => {
  try {
    const res = await api.delete(`/admin/channels/${channelId}`);
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

/// ________________________________________common________________________________
/* --------------------------------------------------------
   SEARCH PLACEHOLDER
---------------------------------------------------------*/
export const searchChannels = async (query, limit, offset) => {
  try {
    const res = await api.get(
      `/channels/search?query=${query}&limit=${limit}&offset=${offset}`
    );
    console.log("search channels:", res?.data);
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};
