import TRACKING_PAGES from "../../constants/trackingSubPages";

export const trackingPages = (set) => ({
  trackPage: TRACKING_PAGES.TIMEIN,
  setTrackPage: (data) => set({ trackPage: data }),
});
