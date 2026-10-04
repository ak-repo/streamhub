import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/context";

const EmailVerification = () => {
  const [message, setMessage] = useState("");
  const location = useLocation();
  const { generateLink,user } = useAuth()
  const navigate = useNavigate();

  const email = location.state?.email; // Get email from navigation state

  // Generate verification link on component mount
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const success = await generateLink(email);
        console.log(success);
      } catch (err) {
        setMessage("falied sent link :", err);
      }
    };

    if (email) {
      fetchLink();
    }
  }, [email]);

  const handleCheck = () => {
    if (user != null) {
      navigate("/home");
    }
    alert("not verified");
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-red-500 text-lg">
          No email found. Please go back and register again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          A verification link has been sent to{" "}
          <span className="font-medium">{email}</span>. Please check your inbox
          and click the link to activate your account.
        </p>

        {message && (
          <p
            className={`mb-4 ${
              message.includes("Failed") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
