import Roles from "../../constants/roles";
import api from "../../utils/axios";
import socket from "../../utils/socket";

export const offenseEscalationBadge = (set, get) => ({
  unreadEscalation: 0,

  fetchUnreadEscalatedOffenses: async (user) => {
    try {
      const { data } = await api.get("/offenses");

      let unreadEscalation = 0;

      data.forEach((offense) => {
        if (offense.type !== "IR") return;

        if ([Roles.COMPLIANCE, Roles.COMPLIANCE_HEAD].includes(user.role)) {
          if (
            Object.prototype.hasOwnProperty.call(offense, "isReadByCompliance") &&
            offense.isReadByCompliance === false
          ) {
            unreadEscalation++;
          }
        }
      });

      set({ unreadEscalation });
    } catch (err) {
      console.error("Error fetching unread offenses:", err);
    }
  },

  attachOffenseEscalatedSocketListeners: () => {
    const refresh = () => {
      const user = get().user;
      if (!user?._id) return;
      get().fetchUnreadEscalatedOffenses(user);
    };

    socket.on("offenseCreated", refresh);
    socket.on("offenseUpdated", refresh);
    socket.on("offenseDeleted", refresh);
  },

  removeOffenseSocketListeners: () => {
    socket.off("offenseCreated");
    socket.off("offenseUpdated");
    socket.off("offenseDeleted");
  },
});
