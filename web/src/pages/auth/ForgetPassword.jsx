import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { verifyPasswordReset } from "../../api/services/userService"; // You need to create this

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Unauthorized access");
      navigate("/auth");
    }
  }, [email, navigate]);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!otp.trim()) return toast.error("Please enter the OTP code");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
     
      await verifyPasswordReset(email, otp, newPassword);
      
      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/auth")} 
          className="flex items-center text-blue-300 hover:text-blue-200 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Set New Password</h2>
          <p className="text-blue-100/60 mt-2 text-sm">
            We sent a code to <span className="font-semibold text-white">{email}</span>.
            <br/>Enter it below along with your new password.
          </p>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-5">
          
          {/* OTP Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider ml-1">OTP Code</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-blue-300/50" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                autoFocus
              />
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-blue-300/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-white/10 border border-white/20 pl-10 pr-10 py-3 text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-blue-300/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-blue-300/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
