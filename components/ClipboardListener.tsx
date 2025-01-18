import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

import HoldText from "./Reusable/HoldText";
import HoldButton from "./Reusable/HoldButton";
import { router } from "expo-router";
import { useNotification } from "./contexts/InAppNotificationContext";

const ClipboardListener = () => {
  const [clipboardContent, setClipboardContent] = useState("");
  const { showNotification } = useNotification();
  useEffect(() => {
    const checkClipboard = async () => {
      const content = await Clipboard.getStringAsync();
      if (content !== clipboardContent) {
        setClipboardContent(content);
        console.log("Clipboard updated:", content);
      }
    };

    const interval = setInterval(checkClipboard, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [clipboardContent]);

  return (
    <View style={styles.container}>
      <HoldText fontFamily="Keania">Clipboard Content:</HoldText>

      <HoldText fontFamily="Lalezar">
        {clipboardContent || "No content"}
      </HoldText>
      <HoldButton
        title="Go to auth"
        onPress={() => showNotification("/auth")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
    fontFamily: "Keania",
  },
});

export default ClipboardListener;
