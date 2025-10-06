import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#0D0D0D" } }} />
  );
}
