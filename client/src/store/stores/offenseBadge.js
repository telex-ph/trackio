import Roles from "../../constants/roles";
import api from "../../utils/axios";
import socket from "../../utils/socket";

export const offenseBadge = (set, get) => ({
  unreadIR: 0,
  unreadMyOffenses: 0,

  fetchUnreadOffenses: async (user) => {
    try {
      const { data } = await api.get("/offenses");

      let unreadIR = 0;
      let unreadMyOffenses = 0;

      data.forEach((offense) => {
        if (offense.type !== "IR") return;

        if ([Roles.HR, Roles.ADMIN_HR_HEAD].includes(user.role)) {
          if (!offense.isReadByHR) unreadIR++;
        }

        if (!offense.isReadByRespondant && !["Pending Review", "Escalated to Compliance", "Findings sent"].includes(offense.status) && offense.respondantId === user._id) {
          unreadMyOffenses++;
        }

        // if (!offense.isReadByReporter && offense.reportedById === user._id) {
        //   unreadIR++;
        // }
      });

      set({ unreadIR, unreadMyOffenses });
    } catch (err) {
      console.error("Error fetching unread offenses:", err);
    }
  },

  attachOffenseSocketListeners: () => {
    const refresh = () => {
      const user = get().user;
      if (!user?._id) return;
      get().fetchUnreadOffenses(user);
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
