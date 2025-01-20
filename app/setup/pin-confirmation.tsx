import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Keypad from "react-native-simple-keypad";
import GradientView from "@/components/Reusable/GradientView";
import * as SecureStore from "expo-secure-store";
import { useNotification } from "@/components/contexts/InAppNotificationContext";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { mwidth } from "@/components/Reusable/ScreenDimensions";

export default function PinConfirmation() {
  const [code, setCode] = useState<string>(""); // Store input code
  const { showNotification } = useNotification();
  const { code: originalCode } = useLocalSearchParams<{ code: string }>();
  const navigation = useNavigation();
  const handleCodeComplete = async (inputCode: string) => {
    if (inputCode === originalCode) {
      try {
        await SecureStore.setItemAsync("userCode", inputCode); // Save securely
        showNotification("PIN successfully set!");
        router.push("/"); // Navigate to home or main app screen
      } catch (error) {
        showNotification("Failed to save PIN. Please try again.");
      }
    } else {
      showNotification("PINs do not match. Try again.");
      setCode(""); // Reset the entered code
    }
  };
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  return (
    <GradientView
      viewStyle={{ flex: 1, justifyContent: "center", height: "100%" }}
    >
      <View
        style={{
          position: "absolute",
          top: "20%",
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "500", color: "#FFFFFF" }}>
          Confirm Your PIN:
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
            if (typeof value === "string" && value.toLowerCase() === "delete") {
              setCode((prev) => prev.slice(0, -1)); // Remove last character
            } else if (code.length < 6) {
              const newCode = code + value;
              setCode(newCode);

              if (newCode.length === 6) {
                handleCodeComplete(newCode); // Call handler when PIN is complete
              }
            }
          }}
          textStyle={{ fontWeight: "600", fontSize: 30, color: "#7A7A7A" }}
        />
      </View>
    </GradientView>
  );
}
