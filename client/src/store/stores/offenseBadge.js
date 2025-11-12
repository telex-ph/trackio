import api from "../../utils/axios";


export const offenseBadge = (set) => ({
  unreadOffenses: 0,

  // Fetch unread offenses count
  fetchUnreadOffenses: async () => {
    try {
      const { data } = await api.get("/offenses");
      const unreadCount = data.filter((o) => !o.isReadByHR).length;
      set({ unreadOffenses: unreadCount });
    } catch (error) {
      console.error("Error fetching unread offenses:", error);
    }
  },

  // Decrease count locally when HR views one
  decrementUnreadOffenses: () =>
    set((state) => ({
      unreadOffenses: Math.max(state.unreadOffenses - 1, 0),
    })),
});
