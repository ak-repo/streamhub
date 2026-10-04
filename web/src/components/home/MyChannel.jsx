import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/context";
import { createChannel, listChannels } from "../../api/services/channelService";
import { Pagination } from "../common/Pagination"; 

const ITEMS_PER_PAGE = 6;

export const MyChannels = () => {
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

  const totalPages = Math.ceil(totalChannels / ITEMS_PER_PAGE);

  const fetchChannels = async (page) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const data = await listChannels(user.id, ITEMS_PER_PAGE, offset);
      setChannels(data?.channels || []);
      setTotalChannels(data?.total || 0);
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
      {/* Create Channel Form */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-4">Create Workspace</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            value={inputForm.name}
            onChange={(e) =>
              setInputForm({ ...inputForm, name: e.target.value })
            }
            placeholder="Channel Name"
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200"
          />
          {/* ... Description and Select inputs ... */}
          <button
            onClick={handleCreate}
            className="px-5 py-2 bg-white text-sky-600 font-bold rounded-xl"
          >
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          channels.map((ch) => (
            <div
              key={ch.channelId}
              onClick={() => navigate(`/channel/${ch.channelId}`)}
              className="p-5 border rounded-2xl cursor-pointer hover:shadow-xl transition"
            >
              <h4 className="font-bold">{ch.name}</h4>
              <p className="text-sm text-gray-500">{ch.description}</p>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchChannels}
      />
    </div>
  );
};
