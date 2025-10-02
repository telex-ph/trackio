import { useState, useEffect, useCallback } from "react";
import api from "../utils/axios";
import { formatDate } from "../utils/formatDateTime";
import toast from "react-hot-toast";

const useUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/user/get-users");

      // Map only if array exists
      const formattedData = response.data.map((item) => ({
        id: item._id,
        date: formatDate(item.createdAt),
        name: `${item.firstName} ${item.lastName}`,
        email: item.email,
      }));

      setUsers(formattedData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data ?? err.message);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};

export default useUser;
