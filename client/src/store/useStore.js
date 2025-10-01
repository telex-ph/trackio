import { create } from "zustand";
import { user } from "./stores/user";
import { shiftSchedule } from "./stores/shiftSchedule";

export const useStore = create((...a) => ({
  ...user(...a),
  ...shiftSchedule(...a),
}));
