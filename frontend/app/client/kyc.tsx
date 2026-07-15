import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { kycApi } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

// Per client requirements
const DOC_TYPES = [
  { key: "passport", label: "Passport", icon: "card-outline" },
  { key: "id_front", label: "ID Card - Front", icon: "id-card-outline" },
  { key: "id_back", label: "ID Card - Back", icon: "copy-outline" },
  { key: "drivers_license", label: "Driver's License", icon: "car-outline" },
  { key: "utility_bill", label: "Utility Bill", icon: "receipt-outline" },
  { key: "bank_statement", label: "Bank Statement", icon: "document-text-outline" },
  { key: "other", label: "Other Document", icon: "attach-outline" },
];

export default function KYCScreen() {
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const fetch = async () => { try { setKyc(await kycApi.getStatus()); } catch {} finally { setLoading(false); } };
  useFocusEffect(useCallback(() => { fetch(); }, []));

  const uploadFile = async (docType: string) => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*,application/pdf";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0]; if (!file) return;
      setUploading(docType); setMsg("");
      console.log("Upload:", docType, file.name, file.size);
      try {
        await kycApi.uploadFile(file, file.name, docType);
        console.log("Upload OK");
        setMsg("uploaded"); fetch();
      }
      catch (e: any) {
        console.error("Upload ERR:", e.message, e);
        setMsg(e.message || "Upload failed");
      }
      finally { setUploading(""); }
    };
    input.click();
  };

  const submitAll = async () => {
    setSubmitting(true); setMsg("");
    try { await kycApi.submit(); setMsg("submitted"); fetch(); }
    catch (e: any) { setMsg(e.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  // Preview in modal
  const previewDoc = (storagePath: string) => {
    setPreviewUrl(`https://dzvsdphddukzxqamzktc.supabase.co/storage/v1/object/public/kyc-documents/${storagePath}`);
  };

  const kycStatus = kyc?.kyc_profile?.status || "not_submitted";
  const docs = kyc?.documents || [];
  const hasDocs = docs.length > 0;

  const isVerified = kycStatus === "approved";
  const isPending = kycStatus === "pending" || kycStatus === "under_review";
  const isRejected = kycStatus === "rejected";

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>Identity Verification</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <>
          {/* Status Banner */}
          <View style={[s.banner,
            isVerified ? { backgroundColor: colors.successBg, borderColor: colors.success } :
            isPending ? { backgroundColor: colors.warningBg, borderColor: colors.warning } :
            isRejected ? { backgroundColor: colors.dangerBg, borderColor: colors.danger } :
            { backgroundColor: colors.card, borderColor: colors.cardBorder }
          ]}>
            <Ionicons
              name={isVerified ? "checkmark-circle" : isPending ? "time-outline" : isRejected ? "close-circle" : "cloud-upload-outline"}
              size={44} color={isVerified ? colors.success : isPending ? colors.warning : isRejected ? colors.danger : colors.accent} />
            <Text style={[s.bannerTitle, isVerified ? { color: colors.success } : isPending ? { color: colors.warning } : isRejected ? { color: colors.danger } : { color: colors.text }]}>
              {isVerified ? "Verification Approved" : isPending ? "Verification In Progress" : isRejected ? "Verification Rejected" : "Submit Your Documents"}
            </Text>
            <Text style={s.bannerDesc}>
              {isVerified ? "Your identity has been verified." :
               isPending ? "Documents under review (24-48 hours). Upload additional documents if needed." :
               isRejected ? "Documents rejected. Please upload new documents and resubmit." :
               "Upload the required documents and submit for review."}
            </Text>
          </View>

          {msg !== "" && (
            <View style={[s.msg, (msg === "uploaded" || msg === "submitted") ? { backgroundColor: colors.successBg } : { backgroundColor: colors.dangerBg }]}>
              <Ionicons name={(msg === "uploaded" || msg === "submitted") ? "checkmark-circle" : "alert-circle"} size={16} color={(msg === "uploaded" || msg === "submitted") ? colors.success : colors.danger} />
              <Text style={{ color: (msg === "uploaded" || msg === "submitted") ? colors.success : colors.danger, fontSize: fontSize.sm, flex: 1 }}>
                {msg === "uploaded" ? "Document uploaded." : msg === "submitted" ? "Documents submitted for review!" : msg}
              </Text>
            </View>
          )}

          {/* Upload Section — always visible unless verified */}
          {!isVerified && (
            <View style={s.card}>
              <Text style={s.cardTitle}>{isPending ? "Add More Documents" : "Upload Documents"}</Text>
              <Text style={s.cardSub}>Accepted: JPG, PNG, PDF (max 10MB per file)</Text>
              {DOC_TYPES.map((dt) => {
                const existing = docs.filter((d: any) => d.document_type === dt.key);
                return (
                  <View key={dt.key} style={s.docTypeRow}>
                    <View style={[s.docTypeIcon, existing.length > 0 ? { backgroundColor: colors.successBg } : { backgroundColor: colors.input }]}>
                      <Ionicons name={dt.icon as any} size={22} color={existing.length > 0 ? colors.success : colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.docTypeLabel}>{dt.label}</Text>
                      {existing.length > 0 ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <View style={[s.dot, { backgroundColor: colors.success }]} />
                          <Text style={{ color: colors.success, fontSize: 12 }}>Uploaded</Text>
                        </View>
                      ) : (
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Not uploaded</Text>
                      )}
                    </View>
                    {/* Action buttons */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {existing.length > 0 && (
                        <TouchableOpacity onPress={() => previewDoc(existing[0].storage_path)} style={[s.actionBtn, { borderColor: colors.accent }]}>
                          <Ionicons name="eye-outline" size={15} color={colors.accent} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[s.actionBtn, existing.length > 0 ? { borderColor: colors.accent } : { borderColor: colors.inputBorder }]}
                        onPress={() => uploadFile(dt.key)}
                        disabled={uploading !== ""} activeOpacity={0.7}>
                        {uploading === dt.key ? <ActivityIndicator color={colors.accent} size="small" /> :
                         <Ionicons name={existing.length > 0 ? "sync-outline" : "cloud-upload-outline"} size={15} color={colors.accent} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Submit Button — always show if has documents and not verified */}
          {!isVerified && hasDocs && (
            <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={submitAll} disabled={submitting} activeOpacity={0.7}>
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                  <Text style={s.submitBtnT}>{isPending ? "Resubmit for Review" : "Submit All Documents for Review"}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {!isVerified && !hasDocs && (
            <View style={s.hint}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
              <Text style={s.hintT}>Upload at least one document, then submit for review</Text>
            </View>
          )}
        </>
      )}
      {/* Preview Modal */}
      <Modal visible={previewUrl !== ""} transparent animationType="fade" onRequestClose={() => setPreviewUrl("")}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>Document Preview</Text>
              <TouchableOpacity onPress={() => setPreviewUrl("")}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: previewUrl }} style={{ width: "100%", height: 400, resizeMode: "contain" }} />
          </View>
        </View>
      </Modal>

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
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.lg },

  docTypeRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.divider },
  docTypeIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  docTypeLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  dot: { width: 7, height: 7, borderRadius: 4 },

  actionBtn: {
    width: 34, height: 34, borderRadius: radius.sm,
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },

  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, marginTop: spacing.sm },
  submitBtnT: { color: "#fff", fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, padding: spacing.md, marginTop: spacing.sm },
  hintT: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1 },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 700, backgroundColor: colors.card, borderRadius: radius.xl, overflow: "hidden" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
});
