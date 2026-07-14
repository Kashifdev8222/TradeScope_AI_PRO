import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../src/shared/api"; import { useAuthStore } from "../src/shared/stores/authStore";
import SplitAuthLayout from "../src/shared/components/SplitAuthLayout";
import { colors, spacing, radius, fontSize, fontWeight } from "../src/shared/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALL = [
  { name: "Afghanistan", code: "AF", dial: "+93" },{ name: "Albania", code: "AL", dial: "+355" },{ name: "Algeria", code: "DZ", dial: "+213" },
  { name: "Argentina", code: "AR", dial: "+54" },{ name: "Australia", code: "AU", dial: "+61" },{ name: "Austria", code: "AT", dial: "+43" },
  { name: "Bahrain", code: "BH", dial: "+973" },{ name: "Bangladesh", code: "BD", dial: "+880" },{ name: "Belgium", code: "BE", dial: "+32" },
  { name: "Brazil", code: "BR", dial: "+55" },{ name: "Canada", code: "CA", dial: "+1" },{ name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },{ name: "Colombia", code: "CO", dial: "+57" },{ name: "Denmark", code: "DK", dial: "+45" },
  { name: "Egypt", code: "EG", dial: "+20" },{ name: "Finland", code: "FI", dial: "+358" },{ name: "France", code: "FR", dial: "+33" },
  { name: "Germany", code: "DE", dial: "+49" },{ name: "Ghana", code: "GH", dial: "+233" },{ name: "Greece", code: "GR", dial: "+30" },
  { name: "Hong Kong", code: "HK", dial: "+852" },{ name: "Hungary", code: "HU", dial: "+36" },{ name: "India", code: "IN", dial: "+91" },
  { name: "Indonesia", code: "ID", dial: "+62" },{ name: "Iran", code: "IR", dial: "+98" },{ name: "Iraq", code: "IQ", dial: "+964" },
  { name: "Ireland", code: "IE", dial: "+353" },{ name: "Israel", code: "IL", dial: "+972" },{ name: "Italy", code: "IT", dial: "+39" },
  { name: "Japan", code: "JP", dial: "+81" },{ name: "Jordan", code: "JO", dial: "+962" },{ name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kuwait", code: "KW", dial: "+965" },{ name: "Lebanon", code: "LB", dial: "+961" },{ name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Mexico", code: "MX", dial: "+52" },{ name: "Morocco", code: "MA", dial: "+212" },{ name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },{ name: "New Zealand", code: "NZ", dial: "+64" },{ name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norway", code: "NO", dial: "+47" },{ name: "Oman", code: "OM", dial: "+968" },{ name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Peru", code: "PE", dial: "+51" },{ name: "Philippines", code: "PH", dial: "+63" },{ name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },{ name: "Qatar", code: "QA", dial: "+974" },{ name: "Romania", code: "RO", dial: "+40" },
  { name: "Russia", code: "RU", dial: "+7" },{ name: "Saudi Arabia", code: "SA", dial: "+966" },{ name: "Singapore", code: "SG", dial: "+65" },
  { name: "South Africa", code: "ZA", dial: "+27" },{ name: "South Korea", code: "KR", dial: "+82" },{ name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },{ name: "Sweden", code: "SE", dial: "+46" },{ name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Taiwan", code: "TW", dial: "+886" },{ name: "Thailand", code: "TH", dial: "+66" },{ name: "Turkey", code: "TR", dial: "+90" },
  { name: "UAE", code: "AE", dial: "+971" },{ name: "Ukraine", code: "UA", dial: "+380" },{ name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },{ name: "Vietnam", code: "VN", dial: "+84" },{ name: "Zimbabwe", code: "ZW", dial: "+263" },
];

const PLH: Record<string, string> = {
  US: "(555) 123-4567", GB: "7911 123456", IN: "98765 43210", PK: "300 1234567",
  AE: "50 123 4567", SA: "55 123 4567", CN: "139 1234 5678", JP: "090-1234-5678",
  DE: "151 12345678", FR: "06 12 34 56 78", AU: "411 123 456", CA: "(555) 123-4567",
  KR: "010-1234-5678", BR: "(11) 91234-5678", MX: "55 1234 5678", IT: "312 345 6789",
  ES: "612 34 56 78", NL: "06 12345678", SE: "070-123 45 67", CH: "079 123 45 67",
  TR: "530 123 4567", ZA: "071 123 4567", NG: "0803 123 4567", EG: "010 1234 5678",
  RU: "912 345-67-89", SG: "8123 4567", MY: "012-345 6789", ID: "0812-3456-7890",
  BD: "01712-345678", IR: "0912 345 6789", IQ: "0790 123 4567",
};

export default function RegisterScreen() {
  const router = useRouter(); const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); const [country, setCountry] = useState(ALL[0]);
  const [cpOpen, setCpOpen] = useState(false); const [cpSearch, setCpSearch] = useState("");
  const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false); const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = cpSearch.trim() === "" ? ALL : ALL.filter(c =>
    c.name.toLowerCase().includes(cpSearch.toLowerCase()) || c.dial.includes(cpSearch) || c.code.toLowerCase().includes(cpSearch.toLowerCase())
  );
  const ph = PLH[country.code] || `e.g. ${country.dial} XXXXXXX`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    else if (fullName.trim().length < 2) e.fullName = "Name is too short";
    if (!email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => { setFullName(""); setEmail(""); setPhone(""); setPassword(""); setErrors({}); };
  const handle = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const r = await authApi.register({ email: email.trim(), password, full_name: fullName.trim(), phone: phone.trim() ? `${country.dial}${phone.trim()}` : undefined, country: country.code, accept_terms: true, accept_risk_disclosure: true });
      if (r.tokens.access_token) { setAuth(r.user, r.tokens); reset(); router.replace("/client"); }
      else { setErrors({ form: "Account created! You can now sign in." }); reset(); }
    } catch (err: any) { setErrors({ form: err.message || "Registration failed." }); } finally { setLoading(false); }
  };

  return (
    <SplitAuthLayout title="Create your account" subtitle="Start trading with AI-powered insights" icon="rocket-outline">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
        {errors.form && (
          <View style={[s.alert, errors.form.includes("created") ? { backgroundColor: colors.successBg } : {}]}>
            <Ionicons name={errors.form.includes("created") ? "checkmark-circle" : "alert-circle"} size={16} color={errors.form.includes("created") ? colors.success : colors.danger} />
            <Text style={[s.alertT, errors.form.includes("created") ? { color: colors.success } : {}]}>{errors.form}</Text>
          </View>
        )}

        <View style={s.fg}>
          <Text style={s.l}>Full name *</Text>
          <View style={[s.iW, errors.fullName && { borderColor: colors.danger }]}>
            <View style={s.iB}><Ionicons name="person-outline" size={20} color={errors.fullName ? colors.danger : colors.accentLight} /></View>
            <TextInput style={s.i} placeholder="John Doe" placeholderTextColor={colors.textMuted} value={fullName} onChangeText={(t) => { setFullName(t); setErrors({}); }} />
          </View>
          {errors.fullName && <Text style={s.err}>{errors.fullName}</Text>}
        </View>

        <View style={s.fg}>
          <Text style={s.l}>Email address *</Text>
          <View style={[s.iW, errors.email && { borderColor: colors.danger }]}>
            <View style={s.iB}><Ionicons name="mail-outline" size={20} color={errors.email ? colors.danger : colors.accentLight} /></View>
            <TextInput style={s.i} placeholder="you@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={(t) => { setEmail(t); setErrors({}); }} />
          </View>
          {errors.email && <Text style={s.err}>{errors.email}</Text>}
        </View>

        <View style={[s.fg, { position: "relative", zIndex: 100 }]}>
          <Text style={s.l}>Phone number</Text>
          <View style={s.phoneRow}>
            <TouchableOpacity style={s.phoneCode} onPress={() => { setCpOpen(!cpOpen); setCpSearch(""); }}>
              <Text style={{ fontSize: fontSize.md, color: colors.text, fontWeight: "500" }}>{country.dial}</Text>
              <Ionicons name={cpOpen ? "chevron-up" : "chevron-down"} size={12} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={s.phoneDivider} />
            <TextInput key={country.code} style={s.phoneInput} placeholder={ph} placeholderTextColor={colors.textMuted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>
          {cpOpen && (
            <View style={s.cpDrop}>
              <View style={s.cpDropHead}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}>Select country code</Text>
                <TouchableOpacity onPress={() => setCpOpen(false)}><Ionicons name="close" size={18} color={colors.textMuted} /></TouchableOpacity>
              </View>
              <View style={s.cpSb}><Ionicons name="search" size={15} color={colors.textMuted} /><TextInput style={s.cpSi} placeholder="Search country..." placeholderTextColor={colors.textMuted} value={cpSearch} onChangeText={setCpSearch} autoFocus />{cpSearch !== "" && <TouchableOpacity onPress={() => setCpSearch("")}><Ionicons name="close-circle" size={16} color={colors.textMuted} /></TouchableOpacity>}</View>
              <FlatList style={{ maxHeight: 200 }} data={filtered} keyExtractor={c => c.code} keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={[s.cpItem, country.code === item.code && s.cpItemSel]} onPress={() => { setCountry(item); setCpOpen(false); }}>
                    <Text style={s.cpItemName}>{item.name}</Text><Text style={s.cpItemDial}>{item.dial}</Text>
                    {country.code === item.code && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                  </TouchableOpacity>
                )} />
            </View>
          )}
        </View>

        <View style={s.fg}>
          <Text style={s.l}>Password * (min 8 chars)</Text>
          <View style={[s.iW, errors.password && { borderColor: colors.danger }]}>
            <View style={s.iB}><Ionicons name="lock-closed-outline" size={20} color={errors.password ? colors.danger : colors.accentLight} /></View>
            <TextInput style={s.i} placeholder="Minimum 8 characters" placeholderTextColor={colors.textMuted} secureTextEntry={!showPw} value={password} onChangeText={(t) => { setPassword(t); setErrors({}); }} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 12 }}><Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          {errors.password && <Text style={s.err}>{errors.password}</Text>}
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handle} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Create Account</Text>}
        </TouchableOpacity>
        <View style={{ alignItems: "center", marginTop: spacing.lg }}>
          <Link href="/login" style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accent }}>Already have an account? Sign in</Link>
        </View>
      </KeyboardAvoidingView>
    </SplitAuthLayout>
  );
}

const s = StyleSheet.create({
  alert: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },
  alertT: { color: colors.danger, fontSize: fontSize.sm, flex: 1 },

  fg: { marginBottom: spacing.lg },
  l: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 8 },
  iW: { flexDirection: "row", alignItems: "center", backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inputBorder },
  iB: { width: 46, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.inputBorder, paddingVertical: 15 },
  i: { flex: 1, paddingVertical: 15, paddingHorizontal: 14, fontSize: fontSize.md, color: colors.text },
  err: { color: colors.danger, fontSize: fontSize.xs, marginTop: 6, marginLeft: 4 },

  phoneRow: { flexDirection: "row", alignItems: "stretch", backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inputBorder, overflow: "hidden" },
  phoneCode: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 15 },
  phoneDivider: { width: 1, backgroundColor: colors.inputBorder },
  phoneInput: { flex: 1, paddingVertical: 15, paddingHorizontal: 14, fontSize: fontSize.md, color: colors.text },

  cpDrop: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, zIndex: 200, elevation: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16 },
  cpDropHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 },
  cpSb: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.input, borderRadius: radius.md, marginHorizontal: 12, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.inputBorder },
  cpSi: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  cpItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
  cpItemSel: { backgroundColor: colors.accentBg },
  cpItemName: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  cpItemDial: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "500" },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.sm },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
