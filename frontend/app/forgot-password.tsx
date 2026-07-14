import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Link } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../src/shared/api"; import SplitAuthLayout from "../src/shared/components/SplitAuthLayout";
import { colors, spacing, radius, fontSize, fontWeight } from "../src/shared/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState(""); const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!EMAIL_RE.test(email.trim())) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try { await authApi.forgotPassword(email.trim()); setSent(true); }
    catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  const content = sent ? (
    <View style={{ alignItems: "center", gap: 20, paddingVertical: spacing.lg }}>
      <View style={s.okIcon}><Ionicons name="checkmark" size={28} color={colors.success} /></View>
      <Text style={{ color: colors.text, fontSize: fontSize.md, textAlign: "center", lineHeight: 24 }}>
        If <Text style={{ fontWeight: fontWeight.bold }}>{email}</Text> is registered, a reset link has been sent.
      </Text>
      <Link href="/login" style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accent }}>← Back to sign in</Link>
    </View>
  ) : (
    <>
      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg }}>
        Enter your email and we'll send you a password reset link.
      </Text>

      {error !== "" && (
        <View style={s.alert}><Ionicons name="alert-circle" size={16} color={colors.danger} /><Text style={s.alertT}>{error}</Text></View>
      )}

      <View style={s.fg}>
        <Text style={s.l}>Email address</Text>
        <View style={[s.iW, error !== "" && { borderColor: colors.danger }]}>
          <View style={s.iB}><Ionicons name="mail-outline" size={20} color={error ? colors.danger : colors.accentLight} /></View>
          <TextInput style={s.i} placeholder="you@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>
        {error !== "" && <Text style={s.err}>{error}</Text>}
      </View>

      <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handle} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Send Reset Link</Text>}
      </TouchableOpacity>
      <View style={{ alignItems: "center", marginTop: spacing.lg }}>
        <Link href="/login" style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accent }}>← Back to sign in</Link>
      </View>
    </>
  );
  return <SplitAuthLayout title="Reset password" subtitle="We'll send you a reset link" icon="key-outline">{content}</SplitAuthLayout>;
}

const s = StyleSheet.create({
  okIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successBg, alignItems: "center", justifyContent: "center" },
  alert: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },
  alertT: { color: colors.danger, fontSize: fontSize.sm, flex: 1 },

  fg: { marginBottom: spacing.lg },
  l: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 8 },
  iW: { flexDirection: "row", alignItems: "center", backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inputBorder },
  iB: { width: 46, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.inputBorder, paddingVertical: 15 },
  i: { flex: 1, paddingVertical: 15, paddingHorizontal: 14, fontSize: fontSize.md, color: colors.text },
  err: { color: colors.danger, fontSize: fontSize.xs, marginTop: 6, marginLeft: 4 },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.sm },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
