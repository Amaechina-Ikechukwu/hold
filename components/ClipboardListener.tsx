import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import {
  openDatabaseSync,
  SQLiteDatabase,
  useSQLiteContext,
} from "expo-sqlite";
import { usePushNotification } from "./Notifications";
import HoldText from "./Reusable/HoldText";

const OTP_REGEX = /\b\d{4,8}\b/;

const ClipboardListener = () => {
  const [clipboardContent, setClipboardContent] = useState("");
  const db = useSQLiteContext();
  const { sendNotification } = usePushNotification();

  // Ref to track whether clipboard check is in progress
  const isCheckingClipboardRef = useRef(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (isCheckingClipboardRef.current) return; // Skip if check is in progress
      isCheckingClipboardRef.current = true; // Set the flag to true

      try {
        // Get the current clipboard content
        const content = await Clipboard.getStringAsync();

        if (content) {
          const matchedOTP = content.match(OTP_REGEX);

          if (matchedOTP) {
            // Show notification for sensitive content
            sendNotification(
              "Hold: Sensitive Content",
              "Will not save the newly copied text...looks sensitive"
            );
          } else {
            // Add the content to the database if it's not a duplicate
            await addClipboardContent(db, content, "text");
            setClipboardContent(content); // Update the clipboard content in state
          }
        }
      } catch (error) {
        console.error("Error checking clipboard content:", error);
      } finally {
        isCheckingClipboardRef.current = false; // Reset the flag when done
      }
    }, 5000); // Check every 5 seconds (5000ms)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [db]); // Only depend on db, not isCheckingClipboard

  // Function to add clipboard content if it's not already in the database
  async function addClipboardContent(
    db: SQLiteDatabase,
    content: string,
    contentType: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    try {
      // Check if the content already exists in the database
      const checkExisting = await db.getFirstAsync(
        "SELECT COUNT(*) AS count FROM clipboard_content WHERE content = ?",
        [content]
      );

      console.log({ checkExisting });

      // Check if the count is greater than 0 (indicating existing content)
      if (checkExisting.count > 0) {
        console.log("Content already exists in the database. Not adding.");
        return -1; // Return a negative number to indicate no insertion occurred
      } else {
        // Insert the new content into the database
        const result = await db.runAsync(
          "INSERT INTO clipboard_content (content, content_type, metadata) VALUES (?, ?, ?)",
          content,
          contentType,
          metadata ? JSON.stringify(metadata) : null
        );

        // Optionally, send a notification indicating the content was saved
        sendNotification("Hold: Sensitive Content", "Saved");
        return result.lastInsertRowId; // Returns the ID of the inserted row
      }
    } catch (error) {
      console.error("Error inserting clipboard content:", error);
      return -1;
    }
  }

  return (
    <View style={styles.container}>
      <HoldText fontFamily="Keania">Clipboard Listener:</HoldText>
      <HoldText fontFamily="Lalezar">
        Clipboard Content: {clipboardContent || "No content"}
      </HoldText>
      <View style={styles.historyContainer}>
        <HoldText fontFamily="Keania">Clipboard History:</HoldText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  historyContainer: {
    marginTop: 20,
    width: "90%",
  },
});

export default ClipboardListener;
