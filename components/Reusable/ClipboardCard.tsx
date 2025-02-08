import React from "react";
import { View, TouchableOpacity, Animated, Linking, Image } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import HoldText from "./HoldText";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { mwidth } from "./ScreenDimensions";

interface ClipboardCardProps {
  content: string;
  id: number;
  fadeAnim: Animated.Value;
  onDelete: (id: number, fadeAnim: Animated.Value) => void;
  onCopy: (content: string) => void;
}

const ClipboardCard: React.FC<ClipboardCardProps> = ({
  content,
  id,
  fadeAnim,
  onDelete,
  onCopy,
}) => {
  const detectLink = (text: string) => {
    const match = text.match(/(https?:\/\/[^\s]+)/);
    return match ? match[0] : null;
  };

  const link = detectLink(content);

  return (
    <Animated.View
      style={{
        minHeight: 100,
        borderRadius: 30,
        backgroundColor: "#1a1918",
        width: "90%",
        padding: 30,
        shadowColor: "#9c9c9c",
        shadowOffset: { width: 10, height: 14 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 5,
        gap: 20,
      }}
    >
      {link && (
        <LinkPreview
          containerStyle={{
            backgroundColor: "#9c9c9c",
            width: mwidth * 0.7,
            padding: 10,
            borderRadius: 20,
          }}
          enableAnimation={true}
          renderImage={(image) => (
            <Image
              src={image.url}
              style={{
                aspectRatio: 4 / 3,
                resizeMode: "contain",
                borderRadius: 10,
              }}
            />
          )}
          text={link}
          // metadataContainerStyle={{
          //   backgroundColor: "#9c9c9c",
          //   width: mwidth * 0.7,
          //   padding: 10,
          //   borderRadius: 20,
          // }}
        />
      )}
      <View style={{ position: "absolute", right: 20, top: 20, zIndex: 99 }}>
        <TouchableOpacity onPress={() => onDelete(id, fadeAnim)}>
          <AntDesign name="delete" size={18} color="#7A7A7A" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => onCopy(content)} style={{ gap: 20 }}>
        <HoldText fontFamily="Lalezar">{content}</HoldText>

        <HoldText fontFamily="Keania" style={{ fontSize: 16 }}>
          Tap to copy
        </HoldText>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(ClipboardCard);
