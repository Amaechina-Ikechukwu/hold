import { create } from "zustand";
import dayjs from "dayjs";

interface ClipboardItem {
  id: number;
  content: string;
  content_type: string;
  metadata?: string;
  copied_at: string;
}

interface SectionData {
  title: string;
  data: ClipboardItem[];
}

interface AuthState {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

interface ClipboardState {
  clipboardSections: SectionData[];
  addClipboardItem: (item: ClipboardItem) => void;
  removeClipboardItem: (id: number) => void;
  clearClipboard: () => void;
}

export const holdstore = create<AuthState & ClipboardState>((set) => ({
  // Authentication state
  isSignedIn: false,
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),

  // Clipboard state
  clipboardSections: [], // Initialize clipboardSections properly

  addClipboardItem: (item: ClipboardItem) =>
    set((state) => {
      const dateKey = dayjs(item.copied_at).format("dddd, MMMM D, YYYY");
      const updatedSections = [...state.clipboardSections];

      const existingSection = updatedSections.find(
        (section) => section.title === dateKey
      );

      if (existingSection) {
        existingSection.data.unshift(item);
      } else {
        updatedSections.unshift({ title: dateKey, data: [item] });
      }

      return { clipboardSections: updatedSections };
    }),

  removeClipboardItem: (id: number) =>
    set((state) => {
      const updatedSections = state.clipboardSections
        .map((section) => ({
          ...section,
          data: section.data.filter((item) => item.id !== id),
        }))
        .filter((section) => section.data.length > 0); // Remove empty sections

      return { clipboardSections: updatedSections };
    }),

  clearClipboard: () => set({ clipboardSections: [] }),
}));
