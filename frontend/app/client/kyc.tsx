import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { kycApi } from "../../src/shared/api";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const STATUS: Record<string, { icon: any; color: string; bg: string; label: string; desc: string }> = {
  approved: { icon: "checkmark-circle", color: colors.success, bg: colors.successBg, label: "Verified", desc: "Your identity has been verified." },
  pending: { icon: "time-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review", desc: "Your documents are being reviewed. 24-48 hours." },
  under_review: { icon: "search-outline", color: colors.warning, bg: colors.warningBg, label: "Under Review", desc: "Your documents are being reviewed. 24-48 hours." },
  rejected: { icon: "close-circle", color: colors.danger, bg: colors.dangerBg, label: "Rejected", desc: "KYC was rejected. Please resubmit correct documents." },
  not_submitted: { icon: "document-outline", color: colors.textMuted, bg: colors.input, label: "Not Submitted", desc: "Upload your documents to verify your identity." },
};

const DOC_TYPES = [
  { key: "passport", label: "Passport / ID Card", icon: "card-outline" },
  { key: "drivers_license", label: "Driver's License", icon: "car-outline" },
  { key: "utility_bill", label: "Utility Bill", icon: "receipt-outline" },
  { key: "bank_statement", label: "Bank Statement", icon: "document-text-outline" },
];

export default function KYCScreen() {
  const user = useAuthStore((s) => s.user);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetch = async () => { try { setKyc(await kycApi.getStatus()); } catch {} finally { setLoading(false); } };
  useFocusEffect(useCallback(() => { fetch(); }, []));

  const submit = async () => {
    setSubmitting(true); setMsg("");
    try { await kycApi.submit(); setMsg("ok"); fetch(); }
    catch { setMsg("err"); } finally { setSubmitting(false); }
  };

  const pickAndUpload = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      setUploading(true); setMsg("");
      const file = result.assets[0];
      const res = await fetch("https://tradescope-ai-api.onrender.com/api/v1/client/kyc/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${useAuthStore.getState().tokens?.access_token}` },
        body: (() => {
          const fd = new FormData();
          fd.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as any);
          fd.append("document_type", docType);
          return fd;
        })(),
      });
      if (res.ok) { setMsg("uploaded"); fetch(); }
      else { setMsg("err"); }
    } catch { setMsg("err"); }
    finally { setUploading(false); }
  };

  const sk = kyc?.kyc_profile?.status || user?.kyc_status || "not_submitted";
  const si = STATUS[sk] || STATUS.not_submitted;

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>Identity Verification</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <>
          <View style={[s.banner, { backgroundColor: si.bg, borderColor: si.color }]}>
            <Ionicons name={si.icon} size={44} color={si.color} />
            <Text style={[s.bannerLabel, { color: si.color }]}>{si.label}</Text>
            <Text style={s.bannerDesc}>{si.desc}</Text>
          </View>

          {msg !== "" && (
            <View style={[s.msg, msg === "ok" || msg === "uploaded" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.dangerBg }]}>
              <Ionicons name={msg === "ok" || msg === "uploaded" ? "checkmark-circle" : "alert-circle"} size={16} color={msg === "ok" || msg === "uploaded" ? colors.success : colors.danger} />
              <Text style={{ color: msg === "ok" || msg === "uploaded" ? colors.success : colors.danger, fontSize: fontSize.sm, flex: 1 }}>
                {msg === "ok" ? "KYC submitted for review!" : msg === "uploaded" ? "Document uploaded successfully!" : "Failed. Try again."}
              </Text>
            </View>
          )}

          {/* Upload Documents */}
          {(sk === "not_submitted" || sk === "rejected") && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Upload Documents</Text>
              <Text style={s.cardSub}>Select the type of document you want to upload:</Text>
              <View style={s.uploadGrid}>
                {DOC_TYPES.map((dt) => (
                  <TouchableOpacity key={dt.key} style={s.uploadItem} onPress={() => pickAndUpload(dt.key)} disabled={uploading} activeOpacity={0.7}>
                    <View style={s.uploadIcon}>
                      <Ionicons name={dt.icon as any} size={22} color={colors.accent} />
                    </View>
                    <Text style={s.uploadLabel}>{dt.label}</Text>
                    <Text style={s.uploadHint}>Tap to upload</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {uploading && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}
            </View>
          )}

          {/* Required Documents */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Requirements</Text>
            <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Government-issued photo ID (passport, driver's license, or national ID)</Text></View>
            <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Proof of address (utility bill or bank statement, last 3 months)</Text></View>
            <View style={s.docItem}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={s.docText}>Clear copies — all corners visible, no glare</Text></View>
          </View>

          {/* Uploaded Files */}
          {kyc?.documents?.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Uploaded Files ({kyc.documents.length})</Text>
              {kyc.documents.map((d: any) => (
                <View key={d.id} style={s.fileRow}>
                  <Ionicons name="document-text-outline" size={18} color={colors.accent} />
                  <Text style={{ color: colors.text, fontSize: fontSize.sm, flex: 1 }}>{d.document_type.replace(/_/g, " ")}</Text>
                  <View style={[s.fileBadge, { backgroundColor: d.status === "uploaded" ? colors.successBg : colors.warningBg }]}>
                    <Text style={{ color: d.status === "uploaded" ? colors.success : colors.warning, fontSize: 11, fontWeight: fontWeight.semibold }}>{d.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

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

  banner: { borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg, borderWidth: 2 },
  bannerLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  bannerDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },

  msg: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  cardSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },

  uploadGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  uploadItem: {
    flex: 1, minWidth: 140, backgroundColor: colors.input,
    borderRadius: radius.lg, padding: spacing.md,
    alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: colors.inputBorder,
    borderStyle: "dashed",
  },
  uploadIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  uploadLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, textAlign: "center" },
  uploadHint: { fontSize: 10, color: colors.textMuted },

  docItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  docText: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 20 },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  fileBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },

  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: spacing.md },
  btnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
