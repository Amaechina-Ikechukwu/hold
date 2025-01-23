import { View, Text } from "react-native";
import React from "react";
import { SQLiteDatabase } from "expo-sqlite";

export default function ClipFlatList() {
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

  return (
    <View>
      <Text>ClipFlatList</Text>
    </View>
  );
}
