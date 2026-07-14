import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <ScreenContainer max={960} scroll>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {getGreeting()}, {user?.full_name?.split(" ")[0] ?? "Trader"}</Text>
          <Text style={s.subtitle}>Here's your trading overview</Text>
        </View>
      </View>

      <View style={s.stats}>
        <StatCard icon="wallet-outline" label="Total Balance" value="$0.00" />
        <StatCard icon="pie-chart-outline" label="Equity" value="$0.00" />
        <StatCard icon="trending-up-outline" label="P/L Today" value="$0.00" />
      </View>

      <View style={s.grid}>
        <QuickCard
          icon="person-outline"
          title="Profile"
          desc="Manage your details"
          onPress={() => router.push("/client/profile")}
        />
        <QuickCard
          icon="wallet-outline"
          title="Accounts"
          desc="Manage trading accounts"
          onPress={() => router.push("/client/accounts")}
        />
        <QuickCard
          icon="shield-checkmark-outline"
          title="KYC"
          desc="Verify your identity"
          onPress={() => router.push("/client/kyc")}
        />
        <QuickCardDisabled icon="bar-chart-outline" title="Charts" desc="Coming in Module 5" />
        <QuickCardDisabled icon="stats-chart-outline" title="Web Trader" desc="Coming in Module 5" />
        <QuickCardDisabled icon="newspaper-outline" title="News" desc="Coming in Module 14" />
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatCard({ icon, label, value }: any) {
  return (
    <View style={s.stat}>
      <View style={s.statIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

function QuickCard({ icon, title, desc, onPress }: any) {
  return (
    <View style={s.card} onTouchEnd={onPress}>
      <View style={s.cardIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardDesc}>{desc}</Text>
    </View>
  );
}

function QuickCardDisabled({ icon, title, desc }: any) {
  return (
    <View style={[s.card, { opacity: 0.35 }]}>
      <View style={[s.cardIcon, { backgroundColor: colors.bgDark }]}>
        <Ionicons name={icon} size={22} color={colors.textMuted} />
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardDesc}>{desc}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },

  stats: { flexDirection: "row", gap: 12, marginBottom: spacing.xl },
  stat: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.lg, gap: 8,
    borderWidth: 1, borderColor: "#1A2433",
  },
  statIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: "rgba(30,56,82,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "31%", minWidth: 160, flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg, padding: spacing.lg, gap: 10,
    borderWidth: 1, borderColor: "#1A2433",
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: "rgba(30,56,82,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardDesc: { fontSize: fontSize.xs, color: colors.textMuted },
});
