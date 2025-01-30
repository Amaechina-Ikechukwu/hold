import { Image, StyleSheet, View } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Clipboard from "expo-clipboard"; // Ensure correct import
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { usePushNotification } from "@/components/Notifications";

import ClipFlatList from "@/components/ClipFlatList";
import { StatusBar } from "expo-status-bar";
const BACKGROUND_FETCH_TASK = "background-fetch";
const OTP_REGEX = /\b\d{4,6}\b/; // Example regex for matching OTPs

let lastClipboardContent = "";

// Define the background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    //  Clipboard.addClipboardListener(
    //    ({ contentTypes }: Clipboard.ClipboardEvent) => {
    //      if (contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
    //        Clipboard.getStringAsync().then((content) => {
    //          alert("Copy pasta! Here's the string that was copied: " + content);
    //        });
    //      } else if (contentTypes.includes(Clipboard.ContentType.IMAGE)) {
    //        alert("Yay! Clipboard contains an image");
    //      }
    //    }
    //  );

    // // Send a notification about the new clipboard content
    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "New Clipboard Content Detected",
    //     // body: clipboardContent,
    //   },
    //   trigger: null, // Immediate notification
    // });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Error in background fetch task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 10,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function HomeScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] =
    useState<BackgroundFetch.BackgroundFetchStatus | null>(null);
  const [clipboardContent, setClipboardContent] = useState("");
  const db = useSQLiteContext();
  const { sendNotification } = usePushNotification();
  const clipboardContentRef = useRef("");
  const isCheckingClipboardRef = useRef(false);

  useEffect(() => {
    const checkStatusAsync = async () => {
      const status = await BackgroundFetch.getStatusAsync();
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_FETCH_TASK
      );
      setStatus(status);
      setIsRegistered(isRegistered);
    };

    const toggleFetchTask = async () => {
      if (!isRegistered) await registerBackgroundFetchAsync();
      checkStatusAsync();
    };

    toggleFetchTask();
  }, [isRegistered]);

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
              clipboardContentRef.current = content;
              setClipboardContent(content);
              lastClipboardContent = content;
            }
          }
        }
      } catch (error) {
        console.error("Error checking clipboard content:", error);
      } finally {
        isCheckingClipboardRef.current = false;
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  async function addClipboardContent(
    db: SQLiteDatabase,
    content: string,
    contentType: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    try {
      if (!db || db.closed) {
        console.error("Database is closed or not available.");
        return -1;
      }

      const checkExisting = await db.getFirstAsync(
        "SELECT COUNT(*) AS count FROM clipboard_content WHERE content = ?",
        [content]
      );

      if (checkExisting.count > 0) return -1;

      const result = await db.runAsync(
        "INSERT INTO clipboard_content (content, content_type, metadata) VALUES (?, ?, ?)",
        content,
        contentType,
        metadata ? JSON.stringify(metadata) : null
      );

      sendNotification("Clipboard Content Saved", "Saved successfully");
      return result.lastInsertRowId;
    } catch (error) {
      console.error("Error inserting clipboard content:", error);
      return -1;
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent />
      <ClipFlatList />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
