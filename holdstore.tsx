import { create } from "zustand";
import dayjs from "dayjs";
import { Animated } from "react-native";

interface ClipboardItem {
  id: number;
  content: string;
  content_type: string;
  metadata?: string;
  copied_at: string;
  fadeAnim: Animated.Value;
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
  filteredClipboardSections: SectionData[]; // New state for search results
  addClipboardItem: (sections: SectionData[]) => void;
  searchClipboard: (query: string) => void;
  cancelSearch: () => void;
  removeClipboardItem: (id: number) => void;
  clearClipboard: () => void;
}

export const holdstore = create<AuthState & ClipboardState>((set) => ({
  // Authentication state
  isSignedIn: false,
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),

  // Clipboard state
  clipboardSections: [],
  filteredClipboardSections: [],

  addClipboardItem: (sections: SectionData[]) =>
    set((state) => {
      const updatedSections = [...state.clipboardSections];

      sections.forEach((section) => {
        if (section.data.length === 0) return;

        const dateKey = dayjs(section.data[0].copied_at).format(
          "dddd, MMMM D, YYYY"
        );

        let existingSection = updatedSections.find(
          (sec) => sec.title === dateKey
        );

        const newItems = section.data.map((item) => ({
          ...item,
          fadeAnim: new Animated.Value(1),
        }));

        if (existingSection) {
          const existingIds = new Set(
            existingSection.data.map((item) => item.id)
          );
          const existingContents = new Set(
            existingSection.data.map((item) => item.content.toLowerCase())
          );

          // Remove duplicates based on ID and content
          const uniqueNewItems = newItems.filter(
            (item) =>
              !existingIds.has(item.id) &&
              !existingContents.has(item.content.toLowerCase())
          );

          existingSection.data.unshift(...uniqueNewItems);
        } else {
          updatedSections.push({ title: dateKey, data: newItems });
        }
      });

      // **Sort sections by date (Newest First)**
     updatedSections.sort(
       (a, b) =>
         dayjs(b.data[0].copied_at).valueOf() -
         dayjs(a.data[0].copied_at).valueOf()
     );


      return {
        clipboardSections: updatedSections,
        filteredClipboardSections: updatedSections,
      };
    }),

  searchClipboard: (query: string) =>
    set((state) => {
      if (!query) return { filteredClipboardSections: state.clipboardSections };

      const filteredSections = state.clipboardSections
        .map((section) => ({
          ...section,
          data: section.data.filter((item) =>
            item.content.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((section) => section.data.length > 0);

      return { filteredClipboardSections: filteredSections };
    }),

  cancelSearch: () =>
    set((state) => ({
      filteredClipboardSections: state.clipboardSections,
    })),

  removeClipboardItem: (id: number) =>
    set((state) => {
      const updatedSections = state.clipboardSections
        .map((section) => ({
          ...section,
          data: section.data.filter((item) => item.id !== id),
        }))
        .filter((section) => section.data.length > 0);

      return {
        clipboardSections: updatedSections,
        filteredClipboardSections: updatedSections,
      };
    }),

  clearClipboard: () =>
    set({ clipboardSections: [], filteredClipboardSections: [] }),
}));

