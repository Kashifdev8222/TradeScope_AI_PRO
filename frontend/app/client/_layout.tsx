import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ClientSidebar from "../../src/client/components/ClientSidebar";
import { colors } from "../../src/shared/theme";

export default function ClientLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={[s.root, isWide && { flexDirection: "row" }]}>
      {isWide && <ClientSidebar />}
      <View style={s.content}>
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="accounts" />
          <Stack.Screen name="accounts/create" />
          <Stack.Screen name="kyc" />
        </Stack>
      </View>
      {!isWide && <ClientSidebar />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: "column", backgroundColor: colors.bg },
  content: { flex: 1, overflow: "hidden" },
});
