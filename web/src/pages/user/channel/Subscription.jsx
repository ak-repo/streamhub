import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth, useChannel } from "../../../context/context";
import {
  paymentSession,
  listSubscriptionPlans,
  verifyPaymentService,
} from "../../../api/services/paymentService";

const RAZORPAY_KEY_ID = "rzp_test_RqwWzgHgoIe4Eu";
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

// Utility functions extracted outside component
const mbToGB = (mb) => Math.floor(Number(mb) / 1024);

const formatDuration = (days) => {
  const daysNumber = Number(days);

  if (daysNumber >= 36500) return "Lifetime";
  if (daysNumber >= 365) return `${Math.floor(daysNumber / 365)} Years`;

  return `${daysNumber} Days`;
};

const formatPrice = (priceInr) => {
  return priceInr === undefined || priceInr === null ? "Free" : `₹${priceInr}`;
};

// Custom hook for Razorpay script loading
const useRazorpayScript = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadScript = useCallback(async () => {
    if (isScriptLoaded) return true;

    setIsLoading(true);

    try {
      const loaded = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      setIsScriptLoaded(loaded);
      return loaded;
    } finally {
      setIsLoading(false);
    }
  }, [isScriptLoaded]);

  return { loadScript, isLoading };
};

// Component for rendering individual plan cards
const PlanCard = React.memo(({ plan, isActive, isLoading, onSelectPlan }) => {
  const handleClick = useCallback(() => {
    if (!isActive && !isLoading) {
      onSelectPlan(plan);
    }
  }, [plan, isActive, isLoading, onSelectPlan]);

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-all duration-200
        ${
          isActive
            ? "border-sky-600 bg-sky-50 transform scale-[1.02]"
            : "bg-white hover:shadow-md"
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg uppercase tracking-wide text-gray-800">
          {plan.name}
        </h3>
        {isActive && (
          <span className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full font-medium">
            Current Plan
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Storage:</span>
          <span className="font-semibold">
            {mbToGB(plan.storageLimitMb)} GB
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Duration:</span>
          <span className="font-semibold">
            {formatDuration(plan.durationDays)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Price:</span>
          <span className="font-semibold text-lg">
            {formatPrice(plan.priceInr)}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isActive || isLoading}
        onClick={handleClick}
        className={`w-full py-3 rounded-lg font-medium transition-colors duration-200
          ${
            isActive
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          }
          ${isLoading ? "opacity-75 cursor-wait" : ""}
        `}
        aria-label={
          isActive ? "Current active plan" : `Upgrade to ${plan.name}`
        }
      >
        {isActive ? "✓ Active Plan" : "Upgrade Now"}
      </button>
    </div>
  );
});

PlanCard.displayName = "PlanCard";

// Main Subscription Component
function Subscription() {
  const { user } = useAuth();
  const { chanID } = useChannel();

  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { loadScript: loadRazorpayScript } = useRazorpayScript();

  const fetchPlans = useCallback(async () => {
    if (!chanID) return;

    try {
      const data = await listSubscriptionPlans(chanID);

      setPlans(data.plans || []);
      setCurrentPlanId(data?.currentPlanId);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
      setError("Unable to load subscription plans. Please try again later.");
    }
  }, [chanID, isProcessing]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePayment = useCallback(
    async (plan) => {
      if (!plan?.id || !user) {
        console.error("Missing plan ID or user information");
        return;
      }

      setIsProcessing(true);

      try {
        // Step 1: Create payment session
        const paymentData = await paymentSession(chanID, plan.id);
        const { razorpayOrderId: orderId } = paymentData;

        if (!orderId) {
          throw new Error("No order ID received from payment session");
        }

        // Step 2: Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        // Step 3: Initialize Razorpay
        const razorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: (plan.priceInr || 0) * 100, // Convert to paise
          currency: "INR",
          name: "StreamHub Storage",
          description: `${mbToGB(plan.storageLimitMb)} GB Storage Plan - ${
            plan.name
          }`,
          order_id: orderId,
          handler: async (response) => {
            try {
              await verifyPaymentService(response);
              setIsProcessing(false);
            } catch (error) {
              console.error("Payment verification failed:", error);
              // Consider showing a toast notification here
            }
          },
          prefill: {
            name: user.username || "",
            email: user.email || "",
          },
          theme: {
            color: "#0ea5e9",
            hide_topbar: false,
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);

        razorpay.on("payment.failed", (response) => {
          console.error("Payment failed:", response.error);
          setIsProcessing(false);
          // Consider showing a toast notification here
        });

        razorpay.open();
      } catch (error) {
        console.error("Payment initiation error:", error);
        setIsProcessing(false);

        // You could set an error state here for user feedback
      }
    },
    [chanID, user, loadRazorpayScript]
  );

  const planCards = useMemo(() => {
    return plans.map((plan) => (
      <PlanCard
        key={plan.id}
        plan={plan}
        isActive={plan.id === currentPlanId}
        isLoading={isProcessing}
        onSelectPlan={handlePayment}
      />
    ));
  }, [plans, currentPlanId, isProcessing, handlePayment]);

  // Loading state
  if (!chanID) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12 text-gray-500">
          Please select a channel to view subscription plans.
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPlans}
            className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (plans.length === 0 && !error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Channel Subscription Plans
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Choose a plan that fits your storage needs
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planCards}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
              <p className="text-gray-700">Processing your request...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscription;
