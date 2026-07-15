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
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>Profile & KYC</Text>

      {/* Top: Avatar + Account Info side by side */}
      <View style={s.topRow}>
        {/* Avatar card */}
        <View style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarT}>{user.full_name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
          <Text style={s.name}>{user.full_name}</Text>
          <Text style={s.code}>{user.client_code}</Text>
          <View style={[s.status, { backgroundColor: user.status === "active" ? colors.successBg : colors.warningBg }]}>
            <View style={[s.statusDot, { backgroundColor: user.status === "active" ? colors.success : colors.warning }]} />
            <Text style={[s.statusT, { color: user.status === "active" ? colors.success : colors.warning }]}>{user.status}</Text>
          </View>
        </View>

        {/* Info grid */}
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.cardTitle}>Account Information</Text>
          <View style={s.infoGrid}>
            <Info icon="mail-outline" label="Email" value={user.email} />
            <Info icon="call-outline" label="Phone" value={user.phone || "—"} />
            <Info icon="globe-outline" label="Country" value={user.country || "—"} />
            <Info icon="cash-outline" label="Base Currency" value={user.base_currency} />
            <Info icon="time-outline" label="Timezone" value={user.timezone} />
            <Info icon="document-text-outline" label="KYC Status" value={user.kyc_status} />
            <Info icon="document-lock-outline" label="Terms Version" value={`v${user.terms_version || "1.0"}`} />
            <Info icon="warning-outline" label="Risk Disclosure" value={`v${user.risk_disclosure_version || "1.0"}`} last />
          </View>
        </View>
      </View>

      {/* Editable Details */}
      <View style={s.card}>
        <View style={s.cardHead}>
          <Text style={s.cardTitle}>Personal Details</Text>
          {!edit && (
            <TouchableOpacity style={s.editBtn} onPress={() => setEdit(true)}>
              <Ionicons name="create-outline" size={15} color={colors.accent} />
              <Text style={s.editBtnT}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.fields}>
          <Field label="Full Name" edit={edit} value={form.full_name} onChange={(v: string) => setForm({ ...form, full_name: v })} read={user.full_name} />
          <Field label="Phone" edit={edit} value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} read={user.phone || "—"} keyboardType="phone-pad" />
          <Field label="Country (2-letter code)" edit={edit} value={form.country} onChange={(v: string) => setForm({ ...form, country: v })} read={user.country || "—"} maxLength={2} autoCapitalize="characters" last />
        </View>

        {edit && (
          <View style={s.actions}>
            <TouchableOpacity style={s.cancel} onPress={() => setEdit(false)}><Text style={s.cancelT}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[s.save, loading && { opacity: 0.7 }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveT}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function Info({ icon, label, value, last }: any) {
  return (
    <View style={[is.wrap, last && { borderBottomWidth: 0 }]}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={is.label}>{label}</Text>
      <Text style={is.value}>{value}</Text>
    </View>
  );
}
const is = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: fontSize.sm, color: colors.textSecondary, width: 130 },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium, flex: 1, textAlign: "right" },
});

function Field({ label, edit, value, onChange, read, last, ...rest }: any) {
  return (
    <View style={[fs.wrap, last && { borderBottomWidth: 0 }]}>
      <Text style={fs.label}>{label}</Text>
      {edit ? <TextInput style={fs.inp} value={value} onChangeText={onChange} {...rest} /> : <Text style={fs.val}>{read}</Text>}
    </View>
  );
}
const fs = StyleSheet.create({
  wrap: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  val: { fontSize: fontSize.md, color: colors.text },
  inp: { backgroundColor: colors.input, borderRadius: radius.md, padding: 13, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder },
});

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  topRow: { flexDirection: "row", gap: 20, marginBottom: spacing.lg },

  avatarCard: {
    width: 260, backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: "center", gap: spacing.sm,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  avatarT: { fontSize: 28, fontWeight: fontWeight.bold, color: "#fff" },
  name: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  code: { fontSize: fontSize.sm, color: colors.accent },
  status: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusT: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "uppercase" },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },

  infoGrid: { gap: 0 },

  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accentBg, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  editBtnT: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  fields: { marginBottom: spacing.md },
  actions: { flexDirection: "row", gap: 12, marginTop: spacing.md },
  cancel: { flex: 1, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", borderWidth: 1, borderColor: colors.inputBorder },
  cancelT: { color: colors.textSecondary, fontWeight: fontWeight.medium },
  save: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
  saveT: { color: "#fff", fontWeight: fontWeight.semibold },
});
