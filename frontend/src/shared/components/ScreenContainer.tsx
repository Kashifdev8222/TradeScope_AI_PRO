import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme";

interface Props { children: React.ReactNode; max?: number; scroll?: boolean; style?: ViewStyle; contentStyle?: ViewStyle; padded?: boolean; }

export default function ScreenContainer({ children, max, scroll = false, style, contentStyle, padded = true }: Props) {
  const Wrapper = scroll ? ScrollView : View;
  return (
    <Wrapper
      style={[{ flex: 1, backgroundColor: colors.bg }, style]}
      contentContainerStyle={scroll ? [padded && { padding: 24 }, contentStyle] : undefined}
    >
      <View style={[{ flex: 1 }, padded && !scroll && { padding: 24 }, contentStyle]}>
        {children}
      </View>
    </Wrapper>
  );
}
