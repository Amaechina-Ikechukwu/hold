import { create } from "zustand";

interface AuthState {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const holdstore = create<AuthState>((set) => ({
  isSignedIn: false,
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),
}));
