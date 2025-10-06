import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  SectionList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Text,
} from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import * as Clipboard from "expo-clipboard";
import { useNotification } from "./contexts/InAppNotificationContext";
import { mheight, mwidth } from "./Reusable/ScreenDimensions";
import ClipboardCard from "./Reusable/ClipboardCard";
import { holdstore } from "@/holdstore";
import { useShallow } from "zustand/shallow";
import dayjs from "dayjs"; // Install for date formatting
import localizedFormat from "dayjs/plugin/localizedFormat";
import weekday from "dayjs/plugin/weekday";
import HoldText from "./Reusable/HoldText";

dayjs.extend(localizedFormat);
dayjs.extend(weekday);

const { width } = Dimensions.get("window");

interface ClipboardItem {
  id: number;
  content: string;
  content_type: string;
  metadata?: string;
  copied_at: string; // Ensure this field exists in your database
  fadeAnim: Animated.Value;
}

interface SectionData {
  title: string; // Formatted as "Monday, January 5, 2025"
  data: ClipboardItem[];
}

export default function ClipSectionList() {
  const [clipboardContent, setClipboardContent] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clipboardSections, addClipboardItem, removeClipboardItem] = holdstore(
    useShallow((state) => [
      state.filteredClipboardSections,
      state.addClipboardItem,
      state.removeClipboardItem,
    ])
  );
  const { showNotification } = useNotification();
  const db = useSQLiteContext();
const deletedClipboardItems = new Set<string>();

const deleteClipboardContent = async (id: number, fadeAnim: Animated.Value) => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start(async () => {
    const result = await db.runAsync(
      "DELETE FROM clipboard_content WHERE id = ?",
      id
    );
    if (result.changes > 0) {
      setClipboardContent((prevSections) =>
        prevSections
          .map((section) => ({
            ...section,
            data: section.data.filter((item) => {
              if (item.id === id) {
                deletedClipboardItems.add(item.content); // Track deleted content
              }
              return item.id !== id;
            }),
          }))
          .filter((section) => section.data.length > 0)
      );
      removeClipboardItem(id);
      showNotification("Removed");
    }
  });
};

const copyToClipboard = async (content: string) => {
  await Clipboard.setStringAsync(content);
  showNotification("Copied");
};

const getClipboardContent = async (
  db: SQLiteDatabase
): Promise<SectionData[]> => {
  try {
    let query = "SELECT * FROM clipboard_content ORDER BY copied_at DESC";
    const results = (await db.getAllAsync(query)) as ClipboardItem[];

    // Filter out deleted content
    const filteredResults = results.filter(
      (item) => !deletedClipboardItems.has(item.content)
    );

    // Ensure unique IDs and format data
    const uniqueItemsMap = new Map<number, ClipboardItem>();
    filteredResults.forEach((item) => {
      if (!uniqueItemsMap.has(item.id)) {
        uniqueItemsMap.set(item.id, {
          ...item,
          fadeAnim: new Animated.Value(1),
        });
      }
    });

    // Group by formatted date
    const groupedData = Array.from(uniqueItemsMap.values()).reduce(
      (acc: Record<string, ClipboardItem[]>, item) => {
        const dateKey = dayjs(item.copied_at).format("dddd, MMMM D, YYYY");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      },
      {}
    );

    // Sort dates in descending order (newest first)
 const sortedDates = Object.keys(groupedData).sort(
   (a, b) =>
     dayjs(groupedData[b][0].copied_at).valueOf() -
     dayjs(groupedData[a][0].copied_at).valueOf()
 );


    return sortedDates.map((date) => ({
      title: date,
      data: groupedData[date],
    }));
  } catch (error) {
    console.error("Error fetching clipboard content:", error);
    return [];
  }
};


  useEffect(() => {
    const fetchClipboardContent = async () => {
      try {
        const data = await getClipboardContent(db);
        addClipboardItem(data);
      } catch (error) {
        console.error("Error fetching clipboard content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClipboardContent();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Check if search is active
    const isSearching =
      clipboardSections !== holdstore.getState().clipboardSections;

    if (!isSearching) {
      intervalId = setInterval(async () => {
        const data = await getClipboardContent(db);
        addClipboardItem(data);
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [clipboardSections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await getClipboardContent(db);

    addClipboardItem(data);
    setRefreshing(false);
  }, []);
  useEffect(() => {}, [clipboardSections]);
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SectionList
      sections={clipboardSections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            width: mwidth,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ClipboardCard
            content={item.content}
            id={item.id}
            fadeAnim={item?.fadeAnim}
            onDelete={deleteClipboardContent}
            onCopy={copyToClipboard}
          />
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <HoldText
          fontFamily="Keania"
          style={{
            fontSize: 22,

            marginVertical: 10,
          }}
        >
          {title}
        </HoldText>
      )}
      contentContainerStyle={{
        gap: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            height: mheight,
          }}
        >
          <ClipboardCard
            content="Hold addresses the issue of copied content being removed from the clipboard after a short duration by providing a persistent and secure storage solution."
            id={-1}
            fadeAnim={new Animated.Value(1)}
            onDelete={() => {}}
            onCopy={copyToClipboard}
          />
        </View>
      }
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={5}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}
