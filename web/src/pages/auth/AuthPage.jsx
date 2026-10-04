import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/context";
import Logo from "../../components/Logo";
import toast from "react-hot-toast";
import { forgetPassword } from "../../api/services/userService";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // --- Forgot Password State ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const passwordMinLength = 6;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors = {};
    if (!isLogin && form.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!isLogin) {
      if (form.password.length < passwordMinLength) {
        newErrors.password = `Password must be at least ${passwordMinLength} characters`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const success = await login(form.email, form.password);
        if (!success) setMessage("Invalid login credentials");
      } else {
        const success = await register(form);
        if (success) navigate("/verify-gen", { state: { email: form.email } });
        else setMessage("Registration failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle Forgot Password Navigation ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(forgotEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    const data = await forgetPassword(forgotEmail);
    if (data) {
      navigate("/forgot-password", { state: { email: forgotEmail } });
    }
  };

  const oauthProviders = [
    {
      name: "Google",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
          {/* Left Side - Branding (Unchanged) */}
          <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-12 justify-between border-r border-white/10 backdrop-blur-sm">
            <div>
              <div className="flex items-center space-x-3 mb-12">
                <Logo />
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Your Central Hub for{" "}
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Files & Collaboration
                </span>
              </h2>
              <p className="text-blue-100/80 text-lg mb-10 leading-relaxed">
                Streamline your workflow with seamless file sharing, real-time
                communication, and smart notifications.
              </p>
              <div className="space-y-4">
                {[
                  "Secure file storage",
                  "Real-time collaboration",
                  "Smart tracking",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-100/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="p-8 lg:p-12 bg-gradient-to-br from-white/10 to-white/5 flex flex-col justify-center relative">
            {/* --- Forgot Password Modal Overlay --- */}
            {showForgotModal && (
              <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Reset Password
                    </h3>
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    Enter your email address to verify your identity. We will
                    send you an OTP.
                  </p>
                  <form
                    onSubmit={handleForgotPasswordSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-slate-900 border border-gray-700 text-white pl-10 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Main Form Content */}
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                  {isLogin ? "Welcome back" : "Join StreamHub"}
                </h2>
                <p className="mt-2 text-blue-100/70">
                  {isLogin ? "Sign in to continue" : "Create your account"}
                </p>
              </div>

              {/* Toggle Login/Signup */}
              <div className="mb-8">
                <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-sm border border-white/20">
                  <div className="grid grid-cols-2 gap-1">
                    {["Sign In", "Sign Up"].map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIsLogin(idx === 0)}
                        className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          (idx === 0 && isLogin) || (idx === 1 && !isLogin)
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "text-blue-100/70 hover:text-blue-100"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {message && (
                  <p className="text-red-400 text-sm text-center">{message}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {oauthProviders.map((provider) => (
                    <button
                      key={provider.name}
                      type="button"
                      className="flex items-center justify-center space-x-3 py-3 px-4 rounded-lg border border-white/20 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:border-white/40 group backdrop-blur-sm"
                    >
                      <div className="flex-shrink-0">{provider.icon}</div>
                      <span className="text-sm font-medium text-white/90 group-hover:text-white whitespace-nowrap">
                        {provider.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Inputs (Username, Email, Password) - Keeping existing logic */}
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-blue-300/50" />
                    <input
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full bg-white/10 border border-white/20 pl-12 pr-4 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-blue-300/50" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                    className="w-full bg-white/10 border border-white/20 pl-12 pr-4 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-blue-300/50" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full bg-white/10 border border-white/20 pl-12 pr-12 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-blue-300/50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link Trigger */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 px-4 text-sm font-semibold text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>
                    {loading
                      ? "Loading..."
                      : isLogin
                      ? "Sign in"
                      : "Create account"}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
