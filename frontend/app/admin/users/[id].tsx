import { useEffect, useState } from "react"; import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUserDetail } from "../../../src/shared/api"; import ScreenContainer from "../../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../../src/shared/theme";
const SC: Record<string, string> = { active: colors.success, restricted: colors.warning, suspended: colors.danger, closed: colors.textMuted };
const ACTS = [{ k: "activate", l: "Activate", fn: adminApi.activateUser, c: colors.success, ic: "checkmark-circle-outline" },{ k: "suspend", l: "Suspend", fn: adminApi.suspendUser, c: colors.warning, ic: "pause-circle-outline" },{ k: "restrict", l: "Restrict", fn: adminApi.restrictUser, c: "#C2410C", ic: "hand-left-outline" }];
export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [d, setD] = useState<AdminUserDetail | null>(null); const [loading, setLoading] = useState(true);
  const [al, setAl] = useState(""); const [reason, setReason] = useState(""); const [sa, setSa] = useState("");
  const fetch = async () => { if (!id) return; try { setD(await adminApi.getUserDetail(id)); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, [id]);
  const doit = async (key: string, fn: any) => { if (!reason.trim()) { Alert.alert("Required", "Provide a reason."); return; } setAl(key); try { await fn(id!, reason.trim()); setReason(""); setSa(""); fetch(); } catch (e: any) { Alert.alert("Error", e.message); } finally { setAl(""); } };
  if (loading) return <ScreenContainer max={600}><View style={s.ctr}><ActivityIndicator color={colors.accent} size="large" /></View></ScreenContainer>;
  if (!d) return <ScreenContainer max={600}><View style={s.ctr}><Text style={{ color: colors.danger }}>Not found</Text></View></ScreenContainer>;
  const p = d.profile; const sc = SC[p.status] || colors.textMuted;
  return (<ScreenContainer max={650} scroll>
    <View style={s.top}><View style={s.av}><Ionicons name="person" size={30} color={colors.accent} /></View><Text style={s.nm}>{p.full_name}</Text><Text style={s.cd}>{p.client_code}</Text><View style={s.sr}><View style={[s.sb, { borderColor: sc }]}><View style={[s.sd, { backgroundColor: sc }]} /><Text style={[s.st, { color: sc }]}>{p.status}</Text></View><Text style={s.kyc}>KYC: {p.kyc_status || "not_submitted"}</Text></View></View>
    <View style={s.sc}><Text style={s.stt}>Details</Text><IR i="mail-outline" l="Email" v={p.email || "—"} /><IR i="call-outline" l="Phone" v={p.phone || "—"} /><IR i="globe-outline" l="Country" v={p.country || "—"} /><IR i="cash-outline" l="Currency" v={p.base_currency} /><IR i="calendar-outline" l="Joined" v={p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"} last /></View>
    <View style={s.sc}><Text style={s.stt}>Roles</Text>{d.roles.length === 0 ? <Text style={s.emp}>Client only</Text> : d.roles.map(r => <View key={r.role_id} style={s.rp}><Ionicons name="shield-checkmark" size={12} color={colors.accent} /><Text style={s.rt}>{r.name}</Text></View>)}</View>
    <View style={s.sc}><Text style={s.stt}>Accounts ({d.trading_accounts?.length || 0})</Text>{d.trading_accounts?.length === 0 ? <Text style={s.emp}>None</Text> : d.trading_accounts?.map((a: any) => <View key={a.id} style={s.ac}><View style={{ flex: 1 }}><Text style={s.an}>{a.account_name}</Text><Text style={s.anu}>{a.account_number}</Text></View><View style={{ alignItems: "flex-end" }}><Text style={{ color: colors.success, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{a.status}</Text><Text style={{ color: colors.textMuted, fontSize: 10 }}>{a.environment}</Text></View></View>)}</View>
    <View style={s.sc}><Text style={s.stt}>Actions</Text>{sa ? (<View style={{ gap: 12 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Ionicons name="warning-outline" size={17} color={colors.warning} /><Text style={{ color: colors.text, fontSize: fontSize.sm, flex: 1 }}>You are about to <Text style={{ fontWeight: fontWeight.bold }}>{sa}</Text> this user.</Text></View><TextInput style={s.ri} placeholder="Reason (required)..." placeholderTextColor={colors.textMuted} value={reason} onChangeText={setReason} multiline /><View style={{ flexDirection: "row", gap: 10 }}><TouchableOpacity style={s.cb} onPress={() => { setSa(""); setReason(""); }}><Text style={s.ct}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[s.cfb, { backgroundColor: sc }]} onPress={() => { const a = ACTS.find(x => x.k === sa); if (a) doit(a.k, a.fn); }} disabled={al !== ""}>{al ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.cft}>Confirm {sa}</Text>}</TouchableOpacity></View></View>) : (<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{ACTS.map(a => <TouchableOpacity key={a.k} style={[s.ab, { borderColor: a.c }]} onPress={() => setSa(a.k)}><Ionicons name={a.ic as any} size={14} color={a.c} /><Text style={[s.at, { color: a.c }]}>{a.l}</Text></TouchableOpacity>)}</View>)}</View>
    <View style={{ height: 60 }} /></ScreenContainer>); }
function IR({ i, l, v, last }: any) { return <View style={[s.ir, !last && s.irB]}><Ionicons name={i} size={15} color={colors.textMuted} /><Text style={s.irL}>{l}</Text><Text style={s.irV}>{v}</Text></View>; }
const s = StyleSheet.create({
  ctr: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  top: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  av: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  nm: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }, cd: { fontSize: fontSize.sm, color: colors.accent, marginTop: spacing.xs },
  sr: { flexDirection: "row", gap: 12, marginTop: spacing.md, alignItems: "center" },
  sb: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1.5 },
  sd: { width: 6, height: 6, borderRadius: 3 }, st: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold }, kyc: { fontSize: fontSize.xs, color: colors.textMuted },
  sc: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  stt: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  ir: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }, irB: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  irL: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary }, irV: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  rp: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.accentBg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full, alignSelf: "flex-start", marginBottom: 4 },
  rt: { color: colors.accent, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  ac: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  an: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }, anu: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 }, emp: { color: colors.textMuted, fontSize: fontSize.sm },
  ab: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 16 }, at: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  ri: { backgroundColor: colors.input, borderRadius: radius.md, padding: 12, fontSize: fontSize.sm, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, minHeight: 55, textAlignVertical: "top" },
  cb: { flex: 1, borderRadius: radius.md, padding: 13, alignItems: "center", borderWidth: 1, borderColor: colors.border }, ct: { color: colors.textSecondary, fontWeight: fontWeight.medium },
  cfb: { flex: 1, borderRadius: radius.md, padding: 13, alignItems: "center" }, cft: { color: "#fff", fontWeight: fontWeight.semibold },
});
