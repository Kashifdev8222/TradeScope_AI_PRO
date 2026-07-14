import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
    <ScreenContainer max={900} scroll>
      <Text style={s.pageTitle}>Profile & KYC</Text>

      {/* Profile Card */}
      <View style={s.card}>
        <View style={s.avatarRow}>
          <View style={s.avatar}>
            <Text style={s.avatarT}>{(user.full_name || "?")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user.full_name}</Text>
            <Text style={s.code}>{user.client_code}</Text>
            <View style={s.statusBadge}>
              <View style={[s.statusDot, { backgroundColor: user.status === "active" ? colors.success : colors.warning }]} />
              <Text style={[s.statusT, { color: user.status === "active" ? colors.success : colors.warning }]}>{user.status}</Text>
            </View>
          </View>
        </View>

        <View style={s.infoGrid}>
          <InfoBlock icon="mail-outline" label="Email" value={user.email} />
          <InfoBlock icon="call-outline" label="Phone" value={user.phone || "—"} />
          <InfoBlock icon="globe-outline" label="Country" value={user.country || "—"} />
          <InfoBlock icon="cash-outline" label="Currency" value={user.base_currency} />
          <InfoBlock icon="time-outline" label="Timezone" value={user.timezone} />
          <InfoBlock icon="document-text-outline" label="KYC Status" value={user.kyc_status} highlight />
          <InfoBlock icon="document-lock-outline" label="Terms" value={`v${user.terms_version || "1.0"}`} />
          <InfoBlock icon="warning-outline" label="Risk Disclosure" value={`v${user.risk_disclosure_version || "1.0"}`} />
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

        <Field label="Full Name" edit={edit} value={form.full_name} onChange={(v: string) => setForm({ ...form, full_name: v })} read={user.full_name} />
        <Field label="Phone" edit={edit} value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} read={user.phone || "—"} keyboardType="phone-pad" />
        <Field label="Country (2-letter)" edit={edit} value={form.country} onChange={(v: string) => setForm({ ...form, country: v })} read={user.country || "—"} maxLength={2} autoCapitalize="characters" last />

        {edit && (
          <View style={s.actionRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setEdit(false)}><Text style={s.cancelT}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.7 }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveT}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function InfoBlock({ icon, label, value, highlight }: any) {
  return (
    <View style={[is.ib, highlight && { backgroundColor: colors.accentBg, borderRadius: radius.md, padding: 10, margin: -4 }]}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={is.lb}>{label}</Text>
      <Text style={[is.vl, highlight && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{value}</Text>
    </View>
  );
}

function Field({ label, edit, value, onChange, read, last, ...rest }: any) {
  return (
    <View style={[fs.wrap, last && { borderBottomWidth: 0 }]}>
      <Text style={fs.lb}>{label}</Text>
      {edit ? (
        <TextInput style={fs.inp} value={value} onChangeText={onChange} {...rest} />
      ) : (
        <Text style={fs.vl}>{read}</Text>
      )}
    </View>
  );
}

const is = StyleSheet.create({
  ib: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  lb: { fontSize: fontSize.xs, color: colors.textMuted, width: 80 },
  vl: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium, flex: 1 },
});

const fs = StyleSheet.create({
  wrap: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lb: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  vl: { fontSize: fontSize.md, color: colors.text },
  inp: { backgroundColor: colors.input, borderRadius: radius.md, padding: 13, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder },
});

const s = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  avatarT: { fontSize: 22, fontWeight: fontWeight.bold, color: "#fff" },
  name: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  code: { fontSize: fontSize.sm, color: colors.accent, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusT: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "uppercase" },

  infoGrid: { gap: 4 },

  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },

  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accentBg, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  editBtnT: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  actionRow: { flexDirection: "row", gap: 12, marginTop: spacing.lg },
  cancelBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", borderWidth: 1, borderColor: colors.inputBorder },
  cancelT: { color: colors.textSecondary, fontWeight: fontWeight.medium },
  saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
  saveT: { color: "#fff", fontWeight: fontWeight.semibold },
});
