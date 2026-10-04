import api, { handleError, handleSuccess } from "../api";
import axios from "axios";

/**
 * Upload a file using presigned URL
 */
export const uploadFile = async (file, channelId, isPublic) => {
  try {
    if (!file) {
      alert("Select a file first!");
      return null;
    }

    // 1. Request presigned upload URL
    const { data } = await api.post(`/files/upload-url`, {
      filename: file.name,
      size_bytes: file.size,
      mime_type: file.type,
      is_public: isPublic,
      channel_id: channelId,
    });

    const uploadUrl = data?.uploadUrl; // changed from upload_url
    const fileId = data?.fileId; // changed from file_id
    console.log("file id:", fileId);
    console.log("upload url: ", uploadUrl);

    // 2. Upload directly to S3 / MinIO
    await axios.put(uploadUrl, file);

    // 3. Confirm upload
    const res = await api.post(`/files/confirm`, {
      file_id: fileId,
      success: true,
    });

    console.log("file upload confirm res:", res);
    return fileId;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
};

/**
 * List files for a channel
 */
export const listFilesByChannel = async (channelId) => {
  try {
    const res = await api.get(
      `/files?channel_id=${channelId}&limit=10&offset=10`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to load files:", err);
    throw err;
  }
};

/**
 * Get a temporary download URL
 */
export const downloadUrl = async (fileId, expireSeconds) => {
  try {
    const res = await api.get(
      `/files/download-url?file_id=${fileId}&expireSeconds=${expireSeconds}`
    );

    const url = res.data?.downloadUrl; // changed from download_url
    if (!url) throw new Error("No download URL returned");

    return url;
  } catch (err) {
    console.error("Failed to get download URL:", err);
    throw err;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const res = await api.delete(`/files/${fileId}`);

    return res?.data;
  } catch (e) {
    handleError(e);
  }
};

export const getStorageUsage = async (channel_id) => {
  try {
    const res = await api.get(`/channels/storage/${channel_id}`);
    return res?.data;
  } catch (e) {
    handleError(e);
  }
};

//  ----------------------------------------  -------- admin specified
export const adminListFiles = async (limit, offset) => {
  try {
    const res = await api.get(`/admin/files?limit=${limit}&offset=${offset}`);
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const adminDeleteFile = async (filesId) => {
  try {
    const res = await api.delete(`/admin/files/${filesId}`, {
      data: { filesId },
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};
