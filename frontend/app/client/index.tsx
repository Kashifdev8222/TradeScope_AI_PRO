import { View, Text, StyleSheet, TouchableOpacity } from "react-native"; import { useRouter } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../src/shared/stores/authStore"; import { authApi, adminApi } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer"; import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function Dashboard() {
  const router = useRouter(); const user = useAuthStore((s) => s.user); const logout = useAuthStore((s) => s.logout);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user has admin role
    adminApi.me().then(() => setIsAdmin(true)).catch(() => setIsAdmin(false));
  }, []);

  return (<ScreenContainer max={800} scroll>
    <View style={s.top}><View style={{ flex: 1 }}><Text style={s.g}>Welcome, {user?.full_name?.split(" ")[0] ?? "Trader"}</Text><Text style={s.cd}>{user?.client_code}</Text></View><View style={s.sts}><View style={s.sd} /><Text style={s.st}>{user?.status ?? "active"}</Text></View></View>
    <View style={s.ss}><SB i="wallet-outline" l="Balance" v="$0.00" /><SB i="pie-chart-outline" l="Equity" v="$0.00" /><SB i="trending-up-outline" l="P/L Today" v="$0.00" /></View>
    <N i="person-outline" t="Profile & KYC" s="Manage details and verification" onPress={() => router.push("/client/profile")} />
    <Text style={s.lbl}>Coming Soon</Text><ND i="bar-chart-outline" t="Portfolio & Charts" s="Module 8" /><ND i="stats-chart-outline" t="Web Trader" s="Module 5" />

    {/* Admin button — only visible for admin users */}
    {isAdmin && (
      <TouchableOpacity style={s.adm} onPress={() => router.push("/admin")}>
        <Ionicons name="shield-outline" size={16} color={colors.accent} /><Text style={s.admT}>Admin Console</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity style={s.out} onPress={async () => { try { await authApi.logout(); } catch {} logout(); router.replace("/login"); }}>
      <Ionicons name="log-out-outline" size={16} color={colors.danger} /><Text style={s.outT}>Sign Out</Text>
    </TouchableOpacity>
    <View style={{ height: 40 }} /></ScreenContainer>);
}
function SB({ i, l, v }: any) { return <View style={s.sb}><Ionicons name={i} size={15} color={colors.accent} /><Text style={s.sl}>{l}</Text><Text style={s.sv}>{v}</Text></View>; }
function N({ i, t, s: sub, onPress }: any) { return <TouchableOpacity style={s.n} onPress={onPress}><View style={s.ni}><Ionicons name={i} size={19} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={s.nt}>{t}</Text><Text style={s.ns}>{sub}</Text></View><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></TouchableOpacity>; }
function ND({ i, t, s: sub }: any) { return <View style={[s.n, { opacity: 0.45 }]}><View style={[s.ni, { backgroundColor: "#F3F4F6" }]}><Ionicons name={i} size={19} color={colors.textMuted} /></View><View style={{ flex: 1 }}><Text style={[s.nt, { color: colors.textSecondary }]}>{t}</Text><Text style={s.ns}>{sub}</Text></View></View>; }
const s = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  g: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }, cd: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  sts: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  sd: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }, st: { color: colors.success, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "uppercase" },
  ss: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  sb: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.cardBorder },
  sl: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase" }, sv: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  n: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder },
  ni: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  nt: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }, ns: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  lbl: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.md, marginTop: spacing.sm, paddingLeft: 4 },
  adm: { backgroundColor: colors.accentBg, borderRadius: radius.md, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.md, borderWidth: 1, borderColor: colors.accent },
  admT: { color: colors.accent, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  out: { borderRadius: radius.md, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  outT: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.medium },
});
