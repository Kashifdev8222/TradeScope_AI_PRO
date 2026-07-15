import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../shared/stores/authStore";
import { authApi } from "../../shared/api";
import { colors, spacing, radius, fontSize, fontWeight } from "../../shared/theme";

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

const NAV: NavItem[] = [
  { icon: "grid-outline", label: "Dashboard", href: "/client" },
  { icon: "person-outline", label: "Profile", href: "/client/profile" },
  { icon: "wallet-outline", label: "Accounts", href: "/client/accounts" },
  { icon: "stats-chart-outline", label: "Market", href: "/client/market" },
  { icon: "shield-checkmark-outline", label: "Verification", href: "/client/kyc" },
];

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const doLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout(); router.replace("/login");
  };

  if (!isWide) {
    return (
      <View style={mob.bar}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={mob.tab} onPress={() => router.push(item.href as any)}>
              <Ionicons name={item.icon} size={21} color={active ? colors.accent : colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Brand */}
      <TouchableOpacity style={s.brand} onPress={() => router.push("/client")}>
        <View style={s.brandIcon}>
          <Ionicons name="trending-up" size={22} color="#fff" />
        </View>
        <View>
          <Text style={s.brandName}>TradeScope AI</Text>
          <Text style={s.brandVer}>v1.0</Text>
        </View>
      </TouchableOpacity>

      {/* User */}
      <View style={s.user}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.full_name || "T")[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName} numberOfLines={1}>{user?.full_name ?? "Trader"}</Text>
          <Text style={s.userCode}>{user?.client_code}</Text>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>MAIN MENU</Text>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={[s.nav, active && s.navActive]} onPress={() => router.push(item.href as any)}>
              <View style={[s.navIcon, active && s.navIconActive]}>
                <Ionicons name={item.icon} size={18} color={active ? "#fff" : colors.textMuted} />
              </View>
              <Text style={[s.navText, active && s.navTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={s.logout} onPress={doLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    width: 230, backgroundColor: colors.bgDark,
    paddingTop: spacing.lg,
    borderRightWidth: 1, borderRightColor: "#1A2433",
  },

  brand: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: "#1A2433",
  },
  brandIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  brandName: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.textLight },
  brandVer: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  user: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1A2433",
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: fontWeight.bold, color: "#fff" },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textLight },
  userCode: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  sectionLabel: {
    fontSize: 10, fontWeight: fontWeight.semibold, color: colors.textMuted,
    letterSpacing: 1.5, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },

  nav: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm, borderRadius: radius.md,
    marginBottom: 2,
  },
  navActive: { backgroundColor: "rgba(30,56,82,0.5)" },
  navIcon: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
  },
  navIconActive: { backgroundColor: colors.accent },
  navText: { fontSize: fontSize.sm, color: colors.textLightSecondary, flex: 1 },
  navTextActive: { color: colors.textLight, fontWeight: fontWeight.semibold },

  logout: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    borderTopWidth: 1, borderTopColor: "#1A2433",
  },
  logoutText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
});

const mob = StyleSheet.create({
  bar: {
    flexDirection: "row", backgroundColor: colors.bgDark,
    borderTopWidth: 1, borderTopColor: "#1A2433",
    paddingBottom: 20, paddingTop: spacing.sm, paddingHorizontal: spacing.sm,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
});
