import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../src/shared/stores/authStore";
import { colors } from "../../src/shared/theme";

export default function ClientLayout() {
  if (!useAuthStore((s) => s.isAuthenticated)) return <Redirect href="/login" />;
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bgDark }, headerTintColor: colors.textLight, headerTitleStyle: { fontWeight: "600" }, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" options={{ title: "TradeScope AI" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="accounts" options={{ title: "Trading Accounts" }} />
      <Stack.Screen name="accounts/create" options={{ title: "New Account" }} />
      <Stack.Screen name="kyc" options={{ title: "KYC Verification" }} />
    </Stack>
  );
}
