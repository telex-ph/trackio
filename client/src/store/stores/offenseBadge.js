import api from "../../utils/axios";

export const offenseBadge = (set) => ({
  unreadOffensesHR: 0,
  unreadOffensesRespondent: 0,
  unreadOffensesReporter: 0, // for Reporter side

  fetchUnreadOffenses: async ({ role, employeeId }) => {
    try {
      const { data } = await api.get("/offenses");

      let unreadHR = 0;
      let unreadRespondent = 0;
      let unreadReporter = 0;

      data.forEach((offense) => {
        const status = offense.status;

        // ---------- HR logic ----------
        if (role === "HR") {
          if (
            ["Pending Review", "Respondent Explained", "Acknowledged"].includes(
              status
            )
          ) {
            if (!offense.isReadByHR) unreadHR++;
          } else if (
            ["NTE", "Scheduled for hearing", "After Hearing"].includes(status)
          ) {
            if (!offense.isReadByRespondant) unreadRespondent++;
          } else if (status === "Invalid") {
            if (!offense.isReadByReporter) unreadReporter++;
          }
        }

        // ---------- Respondent logic ----------
        if (role === "RESPONDENT") {
          if (
            ["NTE", "Scheduled for hearing", "After Hearing"].includes(status)
          ) {
            if (!offense.isReadByRespondant && offense.employeeId === employeeId) unreadRespondent++;
          } else if (status === "Invalid") {
            if (!offense.isReadByReporter) unreadReporter++;
          } else if (
            ["Pending Review", "Respondent Explained", "Acknowledged"].includes(
              status
            )
          ) {
            if (!offense.isReadByHR) unreadHR++;
          }
        }

        // ---------- Reporter logic ----------
        if (role === "REPORTER") {
          if (status === "Invalid") {
            if (!offense.isReadByReporter) unreadReporter++;
          } else if (
            ["Pending Review", "Respondent Explained", "Acknowledged"].includes(
              status
            )
          ) {
            if (!offense.isReadByHR) unreadHR++;
          } else if (
            ["NTE", "Scheduled for hearing", "After Hearing"].includes(status)
          ) {
            if (!offense.isReadByRespondant) unreadRespondent++;
          }
        }
      });

      set({
        unreadOffensesHR: unreadHR,
        unreadOffensesRespondent: unreadRespondent,
        unreadOffensesReporter: unreadReporter,
      });
    } catch (error) {
      console.error("Error fetching unread offenses:", error);
    }
  },

  decrementUnreadOffensesHR: () =>
    set((state) => ({ unreadOffensesHR: Math.max(state.unreadOffensesHR - 1, 0) })),
  decrementUnreadOffensesRespondent: () =>
    set((state) => ({
      unreadOffensesRespondent: Math.max(state.unreadOffensesRespondent - 1, 0),
    })),
  decrementUnreadOffensesReporter: () =>
    set((state) => ({
      unreadOffensesReporter: Math.max(state.unreadOffensesReporter - 1, 0),
    })),
});
