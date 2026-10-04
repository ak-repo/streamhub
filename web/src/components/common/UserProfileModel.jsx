

export const UserProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* ... (Keep your existing Modal JSX here) ... */}
        {/* I omitted the inner JSX for brevity, copy your existing JSX here */}
        <div className="p-6">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">{user.username}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
           </div>
           <p className="text-gray-600 dark:text-gray-300">Joined: {joinDate}</p>
        </div>
      </div>
    </div>
  );
};
