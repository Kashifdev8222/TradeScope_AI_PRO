import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useWindowDimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { marketApi, Quote } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const CATEGORIES = [
  { key: null, label: "All", icon: "grid-outline" },
  { key: "forex", label: "Forex", icon: "trending-up-outline" },
  { key: "crypto", label: "Crypto", icon: "logo-bitcoin" },
  { key: "indices", label: "Indices", icon: "stats-chart-outline" },
  { key: "commodities", label: "Commodities", icon: "cube-outline" },
  { key: "stocks", label: "Stocks", icon: "business-outline" },
];

export default function MarketScreen() {
  const { width } = useWindowDimensions();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const instruments = await marketApi.getInstruments(category || undefined);
      const symbols = instruments.map(i => i.symbol).join(",");
      if (symbols) setQuotes(await marketApi.getQuotes(symbols));
      else setQuotes([]);
    } catch {} finally { setLoading(false); }
  };
  useFocusEffect(useCallback(() => { fetch(); }, [category]));

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>Market Watch</Text>

      {/* Category pills */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: spacing.lg }}
        data={CATEGORIES}
        keyExtractor={c => c.key ?? "all"}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.pill, category === item.key && s.pillActive]} onPress={() => setCategory(item.key)}>
            <Ionicons name={item.icon as any} size={15} color={category === item.key ? "#fff" : colors.textMuted} />
            <Text style={[s.pillT, category === item.key && s.pillTA]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Quotes table */}
      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <View style={s.table}>
          {/* Header */}
          <View style={s.tableHead}>
            <Text style={[s.th, { flex: 2 }]}>Symbol</Text>
            <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Bid</Text>
            <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Ask</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Spread</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Change</Text>
          </View>

          {quotes.map((q) => (
            <TouchableOpacity key={q.symbol} style={s.row} activeOpacity={0.7}>
              <View style={{ flex: 2 }}>
                <Text style={s.symbol}>{q.symbol}</Text>
                <Text style={s.classLabel}>{q.asset_class}</Text>
              </View>
              <Text style={[s.price, { flex: 1.5, textAlign: "right" }]}>{formatPrice(q.bid)}</Text>
              <Text style={[s.price, { flex: 1.5, textAlign: "right" }]}>{formatPrice(q.ask)}</Text>
              <Text style={[s.spread, { flex: 1, textAlign: "right" }]}>{formatSpread(q.spread)}</Text>
              <Text style={[s.change, { flex: 1, textAlign: "right", color: q.change_pct >= 0 ? colors.success : colors.danger }]}>
                {q.change_pct >= 0 ? "+" : ""}{q.change_pct.toFixed(2)}%
              </Text>
            </TouchableOpacity>
          ))}

          {quotes.length === 0 && (
            <Text style={{ color: colors.textMuted, textAlign: "center", padding: 40 }}>No instruments found</Text>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toFixed(2);
  if (p >= 10) return p.toFixed(4);
  return p.toFixed(5);
}
function formatSpread(s: number): string {
  if (s >= 1) return s.toFixed(2);
  return s.toFixed(5);
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },

  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.cardBorder },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillT: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary },
  pillTA: { color: "#fff" },

  table: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden" },
  tableHead: { flexDirection: "row", padding: spacing.md, backgroundColor: colors.input, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  th: { fontSize: 11, fontWeight: fontWeight.semibold, color: colors.textMuted, textTransform: "uppercase" },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  symbol: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  classLabel: { fontSize: 10, color: colors.textMuted, textTransform: "capitalize", marginTop: 2 },
  price: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium, fontVariant: ["tabular-nums"] as any },
  spread: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ["tabular-nums"] as any },
  change: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontVariant: ["tabular-nums"] as any },
});
