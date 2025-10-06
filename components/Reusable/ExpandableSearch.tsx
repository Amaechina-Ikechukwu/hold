import React, { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { mwidth } from "./ScreenDimensions";
import { holdstore } from "@/holdstore";
import { useShallow } from "zustand/shallow";

const ExpandableSearch = () => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const [searchClipboard, cancelSearch] = holdstore(
    useShallow((state) => [state.searchClipboard, state.cancelSearch])
  );

  const inputRef = useRef<TextInput | null>(null);
  const widthAnim = useRef(new Animated.Value(40)).current; // Start small

  const toggleSearch = () => {
    if (!expanded) {
      Animated.timing(widthAnim, {
        toValue: mwidth * 0.7, // Expand to 80% of the screen width
        duration: 300,
        useNativeDriver: false,
      }).start(() => inputRef.current?.focus());
    } else {
      cancelSearch();
      Animated.timing(widthAnim, {
        toValue: 40, // Collapse back
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setExpanded(!expanded);
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    searchClipboard(text);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Animated.View
        style={{
          width: expanded ? widthAnim : 40,
          backgroundColor: "#f0f0f0",
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          height: 40,
        }}
      >
        {expanded && (
          <TextInput
            ref={inputRef}
            style={{ flex: 1, fontSize: 16 }}
            placeholder="Search..."
            value={query}
            onChangeText={handleSearch}
          />
        )}
      </Animated.View>

      <TouchableOpacity
        onPress={toggleSearch}
        style={{
          position: "absolute",
          right: 10,
        }}
      >
        <Feather name={expanded ? "x" : "search"} size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default ExpandableSearch;
