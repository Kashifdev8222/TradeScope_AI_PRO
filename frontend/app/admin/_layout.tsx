import { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Stack, Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import { adminApi } from "../../src/shared/api";
import AdminSidebar from "../../src/admin/components/AdminSidebar";
import { colors } from "../../src/shared/theme";

export default function AdminLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const isWide = width >= 768;

  useEffect(() => {
    adminApi.me().then(() => setIsAdmin(true)).catch(() => setIsAdmin(false));
  }, []);

  if (!isAuthenticated) return <Redirect href="/login" />;

  // Loading check
  if (isAdmin === null) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  // Not an admin — redirect
  if (isAdmin === false) {
    return (
      <View style={s.center}>
        <Ionicons name="shield-outline" size={48} color={colors.danger} />
        <Text style={s.denied}>Access Denied</Text>
        <Text style={s.deniedSub}>You do not have admin permissions</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.replace("/client")}>
          <Text style={s.backBtnT}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.root, isWide && { flexDirection: "row" }]}>
      {isWide && <AdminSidebar />}
      <View style={s.content}>
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="users" />
          <Stack.Screen name="users/[id]" />
        </Stack>
      </View>
      {!isWide && <AdminSidebar />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: "column", backgroundColor: colors.bg },
  content: { flex: 1, overflow: "hidden" },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: 40, gap: 12 },
  denied: { fontSize: 22, fontWeight: "700", color: colors.textLight, marginTop: 8 },
  deniedSub: { fontSize: 14, color: colors.textMuted },
  backBtn: { marginTop: 16, backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnT: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
