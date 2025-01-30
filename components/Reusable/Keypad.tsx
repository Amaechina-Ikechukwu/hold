import { Entypo, Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

interface KeypadProps {
  onKeyPress: (value: string) => void;
  onBiometricAuth?: () => void;
  showBioAuth: boolean;
}

const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onBiometricAuth,
  showBioAuth,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableWithoutFeedback onPress={() => onKeyPress("1")}>
          <View style={styles.button}>
            <Text style={styles.text}>1</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("2")}>
          <View style={styles.button}>
            <Text style={styles.text}>2</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("3")}>
          <View style={styles.button}>
            <Text style={styles.text}>3</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.row}>
        <TouchableWithoutFeedback onPress={() => onKeyPress("4")}>
          <View style={styles.button}>
            <Text style={styles.text}>4</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("5")}>
          <View style={styles.button}>
            <Text style={styles.text}>5</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("6")}>
          <View style={styles.button}>
            <Text style={styles.text}>6</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.row}>
        <TouchableWithoutFeedback onPress={() => onKeyPress("7")}>
          <View style={styles.button}>
            <Text style={styles.text}>7</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("8")}>
          <View style={styles.button}>
            <Text style={styles.text}>8</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("9")}>
          <View style={styles.button}>
            <Text style={styles.text}>9</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.row}>
        {showBioAuth ? (
          <TouchableWithoutFeedback onPress={onBiometricAuth}>
            <View style={styles.button}>
              <Entypo name="fingerprint" style={styles.text} />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback onPress={onBiometricAuth}>
            <View style={[styles.button, { backgroundColor: "transparent" }]} />
          </TouchableWithoutFeedback>
        )}
        <TouchableWithoutFeedback onPress={() => onKeyPress("0")}>
          <View style={styles.button}>
            <Text style={styles.text}>0</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onKeyPress("delete")}>
          <View style={styles.button}>
            <Ionicons name="backspace-outline" style={styles.text} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
  },
});

// Use React.memo to avoid unnecessary re-renders
export default memo(Keypad);
