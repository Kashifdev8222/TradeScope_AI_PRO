import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { kycApi } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const DOC_TYPES = [
  { key: "passport", label: "Government ID", desc: "Passport, driver's license, or national ID card", icon: "card-outline" },
  { key: "utility_bill", label: "Proof of Address", desc: "Utility bill or bank statement (last 3 months)", icon: "receipt-outline" },
];

export default function KYCScreen() {
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [msg, setMsg] = useState("");

  const fetch = async () => { try { setKyc(await kycApi.getStatus()); } catch {} finally { setLoading(false); } };
  useFocusEffect(useCallback(() => { fetch(); }, []));

  const pickAndUpload = async (docType: string) => {
    try {
      const input = document.createElement("input"); input.type = "file"; input.accept = "image/*,application/pdf";
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0]; if (!file) return;
        setUploading(docType); setMsg("");
        try {
          await kycApi.uploadFile(file, file.name, docType);
          // Auto-submit for review after first upload
          try { await kycApi.submit(); } catch {}
          setMsg("ok");
          fetch();
        } catch (e: any) { setMsg(e.message || "Upload failed"); }
        finally { setUploading(""); }
      };
      input.click();
    } catch { setMsg("File picker not supported"); }
  };

  const kycStatus = kyc?.kyc_profile?.status || "not_submitted";
  const docs = kyc?.documents || [];

  const isVerified = kycStatus === "approved";
  const isPending = kycStatus === "pending" || kycStatus === "under_review";
  const isRejected = kycStatus === "rejected";

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>Identity Verification</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <>
          {/* Status Banner */}
          <View style={[s.banner, isVerified ? { backgroundColor: colors.successBg, borderColor: colors.success } : isPending ? { backgroundColor: colors.warningBg, borderColor: colors.warning } : isRejected ? { backgroundColor: colors.dangerBg, borderColor: colors.danger } : { backgroundColor: colors.input, borderColor: colors.textMuted }]}>
            <Ionicons
              name={isVerified ? "checkmark-circle" : isPending ? "time-outline" : isRejected ? "close-circle" : "cloud-upload-outline"}
              size={40}
              color={isVerified ? colors.success : isPending ? colors.warning : isRejected ? colors.danger : colors.textMuted}
            />
            <Text style={[s.bannerTitle, { color: isVerified ? colors.success : isPending ? colors.warning : isRejected ? colors.danger : colors.textMuted }]}>
              {isVerified ? "Verified" : isPending ? "Under Review" : isRejected ? "Rejected" : "Documents Required"}
            </Text>
            <Text style={s.bannerDesc}>
              {isVerified ? "Your identity has been verified." :
               isPending ? "Documents submitted. Our team will review them within 24-48 hours." :
               isRejected ? "Verification failed. Please upload new documents." :
               "Upload the required documents below to verify your identity."}
            </Text>
          </View>

          {msg !== "" && (
            <View style={[s.msg, msg === "ok" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.dangerBg }]}>
              <Ionicons name={msg === "ok" ? "checkmark-circle" : "alert-circle"} size={16} color={msg === "ok" ? colors.success : colors.danger} />
              <Text style={{ color: msg === "ok" ? colors.success : colors.danger, fontSize: fontSize.sm, flex: 1 }}>
                {msg === "ok" ? "Document uploaded and submitted for review!" : msg}
              </Text>
            </View>
          )}

          {/* Upload section — hidden only when verified */}
          {!isVerified && (
            <View style={s.card}>
              <Text style={s.cardTitle}>{isPending ? "Add More Documents" : "Upload Documents"}</Text>
              <View style={s.uploadGrid}>
                {DOC_TYPES.map((dt) => {
                  const existing = docs.find((d: any) => d.document_type === dt.key);
                  return (
                    <TouchableOpacity key={dt.key} style={s.uploadCard} onPress={() => pickAndUpload(dt.key)} disabled={uploading !== ""} activeOpacity={0.7}>
                      <View style={[s.uploadIcon, existing && { backgroundColor: colors.successBg }]}>
                        <Ionicons name={dt.icon as any} size={26} color={existing ? colors.success : colors.accent} />
                      </View>
                      <Text style={s.uploadLabel}>{dt.label}</Text>
                      <Text style={s.uploadDesc}>{dt.desc}</Text>
                      {existing ? (
                        <View style={s.uploadBadge}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={{ color: colors.success, fontSize: 11, fontWeight: fontWeight.semibold }}>Uploaded</Text></View>
                      ) : (
                        <Text style={s.uploadHint}>{uploading === dt.key ? "Uploading..." : "Tap to upload"}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {uploading !== "" && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}
            </View>
          )}

          {/* Uploaded Documents Summary */}
          {docs.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Your Documents ({docs.length})</Text>
              {docs.map((d: any) => (
                <View key={d.id} style={s.docRow}>
                  <View style={[s.docIcon, d.status === "uploaded" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.warningBg }]}>
                    <Ionicons name="document-text-outline" size={20} color={d.status === "uploaded" ? colors.success : colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docName}>{d.document_type.replace(/_/g, " ")}</Text>
                    <Text style={s.docStatus}>{d.status === "uploaded" ? "Submitted for review" : d.status}</Text>
                  </View>
                </View>
              ))}
            </View>
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
  bannerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  bannerDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },

  msg: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg },

  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },

  uploadGrid: { gap: 14 },
  uploadCard: {
    backgroundColor: colors.input, borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1.5, borderColor: colors.inputBorder, borderStyle: "dashed",
  },
  uploadIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.accentBg, alignItems: "center", justifyContent: "center" },
  uploadLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  uploadDesc: { fontSize: 11, color: colors.textMuted, flex: 1 },
  uploadBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  uploadHint: { fontSize: 11, color: colors.accent, fontWeight: fontWeight.medium },

  docRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  docIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  docName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, textTransform: "capitalize" },
  docStatus: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
