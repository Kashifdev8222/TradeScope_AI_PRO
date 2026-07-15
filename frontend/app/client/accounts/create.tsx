import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountApi } from "../../../src/shared/api";
import ScreenContainer from "../../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../../src/shared/theme";

const ENVS = [
  { key: "demo", label: "Demo", icon: "flask-outline", desc: "Simulated trading with virtual funds" },
  { key: "live", label: "Live", icon: "globe-outline", desc: "Real trading with actual funds" },
];
const MODES = [
  { key: "netting", label: "Netting", icon: "layers-outline", desc: "Single position per symbol" },
  { key: "hedging", label: "Hedging", icon: "git-branch-outline", desc: "Multiple positions per symbol" },
];

export default function CreateAccountScreen() {
  const router = useRouter(); const { width } = useWindowDimensions();
  const [name, setName] = useState(""); const [env, setEnv] = useState("demo");
  const [mode, setMode] = useState("netting"); const [leverage, setLeverage] = useState("100");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  const handle = async () => {
    setError(""); if (!name.trim()) { setError("Account name is required"); return; }
    setLoading(true);
    try { await accountApi.create({ account_name: name.trim(), environment: env, position_mode: mode, leverage: parseInt(leverage) || 100 }); router.back(); }
    catch (e: any) { setError(e.message || "Failed"); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer max={800} scroll>
      <Text style={s.title}>Create Trading Account</Text>

      {error !== "" && <View style={s.err}><Ionicons name="alert-circle" size={15} color={colors.danger} /><Text style={s.errT}>{error}</Text></View>}

      <View style={s.card}>
        <View style={s.fg}>
          <Text style={s.label}>Account Name</Text>
          <View style={s.inpW}><View style={s.inpI}><Ionicons name="create-outline" size={20} color={colors.accentLight} /></View><TextInput style={s.inp} placeholder="e.g. Main Trading Account" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} /></View>
        </View>

        <View style={s.fg}>
          <Text style={s.label}>Environment</Text>
          <View style={s.optRow}>
            {ENVS.map((e) => (
              <TouchableOpacity key={e.key} style={[s.opt, env === e.key && s.optSel]} onPress={() => setEnv(e.key)} activeOpacity={0.7}>
                <Ionicons name={e.icon as any} size={22} color={env === e.key ? colors.accent : colors.textMuted} />
                <Text style={[s.optL, env === e.key && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{e.label}</Text>
                <Text style={s.optS}>{e.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.fg}>
          <Text style={s.label}>Position Mode</Text>
          <View style={s.optRow}>
            {MODES.map((m) => (
              <TouchableOpacity key={m.key} style={[s.opt, mode === m.key && s.optSel]} onPress={() => setMode(m.key)} activeOpacity={0.7}>
                <Ionicons name={m.icon as any} size={22} color={mode === m.key ? colors.accent : colors.textMuted} />
                <Text style={[s.optL, mode === m.key && { color: colors.accent, fontWeight: fontWeight.semibold }]}>{m.label}</Text>
                <Text style={s.optS}>{m.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.fg}>
          <Text style={s.label}>Leverage (1:X)</Text>
          <View style={s.inpW}><View style={s.inpI}><Ionicons name="resize-outline" size={20} color={colors.accentLight} /></View><TextInput style={s.inp} placeholder="100" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={leverage} onChangeText={setLeverage} /></View>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handle} disabled={loading} activeOpacity={0.7}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Create Account</Text>}
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  err: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },
  errT: { color: colors.danger, fontSize: fontSize.sm, flex: 1 },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder },

  fg: { marginBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 8 },
  inpW: { flexDirection: "row", alignItems: "center", backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inputBorder },
  inpI: { width: 46, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.inputBorder, paddingVertical: 15 },
  inp: { flex: 1, paddingVertical: 15, paddingHorizontal: 14, fontSize: fontSize.md, color: colors.text },

  optRow: { flexDirection: "row", gap: 12 },
  opt: { flex: 1, backgroundColor: colors.input, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: colors.inputBorder },
  optSel: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  optL: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  optS: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center" },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.sm },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
