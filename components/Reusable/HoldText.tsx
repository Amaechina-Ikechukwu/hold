import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";

interface HoldTextProps {
  children: string;
  style?: TextStyle;
  fontFamily?: "Keania" | "Lalezar"; // Ensure these match your loaded fonts
}

const HoldText: React.FC<HoldTextProps> = ({ children, style, fontFamily }) => {
  return (
    <Text style={[styles.text, { fontFamily: fontFamily || "Keania" }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    color: "#7A7A7A",
  },
});

export default HoldText;
