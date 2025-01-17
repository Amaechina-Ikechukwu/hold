import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientViewProps {
  viewStyle?: ViewStyle;
  children?: React.ReactNode;
}

const GradientView: React.FC<GradientViewProps> = ({ viewStyle, children }) => {
  return (
    <LinearGradient
      colors={["#D9D9D9", "#8C8C8C", "#151515"]}
      style={[styles.gradient, viewStyle]}
    >
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default GradientView;
