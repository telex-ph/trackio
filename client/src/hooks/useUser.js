import { useState, useEffect, useCallback } from "react";
import api from "../utils/axios";
import { formatDate } from "../utils/formatDateTime";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";
import Roles from "../constants/roles";

const useUser = () => {
  const user = useStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [userByRoleScope, setUsersByRoleScope] = useState([]);
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

  const fetchUsersByRoleScope = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/user/get-by-role/${user._id}/${user.role}`
      );

      const formattedData = response.data.map((item) => {
        const accounts = item.accountNames.join(", ");

        return {
          id: item._id,
          date: formatDate(item.createdAt),
          name: `${item.firstName} ${item.lastName}`,
          email: item.email,
          accounts,
          ...item,
        };
      });

      setUsersByRoleScope(formattedData);
    } catch (error) {
      console.error("Error fetching users by role scope: ", error);
      setError(error.response?.data ?? error.message);
      toast.error("Failed to load users by role scrope");
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (
      user.role === Roles.ADMIN ||
      user.role === Roles.OM ||
      user.role === Roles.TEAM_LEADER
    )
      fetchUsersByRoleScope();
  }, [fetchUsersByRoleScope, user.role]);

  return {
    users,
    userByRoleScope,
    loading,
    error,
    fetchUsers,
    fetchUsersByRoleScope,
  };
};

export default useUser;
