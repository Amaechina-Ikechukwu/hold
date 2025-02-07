import { View, Text } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Keypad from "@/components/Reusable/Keypad"; // Import your custom Keypad
import GradientView from "@/components/Reusable/GradientView";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { mwidth } from "@/components/Reusable/ScreenDimensions";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useNotification } from "@/components/contexts/InAppNotificationContext";
import { holdstore } from "@/holdstore";
import { useShallow } from "zustand/shallow";

export default function Auth() {
  const [code, setCode] = useState<string>(""); // Store the input code
  const { showNotification } = useNotification();
  const [storedCode, setStoredCode] = useState<string | null>(null);
  const [isSignedIn, signIn] = holdstore(
    useShallow((state) => [state.isSignedIn, state.signIn])
  );
  const onFocus = useCallback(() => {
    // This function will be executed when the screen gains focus
    handleBiometricAuth();
  }, []); // Empty dependency array means this function is only created once

  useFocusEffect(onFocus); // Trigger the memoized callback on screen focus

  // Fetch stored code on component mount
  useEffect(() => {
    const fetchStoredCode = async () => {
      const savedCode = await SecureStore.getItemAsync("userCode");
      setStoredCode(savedCode);
    };
    fetchStoredCode();
  }, []);

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
        signIn(); // Navigate upon successful authentication
        router.push("/");
      } else {
        showNotification("Biometric Authentication Failed!");
      }
    } catch (error) {
      showNotification("An unexpected error occurred during authentication.");
    }
  };

  // Function to handle code completion
  const handleCodeComplete = async (inputCode: string) => {
    if (storedCode === null) {
      showNotification(
        "No PIN code found. Please set up your PIN in the settings."
      );
      return;
    }

    if (inputCode === storedCode) {
      showNotification("Authentication Successful!");
      signIn(); // Navigate upon successful code entry
       router.push("/");
    } else {
      showNotification("Incorrect Code. Please try again.");
      setCode(""); // Reset the entered code
    }
  };
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      statusBarTranslucent: true,
      contentStyle: { backgroundColor: "#0D0D0D" },
    });
  }, []);
  return (
    <GradientView
      viewStyle={{ flex: 1, justifyContent: "center", height: "100%" }}
    >
      <View
        style={{
          position: "absolute",
          bottom: mwidth * 0.2,
          left: 0,
          right: 0,
        }}
      >
        {/* Custom Keypad */}
        <Keypad
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
          showBioAuth={true}
          onBiometricAuth={handleBiometricAuth} // Trigger biometric authentication
        />
      </View>

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
