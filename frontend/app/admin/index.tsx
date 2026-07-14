import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUserDetail } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function AdminDashboard() {
  const [d, setD] = useState<AdminUserDetail | null>(null);

  useEffect(() => {
    adminApi.me().then(setD).catch(() => {});
  }, []);

  const roles = d?.roles?.map(r => r.name).join(", ") || "";

  return (
    <ScreenContainer max={900} scroll>
      <View style={s.welcome}>
        <Text style={s.greeting}>Admin Console</Text>
        <Text style={s.subtitle}>Manage users, finance, AI, and platform settings</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Ionicons name="people-outline" size={20} color={colors.accent} />
          <Text style={s.statV}>—</Text>
          <Text style={s.statL}>Total Users</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="wallet-outline" size={20} color={colors.success} />
          <Text style={s.statV}>$0.00</Text>
          <Text style={s.statL}>Total AUM</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} />
          <Text style={s.statV}>{roles || "—"}</Text>
          <Text style={s.statL}>Your Roles</Text>
        </View>
      </View>

      <View style={s.placeholder}>
        <Ionicons name="analytics-outline" size={40} color={colors.textMuted} />
        <Text style={s.phT}>Finance & Risk dashboards coming in later modules</Text>
        <Text style={s.phS}>Use the sidebar to manage users</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  welcome: { marginBottom: spacing.lg },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.xl },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.cardBorder },
  statV: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statL: { fontSize: fontSize.xs, color: colors.textMuted },

  placeholder: { alignItems: "center", paddingVertical: spacing.xxl, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.sm },
  phT: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: "center" },
  phS: { fontSize: fontSize.xs, color: colors.textMuted },
});
