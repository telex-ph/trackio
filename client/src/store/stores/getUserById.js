import api from "../../utils/axios";

// Fetch user by ID
export const fetchUserById = async (userId) => {
  if (!userId) return null;
  try {
    const res = await api.get(`/user/get-user/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch user", err);
    return null;
  }
};
