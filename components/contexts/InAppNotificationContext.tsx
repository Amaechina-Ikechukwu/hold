import React, { createContext, useContext, useState, ReactNode } from "react";
import { Animated, View, Text, StyleSheet, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Make sure to install expo-linear-gradient
import { mwidth } from "../Reusable/ScreenDimensions"; // Assuming mwidth is defined here

interface Notification {
  text: string;
  icon?: ReactNode; // Can accept React elements like icons
}

interface NotificationContextType {
  showNotification: (text: string, icon?: ReactNode) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade animation

  const showNotification = (text: string, icon?: ReactNode) => {
    setNotification({ text, icon });

    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Hold for 3 seconds before fading out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => setNotification(null));
      }, 3000);
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0], // Change from top to bottom
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#dcdcdc", "#f2f2f2", "#dcdcdc"]}
            style={styles.notificationContent} // Silver shimmer effect
            start={[0, 0]}
            end={[1, 0]}
          >
            {notification.icon && (
              <View style={styles.iconContainer}>{notification.icon}</View>
            )}
            <Text style={styles.notificationText}>{notification.text}</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    bottom: 5, // Position the notification at the bottom
    left: "5%", // Adding margin from the left to ensure it is centered
    right: "5%", // Ensure equal margin on the right side
    alignItems: "center",
    zIndex: 1000,
    width: mwidth * 0.9, // Takes up 90% of screen width
  },
  notificationContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: mwidth,
    height: 50,
  },
  iconContainer: {
    marginRight: 10,
  },
  notificationText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
});
