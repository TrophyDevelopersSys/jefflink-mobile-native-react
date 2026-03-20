import { create } from "zustand";
import type { UserProfile } from "@jefflink/types";

interface UserState {
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}));
