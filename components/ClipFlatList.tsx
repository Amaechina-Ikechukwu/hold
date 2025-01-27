import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import HoldText from "./Reusable/HoldText";
import GradientView from "./Reusable/GradientView";
interface ClipboardItem {
  id: number;
  content: string;
  content_type: string;
  metadata?: string;
}
export default function ClipFlatList() {
  const [clipboardContent, setClipboardContent] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useSQLiteContext();
  async function deleteClipboardContent(
    db: SQLiteDatabase,
    id: number
  ): Promise<number> {
    const result = await db.runAsync(
      "DELETE FROM clipboard_content WHERE id = ?",
      id
    );
    console.log(`Deleted ${result.changes} row(s) with ID: ${id}`);
    return result.changes; // Returns the number of rows deleted
  }
  async function getClipboardContent(
    db: SQLiteDatabase,
    filters?: { contentType?: string; content?: string }
  ): Promise<any[]> {
    try {
      let query = "SELECT * FROM clipboard_content";
      const queryParams: any[] = [];

      // Apply filters if provided
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

      query += " ORDER BY id DESC"; // Optional: Order by most recent

      const results = await db.getAllAsync(query, queryParams);
      console.log(JSON.stringify(results, null, 2));
      return results;
    } catch (error) {
      console.error("Error fetching clipboard content:", error);
      return [];
    }
  }
  useEffect(() => {
    const fetchClipboardContent = async () => {
      try {
        const data = await getClipboardContent(db); // Replace with your function
        setClipboardContent(data);
      } catch (error) {
        console.error("Error fetching clipboard content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClipboardContent();
  }, []);
  const renderItem = ({ item }: { item: ClipboardItem }) => (
    <GradientView>
      <HoldText>{item.content}</HoldText>
    </GradientView>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={clipboardContent}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={<Text>No clipboard content available.</Text>}
    />
  );
}

const styles = StyleSheet.create({});
