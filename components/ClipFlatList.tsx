import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import HoldText from "./Reusable/HoldText";
import * as Clipboard from "expo-clipboard";
import { AntDesign } from "@expo/vector-icons";
import { useNotification } from "./contexts/InAppNotificationContext";

const { width } = Dimensions.get("window");

interface ClipboardItem {
  id: number;
  content: string;
  content_type: string;
  metadata?: string;
  fadeAnim: Animated.Value; // Add animation value for opacity
}

export default function ClipFlatList() {
  const [clipboardContent, setClipboardContent] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const db = useSQLiteContext();

  const MemoizedGradientView = React.memo(
    ({
      content,
      id,
      fadeAnim,
    }: {
      content: string;
      id: number;
      fadeAnim: Animated.Value;
    }) => (
      <Animated.View style={[styles.clipBox, { opacity: fadeAnim }]}>
        <View style={{ position: "absolute", right: 20, top: 20, zIndex: 99 }}>
          <TouchableOpacity
            onPress={() => deleteClipboardContent(id, fadeAnim)}
          >
            <AntDesign name="delete" size={18} color="#7A7A7A" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => copyToClipboard(content)}>
          <HoldText fontFamily="Lalezar">{content}</HoldText>
          <HoldText fontFamily="Keania" style={{ fontSize: 16 }}>
            Tap to copy
          </HoldText>
        </TouchableOpacity>
      </Animated.View>
    )
  );

  const deleteClipboardContent = async (
    id: number,
    fadeAnim: Animated.Value
  ): Promise<void> => {
    Animated.timing(fadeAnim, {
      toValue: 0, // Animate opacity to 0
      duration: 300, // Animation duration
      useNativeDriver: true,
    }).start(async () => {
      // Remove the item after the animation completes
      const result = await db.runAsync(
        "DELETE FROM clipboard_content WHERE id = ?",
        id
      );

      if (result.changes > 0) {
        setClipboardContent((prevContent) =>
          prevContent.filter((item) => item.id !== id)
        );
        showNotification("Removed");
      }
    });
  };

  const copyToClipboard = async (content: string) => {
    await Clipboard.setStringAsync(content);
    showNotification(`Copied ${content}`);
  };

  async function getClipboardContent(
    db: SQLiteDatabase,
    filters?: { contentType?: string; content?: string }
  ): Promise<ClipboardItem[]> {
    try {
      let query = "SELECT * FROM clipboard_content";
      const queryParams: any[] = [];

      if (filters) {
        const conditions: string[] = [];

        if (filters.contentType) {
          conditions.push("content_type = ?");
          queryParams.push(filters.contentType);
        }

        if (filters.content) {
          conditions.push("content LIKE ?");
          queryParams.push(`%${filters.content}%`);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }
      }

      query += " ORDER BY id DESC";

      const results = (await db.getAllAsync(query, queryParams)) as Array<{
        id: number;
        content: string;
        content_type: string;
        metadata?: string;
      }>;

      // Add a fadeAnim property for each item
      return results.map((item) => ({
        ...item,
        fadeAnim: new Animated.Value(1), // Initial opacity is 1
      }));
    } catch (error) {
      console.error("Error fetching clipboard content:", error);
      return [];
    }
  }

  useEffect(() => {
    const fetchClipboardContent = async () => {
      try {
        const data = await getClipboardContent(db);
        setClipboardContent(data);
      } catch (error) {
        console.error("Error fetching clipboard content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClipboardContent();
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: ClipboardItem }) => (
      <MemoizedGradientView
        content={item.content}
        id={item.id}
        fadeAnim={item.fadeAnim}
      />
    ),
    []
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  const ListEmptyComponent = React.memo(() => {
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    const handleDeleteWithAnimation = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        showNotification("Item removed"); // Replace with specific logic if needed
      });
    };

    return (
      <Animated.View style={[styles.clipBox, { opacity: fadeAnim }]}>
        <View style={{ position: "absolute", right: 20, top: 20, zIndex: 99 }}>
          <TouchableOpacity onPress={handleDeleteWithAnimation}>
            <AntDesign name="delete" size={18} color="#7A7A7A" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() =>
            copyToClipboard(
              "Addresses the issue of copied content being removed from the clipboard after a short duration by providing a persistent and secure storage solution."
            )
          }
        >
          <HoldText fontFamily="Lalezar">
            Hold addresses the issue of copied content being removed from the
            clipboard after a short duration by providing a persistent and
            secure storage solution.
          </HoldText>
          <HoldText fontFamily="Keania" style={{ fontSize: 16 }}>
            Tap to copy
          </HoldText>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  return (
    <FlatList
      data={clipboardContent}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{
        gap: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
      ListEmptyComponent={<ListEmptyComponent />}
      initialNumToRender={20} // Optimize initial rendering
      maxToRenderPerBatch={5} // Render items in small batches
      windowSize={5} // Adjust the window size for list recycling
    />
  );
}

const styles = StyleSheet.create({
  clipBox: {
    minHeight: 100,
    borderRadius: 30,
    backgroundColor: "#1a1918",
    width: width * 0.9,
    padding: 30,
    shadowColor: "#9c9c9c", // Ash-like shadow color
    shadowOffset: { width: 10, height: 14 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 30, // Shadow blur radius
    elevation: 5, // Shadow for Android
    gap: 20,
  },
});
