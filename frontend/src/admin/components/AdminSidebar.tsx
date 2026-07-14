/**
 * AdminSidebar — Navigation sidebar for the admin zone.
 */
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../shared/stores/authStore";
import { authApi, adminApi, AdminUserDetail } from "../../shared/api";
import { colors, spacing, radius, fontSize, fontWeight } from "../../shared/theme";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const isWide = width >= 768;

  useEffect(() => {
    adminApi.me().then(setDetail).catch(() => {});
  }, []);

  const doLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout(); router.replace("/login");
  };

  const roles = detail?.roles?.map(r => r.name).join(", ") || "";

  const navItems = [
    { icon: "grid-outline", label: "Dashboard", href: "/admin" },
    { icon: "people-outline", label: "Users", href: "/admin/users" },
  ];

  // Mobile: bottom tabs
  if (!isWide) {
    return (
      <View style={mob.wrap}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={mob.tab} onPress={() => router.push(item.href as any)}>
              <Ionicons name={item.icon as any} size={20} color={active ? colors.accent : colors.textMuted} />
              <Text style={[mob.tabT, active && { color: colors.accent }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      {/* Logo */}
      <View style={s.logoRow}>
        <View style={s.logoBox}><Ionicons name="shield-checkmark" size={18} color="#fff" /></View>
        <Text style={s.logoText}>Admin</Text>
      </View>

      {/* Admin info */}
      <View style={s.userBox}>
        <View style={s.avatar}><Ionicons name="person" size={18} color={colors.accent} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName} numberOfLines={1}>{user?.full_name ?? "Admin"}</Text>
          <Text style={s.userRole} numberOfLines={1}>{roles}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <TouchableOpacity key={item.href} style={[s.navItem, active && s.navItemActive]} onPress={() => router.push(item.href as any)}>
              <Ionicons name={item.icon as any} size={20} color={active ? colors.accent : colors.textMuted} />
              <Text style={[s.navLabel, active && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{item.label}</Text>
              {active && <View style={s.activeDot} />}
            </TouchableOpacity>
          );
        })}

        <View style={s.divider} />
        <Text style={s.sectionLabel}>Coming Soon</Text>
        <View style={s.navItemDisabled}><Ionicons name="cash-outline" size={20} color={colors.textMuted} /><Text style={s.navLabelDisabled}>Finance</Text></View>
        <View style={s.navItemDisabled}><Ionicons name="hardware-chip-outline" size={20} color={colors.textMuted} /><Text style={s.navLabelDisabled}>AI Control</Text></View>
        <View style={s.navItemDisabled}><Ionicons name="settings-outline" size={20} color={colors.textMuted} /><Text style={s.navLabelDisabled}>Settings</Text></View>
      </ScrollView>

      {/* Back to client + Logout */}
      <TouchableOpacity style={s.backBtn} onPress={() => router.push("/client")}>
        <Ionicons name="arrow-back-outline" size={18} color={colors.textMuted} />
        <Text style={s.backText}>Back to Client</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.logoutBtn} onPress={doLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 240, backgroundColor: colors.bgDark, paddingVertical: spacing.lg, borderRightWidth: 1, borderRightColor: colors.border },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  logoBox: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.warning, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textLight },

  userBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginHorizontal: spacing.md, padding: spacing.md, backgroundColor: colors.bg, borderRadius: radius.lg, marginBottom: spacing.lg },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textLight },
  userRole: { fontSize: fontSize.xs, color: colors.warning, marginTop: 1 },

  navItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm, borderRadius: radius.md, marginBottom: 2 },
  navItemActive: { backgroundColor: colors.accentBg },
  navLabel: { fontSize: fontSize.sm, color: colors.textLightSecondary, flex: 1 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },

  navItemDisabled: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm, opacity: 0.35 },
  navLabelDisabled: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm, marginHorizontal: spacing.lg },
  sectionLabel: { fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 1, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, textTransform: "uppercase" },

  backBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm },
  backText: { fontSize: fontSize.sm, color: colors.textMuted },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm },
  logoutText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
});

const mob = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: colors.bgDark, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 20, paddingTop: spacing.sm },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: spacing.xs },
  tabT: { fontSize: 10, color: colors.textMuted },
});
