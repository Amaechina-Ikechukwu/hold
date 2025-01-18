import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import Keypad from "react-native-simple-keypad";
import GradientView from "@/components/Reusable/GradientView";
import { router, useNavigation } from "expo-router";
import { mwidth } from "@/components/Reusable/ScreenDimensions";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useNotification } from "@/components/contexts/InAppNotificationContext";

export default function Auth() {
  const [code, setCode] = useState<string>(""); // Store the input code
  const { showNotification } = useNotification();

  // Function to handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        showNotification(
          "Your device does not support biometric authentication."
        );
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        showNotification(
          "No biometric data found. Please set up biometrics on your device."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Fingerprint",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        showNotification("Biometric Authentication Successful!");
        // Navigate or perform an action upon successful authentication
      } else {
        showNotification("Biometric Authentication Failed!");
      }
    } catch (error) {
      showNotification("An unexpected error occurred during authentication.");
    }
  };

  // Function to handle code completion
  const handleCodeComplete = async (inputCode: string) => {
    try {
      // Save the code securely
      await SecureStore.setItemAsync("userCode", inputCode);
      showNotification("Code saved securely!");
      // Navigate to the next screen or perform another action
      router.push("/");
    } catch (error) {
      showNotification("Failed to save the code. Please try again.");
    }
  };

  return (
    <GradientView
      viewStyle={{ flex: 1, justifyContent: "center", height: "100%" }}
    >
      <View
        style={{
          position: "absolute",
          bottom: mwidth * 0.9,
          left: 0,
          right: 0,
        }}
      >
        <Keypad
          onKeyPress={(value) => {
            if (typeof value === "string") {
              // Ensure the value is a string
              if (value.toLowerCase() === "delete") {
                setCode((prev) => prev.slice(0, -1)); // Remove the last character
              }
            } else {
              if (code.length < 6) {
                const newCode = code + value;
                setCode(newCode);

                if (newCode.length === 6) {
                  handleCodeComplete(newCode); // Call the handler when 6 digits are entered
                }
              }
            }
          }}
          textStyle={{ fontWeight: "600", fontSize: 30, color: "#7A7A7A" }}
          backspaceIconFillColor="#7A7A7A"
          backspaceIconStrokeColor="#FFFFFF"
          bioMetricFillColor="#7A7A7A"
          backspaceIconHeight={24}
          backspaceIconWidth={33}
          bioMetricIconHeight={28}
          bioMetricIconWidth={28}
          //   disable={code.length === 6}
          onBioAuthPress={handleBiometricAuth} // Trigger fingerprint authentication
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: mwidth * 0.1,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "500", color: "#FFFFFF" }}>
          Enter Your Code:
        </Text>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            color: "#FFFFFF",
            marginTop: 10,
          }}
        >
          {code.padEnd(6, "_")} {/* Display entered code with placeholders */}
        </Text>
      </View>
    </GradientView>
  );
}
