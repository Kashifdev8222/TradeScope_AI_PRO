import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUserDetail } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [d, setD] = useState<AdminUserDetail | null>(null);
  useEffect(() => { adminApi.me().then(setD).catch(() => {}); }, []);

  const roles = d?.roles?.map(r => r.name).join(", ") || "";

  return (
    <ScreenContainer max={1100} scroll>
      <View style={s.header}>
        <Text style={s.greeting}>Admin Console</Text>
        <Text style={s.subtitle}>Manage users and monitor the platform</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>User Management</Text>
        <TouchableOpacity style={s.card} onPress={() => router.push("/admin/users")} activeOpacity={0.7}>
          <View style={[s.cardIcon, { backgroundColor: colors.accentBg }]}>
            <Ionicons name="people-outline" size={26} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>User Directory</Text>
            <Text style={s.cardDesc}>View, search, activate, suspend, and manage all platform users</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Coming Soon</Text>
        <View style={[s.grid, width < 600 && { flexDirection: "column" }]}>
          <View style={s.smallCard}>
            <Ionicons name="cash-outline" size={24} color={colors.textMuted} />
            <Text style={s.smallTitle}>Finance</Text>
            <Text style={s.smallDesc}>Module 11-12</Text>
          </View>
          <View style={s.smallCard}>
            <Ionicons name="hardware-chip-outline" size={24} color={colors.textMuted} />
            <Text style={s.smallTitle}>AI Control</Text>
            <Text style={s.smallDesc}>Module 9-10</Text>
          </View>
          <View style={s.smallCard}>
            <Ionicons name="shield-outline" size={24} color={colors.textMuted} />
            <Text style={s.smallTitle}>Risk Controls</Text>
            <Text style={s.smallDesc}>Module 10</Text>
          </View>
          <View style={s.smallCard}>
            <Ionicons name="settings-outline" size={24} color={colors.textMuted} />
            <Text style={s.smallTitle}>Settings</Text>
            <Text style={s.smallDesc}>Module 16</Text>
          </View>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },

  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text,
    marginBottom: spacing.md, paddingBottom: spacing.sm,
    borderBottomWidth: 2, borderBottomColor: colors.accent,
    alignSelf: "flex-start",
  },

  card: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 3 },

  grid: { flexDirection: "row", gap: 14 },
  smallCard: {
    flex: 1, minWidth: 150,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.lg, gap: 8,
    borderWidth: 1, borderColor: colors.cardBorder,
    opacity: 0.5,
  },
  smallTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  smallDesc: { fontSize: fontSize.xs, color: colors.textMuted },
});
