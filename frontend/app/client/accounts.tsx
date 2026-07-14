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

  const fetch = async () => {
    try { setAccounts(await accountApi.list()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  return (
    <ScreenContainer max={700} scroll>
      <View style={s.header}>
        <Text style={s.title}>Trading Accounts</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push("/client/accounts/create")}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addBtnT}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : accounts.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
          <Text style={s.emptyT}>No trading accounts yet</Text>
          <Text style={s.emptyS}>Create your first account to start trading</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push("/client/accounts/create")}>
            <Text style={s.emptyBtnT}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(a) => a.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/client/accounts/${item.id}`)}>
              <View style={s.cardTop}>
                <View style={s.cardIcon}>
                  <Ionicons name="briefcase-outline" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{item.account_name}</Text>
                  <Text style={s.cardNum}>{item.account_number}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View style={[s.badge, item.status === "active" ? s.badgeActive : s.badgeOther]}>
                    <Text style={[s.badgeT, item.status === "active" ? { color: colors.success } : { color: colors.textMuted }]}>{item.status}</Text>
                  </View>
                  <Text style={s.cardEnv}>{item.environment}</Text>
                </View>
              </View>
              <View style={s.cardInfo}>
                <Info icon="cash-outline" label="Mode" value={item.position_mode} />
                <Info icon="resize-outline" label="Leverage" value={`1:${item.leverage}`} />
                <Info icon="logo-usd" label="Currency" value={item.base_currency} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <View style={s.info}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={s.infoL}>{label}</Text>
      <Text style={s.infoV}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnT: { color: "#fff", fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyT: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md },
  emptyS: { fontSize: fontSize.sm, color: colors.textSecondary },
  emptyBtn: { marginTop: spacing.md, backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnT: { color: "#fff", fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: spacing.md },
  cardIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  cardNum: { fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, marginBottom: 3 },
  badgeActive: { backgroundColor: colors.successBg },
  badgeOther: { backgroundColor: colors.bg },
  badgeT: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  cardEnv: { fontSize: 10, color: colors.textMuted },

  cardInfo: { flexDirection: "row", gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  info: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  infoL: { fontSize: fontSize.xs, color: colors.textMuted },
  infoV: { fontSize: fontSize.xs, color: colors.text, fontWeight: fontWeight.medium },
});
