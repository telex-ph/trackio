import api from "../../utils/axios";

export const fetchAccountsById = async (userId) => {
  if (!userId) return null;
  try {
    const res = await api.get(`/user/get-by-account/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch user", err);
    return null;
  }
};
