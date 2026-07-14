import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountApi, TradingAccount } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { try { setAccounts(await accountApi.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);

  return (
    <ScreenContainer max={900} scroll>
      <View style={s.head}>
        <Text style={s.title}>Trading Accounts</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push("/client/accounts/create")} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addBtnT}>New Account</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : accounts.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Ionicons name="wallet-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={s.emptyT}>No trading accounts yet</Text>
          <Text style={s.emptyS}>Create your first demo or live account to start trading</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push("/client/accounts/create")} activeOpacity={0.7}>
            <Text style={s.emptyBtnT}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {accounts.map((a) => (
            <TouchableOpacity key={a.id} style={s.card} onPress={() => {}} activeOpacity={0.7}>
              <View style={s.cardTop}>
                <View style={s.cardIcon}>
                  <Ionicons name="briefcase-outline" size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{a.account_name}</Text>
                  <Text style={s.cardNum}>{a.account_number}</Text>
                </View>
                <View style={[s.badge, a.status === "active" ? s.badgeOk : s.badgeOther]}>
                  <Text style={[s.badgeT, a.status === "active" ? { color: colors.success } : { color: colors.textMuted }]}>{a.status}</Text>
                </View>
              </View>
              <View style={s.cardInfo}>
                <Tag icon="globe-outline" label={a.environment} />
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

function Tag({ icon, label }: any) {
  return (
    <View style={s.tag}>
      <Ionicons name={icon} size={12} color={colors.textMuted} />
      <Text style={s.tagT}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 11 },
  addBtnT: { color: "#fff", fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.input, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  emptyT: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  emptyS: { fontSize: fontSize.sm, color: colors.textSecondary },
  emptyBtn: { marginTop: spacing.md, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 28, paddingVertical: 13 },
  emptyBtnT: { color: "#fff", fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardNum: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeOk: { backgroundColor: colors.successBg },
  badgeOther: { backgroundColor: colors.input },
  badgeT: { fontSize: 11, fontWeight: fontWeight.semibold },

  cardInfo: { flexDirection: "row", gap: 8, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.input, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  tagT: { fontSize: 11, color: colors.textSecondary, textTransform: "uppercase" },
});
