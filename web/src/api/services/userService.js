// src/services/authService.js
import api, { handleError, handleSuccess } from "../api";

// -------------------------------
// Public Auth APIs
// -------------------------------
export const loginService = async (email, password) => {
  try {
    const res = await api.post("/login", {
      email: email,
      password: password,
    });
    handleSuccess(res?.message);
    console.log("login:", res?.data);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const registerService = async (data) => {
  try {
    const res = await api.post("/register", data);
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const generateLinkService = async (data) => {
  console.log("Sending data:", data);
  try {
    const res = await api.post(
      "/verify-gen",
      { email: data },
      {
        headers: {
          "Content-Type": "application/json", // ensure server parses JSON
        },
      }
    );
    if (res?.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error generating link:", error);
    handleError(error); // custom error handler
  }
};
export const verifyLinkService = async (email, token) => {
  try {
    const res = await api.get(`/verify-link?email=${email}&token=${token}`);
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
    return error;
  }
};

export const forgetPassword = async (email) => {
  try {
    const res = await api.post("/forget-password", { email: email });
    handleSuccess(res?.message);
    return res?.success;
  } catch (error) {
    handleError(error);
  }
};

export const verifyPasswordReset = async (email, otp, password) => {
  try {
    const res = await api.post("/verify-password", {
      email: email,
      token: otp,
      new_password: password,
    });
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

// -------------------------------
// Authenticated APIs
// -------------------------------
export const changePassword = async (current_password, new_password) => {
  try {
    const res = await api.post("/auth/change-password", {
      current_password,
      new_password,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const profileUpdate = async (username) => {
  try {
    const res = await api.post("/auth/profile-update", { username });
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const getMeService = async () => {
  try {
    const res = await api.get("/auth/me");
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const searchUsers = async (query) => {
  try {
    const res = await api.get(`/auth/users?query=${query}`);
    console.log("all users:", res?.data);
    handleSuccess(res?.message);
    return res?.data;
  } catch (error) {
    handleError(error);
  }
};

export const UploadProfile = async (formData) => {
  try {
    const res = await api.post(`/auth/upload-profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    handleSuccess(res?.message);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// admin
export const listUsers = async (filter, limit, offset) => {
  console.log("f:", filter, " limit", limit, "off:c", offset);
  try {
    const res = await api.get(
      `/admin/users?filter=${filter}&limit=${limit}&offset=${offset}`
    );
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const banUser = async (userId, reason) => {
  try {
    const res = await api.post("/admin/users/ban", {
      target_user_id: userId,
      reason: reason,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const unbanUser = async (userId, reason) => {
  try {
    const res = await api.post("/admin/users/unban", {
      target_user_id: userId,
      reason: reason,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const res = await api.post("/admin/users/change-role", {
      target_user_id: userId,
      new_role: role,
    });
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};

export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/admin/users/${userId}`);
    handleSuccess(res?.message);
    return res?.data;
  } catch (err) {
    handleError(err);
  }
};
