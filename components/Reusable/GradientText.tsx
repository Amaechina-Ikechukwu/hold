import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface GradientTextProps {
  text: string;
  textStyle?: TextStyle;
}

const GradientText: React.FC<GradientTextProps> = ({ text, textStyle }) => {
  return (
    <MaskedView
      maskElement={<Text style={[styles.text, textStyle]}>{text}</Text>}
    >
      <LinearGradient
        colors={["#E0E0E0", "#7A7A7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  gradient: {
    flex: 1,
  },
});

export default GradientText;
