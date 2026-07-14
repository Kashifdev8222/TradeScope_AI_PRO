import { useEffect, useState } from "react"; import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUserDetail } from "../../src/shared/api"; import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer"; import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";
export default function AdminDashboard() {
  const router = useRouter(); const user = useAuthStore((s) => s.user); const [d, setD] = useState<AdminUserDetail | null>(null); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  useEffect(() => { (async () => { try { setD(await adminApi.me()); } catch (e: any) { setErr(e.message || "Not authorized"); } finally { setLoading(false); } })(); }, []);
  if (loading) return <ScreenContainer max={600}><View style={s.ctr}><ActivityIndicator color={colors.accent} size="large" /></View></ScreenContainer>;
  if (err) return <ScreenContainer max={480}><View style={s.ctr}><Ionicons name="shield-outline" size={36} color={colors.danger} /><Text style={s.et}>{err}</Text><TouchableOpacity style={s.bb} onPress={() => router.replace("/client")}><Text style={s.bt}>Go to Client Zone</Text></TouchableOpacity></View></ScreenContainer>;
  return (<ScreenContainer max={800} scroll>
    <View style={s.top}><View style={s.av}><Ionicons name="person" size={22} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={s.nm}>{user?.full_name}</Text><Text style={s.rl}>{d?.roles?.map(r => r.name).join(", ") || "Client"}</Text></View></View>
    <Text style={s.sl}>USER MANAGEMENT</Text>
    <TouchableOpacity style={s.card} onPress={() => router.push("/admin/users")}><View style={s.ci}><Ionicons name="people-outline" size={19} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={s.ct}>User Directory</Text><Text style={s.cs}>Search and manage all platform users</Text></View><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></TouchableOpacity>
    <Text style={[s.sl, { marginTop: spacing.lg }]}>COMING SOON</Text>
    <D i="cash-outline" t="Finance Overview" sb="Module 11-12" /><D i="hardware-chip-outline" t="AI Control Panel" sb="Module 9-10" /><D i="settings-outline" t="Platform Settings" sb="Module 16" />
    <View style={{ height: 40 }} /></ScreenContainer>); }
function D({ i, t, sb }: any) { return <View style={s.dis}><View style={[s.ci, { backgroundColor: "#F3F4F6" }]}><Ionicons name={i} size={19} color={colors.textMuted} /></View><View style={{ flex: 1 }}><Text style={s.dt}>{t}</Text><Text style={s.cs}>{sb}</Text></View></View>; }
const s = StyleSheet.create({
  ctr: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  top: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  av: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  nm: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }, rl: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  sl: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.md, paddingLeft: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder },
  ci: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  ct: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }, cs: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  dis: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder, opacity: 0.5 },
  dt: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  et: { color: colors.danger, fontSize: fontSize.md, marginTop: spacing.md, marginBottom: spacing.lg },
  bb: { backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1, borderColor: colors.cardBorder }, bt: { color: colors.text, fontWeight: fontWeight.medium },
});
