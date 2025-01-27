import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Function to send push notification with dynamic data
async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: object = {}
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      alert("Project ID not found");
      return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    return token;
  } else {
    alert("Must use physical device for push notifications");
    return null;
  }
}

// Context Type
interface PushNotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | undefined;
  sendNotification: (
    title: string,
    body: string,
    data?: object
  ) => Promise<void>;
}

// Create Context
const PushNotificationContext = createContext<PushNotificationContextType>({
  expoPushToken: null,
  notification: undefined,
  sendNotification: async () => {},
});

export const PushNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(setExpoPushToken);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const sendNotification = async (
    title: string,
    body: string,
    data: object = {}
  ) => {
    if (!expoPushToken) {
      return;
    }
    await sendPushNotification(expoPushToken, title, body, data);
  };

  return (
    <PushNotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        sendNotification,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

// Hook to use the context
export const usePushNotification = () => useContext(PushNotificationContext);
