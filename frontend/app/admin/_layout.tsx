import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../src/shared/stores/authStore";
import AdminSidebar from "../../src/admin/components/AdminSidebar";
import { colors } from "../../src/shared/theme";

export default function AdminLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={s.root}>
      {isWide && <AdminSidebar />}
      <View style={s.content}>
        <Stack screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.bg },
        }}>
          <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
          <Stack.Screen name="users" options={{ title: "User Directory" }} />
          <Stack.Screen name="users/[id]" options={{ title: "User Detail" }} />
        </Stack>
      </View>
      {!isWide && <AdminSidebar />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: "column", backgroundColor: colors.bg },
  content: { flex: 1 },
});
