import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyLinkService } from "../../api/services/userService";

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const data = await verifyLinkService(email, token);
        console.log("Verification response:", data);
        setStatus("success");
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } catch (err) {
        console.log(err);
        setStatus("error");
      }
    };

    if (token && email) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [email, token, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        {/* Success State */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Email Verified
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your email has been successfully verified. Redirecting you to the
              hub...
            </p>
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mx-auto mt-6">
              <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              The verification link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}

        {/* Verifying State */}
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-7.364l-2.828 2.828M7.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M7.464 6.464L4.636 3.636"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Verifying Email
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Please wait while we verify your email address...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
