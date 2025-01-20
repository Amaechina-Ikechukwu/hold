import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import Keypad from "react-native-simple-keypad";
import GradientView from "@/components/Reusable/GradientView";
import { useNotification } from "@/components/contexts/InAppNotificationContext";
import { router, useNavigation } from "expo-router";
import { mwidth } from "@/components/Reusable/ScreenDimensions";

export default function PinSetup() {
  const [code, setCode] = useState<string>(""); // Store the input code
  const { showNotification } = useNotification();
  const navigation = useNavigation();

  const handleCodeComplete = async (inputCode: string) => {
    if (inputCode.length === 6) {
      // Navigate to confirmation step
      router.push({
        pathname: "/setup/pin-confirmation",
        params: { code: inputCode }, // Pass the code to confirmation
      });
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
          Create Your PIN:
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
