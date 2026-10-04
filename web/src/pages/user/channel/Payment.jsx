import React, { useState } from "react";
import {
  paymentSession,
  verifyPaymentService,
} from "../../../api/services/paymentService";

// --- CONFIGURATION ---
const RAZORPAY_KEY_ID = "rzp_test_RqwWzgHgoIe4Eu"; // REPLACE with your actual public key

// --- DUMMY DATA FOR DEMO ---
// These values mirror what your gRPC service expects
const DEMO_PAYLOAD = {
  // 1 GB = 1073741824 bytes
  storage_added_bytes: 1073741824,
  // ₹500.00 = 50000 paise/cents (Razorpay expects smallest unit)
  amount_paid_cents: 50000,
  // Example UUID for the channel buying storage
  channel_id: "12345678-abcd-1234-abcd-1234567890ab",
  // purchaser_user_id is typically added by the Fiber Gateway from the Auth token
};

const Payment = () => {
  const [status, setStatus] = useState(
    "Ready to purchase 1GB storage for ₹500."
  );
  const [isLoading, setIsLoading] = useState(false);

  // 1. Function to load the Razorpay script dynamically
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 2. Main function to handle the payment button click
  const handlePayment = async () => {
    if (!RAZORPAY_KEY_ID.startsWith("rzp_")) {
      setStatus("ERROR: Please set your RAZORPAY_KEY_ID in the component.");
      return;
    }

    setIsLoading(true);
    setStatus("Step 1: Requesting Order ID from backend...");

    // A. Call the Fiber Gateway to create the Razorpay Order
    let orderId;
    try {
      const data = await paymentSession(DEMO_PAYLOAD);

      orderId = data.razorpayOrderId; // Get the ID from your gRPC response structure
      console.log("order id: ", orderId);
    } catch (error) {
      console.error("Order Creation Error:", error);
      setStatus(`ERROR: Order creation failed. ${error.message}`);
      setIsLoading(false);
      return;
    }

    // B. Load Razorpay script and open the widget
    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      setStatus("ERROR: Failed to load Razorpay SDK.");
      setIsLoading(false);
      return;
    }

    setStatus("Step 2: Razorpay checkout widget opened. Awaiting payment...");

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: DEMO_PAYLOAD.amount_paid_cents, // Amount in paise
      currency: "INR",
      name: "Stream Hub Storage",
      description: `Purchase ${
        DEMO_PAYLOAD.storage_added_bytes / 1024 / 1024 / 1024
      } GB Storage`,
      order_id: orderId, // The ID received from your backend
      handler: (response) => {
        // --- STEP 3: Razorpay Success Callback ---
        verifyPayment(response);
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
      },
      theme: {
        color: "#3498db",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      setStatus(`Payment Failed: ${response.error.description}`);
      setIsLoading(false);
    });
    paymentObject.open();

    // Since the widget is open, we can set loading to false here
    // The rest of the state changes will happen inside verifyPayment
    setIsLoading(false);
  };

  // 3. Function to send verification details back to your backend
  const verifyPayment = async (response) => {
    setStatus(
      "Step 3: Payment successful! Sending verification details to backend..."
    );
    setIsLoading(true);

    const verificationData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    };

    try {
      const data = await verifyPaymentService(verificationData);

      // SUCCESS! Storage is added and history is recorded.
      setStatus("Step 4: Verification Complete! Storage successfully added!");
      console.log("Verification Success:", data);
    } catch (error) {
      console.error("Verification Error:", error);
      setStatus(
        `CRITICAL ERROR: Verification Failed! ${error.message}. Check backend logs.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Stream Hub Storage Purchase Demo</h1>
      <p style={styles.status}>{status}</p>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? "Processing..." : "Buy 1GB Storage (₹500)"}
      </button>
      <hr style={styles.hr} />
    </div>
  );
};

// Simple inline styles for a quick demo look
const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  status: {
    fontSize: "1.1em",
    margin: "20px 0",
    color: "#3498db",
    fontWeight: "bold",
    minHeight: "30px",
  },
  button: {
    padding: "12px 25px",
    fontSize: "1.1em",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  hr: {
    margin: "30px 0",
    borderColor: "#eee",
  },
  note: {
    fontSize: "0.9em",
    color: "#777",
  },
  code: {
    backgroundColor: "#f4f4f4",
    padding: "2px 5px",
    borderRadius: "3px",
  },
};

export default Payment;
