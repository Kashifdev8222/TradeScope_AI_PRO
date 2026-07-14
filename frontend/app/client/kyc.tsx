import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { kycApi } from "../../src/shared/api";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const STATUS_INFO: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  approved: { icon: "checkmark-circle", color: colors.success, bg: colors.successBg, label: "Verified" },
  pending: { icon: "time-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review" },
  under_review: { icon: "search-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review" },
  rejected: { icon: "close-circle", color: colors.danger, bg: colors.dangerBg, label: "Rejected" },
  not_submitted: { icon: "document-outline", color: colors.textMuted, bg: colors.bg, label: "Not Submitted" },
};

export default function KYCScreen() {
  const user = useAuthStore((s) => s.user);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetch = async () => {
    try { setKyc(await kycApi.getStatus()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const submit = async () => {
    setSubmitting(true);
    try { await kycApi.submit(); setMsg("KYC submitted for review!"); fetch(); }
    catch { setMsg("Failed to submit. Try again."); }
    finally { setSubmitting(false); }
  };

  const statusKey = kyc?.kyc_profile?.status || user?.kyc_status || "not_submitted";
  const si = STATUS_INFO[statusKey] || STATUS_INFO.not_submitted;

  return (
    <ScreenContainer max={600} scroll>
      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <>
          <View style={[s.statusCard, { backgroundColor: si.bg, borderColor: si.color }]}>
            <Ionicons name={si.icon} size={40} color={si.color} />
            <Text style={[s.statusLabel, { color: si.color }]}>{si.label}</Text>
            <Text style={s.statusDesc}>
              {statusKey === "not_submitted" ? "Submit your documents to verify your identity." :
               statusKey === "pending" || statusKey === "under_review" ? "Your documents are being reviewed. This may take 24-48 hours." :
               statusKey === "approved" ? "Your identity has been verified." :
               "Your KYC was rejected. Please resubmit with correct documents."}
            </Text>
          </View>

          {msg !== "" && (
            <View style={[s.msg, msg.includes("submitted") ? { backgroundColor: colors.successBg } : { backgroundColor: colors.dangerBg }]}>
              <Ionicons name={msg.includes("submitted") ? "checkmark-circle" : "alert-circle"} size={15} color={msg.includes("submitted") ? colors.success : colors.danger} />
              <Text style={{ color: msg.includes("submitted") ? colors.success : colors.danger, fontSize: fontSize.sm, flex: 1 }}>{msg}</Text>
            </View>
          )}

          <View style={s.docSection}>
            <Text style={s.docTitle}>Required Documents</Text>
            <Text style={s.docSub}>Please prepare the following:</Text>
            <View style={s.docItem}><Ionicons name="checkmark-circle" size={18} color={colors.success} /><Text style={s.docText}>Government-issued ID (passport, driver's license, or national ID)</Text></View>
            <View style={s.docItem}><Ionicons name="checkmark-circle" size={18} color={colors.success} /><Text style={s.docText}>Proof of address (utility bill or bank statement, last 3 months)</Text></View>
          </View>

          {kyc?.documents?.length > 0 && (
            <View style={s.docSection}>
              <Text style={s.docTitle}>Uploaded Documents</Text>
              {kyc.documents.map((d: any) => (
                <View key={d.id} style={s.uploadedDoc}>
                  <Ionicons name="document-text-outline" size={16} color={colors.accent} />
                  <Text style={{ color: colors.text, fontSize: fontSize.sm, flex: 1 }}>{d.document_type}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{d.status}</Text>
                </View>
              ))}
            </View>
          )}

          {statusKey === "not_submitted" || statusKey === "rejected" ? (
            <TouchableOpacity style={[s.btn, submitting && { opacity: 0.7 }]} onPress={submit} disabled={submitting} activeOpacity={0.8}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Submit KYC for Review</Text>}
            </TouchableOpacity>
          ) : null}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  statusCard: { borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg, borderWidth: 2 },
  statusLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  statusDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },

  msg: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },

  docSection: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  docTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  docSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  docItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  docText: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 20 },
  uploadedDoc: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.lg },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
