import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientViewProps {
  viewStyle?: ViewStyle;
  children?: React.ReactNode;
}

const GradientView: React.FC<GradientViewProps> = ({ viewStyle, children }) => {
  return (
    // <LinearGradient
    //   colors={["#161616", "#0D0D0D"]}
    //   style={[styles.gradient, viewStyle]}
    // >
    <View style={styles.content}>{children}</View>
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
});

export default GradientView;
