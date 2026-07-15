import { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountApi, AccountDetail } from "../../../src/shared/api";
import ScreenContainer from "../../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../../src/shared/theme";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try { setDetail(await accountApi.getDetail(id)); } catch {} finally { setLoading(false); }
  };
  useFocusEffect(useCallback(() => { fetch(); }, [id]));

  if (loading) return <ScreenContainer max={1400}><View style={s.ctr}><ActivityIndicator color={colors.accent} size="large" /></View></ScreenContainer>;
  if (!detail) return <ScreenContainer max={1400}><View style={s.ctr}><Text style={{ color: colors.danger }}>Account not found</Text></View></ScreenContainer>;

  const a = detail.account;
  const settings = detail.settings;
  const risk = detail.risk_limits;

  return (
    <ScreenContainer max={1400} scroll>
      <View style={s.head}>
        <Text style={s.title}>{a.account_name}</Text>
        <Text style={s.sub}>{a.account_number}</Text>
      </View>

      <View style={s.grid}>
        {/* Account Info */}
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.cardTitle}>Account Details</Text>
          <Row icon="briefcase-outline" label="Type" value={a.account_type} />
          <Row icon="globe-outline" label="Environment" value={a.environment} />
          <Row icon="layers-outline" label="Position Mode" value={a.position_mode} />
          <Row icon="resize-outline" label="Leverage" value={`1:${a.leverage}`} />
          <Row icon="logo-usd" label="Currency" value={a.base_currency} />
          <Row icon="shield-checkmark-outline" label="Status" value={a.status} badge color={a.status === "active" ? colors.success : colors.textMuted} />
          <Row icon="hardware-chip-outline" label="AI Trading" value={a.ai_enabled ? "Enabled" : "Disabled"} last />
        </View>

        {/* Settings */}
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.cardTitle}>Trading Settings</Text>
          <Row icon="flash-outline" label="One-Click Trading" value={settings?.one_click_enabled ? "On" : "Off"} />
          <Row icon="layers-outline" label="Default Order Size" value={String(settings?.default_order_size || "0.01")} />
          <Row icon="shield-outline" label="Manual AI Approval" value={settings?.manual_ai_approval ? "Required" : "Auto"} last />
        </View>
      </View>

      {/* Risk Limits */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Risk Limits</Text>
        <View style={s.grid2}>
          <Block label="Risk Profile" value={risk?.risk_profile || "moderate"} />
          <Block label="Max Daily Trades" value={String(risk?.max_daily_trades || 20)} />
          <Block label="Max Open Positions" value={String(risk?.max_open_positions || 5)} />
          <Block label="Max Position Size" value={String(risk?.max_position_size || 1.0)} />
          <Block label="Daily Loss Limit" value={`$${risk?.daily_loss_limit || 500}`} />
          <Block label="Daily Profit Target" value={`$${risk?.daily_profit_target || 1000}`} />
          <Block label="Max Drawdown" value={`${risk?.max_drawdown || 20}%`} />
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function Row({ icon, label, value, badge, color, last }: any) {
  return (
    <View style={[s.row, !last && s.rowBorder]}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={s.rowLabel}>{label}</Text>
      {badge ? (
        <View style={[s.badge, { backgroundColor: color + "18" }]}>
          <View style={[s.badgeDot, { backgroundColor: color }]} />
          <Text style={[s.rowValue, { color }]}>{value}</Text>
        </View>
      ) : (
        <Text style={s.rowValue}>{value}</Text>
      )}
    </View>
  );
}

function Block({ label, value }: any) {
  return (
    <View style={s.block}>
      <Text style={s.blockLabel}>{label}</Text>
      <Text style={s.blockValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  ctr: { flex: 1, justifyContent: "center", alignItems: "center" },
  head: { marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.accent, marginTop: 4 },

  grid: { flexDirection: "row", gap: 20, marginBottom: spacing.lg },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: spacing.lg },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },

  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },

  block: { flex: 1, minWidth: 160, backgroundColor: colors.input, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  blockLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase" },
  blockValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
});
