import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();

  return (
    <ScreenContainer max={1100} scroll>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {greet()}, {user?.full_name?.split(" ")[0] ?? "Trader"}</Text>
          <Text style={s.subtitle}>Trading overview & quick actions</Text>
        </View>
      </View>

      {/* Portfolio Stats */}
      <View style={[s.statsRow, width < 600 && s.statsRowSmall]}>
        <StatCard icon="wallet-outline" label="Balance" value="$0.00" color={colors.accent} />
        <StatCard icon="pie-chart-outline" label="Equity" value="$0.00" color="#10B981" />
        <StatCard icon="bar-chart-outline" label="Free Margin" value="$0.00" color="#6366F1" />
        <StatCard icon="trending-up-outline" label="P/L Today" value="$0.00" color="#F59E0B" />
      </View>

      {/* Grid sections */}
      <View style={[s.grid, width < 600 && s.gridSmall]}>
        {/* Quick links */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Navigation</Text>
          <TouchableOpacity style={s.navCard} onPress={() => router.push("/client/profile")} activeOpacity={0.7}>
            <View style={[s.navIcon, { backgroundColor: colors.accentBg }]}>
              <Ionicons name="person-outline" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.navTitle}>Profile & KYC</Text>
              <Text style={s.navDesc}>Manage your personal details and identity verification</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={s.navCard} onPress={() => router.push("/client/accounts")} activeOpacity={0.7}>
            <View style={[s.navIcon, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="wallet-outline" size={22} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.navTitle}>Trading Accounts</Text>
              <Text style={s.navDesc}>Create and manage your trading accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={s.navCard} onPress={() => router.push("/client/kyc")} activeOpacity={0.7}>
            <View style={[s.navIcon, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.navTitle}>Verification</Text>
              <Text style={s.navDesc}>Submit KYC documents for account verification</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Coming soon */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Coming Soon</Text>
          <View style={s.comingSoon}>
            <ComingItem icon="stats-chart-outline" label="Web Trader" desc="Professional trading terminal" />
            <ComingItem icon="bar-chart-outline" label="Advanced Charts" desc="Real-time candlestick charts" />
            <ComingItem icon="trophy-outline" label="Leaderboard" desc="Anonymous live trader rankings" />
            <ComingItem icon="newspaper-outline" label="News Feed" desc="Licensed market news" />
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      <View style={[s.statIconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
    </View>
  );
}

function ComingItem({ icon, label, desc }: any) {
  return (
    <View style={s.ci}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={s.ciLabel}>{label}</Text>
        <Text style={s.ciDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: "row", gap: 14, marginBottom: spacing.xl },
  statsRowSmall: { flexWrap: "wrap" },
  stat: {
    flex: 1, minWidth: 140,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.lg, gap: 6,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase", fontWeight: fontWeight.medium },
  statValue: { fontSize: 26, fontWeight: fontWeight.bold, color: colors.text },
  statIconWrap: {
    position: "absolute", right: 14, top: 14,
    width: 32, height: 32, borderRadius: radius.sm,
    alignItems: "center", justifyContent: "center",
  },

  grid: { flexDirection: "row", gap: 20 },
  gridSmall: { flexDirection: "column" },
  section: { flex: 1 },

  sectionTitle: {
    fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text,
    marginBottom: spacing.md, paddingBottom: spacing.sm,
    borderBottomWidth: 2, borderBottomColor: colors.accent,
    alignSelf: "flex-start",
  },

  navCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  navIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  navTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  navDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  comingSoon: { gap: 10 },
  ci: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.md, borderWidth: 1, borderColor: colors.cardBorder,
    opacity: 0.55,
  },
  ciLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  ciDesc: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
});
