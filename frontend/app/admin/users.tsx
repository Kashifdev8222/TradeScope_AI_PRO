import { useEffect, useState } from "react"; import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router"; import { Ionicons } from "@expo/vector-icons"; import { adminApi, AdminUser } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer"; import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";
const SM: Record<string, { bg: string; fg: string }> = { active: { bg: colors.successBg, fg: colors.success }, pending_verification: { bg: colors.warningBg, fg: colors.warning }, restricted: { bg: "#FFF7ED", fg: "#C2410C" }, suspended: { bg: colors.dangerBg, fg: colors.danger }, closed: { bg: "#F3F4F6", fg: colors.textMuted } };
export default function UserDirectory() {
  const router = useRouter(); const [users, setUsers] = useState<AdminUser[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState(""); const [total, setTotal] = useState(0); const [filter, setFilter] = useState<string | null>(null);
  const fetch = async (p = 1, s: string | null = null, q = "") => { setLoading(true); try { const params: any = { page: p, page_size: 20 }; if (s) params.status = s; if (q) params.search = q; const r = await adminApi.listUsers(params); setUsers(r.users); setTotal(r.total); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetch(1, filter, search); }, [filter]);
  return (<ScreenContainer max={800}>
    <View style={s.sb}><Ionicons name="search" size={16} color={colors.textMuted} /><TextInput style={s.si} placeholder="Search users..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={() => fetch(1, filter, search)} returnKeyType="search" /></View>
    <FlatList horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.md }} data={[null, "active", "suspended", "restricted"]} keyExtractor={(f) => f ?? "all"} renderItem={({ item }) => (<TouchableOpacity style={[s.p, filter === item && s.pA]} onPress={() => setFilter(item)}><Text style={[s.pt, filter === item && s.ptA]}>{item ?? "All users"}</Text></TouchableOpacity>)} />
    <Text style={s.cnt}>{total} users</Text>
    {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : <FlatList data={users} keyExtractor={(u) => u.id} renderItem={({ item }) => { const st = SM[item.status] || SM.closed; return (<TouchableOpacity style={s.card} onPress={() => router.push(`/admin/users/${item.id}`)}><View style={s.av}><Ionicons name="person" size={16} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={s.un}>{item.full_name}</Text><Text style={s.uc}>{item.client_code}</Text></View><View style={{ alignItems: "flex-end" }}><View style={[s.sbadge, { backgroundColor: st.bg }]}><Text style={[s.st, { color: st.fg }]}>{item.status}</Text></View><Text style={s.kyc}>KYC: {item.kyc_status || "—"}</Text></View></TouchableOpacity>); }} ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No users found.</Text>} />}
  </ScreenContainer>); }
const s = StyleSheet.create({
  sb: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: spacing.md },
  si: { flex: 1, paddingVertical: 13, fontSize: fontSize.sm, color: colors.text },
  p: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.cardBorder },
  pA: { backgroundColor: colors.accent, borderColor: colors.accent }, pt: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, textTransform: "capitalize" }, ptA: { color: "#fff" },
  cnt: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  un: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }, uc: { fontSize: fontSize.xs, color: colors.accent, marginTop: 1 },
  sbadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, marginBottom: 3 }, st: { fontSize: 11, fontWeight: fontWeight.semibold }, kyc: { fontSize: 10, color: colors.textMuted },
});
