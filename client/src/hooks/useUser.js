import { useState } from "react";
import api from "../utils/axios";
import { formatDate } from "../utils/formatDateTime";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";
import Roles from "../constants/roles";
import { useQuery } from "@tanstack/react-query";

const useUser = () => {
  const user = useStore((state) => state.user);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user/get-users");

      // Map only if array exists
      const formattedData = response.data.map((item) => ({
        id: item._id,
        date: formatDate(item.createdAt),
        name: `${item.firstName} ${item.lastName}`,
        email: item.email,
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching users:", err);
      setError(err.response?.data ?? err.message);
      toast.error("Failed to load users");
    }
  };

  const fetchUsersByRoleScope = async () => {
    try {
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

      return formattedData;
    } catch (error) {
      console.error("Error fetching users by role scope: ", error);
      setError(error.response?.data ?? error.message);
      toast.error("Failed to load users by role scrope");
    }
  };

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const allowedRoles = [
    Roles.PRESIDENT,
    Roles.ADMIN,
    Roles.ADMIN_HR_HEAD,
    Roles.COMPLIANCE,
    Roles.COMPLIANCE_HEAD,
    Roles.OM,
    Roles.TEAM_LEADER,
  ];

  const { data: userByRoleScope, isLoading: loading } = useQuery({
    queryKey: ["usersByRoleScope"],
    queryFn: fetchUsersByRoleScope,
    enabled: !!user?._id && !!user?.role && allowedRoles.includes(user.role),
  });

  // useEffect(() => {
  //   fetchUsers();
  // }, [fetchUsers]);

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
