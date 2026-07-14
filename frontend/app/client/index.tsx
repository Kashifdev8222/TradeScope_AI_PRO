import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <ScreenContainer max={900} scroll>
      <View style={s.welcome}>
        <Text style={s.greeting}>Welcome back, {user?.full_name?.split(" ")[0] ?? "Trader"}</Text>
        <Text style={s.subtitle}>Here's your trading overview</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard icon="wallet-outline" label="Total Balance" value="$0.00" color={colors.accent} />
        <StatCard icon="pie-chart-outline" label="Equity" value="$0.00" color={colors.success} />
        <StatCard icon="trending-up-outline" label="P/L Today" value="$0.00" color={colors.success} />
      </View>

      {/* Quick actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickRow}>
          <ActionCard icon="wallet-outline" label="Accounts" onPress={() => {}} />
          <ActionCard icon="bar-chart-outline" label="Charts" onPress={() => {}} />
          <ActionCard icon="trending-up" label="Trade" onPress={() => {}} />
          <ActionCard icon="document-text-outline" label="History" onPress={() => {}} />
        </View>
      </View>

      {/* Market Overview placeholder */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Market Overview</Text>
        <View style={s.placeholder}>
          <Ionicons name="stats-chart-outline" size={32} color={colors.textMuted} />
          <Text style={s.placeholderT}>Market data coming in Module 4</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

function ActionCard({ icon, label, onPress }: any) {
  return (
    <View style={s.action}>
      <View style={s.actionIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  welcome: { marginBottom: spacing.lg },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.xl },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.cardBorder },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase" },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },

  quickRow: { flexDirection: "row", gap: 10 },
  action: { flex: 1, alignItems: "center", gap: 8, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  actionIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },

  placeholder: { alignItems: "center", paddingVertical: spacing.xl, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.sm },
  placeholderT: { fontSize: fontSize.sm, color: colors.textMuted },
});
