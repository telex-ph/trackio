import api from "../../utils/axios";

export const offenseBadge = (set) => ({
  unreadOffensesHR: 0,
  unreadOffensesRespondent: 0,

  // ✅ Fetch unread offenses for HR (isReadByHR: false)
  fetchUnreadOffensesHR: async () => {
    try {
      const { data } = await api.get("/offenses");
      const unreadCount = data.filter((o) => !o.isReadByHR).length;
      set({ unreadOffensesHR: unreadCount });
    } catch (error) {
      console.error("Error fetching unread offenses (HR):", error);
    }
  },

  // ✅ Fetch unread offenses for Team Leader & Agent (isReadByRespondant: false)
  fetchUnreadOffensesRespondent: async (employeeId) => {
    if (!employeeId) return; // Skip if no ID available
    try {
      const { data } = await api.get("/offenses");

      const unreadCount = data.filter(
        (o) =>
          // Must have the field
          Object.prototype.hasOwnProperty.call(o, "isReadByRespondant") &&
          // Unread by respondent
          o.isReadByRespondant === false &&
          // Belongs to current user
          o.employeeId === employeeId
      ).length;

      set({ unreadOffensesRespondent: unreadCount });
    } catch (error) {
      console.error("Error fetching unread offenses (TL/AGENT):", error);
    }
  },

  // ✅ Decrease counts when read
  decrementUnreadOffensesHR: () =>
    set((state) => ({
      unreadOffensesHR: Math.max(state.unreadOffensesHR - 1, 0),
    })),

  decrementUnreadOffensesRespondent: () =>
    set((state) => ({
      unreadOffensesRespondent: Math.max(
        state.unreadOffensesRespondent - 1,
        0
      ),
    })),
});
