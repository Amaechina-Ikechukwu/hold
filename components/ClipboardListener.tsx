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

  // Ref to store clipboard content without causing re-renders
  const clipboardContentRef = useRef("");
  const isCheckingClipboardRef = useRef(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (isCheckingClipboardRef.current) return;

      isCheckingClipboardRef.current = true;

      try {
        const content = await Clipboard.getStringAsync();

        if (content && content !== clipboardContentRef.current) {
          const matchedOTP = content.match(OTP_REGEX);

          if (matchedOTP) {
            sendNotification(
              "Hold: Sensitive Content",
              "Will not save the newly copied text...looks sensitive"
            );
          } else {
            const result = await addClipboardContent(db, content, "text");
            if (result !== -1) {
              clipboardContentRef.current = content; // Update ref
              setClipboardContent(content); // Update state only when necessary
            }
          }
        }
      } catch (error) {
        console.error("Error checking clipboard content:", error);
      } finally {
        isCheckingClipboardRef.current = false;
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  async function addClipboardContent(
    db: SQLiteDatabase,
    content: string,
    contentType: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    try {
      const checkExisting = await db.getFirstAsync(
        "SELECT COUNT(*) AS count FROM clipboard_content WHERE content = ?",
        [content]
      );

      if (checkExisting.count > 0) {
        // console.log("Content already exists in the database. Not adding.");
        return -1;
      } else {
        const result = await db.runAsync(
          "INSERT INTO clipboard_content (content, content_type, metadata) VALUES (?, ?, ?)",
          content,
          contentType,
          metadata ? JSON.stringify(metadata) : null
        );

        sendNotification("Clipboard Content Saved", "Saved successfully");
        return result.lastInsertRowId;
      }
    } catch (error) {
      // console.error("Error inserting clipboard content:", error);
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
