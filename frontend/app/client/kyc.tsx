import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { kycApi } from "../../src/shared/api";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const STATUS: Record<string, { icon: any; color: string; bg: string; label: string; desc: string }> = {
  approved: { icon: "checkmark-circle", color: colors.success, bg: colors.successBg, label: "Verified", desc: "Your identity has been verified successfully." },
  pending: { icon: "time-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review", desc: "Your documents are being reviewed. This may take 24-48 hours." },
  under_review: { icon: "search-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review", desc: "Your documents are being reviewed. This may take 24-48 hours." },
  rejected: { icon: "close-circle", color: colors.danger, bg: colors.dangerBg, label: "Rejected", desc: "Your KYC was rejected. Please review and resubmit with correct documents." },
  not_submitted: { icon: "document-outline", color: colors.textMuted, bg: colors.input, label: "Not Submitted", desc: "Submit your documents to verify your identity and unlock full platform features." },
};

export default function KYCScreen() {
  const user = useAuthStore((s) => s.user);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetch = async () => { try { setKyc(await kycApi.getStatus()); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);

  const submit = async () => { setSubmitting(true); try { await kycApi.submit(); setMsg("submitted"); fetch(); } catch { setMsg("error"); } finally { setSubmitting(false); } };

  const sk = kyc?.kyc_profile?.status || user?.kyc_status || "not_submitted";
  const si = STATUS[sk] || STATUS.not_submitted;

  return (
    <ScreenContainer max={900} scroll>
      <Text style={s.title}>Identity Verification</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <>
          {/* Status Banner */}
          <View style={[s.statusCard, { backgroundColor: si.bg, borderColor: si.color }]}>
            <Ionicons name={si.icon} size={44} color={si.color} />
            <Text style={[s.statusLabel, { color: si.color }]}>{si.label}</Text>
            <Text style={s.statusDesc}>{si.desc}</Text>
          </View>

          {msg !== "" && (
            <View style={[s.msg, msg === "submitted" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.dangerBg }]}>
              <Ionicons name={msg === "submitted" ? "checkmark-circle" : "alert-circle"} size={16} color={msg === "submitted" ? colors.success : colors.danger} />
              <Text style={{ color: msg === "submitted" ? colors.success : colors.danger, fontSize: fontSize.sm, flex: 1 }}>
                {msg === "submitted" ? "KYC submitted for review!" : "Failed to submit. Try again."}
              </Text>
            </View>
          )}

          {/* Required Documents */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Required Documents</Text>
            <Text style={s.cardSub}>Prepare clear photos or scans of the following:</Text>
            <View style={s.docList}>
              <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Government-issued photo ID (passport, driver's license, or national ID card)</Text></View>
              <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Proof of residential address (utility bill or bank statement, dated within last 3 months)</Text></View>
              <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Clear, legible copies — all four corners visible, no glare or obstructions</Text></View>
            </View>
          </View>

          {/* Uploaded Documents */}
          {kyc?.documents?.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Uploaded Documents</Text>
              {kyc.documents.map((d: any) => (
                <View key={d.id} style={s.upDoc}>
                  <Ionicons name="document-text-outline" size={18} color={colors.accent} />
                  <Text style={{ color: colors.text, fontSize: fontSize.sm, flex: 1 }}>{d.document_type.replace(/_/g, " ")}</Text>
                  <View style={[s.upBadge, { backgroundColor: d.status === "uploaded" ? colors.successBg : colors.warningBg }]}>
                    <Text style={{ color: d.status === "uploaded" ? colors.success : colors.warning, fontSize: 11, fontWeight: fontWeight.semibold }}>{d.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          {(sk === "not_submitted" || sk === "rejected") && (
            <TouchableOpacity style={[s.btn, submitting && { opacity: 0.7 }]} onPress={submit} disabled={submitting} activeOpacity={0.7}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Submit for Review</Text>}
            </TouchableOpacity>
          )}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },

  statusCard: { borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg, borderWidth: 2 },
  statusLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  statusDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },

  msg: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  cardSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },

  docList: { gap: 14 },
  docItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  docText: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 20 },

  upDoc: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  upBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.md },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
