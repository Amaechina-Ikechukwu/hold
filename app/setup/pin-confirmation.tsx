import React, { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import GradientView from "@/components/Reusable/GradientView";
import * as SecureStore from "expo-secure-store";
import { useNotification } from "@/components/contexts/InAppNotificationContext";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { mwidth } from "@/components/Reusable/ScreenDimensions";
import Keypad from "@/components/Reusable/Keypad";
import { holdstore } from "@/holdstore";
import { useShallow } from "zustand/shallow";

export default function PinConfirmation() {
  const [code, setCode] = useState<string>(""); // Store input code
  const { showNotification } = useNotification();
  const { code: originalCode } = useLocalSearchParams<{ code: string }>();
  const navigation = useNavigation();
  const [isSignedIn, signIn] = holdstore(
    useShallow((state) => [state.isSignedIn, state.signIn])
  );
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Memoized callback to handle code completion
  const handleCodeComplete = useCallback(
    async (inputCode: string) => {
      if (inputCode === originalCode) {
        try {
          await SecureStore.setItemAsync("userCode", inputCode); // Save securely
          showNotification("PIN successfully set!");
          signIn(); // Navigate to home or main app screen
          router.push("/");
        } catch (error) {
          showNotification("Failed to save PIN. Please try again.");
        }
      } else {
        showNotification("PINs do not match. Try again.");
        setCode(""); // Reset the entered code
      }
    },
    [originalCode, router, showNotification]
  );

  const handleKeyPress = (value: string) => {
    // Don't update the state unnecessarily if we have reached the PIN length
    if (value === "delete") {
      setCode((prev) => prev.slice(0, -1)); // Remove last character
    } else if (code.length < 6) {
      const newCode = code + value;
      setCode(newCode); // Update code

      if (newCode.length === 6) {
        handleCodeComplete(newCode); // Call handler when PIN is complete
      }
    }
  };

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
          bottom: mwidth * 0.2,
          left: 0,
          right: 0,
        }}
      >
        <Keypad
          showBioAuth={false}
          onKeyPress={(value) => {
            if (value === "delete") {
              setCode((prev) => prev.slice(0, -1)); // Remove the last character
            } else if (code.length < 6) {
              const newCode = code + value;
              setCode(newCode);

              if (newCode.length === 6) {
                handleCodeComplete(newCode); // Call the handler when 6 digits are entered
              }
            }
          }}
        />
      </View>
    </GradientView>
  );
}
