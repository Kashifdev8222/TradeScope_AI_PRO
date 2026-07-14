import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import { authApi } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user); const setUser = useAuthStore((s) => s.setUser);
  const [edit, setEdit] = useState(false); const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", country: "" });
  useEffect(() => { if (user) setForm({ full_name: user.full_name, phone: user.phone ?? "", country: user.country ?? "" }); }, [user]);
  const save = async () => { setLoading(true); try { const u = await authApi.updateProfile(form); setUser(u as any); setEdit(false); } catch (e: any) { alert(e.message); } finally { setLoading(false); } };
  if (!user) return null;
  return (
    <ScreenContainer max={650} scroll>
      <View style={s.top}><View style={s.av}><Ionicons name="person" size={32} color={colors.accent} /></View><Text style={s.nm}>{user.full_name}</Text><Text style={s.cd}>{user.client_code}</Text></View>
      <View style={s.sc}><Text style={s.st}>Account</Text><R i="mail-outline" l="Email" v={user.email} /><R i="shield-checkmark-outline" l="Status" v={user.status} c={colors.success} /><R i="document-text-outline" l="KYC" v={user.kyc_status} /><R i="cash-outline" l="Currency" v={user.base_currency} /><R i="time-outline" l="Timezone" v={user.timezone} last /></View>
      <View style={s.sc}><Text style={s.st}>Personal Details</Text><F l="Full Name" e={edit} val={form.full_name} onChange={(v: string) => setForm({ ...form, full_name: v })} r={user.full_name} /><F l="Phone" e={edit} val={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} r={user.phone || "—"} kt="phone-pad" /><F l="Country" e={edit} val={form.country} onChange={(v: string) => setForm({ ...form, country: v })} r={user.country || "—"} max={2} ac />{edit ? <View style={s.br}><TouchableOpacity style={s.cb} onPress={() => setEdit(false)}><Text style={s.ct}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[s.sb, loading && { opacity: 0.7 }]} onPress={save} disabled={loading}>{loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.st2}>Save</Text>}</TouchableOpacity></View> : <TouchableOpacity style={s.eb} onPress={() => setEdit(true)}><Ionicons name="create-outline" size={14} color={colors.accent} /><Text style={s.et}>Edit Details</Text></TouchableOpacity>}</View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}
function R({ i, l, v, c, last }: any) { return <View style={[s.r, !last && s.rb]}><Ionicons name={i} size={15} color={colors.textMuted} /><Text style={s.rl}>{l}</Text>{c ? <View style={[s.bd, { backgroundColor: c + "18" }]}><View style={[s.bdd, { backgroundColor: c }]} /><Text style={[s.rv2, { color: c }]}>{v}</Text></View> : <Text style={[s.rv, { flex: 1, textAlign: "right" }]}>{v}</Text>}</View>; }
function F({ l, e, val, onChange, r, kt, max, ac }: any) { return <><Text style={s.fl}>{l}</Text>{e ? <TextInput style={s.inp} value={val} onChangeText={onChange} keyboardType={kt} maxLength={max} autoCapitalize={ac ? "characters" : "none"} /> : <Text style={s.fv}>{r}</Text>}</>; }
const s = StyleSheet.create({
  top: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  av: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  nm: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }, cd: { fontSize: fontSize.sm, color: colors.accent, marginTop: spacing.xs },
  sc: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  st: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  r: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }, rb: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rl: { fontSize: fontSize.sm, color: colors.textSecondary }, rv: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium }, rv2: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  bd: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full }, bdd: { width: 6, height: 6, borderRadius: 3 },
  fl: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md }, fv: { fontSize: fontSize.md, color: colors.text },
  inp: { backgroundColor: colors.input, borderRadius: radius.md, padding: 12, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginTop: 4 },
  br: { flexDirection: "row", gap: 10, marginTop: spacing.lg },
  eb: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.lg, backgroundColor: colors.accentBg, borderRadius: radius.md, padding: 12 },
  et: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  cb: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border }, ct: { color: colors.textSecondary, fontWeight: fontWeight.medium },
  sb: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, padding: 12, alignItems: "center" }, st2: { color: "#fff", fontWeight: fontWeight.semibold },
});
