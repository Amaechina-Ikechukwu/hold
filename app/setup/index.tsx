import HoldButton from "@/components/Reusable/HoldButton";
import HoldText from "@/components/Reusable/HoldText";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "HOLD: A Secure Clipboard Manager",
    description:
      "HOLD is a secure clipboard manager that keeps your clipboard content safe and accessible with persistent storage.",
  },
  {
    id: 2,
    title: "Persistent Clipboard History",
    description:
      "Save clipboard content for as long as you need, with easy access to everything you've copied.",
  },
  {
    id: 3,
    title: "Categorized Storage",
    description:
      "Organize your clipboard entries into customizable categories for a cleaner and more efficient experience.",
  },
  {
    id: 4,
    title: "Search Functionality",
    description:
      "Quickly find specific entries using keywords to navigate your clipboard history with ease.",
  },
  {
    id: 5,
    title: "Encryption",
    description:
      "All clipboard content is encrypted with AES-256, ensuring your sensitive information remains secure.",
  },
  {
    id: 6,
    title: "Biometric Authentication",
    description:
      "Access your clipboard vault using fingerprint or face recognition for added security.",
  },
  {
    id: 7,
    title: "Auto-Lock & Secure Deletion",
    description:
      "Automatically locks the app after inactivity and securely deletes clipboard content to ensure no data is left behind.",
  },
];

export default function OnboardingScreen() {
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={styles.slide}>
      <HoldText fontFamily="Keania" style={{ fontSize: 30 }}>
        {item.title}
      </HoldText>
      <HoldText fontFamily="Lalezar" style={styles.description}>
        {item.description}
      </HoldText>
    </View>
  );

  const handleNext = () => {
    router.push("/setup/pin-setup");
  };
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      contentStyle: { backgroundColor: "#0D0D0D" },
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.flatlistContainer}
      />

      {/* Add Next Button */}
      <View style={styles.footer}>
        <HoldButton title="Get Started" onPress={handleNext} />
      </View>

      {/* Add indicator for progress */}
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 20,
    color: "#7A7A7A",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  flatlistContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 120,
    flexDirection: "row",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7A7A7A",
    marginHorizontal: 3,
  },
});
