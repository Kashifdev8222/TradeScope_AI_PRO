import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle, useWindowDimensions } from "react-native";
import { colors } from "../theme";

interface Props { children: React.ReactNode; max?: number; scroll?: boolean; style?: ViewStyle; contentStyle?: ViewStyle; padded?: boolean; }

export default function ScreenContainer({ children, max = 900, scroll = false, style, contentStyle, padded = true }: Props) {
  const { width } = useWindowDimensions();
  return (
    <View style={[s.base, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={[s.inner, padded && { padding: 24 }, { width: "100%", maxWidth: max }, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[s.inner, padded && { padding: 24 }, { width: "100%", maxWidth: max, flex: 1 }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}
const s = StyleSheet.create({ base: { flex: 1, backgroundColor: colors.bg, alignItems: "center" }, inner: { alignSelf: "center" } });
