import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountApi } from "../../../src/shared/api";
import ScreenContainer from "../../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../../src/shared/theme";

const TYPES = [
  { key: "demo", label: "Demo", icon: "flask-outline", desc: "Simulated trading" },
  { key: "live", label: "Live", icon: "globe-outline", desc: "Real trading" },
];

export default function CreateAccountScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [env, setEnv] = useState("demo");
  const [mode, setMode] = useState("netting");
  const [leverage, setLeverage] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!name.trim()) { setError("Account name is required"); return; }
    setLoading(true);
    try {
      await accountApi.create({
        account_name: name.trim(),
        environment: env,
        position_mode: mode,
        leverage: parseInt(leverage) || 100,
      });
      router.back();
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <ScreenContainer max={800} scroll>
      <Text style={s.title}>Create Trading Account</Text>

      {error !== "" && <View style={s.err}><Ionicons name="alert-circle" size={15} color={colors.danger} /><Text style={s.errT}>{error}</Text></View>}

      <Text style={s.l}>Account Name</Text>
      <View style={s.iW}><View style={s.iB}><Ionicons name="create-outline" size={20} color={colors.accentLight} /></View><TextInput style={s.i} placeholder="e.g. Main Trading Account" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} /></View>

      <Text style={s.l}>Environment</Text>
      <View style={s.optRow}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t.key} style={[s.opt, env === t.key && s.optSel]} onPress={() => setEnv(t.key)}>
            <Ionicons name={t.icon as any} size={18} color={env === t.key ? colors.accent : colors.textMuted} />
            <Text style={[s.optL, env === t.key && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{t.label}</Text>
            <Text style={s.optS}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.l}>Position Mode</Text>
      <View style={s.optRow}>
        <TouchableOpacity style={[s.opt, mode === "netting" && s.optSel]} onPress={() => setMode("netting")}>
          <Ionicons name="layers-outline" size={18} color={mode === "netting" ? colors.accent : colors.textMuted} />
          <Text style={[s.optL, mode === "netting" && { color: colors.accent, fontWeight: fontWeight.semibold }]}>Netting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.opt, mode === "hedging" && s.optSel]} onPress={() => setMode("hedging")}>
          <Ionicons name="git-branch-outline" size={18} color={mode === "hedging" ? colors.accent : colors.textMuted} />
          <Text style={[s.optL, mode === "hedging" && { color: colors.accent, fontWeight: fontWeight.semibold }]}>Hedging</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.l}>Leverage (1:X)</Text>
      <View style={s.iW}><View style={s.iB}><Ionicons name="resize-outline" size={20} color={colors.accentLight} /></View><TextInput style={s.i} placeholder="100" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={leverage} onChangeText={setLeverage} /></View>

      <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handle} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Create Account</Text>}
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  err: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },
  errT: { color: colors.danger, fontSize: fontSize.sm, flex: 1 },

  l: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 8, marginTop: spacing.lg },
  iW: { flexDirection: "row", alignItems: "center", backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inputBorder },
  iB: { width: 46, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.inputBorder, paddingVertical: 15 },
  i: { flex: 1, paddingVertical: 15, paddingHorizontal: 14, fontSize: fontSize.md, color: colors.text },

  optRow: { flexDirection: "row", gap: 10 },
  opt: { flex: 1, backgroundColor: colors.input, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: colors.inputBorder },
  optSel: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  optL: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  optS: { fontSize: fontSize.xs, color: colors.textMuted },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.xl },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
