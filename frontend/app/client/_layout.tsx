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
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.bg },
        }}>
          <Stack.Screen name="index" options={{ title: "Dashboard" }} />
          <Stack.Screen name="profile" options={{ title: "Profile & KYC" }} />
          <Stack.Screen name="accounts" options={{ title: "Trading Accounts" }} />
          <Stack.Screen name="accounts/create" options={{ title: "New Account" }} />
          <Stack.Screen name="kyc" options={{ title: "KYC Verification" }} />
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
