import { useAuth, useChannel } from "../../../context/context";
import { getStorageUsage } from "../../../api/services/fileService";

import {
  uploadFile,
  downloadUrl,
  deleteFile,
} from "../../../api/services/fileService";
import { useState, useMemo, useEffect } from "react";

export default function Files() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);

  // Destructure members to look up names if file.username is missing
  const { files, chanID, refFile, setRefFile, members } = useChannel();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!chanID) return;

    const fetchChannelPlan = async () => {
      try {
        const data = await getStorageUsage(chanID);
        setPlan(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchChannelPlan();
  }, [chanID]);

  const usagePercent =
    plan?.limitBytes && plan?.usedBytes
      ? ((plan.usedBytes / plan.limitBytes) * 100).toFixed(2)
      : 0;

  // --- Logic: Sort Files (Newest First) ---
  const sortedFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];
    return [...files].sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return dateB - dateA; // Descending order
    });
  }, [files]);

  // --- Logic: File Icons & Colors ---
  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const baseClass = "w-6 h-6";

    // PDF (Red)
    if (["pdf"].includes(ext)) {
      return (
        <svg
          className={`${baseClass} text-red-500`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0111.414 2.586L15 6.172A2 2 0 0115.586 6H15a2 2 0 01-2-2V4a2 2 0 01-2-2H6a2 2 0 01-2 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    // Images (Blue)
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
      return (
        <svg
          className={`${baseClass} text-blue-500`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    // Video (Purple)
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
      return (
        <svg
          className={`${baseClass} text-purple-500`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }
    // Archives (Yellow)
    if (["zip", "rar", "7z", "tar"].includes(ext)) {
      return (
        <svg
          className={`${baseClass} text-yellow-500`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    // Code/Text (Gray)
    return (
      <svg
        className={`${baseClass} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0111.414 2.586L15 6.172A2 2 0 0115.586 6H15a2 2 0 01-2-2V4a2 2 0 01-2-2H6a2 2 0 01-2 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  // --- Logic: Helpers ---
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUploaderName = (file) => {
    if (file.ownerId === user?.id) return "You";
    if (file.username) return file.username; // If backend provides it
    // Fallback: search in members list
    const member = members?.find(
      (m) => String(m.userId) === String(file.ownerId)
    );
    return member?.username || member?.user?.username || "Unknown User";
  };

  // --- Handlers ---

  // 1. Preview (New Tab)
  const handlePreview = async (fileId) => {
    try {
      // Get signed URL valid for 1 hour
      const signedUrl = await downloadUrl(fileId, user?.id, 3600);
      // Open in new tab
      window.open(signedUrl, "_blank");
    } catch (err) {
      console.error("Preview failed", err);
      alert("Could not preview file.");
    }
  };

  // 2. Download (Force Save)
  const handleDownload = async (fileId, filename) => {
    try {
      const signedUrl = await downloadUrl(fileId, 3600);
      const link = document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", filename); // Hint to browser
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed.");
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      setRefFile(!refFile);
    } catch (e) {
      console.log("file delete err: ", e);
    }
  };

  // 3. Upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadFile(file, chanID, false);
      setRefFile(!refFile);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header Area */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Channel Files
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and share resources
            </p>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              <span>Storage used: {usagePercent}%</span>
            </h1>
          </div>

          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            {isUploading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            <span>{isUploading ? "Uploading..." : "Upload New"}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-6">
          {/* Table Header */}
          {sortedFiles.length > 0 && (
            <div className="grid grid-cols-12 gap-4 mb-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-5">File Name</div>
              <div className="hidden sm:block col-span-3">Shared By</div>
              <div className="hidden sm:block col-span-2 text-right">Size</div>
              <div className="col-span-6 sm:col-span-2 text-right">Actions</div>
            </div>
          )}

          <div className="space-y-2">
            {sortedFiles.length > 0 ? (
              sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-200"
                >
                  {/* 1. File Info */}
                  <div className="col-span-6 sm:col-span-5 w-full flex items-center min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center mr-4 border border-gray-100 dark:border-gray-600">
                      {getFileIcon(file.filename)}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                        title={file.filename}
                      >
                        {file.filename}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-0.5">
                        {formatFileSize(file.size)} •{" "}
                        {formatDate(file.created_at || file.createdAt)}
                      </p>
                      <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        {formatDate(file.created_at || file.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* 2. Uploader */}
                  <div className="hidden sm:flex col-span-3 items-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {getUploaderName(file)}
                    </div>
                  </div>

                  {/* 3. Size */}
                  <div className="hidden sm:block col-span-2 text-right text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {formatFileSize(file.sizeBytes)}
                  </div>

                  {/* 4. Actions */}
                  <div className="col-span-6 sm:col-span-2 w-full sm:w-auto flex justify-end items-center space-x-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreview(file.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Open in new tab"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                      title="Download"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    {/* Download Button */}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m4-3h2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No files yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-center max-w-xs">
                  Share documents, images, and resources with your team in this
                  channel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
