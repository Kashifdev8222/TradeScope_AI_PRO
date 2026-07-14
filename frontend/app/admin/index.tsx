import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUserDetail } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function AdminDashboard() {
  const router = useRouter();
  const [d, setD] = useState<AdminUserDetail | null>(null);

  useEffect(() => { adminApi.me().then(setD).catch(() => {}); }, []);

  return (
    <ScreenContainer max={960} scroll>
      <View style={s.header}>
        <Text style={s.greeting}>Admin Console</Text>
        <Text style={s.subtitle}>Manage users, monitor the platform</Text>
      </View>

      <View style={s.grid}>
        <TouchableOpacity style={s.card} onPress={() => router.push("/admin/users")} activeOpacity={0.7}>
          <View style={s.cardIcon}>
            <Ionicons name="people-outline" size={24} color={colors.accent} />
          </View>
          <Text style={s.cardTitle}>User Directory</Text>
          <Text style={s.cardDesc}>View, search, and manage all users</Text>
        </TouchableOpacity>

        <View style={[s.card, { opacity: 0.35 }]}>
          <View style={[s.cardIcon, { backgroundColor: colors.bgDark }]}>
            <Ionicons name="cash-outline" size={24} color={colors.textMuted} />
          </View>
          <Text style={s.cardTitle}>Finance</Text>
          <Text style={s.cardDesc}>Module 11-12</Text>
        </View>

        <View style={[s.card, { opacity: 0.35 }]}>
          <View style={[s.cardIcon, { backgroundColor: colors.bgDark }]}>
            <Ionicons name="hardware-chip-outline" size={24} color={colors.textMuted} />
          </View>
          <Text style={s.cardTitle}>AI Control</Text>
          <Text style={s.cardDesc}>Module 9-10</Text>
        </View>

        <View style={[s.card, { opacity: 0.35 }]}>
          <View style={[s.cardIcon, { backgroundColor: colors.bgDark }]}>
            <Ionicons name="settings-outline" size={24} color={colors.textMuted} />
          </View>
          <Text style={s.cardTitle}>Settings</Text>
          <Text style={s.cardDesc}>Module 16</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    width: "47%", minWidth: 200, flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.xl, gap: 12,
    borderWidth: 1, borderColor: "#1A2433",
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: "rgba(30,56,82,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  cardDesc: { fontSize: fontSize.sm, color: colors.textMuted },
});
