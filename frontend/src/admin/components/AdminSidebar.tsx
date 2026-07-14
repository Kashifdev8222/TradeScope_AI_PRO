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

  useEffect(() => { adminApi.me().then(setDetail).catch(() => {}); }, []);

  const doLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout(); router.replace("/login");
  };

  const roles = detail?.roles?.map(r => r.name).join(", ") || "";

  if (!isWide) {
    return (
      <View style={mob.bar}>
        <TouchableOpacity style={mob.tab} onPress={() => router.push("/admin")}>
          <Ionicons name="grid-outline" size={21} color={pathname === "/admin" ? colors.accent : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={mob.tab} onPress={() => router.push("/admin/users")}>
          <Ionicons name="people-outline" size={21} color={pathname.startsWith("/admin/users") ? colors.accent : colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <TouchableOpacity style={s.brand} onPress={() => router.push("/client")}>
        <View style={s.brandIcon}>
          <Ionicons name="shield-checkmark" size={22} color="#fff" />
        </View>
        <View>
          <Text style={s.brandName}>Admin Panel</Text>
          <Text style={s.brandVer}>TradeScope AI</Text>
        </View>
      </TouchableOpacity>

      <View style={s.user}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(user?.full_name || "A")[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName} numberOfLines={1}>{user?.full_name ?? "Admin"}</Text>
          <Text style={s.userRole} numberOfLines={1}>{roles || "Admin"}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>MANAGEMENT</Text>
        <NavItem icon="grid-outline" label="Dashboard" href="/admin" pathname={pathname} router={router} />
        <NavItem icon="people-outline" label="Users" href="/admin/users" pathname={pathname} router={router} />

        <Text style={[s.sectionLabel, { marginTop: spacing.lg }]}>COMING SOON</Text>
        <View style={s.navDisabled}>
          <View style={s.navIcon}>
            <Ionicons name="cash-outline" size={18} color={colors.textMuted} />
          </View>
          <Text style={s.navTextDisabled}>Finance</Text>
        </View>
        <View style={s.navDisabled}>
          <View style={s.navIcon}>
            <Ionicons name="hardware-chip-outline" size={18} color={colors.textMuted} />
          </View>
          <Text style={s.navTextDisabled}>AI Control</Text>
        </View>
        <View style={s.navDisabled}>
          <View style={s.navIcon}>
            <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
          </View>
          <Text style={s.navTextDisabled}>Settings</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={s.back} onPress={() => router.push("/client")}>
        <Ionicons name="arrow-back-outline" size={18} color={colors.textMuted} />
        <Text style={s.backText}>Back to Client</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.logout} onPress={doLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function NavItem({ icon, label, href, pathname, router }: any) {
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <TouchableOpacity style={[s.nav, active && s.navActive]} onPress={() => router.push(href)}>
      <View style={[s.navIcon, active && s.navIconActive]}>
        <Ionicons name={icon} size={18} color={active ? "#fff" : colors.textMuted} />
      </View>
      <Text style={[s.navText, active && s.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { width: 200, backgroundColor: colors.bgDark, paddingTop: spacing.lg, borderRightWidth: 1, borderRightColor: "#1A2433" },

  brand: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1A2433" },
  brandIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.warning, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.textLight },
  brandVer: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  user: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1A2433" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.warning, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: fontWeight.bold, color: "#fff" },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textLight },
  userRole: { fontSize: 11, color: colors.warning, marginTop: 1 },

  sectionLabel: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },

  nav: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm, borderRadius: radius.md, marginBottom: 2 },
  navActive: { backgroundColor: "rgba(30,56,82,0.5)" },
  navIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  navIconActive: { backgroundColor: colors.accent },
  navText: { fontSize: fontSize.sm, color: colors.textLightSecondary, flex: 1 },
  navTextActive: { color: colors.textLight, fontWeight: fontWeight.semibold },

  navDisabled: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: spacing.lg, marginHorizontal: spacing.sm, opacity: 0.3 },
  navTextDisabled: { fontSize: fontSize.sm, color: colors.textMuted, flex: 1 },

  back: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: spacing.lg, borderTopWidth: 1, borderTopColor: "#1A2433" },
  backText: { fontSize: fontSize.sm, color: colors.textMuted },
  logout: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: spacing.lg },
  logoutText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
});

const mob = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: colors.bgDark, borderTopWidth: 1, borderTopColor: "#1A2433", paddingBottom: 20, paddingTop: spacing.sm },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
});
