import { create } from "zustand";
import { user } from "./stores/user";

export const useStore = create((...a) => ({
  ...user(...a),
}));
