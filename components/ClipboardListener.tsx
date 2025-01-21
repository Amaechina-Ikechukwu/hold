import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

import HoldText from "./Reusable/HoldText";
import { usePushNotification } from "./Notifications";

const BACKGROUND_FETCH_TASK = "background-fetch";
const OTP_REGEX = /\b\d{4,8}\b/;

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const content = await Clipboard.getStringAsync();

    if (content) {
      const matchedOTP = content.match(OTP_REGEX);
      if (matchedOTP) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Hold: Sensitive Content",
            body: "Will not save the newly copied text...looks sensitive",
          },
          trigger: null,
        });
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Hold: Clipboard Updated",
            body: "Copied... and Held for you",
          },
          trigger: null,
        });
      }
    }

    console.log("Background clipboard check complete.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background task failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

const ClipboardListener = () => {
  const [clipboardContent, setClipboardContent] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const { sendNotification } = usePushNotification();

  useEffect(() => {
    const setupBackgroundFetch = async () => {
      try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          BACKGROUND_FETCH_TASK
        );

        if (!isRegistered) {
          await registerBackgroundFetchAsync();
          console.log("Background fetch registered successfully.");
        }

        setIsRegistered(true);
      } catch (error) {
        console.error("Error setting up background fetch:", error);
        setIsRegistered(false);
      }
    };

    setupBackgroundFetch();
  }, []);

  useEffect(() => {
    const checkClipboard = async () => {
      const content = await Clipboard.getStringAsync();
      if (content && content !== clipboardContent) {
        const matchedOTP = content.match(OTP_REGEX);
        if (matchedOTP) {
          sendNotification(
            "Hold: Clipboard message",
            "Will not save the newly copied text...looks sensitive"
          );
        } else {
          sendNotification(
            "Hold: Clipboard message",
            "Copied... and Held for you"
          );
        }
        setClipboardContent(content);
      }
    };

    const interval = setInterval(checkClipboard, 1000);

    return () => clearInterval(interval);
  }, [clipboardContent]);

  return (
    <View style={styles.container}>
      <HoldText fontFamily="Keania">Clipboard Listener:</HoldText>
      <HoldText fontFamily="Lalezar">
        Clipboard Content: {clipboardContent || "No content"}
      </HoldText>
      <HoldText fontFamily="Lalezar">
        Background Fetch Registered: {isRegistered ? "Yes" : "No"}
      </HoldText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ClipboardListener;
