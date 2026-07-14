import React from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";

interface Props { title: string; subtitle: string; icon: any; children: React.ReactNode; }

const FEATURES = [
  { icon: "flash-outline" as const, text: "AI-powered trade signals with real-time market analysis" },
  { icon: "shield-checkmark-outline" as const, text: "Advanced risk management & portfolio protection tools" },
  { icon: "analytics-outline" as const, text: "Live charts, anonymous leaderboard & instant trade execution" },
];

export default function SplitAuthLayout({ title, subtitle, icon, children }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={s.root}>
      {isWide ? (
        <View style={s.row}>
          <View style={s.left}>
            {/* Decorative bubbles */}
            <View style={s.bubble1} />
            <View style={s.bubble2} />
            <View style={s.bubble3} />

            <View style={s.leftInner}>
              {/* Logo */}
              <View style={s.logoRow}>
                <View style={s.logoBox}>
                  <Ionicons name="trending-up" size={24} color="#C5D9F0" />
                </View>
                <Text style={s.logoText}>TradeScope AI</Text>
              </View>

              {/* Hero */}
              <Text style={s.hero}>
                Intelligent Trading.{" "}
                <Text style={s.heroAccent}>Powered by AI.</Text>
              </Text>

              <Text style={s.desc}>
                The complete platform for manual & AI-driven trading — real-time market data, risk controls, and instant execution. Supports both demo and live broker modes.
              </Text>

              {/* Feature list */}
              <View style={s.features}>
                {FEATURES.map((f, i) => (
                  <View key={i} style={s.fRow}>
                    <View style={s.fDot}>
                      <Ionicons name={f.icon} size={18} color="#6BA5D1" />
                    </View>
                    <Text style={s.fText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={s.right}>
            <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
              <View style={s.formCard}>
                <View style={s.formHead}>
                  <View style={s.formIcon}>
                    <Ionicons name={icon} size={24} color={colors.accent} />
                  </View>
                  <Text style={s.formTitle}>{title}</Text>
                  <Text style={s.formSub}>{subtitle}</Text>
                </View>
                {children}
              </View>
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.mobScroll} keyboardShouldPersistTaps="handled">
          <View style={s.mobHead}>
            <View style={s.logoRow}>
              <View style={s.logoBox}><Ionicons name="trending-up" size={24} color="#C5D9F0" /></View>
              <Text style={[s.logoText, { color: colors.textLight }]}>TradeScope AI</Text>
            </View>
          </View>
          <View style={s.mobCard}>
            <View style={s.formHead}>
              <View style={s.formIcon}><Ionicons name={icon} size={24} color={colors.accent} /></View>
              <Text style={s.formTitle}>{title}</Text>
              <Text style={s.formSub}>{subtitle}</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  row: { flex: 1, flexDirection: "row" },

  left: {
    flex: 1, backgroundColor: colors.bgDark,
    justifyContent: "center", alignItems: "center",
    position: "relative", overflow: "hidden",
  },

  // Decorative bubbles — subtle, dark navy tones
  bubble1: {
    position: "absolute", top: -100, right: -80,
    width: 420, height: 420, borderRadius: 210,
    backgroundColor: "rgba(20,40,60,0.3)",
  },
  bubble2: {
    position: "absolute", bottom: -60, left: -50,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(20,40,60,0.25)",
  },
  bubble3: {
    position: "absolute", top: "40%", right: -20,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(20,40,60,0.15)",
  },

  leftInner: { padding: spacing.xxl, maxWidth: 440, zIndex: 1 },

  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  logoBox: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.accentLight,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.accentLight, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  logoText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textLight },

  hero: { fontSize: 36, fontWeight: fontWeight.bold, color: colors.textLight, lineHeight: 46, marginBottom: spacing.lg },
  heroAccent: { color: "#6BA5D1" },

  desc: { fontSize: fontSize.sm, color: "#B0C4D9", lineHeight: 24, marginBottom: spacing.xl },

  features: { gap: spacing.md },
  fRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  fDot: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: "rgba(107,165,209,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  fIcon: { color: "#6BA5D1" },
  fText: { fontSize: 15, color: "#B0C4D9", flex: 1 },

  right: { flex: 1, backgroundColor: colors.card },
  formScroll: { flexGrow: 1, justifyContent: "center", padding: spacing.xxl, alignItems: "center" },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    width: "100%", maxWidth: 540,
    overflow: "visible" as any,
  },
  formHead: { alignItems: "center", marginBottom: spacing.xl },
  formIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(30,56,82,0.08)", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  formTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  formSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  mobScroll: { flexGrow: 1, backgroundColor: colors.bg, padding: spacing.lg, paddingTop: spacing.xxl },
  mobHead: { alignItems: "center", marginBottom: spacing.xl },
  mobCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder },
});
