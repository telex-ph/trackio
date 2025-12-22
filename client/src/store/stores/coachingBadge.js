import api from "../../utils/axios";
import socket from "../../utils/socket";

export const coachingBadge = (set, get) => ({
    unreadMyCoaching: 0,
    unreadCreatedCoaching: 0,

    fetchUnreadCoaching: async (user) => {
        try {
            const { data } = await api.get("/offenses");

            let unreadMyCoaching = 0;
            let unreadCreatedCoaching = 0;

            data.forEach((log) => {
                if (log.type !== "COACHING") return;

                if (!log.isReadByRespondant && log.respondantId === user._id)
                    unreadMyCoaching++;

                if (!log.isReadByCoach && log.coachId === user._id)
                    unreadCreatedCoaching++;
            });

            set({ unreadMyCoaching, unreadCreatedCoaching });
        } catch (err) {
            console.error("Error fetching unread coaching logs:", err);
        }
    },

    attachCoachingSocketListeners: () => {
        const refresh = () => {
            const user = get().user;
            if (!user?.employeeId) return;
            get().fetchUnreadCoaching(user);
        };

        socket.on("coachingCreated", refresh);
        socket.on("coachingUpdated", refresh);
    },

    removeCoachingSocketListeners: () => {
        socket.off("coachingCreated");
        socket.off("coachingUpdated");
    },
});
