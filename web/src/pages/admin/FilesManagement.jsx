import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  adminListFiles,
  adminDeleteFile,
} from "../../api/services/fileService";

export default function FilesManagement() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [deletingFile, setDeletingFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const detailsModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // ---------------------
  // Fetch Files (NO totalCount)
  // ---------------------
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);

      const data = await adminListFiles(limit, limit * (page - 1));

      setFiles(data?.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ---------------------
  // Utilities
  // ---------------------
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes) => {
    const n = parseInt(bytes, 10) || 0;
    if (n < 1024) return `${n} B`;
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // ---------------------
  // Client search filter
  // ---------------------
  const filteredFiles = search
    ? files.filter((f) =>
        [f.filename, f.channelname, f.ownerName, f.mimeType]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : files;

  // ---------------------
  // Delete Logic
  // ---------------------
  const handleDeleteRequest = (file) => {
    setDeletingFile(file);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    try {
      await adminDeleteFile(deletingFile.id);
      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id));
      setShowDeleteModal(false);
      setDeletingFile(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ---------------------
  // Details Modal
  // ---------------------
  const handleViewDetails = (file) => {
    setSelectedFile(file);
    setShowDetailsModal(true);
  };

  // ---------------------
  // Render
  // ---------------------
  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Title + Search */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">File Management</h1>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="px-4 py-2 border rounded-lg bg-gray-50 w-64"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600">Loading...</div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "File",
                    "Channel",
                    "Owner",
                    "Type",
                    "Size",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{f.filename}</td>
                      <td className="px-6 py-4">{f.channelname}</td>
                      <td className="px-6 py-4">{f.ownerName}</td>
                      <td className="px-6 py-4">{f.mimeType}</td>
                      <td className="px-6 py-4">{formatSize(f.sizeBytes)}</td>
                      <td className="px-6 py-4">{formatDate(f.createdAt)}</td>

                      <td className="px-6 py-4 flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(f)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDeleteRequest(f)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No files found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              page={page}
              setPage={setPage}
              len={files.length}
              limit={limit}
            />
          </div>
        )}
      </div>

      {/* ---------------------- */}
      {/* File Details Modal     */}
      {/* ---------------------- */}
      {showDetailsModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div
            ref={detailsModalRef}
            className="bg-white rounded-lg p-6 w-96 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">File Details</h2>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedFile.filename}
              </p>
              <p>
                <strong>Channel:</strong> {selectedFile.channelname}
              </p>
              <p>
                <strong>Owner:</strong> {selectedFile.ownerName}
              </p>
              <p>
                <strong>Type:</strong> {selectedFile.mimeType}
              </p>
              <p>
                <strong>Size:</strong> {formatSize(selectedFile.sizeBytes)}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(selectedFile.createdAt)}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* Delete Confirmation    */}
      {/* ---------------------- */}
      {showDeleteModal && deletingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-lg p-6 w-96 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Delete File?</h2>

            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <strong>{deletingFile.filename}</strong>?
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------
// Pagination – LIMIT BASED
// ----------------------
function Pagination({ page, setPage, len, limit }) {
  return (
    <div className="flex justify-between items-center p-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-gray-700 font-medium">Page {page}</span>

      <button
        disabled={len < limit}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

// Modals
const FileDetailsModal = React.forwardRef(
  (
    {
      setShowDetailsModal,
      selectedFile,
      formatDate,
      formatFileSize,
      getFileTypeName,
      handleBackdropClick,
    },
    ref
  ) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={(e) => handleBackdropClick(e, "details")}
    >
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">File Details</h2>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            Close
          </button>
        </div>
        <div>
          <p className="font-bold">{selectedFile.filename}</p>
          <p>{getFileTypeName(selectedFile.mimeType)}</p>
          <p>{formatFileSize(selectedFile.size)}</p>
          <p>Uploaded: {formatDate(selectedFile.createdAt)}</p>
        </div>
      </div>
    </div>
  )
);

const DeleteFileModal = React.forwardRef(
  (
    {
      setShowDeleteModal,
      deletingFile,
      setDeletingFile,
      handleConfirmDelete,
      formatFileSize,
      handleBackdropClick,
    },
    ref
  ) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={(e) => handleBackdropClick(e, "delete")}
    >
      <div
        ref={ref}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Delete File</h2>
        <p>
          Are you sure you want to delete{" "}
          <strong>{deletingFile.filename}</strong>?
        </p>
        <p>Size: {formatFileSize(deletingFile.size)}</p>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Delete
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingFile(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
);
