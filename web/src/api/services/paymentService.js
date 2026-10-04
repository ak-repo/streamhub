import api, { handleError } from "../api";

export const paymentSession = async (channel_id, plan_id) => {
  try {
    const res = await api.post(`/payment/session`, { channel_id, plan_id });

    return res?.data;
  } catch (e) {
    handleError(e);
  }
};

export const verifyPaymentService = async (data) => {
  try {
    console.log("data:  ", data);
    const res = await api.post(`/payment/verify`, data);

    return res?.data;
  } catch (e) {
    handleError(e);
  }
};

export const listSubscriptionPlans = async (channel_id) => {
  try {
    const res = await api.get(`/payment/subscription/${channel_id}`);
    return res?.data;
  } catch (e) {
    handleError(e);
  }
};
