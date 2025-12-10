import { create } from "zustand";
import { user } from "./stores/user";
import { shiftSchedule } from "./stores/shiftSchedule";
import { trackingPages } from "./stores/trackingPages";
import { monitoringPages } from "./stores/monitoringPages";
import { offenseBadge } from "./stores/offenseBadge";
import { fetchUserById } from "./stores/getUserById";
import { coachingBadge } from "./stores/coachingBadge";
import { fetchAccountsById } from "./stores/getAccountById";

export const useStore = create((...a) => ({
  ...user(...a),
  ...shiftSchedule(...a),
  ...trackingPages(...a),
  ...monitoringPages(...a),
  ...offenseBadge(...a),
  ...coachingBadge(...a),
  ...fetchUserById(...a),
  ...fetchAccountsById(...a),
}));
