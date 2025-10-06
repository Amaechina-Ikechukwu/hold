import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import GradientView from "@/components/Reusable/GradientView";
import { useNotification } from "@/components/contexts/InAppNotificationContext";
import { router, useNavigation } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { mwidth } from "@/components/Reusable/ScreenDimensions";
import Keypad from "@/components/Reusable/Keypad";

export default function PinSetup() {
  const [code, setCode] = useState<string>(""); // Store the input code
  const { showNotification } = useNotification();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleCodeComplete = async (inputCode: string) => {
    if (inputCode.length === 6) {
      router.push({
        pathname: "/setup/pin-confirmation",
        params: { code: inputCode },
      });
    }
  };

  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with Fingerprint",
      fallbackLabel: "Use PIN",
    });
    if (result.success) {
      showNotification("Fingerprint authentication successful");
    } else {
      Alert.alert("Authentication Failed", "Try again or use your PIN.");
    }
  };

  const handleKeyPress = (value: string) => {
    // Optimized state handling
    setCode((prevCode) => {
      const newCode =
        value === "delete" ? prevCode.slice(0, -1) : prevCode + value;

      if (newCode.length === 6) {
        handleCodeComplete(newCode); // Call the handler when 6 digits are entered
      }

      return newCode;
    });
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
          bottom: mwidth * 0.2,
          left: 0,
          right: 0,
          alignItems: "center",
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
          onBiometricAuth={handleBiometricAuth}
        />
      </View>
    </GradientView>
  );
}
