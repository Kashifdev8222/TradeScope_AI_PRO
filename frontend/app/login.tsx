import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../src/shared/api";
import { useAuthStore } from "../src/shared/stores/authStore";
import SplitAuthLayout from "../src/shared/components/SplitAuthLayout";
import { colors, spacing, radius, fontSize, fontWeight } from "../src/shared/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const r = await authApi.login(email.trim(), password);
      if (r.tokens.access_token) { setAuth(r.user, r.tokens); router.replace("/client"); }
      else setErrors({ form: "Please verify your email first." });
    } catch (err: any) { setErrors({ form: err.message || "Invalid credentials." }); }
    finally { setLoading(false); }
  };

  return (
    <SplitAuthLayout title="Welcome back" subtitle="Sign in to your account" icon="log-in-outline">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
        {/* Form error */}
        {errors.form && (
          <View style={s.alert}><Ionicons name="alert-circle" size={16} color={colors.danger} /><Text style={s.alertT}>{errors.form}</Text></View>
        )}

        {/* Email */}
        <View style={s.fg}>
          <Text style={s.l}>Email address</Text>
          <View style={[s.iW, errors.email && { borderColor: colors.danger }]}>
            <View style={s.iB}><Ionicons name="mail-outline" size={20} color={errors.email ? colors.danger : colors.accentLight} /></View>
            <TextInput style={s.i} placeholder="you@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={(t) => { setEmail(t); setErrors({}); }} />
          </View>
          {errors.email && <Text style={s.err}>{errors.email}</Text>}
        </View>

        {/* Password */}
        <View style={s.fg}>
          <Text style={s.l}>Password</Text>
          <View style={[s.iW, errors.password && { borderColor: colors.danger }]}>
            <View style={s.iB}><Ionicons name="lock-closed-outline" size={20} color={errors.password ? colors.danger : colors.accentLight} /></View>
            <TextInput style={s.i} placeholder="Enter your password" placeholderTextColor={colors.textMuted} secureTextEntry={!showPw} value={password} onChangeText={(t) => { setPassword(t); setErrors({}); }} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={s.eye}><Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          {errors.password && <Text style={s.err}>{errors.password}</Text>}
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handle} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Sign In</Text>}
        </TouchableOpacity>

        <View style={s.footer}>
          <Link href="/register" style={s.link}>Create an account</Link>
          <Link href="/forgot-password" style={[s.link, { color: colors.textMuted }]}>Forgot password?</Link>
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
  eye: { padding: 12 },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.sm },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  link: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accent },
});
