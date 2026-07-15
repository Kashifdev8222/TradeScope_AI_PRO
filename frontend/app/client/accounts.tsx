import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountApi, TradingAccount } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = async () => { setLoading(true); try { setAccounts(await accountApi.list()); } catch {} finally { setLoading(false); } };
  useFocusEffect(useCallback(() => { fetch(); }, []));

  return (
    <ScreenContainer max={1400} scroll>
      <View style={s.head}>
        <Text style={s.title}>Trading Accounts</Text>
        <TouchableOpacity style={s.add} onPress={() => router.push("/client/accounts/create")} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color="#fff" /><Text style={s.addT}>New Account</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : accounts.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><Ionicons name="wallet-outline" size={44} color={colors.textMuted} /></View>
          <Text style={s.emptyT}>No trading accounts yet</Text>
          <Text style={s.emptyS}>Create your first demo or live account to start trading</Text>
          <TouchableOpacity style={s.add} onPress={() => router.push("/client/accounts/create")} activeOpacity={0.7}>
            <Text style={s.addT}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.grid}>
          {accounts.map((a) => (
            <TouchableOpacity key={a.id} style={s.card} onPress={() => router.push(`/client/accounts/${a.id}`)} activeOpacity={0.7}>
              {/* Card top */}
              <View style={s.cardTop}>
                <View style={[s.cardIcon, { backgroundColor: a.environment === "demo" ? colors.accentBg : colors.warningBg }]}>
                  <Ionicons name="briefcase-outline" size={24} color={a.environment === "demo" ? colors.accent : colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{a.account_name}</Text>
                  <Text style={s.cardNum}>{a.account_number}</Text>
                </View>
                <View style={[s.badge, a.status === "active" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.input }]}>
                  <View style={[s.badgeDot, { backgroundColor: a.status === "active" ? colors.success : colors.textMuted }]} />
                  <Text style={[s.badgeT, { color: a.status === "active" ? colors.success : colors.textMuted }]}>{a.status}</Text>
                </View>
              </View>

              {/* Card info tags */}
              <View style={s.cardTags}>
                <Tag icon="globe-outline" label={a.environment === "demo" ? "Demo" : "Live"} color={a.environment === "demo" ? colors.accent : colors.warning} />
                <Tag icon="layers-outline" label={a.position_mode} />
                <Tag icon="resize-outline" label={`1:${a.leverage}`} />
                <Tag icon="logo-usd" label={a.base_currency} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function Tag({ icon, label, color }: any) {
  return (
    <View style={[s.tag, color && { borderColor: color }]}>
      <Ionicons name={icon} size={11} color={color || colors.textMuted} />
      <Text style={[s.tagT, color && { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text },
  add: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 11 },
  addT: { color: "#fff", fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.md },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.input, alignItems: "center", justifyContent: "center" },
  emptyT: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  emptyS: { fontSize: fontSize.sm, color: colors.textSecondary },

  grid: { gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: spacing.lg },
  cardIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardNum: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeT: { fontSize: 11, fontWeight: fontWeight.semibold, textTransform: "uppercase" },

  cardTags: { flexDirection: "row", gap: 8, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.input, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.inputBorder },
  tagT: { fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", fontWeight: fontWeight.medium },
});
