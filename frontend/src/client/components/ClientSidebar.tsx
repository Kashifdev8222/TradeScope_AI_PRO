/**
 * ClientSidebar — Navigation sidebar for the client zone.
 * Desktop: fixed left sidebar. Mobile: bottom tab bar.
 */
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../shared/stores/authStore";
import { authApi, adminApi } from "../../shared/api";
import { colors, spacing, radius, fontSize, fontWeight } from "../../shared/theme";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  admin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "grid-outline", label: "Dashboard", href: "/client" },
  { icon: "person-outline", label: "Profile & KYC", href: "/client/profile" },
  { icon: "wallet-outline", label: "Trading Accounts", href: "/client/accounts" },
  { icon: "shield-checkmark-outline", label: "Verification", href: "/client/kyc" },
];

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { width } = useWindowDimensions();
  const [isAdmin, setIsAdmin] = useState(false);
  const isWide = width >= 768;

  useEffect(() => {
    adminApi.me().then(() => setIsAdmin(true)).catch(() => setIsAdmin(false));
  }, []);

  const doLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout(); router.replace("/login");
  };

  // Mobile: bottom tab bar
  if (!isWide) {
    return (
      <View style={mob.wrap}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={mob.tab} onPress={() => router.push(item.href as any)}>
              <Ionicons name={item.icon} size={20} color={active ? colors.accent : colors.textMuted} />
              <Text style={[mob.tabT, active && { color: colors.accent }]} numberOfLines={1}>{item.label.split(" ")[0]}</Text>
            </TouchableOpacity>
          );
        })}
        {isAdmin && (
          <TouchableOpacity style={mob.tab} onPress={() => router.push("/admin")}>
            <Ionicons name="shield-outline" size={20} color={pathname.startsWith("/admin") ? colors.accent : colors.textMuted} />
            <Text style={mob.tabT}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Desktop: left sidebar
  return (
    <View style={s.wrap}>
      {/* Logo */}
      <View style={s.logoRow}>
        <View style={s.logoBox}>
          <Ionicons name="trending-up" size={18} color="#fff" />
        </View>
        <Text style={s.logoText}>TradeScope</Text>
      </View>

      {/* User info */}
      <View style={s.userBox}>
        <View style={s.avatar}>
          <Ionicons name="person" size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName} numberOfLines={1}>{user?.full_name ?? "Trader"}</Text>
          <Text style={s.userCode}>{user?.client_code}</Text>
        </View>
      </View>

      {/* Nav items */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={[s.navItem, active && s.navItemActive]} onPress={() => router.push(item.href as any)}>
              <Ionicons name={item.icon} size={20} color={active ? colors.accent : colors.textMuted} />
              <Text style={[s.navLabel, active && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{item.label}</Text>
              {active && <View style={s.activeDot} />}
            </TouchableOpacity>
          );
        })}

        {/* Admin button — only for admins */}
        {isAdmin && (
          <>
            <View style={s.divider} />
            <TouchableOpacity style={[s.navItem, pathname.startsWith("/admin") && s.navItemActive]} onPress={() => router.push("/admin")}>
              <Ionicons name="shield-outline" size={20} color={pathname.startsWith("/admin") ? colors.accent : colors.textMuted} />
              <Text style={[s.navLabel, pathname.startsWith("/admin") && { color: colors.accent, fontWeight: fontWeight.semibold }]}>Admin Console</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={doLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: 240, backgroundColor: colors.bgDark,
    paddingVertical: spacing.lg, borderRightWidth: 1, borderRightColor: colors.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  logoBox: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textLight },

  userBox: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    marginHorizontal: spacing.md, padding: spacing.md,
    backgroundColor: colors.bg, borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textLight },
  userCode: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },

  navItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12, paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm, borderRadius: radius.md,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: colors.accentBg },
  navLabel: { fontSize: fontSize.sm, color: colors.textLightSecondary, flex: 1 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm, marginHorizontal: spacing.lg },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm, marginTop: spacing.sm },
  logoutText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
});

const mob = StyleSheet.create({
  wrap: {
    flexDirection: "row", backgroundColor: colors.bgDark,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: 20, paddingTop: spacing.sm,
  },
  tab: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 2, paddingVertical: spacing.xs,
  },
  tabT: { fontSize: 10, color: colors.textMuted },
});
