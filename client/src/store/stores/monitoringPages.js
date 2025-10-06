import MONITORING_PAGES from "../../constants/monitoringSubPages";

export const monitoringPages = (set) => ({
  monitorPage: MONITORING_PAGES.STATUS,
  setMonitorPage: (data) => set({ monitorPage: data }),
});
