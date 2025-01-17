import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

const ClipboardListener = () => {
  const [clipboardContent, setClipboardContent] = useState("");

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
      <Text style={styles.text}>Clipboard Content:</Text>
      <Text style={styles.content}>{clipboardContent || "No content"}</Text>
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
  },
});

export default ClipboardListener;
