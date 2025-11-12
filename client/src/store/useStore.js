import { create } from "zustand";
import { user } from "./stores/user";
import { shiftSchedule } from "./stores/shiftSchedule";
import { trackingPages } from "./stores/trackingPages";
import { monitoringPages } from "./stores/monitoringPages";
import { offenseBadge } from "./stores/offenseBadge";

export const useStore = create((...a) => ({
  ...user(...a),
  ...shiftSchedule(...a),
  ...trackingPages(...a),
  ...monitoringPages(...a),
  ...offenseBadge(...a),
}));
