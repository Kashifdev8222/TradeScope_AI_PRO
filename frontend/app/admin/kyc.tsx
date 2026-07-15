import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Image, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/shared/stores/authStore";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const API = "https://tradescope-ai-api.onrender.com/api/v1";

export default function AdminKYCScreen() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [reason, setReason] = useState("");
  const [actioning, setActioning] = useState("");

  const token = useAuthStore.getState().tokens?.access_token;

  const fetchKycs = async () => {
    setLoading(true);
    try {
      const p = filter ? `?status=${filter}` : "";
      const res = await fetch(`${API}/admin/kyc${p}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setKycs(await res.json());
    } catch {} finally { setLoading(false); }
  };
  useFocusEffect(useCallback(() => { fetchKycs(); }, [filter]));

  const viewDetail = async (kycId: string) => {
    try {
      const res = await fetch(`${API}/admin/kyc/${kycId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setDetail(await res.json()); setReason(""); }
    } catch {}
  };

  const doAction = async (kycId: string, action: "approve" | "reject") => {
    if (action === "reject" && !reason.trim()) return;
    setActioning(action);
    try {
      await fetch(`${API}/admin/kyc/${kycId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || `${action}d by admin` }),
      });
      setDetail(null); fetchKycs();
    } catch {} finally { setActioning(""); }
  };

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>KYC Review</Text>

      {/* Filter pills */}
      <FlatList horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.lg }}
        data={[null, "pending", "approved", "rejected"]} keyExtractor={f => f ?? "all"}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.pill, filter === item && s.pillActive]} onPress={() => setFilter(item)}>
            <Text style={[s.pillT, filter === item && s.pillTA]}>{item === null ? "All" : item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.th, { flex: 2 }]}>User</Text>
            <Text style={[s.th, { flex: 1 }]}>Status</Text>
            <Text style={[s.th, { flex: 1 }]}>Risk</Text>
            <Text style={[s.th, { flex: 1 }]}>Date</Text>
            <Text style={[s.th, { flex: 0.8, textAlign: "center" }]}>Action</Text>
          </View>
          {kycs.map((k: any) => (
            <View key={k.id} style={s.row}>
              <View style={{ flex: 2 }}>
                <Text style={s.name}>{k.full_name}</Text>
                <Text style={s.code}>{k.client_code}</Text>
              </View>
              <Text style={[s.st, { flex: 1, color: k.status === "approved" ? colors.success : k.status === "rejected" ? colors.danger : colors.warning }]}>{k.status}</Text>
              <Text style={[s.risk, { flex: 1 }]}>{k.risk_level}</Text>
              <Text style={[s.date, { flex: 1 }]}>{k.submitted_at ? new Date(k.submitted_at).toLocaleDateString() : "—"}</Text>
              <TouchableOpacity style={[s.reviewBtn, { flex: 0.8 }]} onPress={() => viewDetail(k.id)}>
                <Text style={s.reviewBtnT}>Review</Text>
              </TouchableOpacity>
            </View>
          ))}
          {kycs.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", padding: 40 }}>No KYC profiles found</Text>}
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            {/* Header */}
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>KYC Detail — {detail?.kyc?.user_profiles?.full_name}</Text>
              <TouchableOpacity onPress={() => setDetail(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={s.modalBody}>
              {/* User info */}
              <View style={s.userInfo}>
                <Info label="Name" value={detail?.kyc?.user_profiles?.full_name} />
                <Info label="Email" value={detail?.kyc?.user_profiles?.email} />
                <Info label="Phone" value={detail?.kyc?.user_profiles?.phone || "—"} />
                <Info label="Country" value={detail?.kyc?.user_profiles?.country || "—"} />
                <Info label="Risk Level" value={detail?.kyc?.risk_level || "medium"} />
                <Info label="Submitted" value={detail?.kyc?.submitted_at ? new Date(detail.kyc.submitted_at).toLocaleString() : "—"} last />
              </View>

              {/* Documents */}
              <Text style={s.sectionTitle}>Documents ({detail?.documents?.length || 0})</Text>
              {detail?.documents?.map((doc: any) => (
                <View key={doc.id} style={s.docRow}>
                  <Ionicons name="document-text-outline" size={20} color={colors.accent} />
                  <Text style={s.docName}>{doc.document_type.replace(/_/g, " ")}</Text>
                  <View style={[s.docStatus, doc.status === "uploaded" ? { backgroundColor: colors.successBg } : { backgroundColor: colors.warningBg }]}>
                    <Text style={{ color: doc.status === "uploaded" ? colors.success : colors.warning, fontSize: 11 }}>{doc.status}</Text>
                  </View>
                  {doc.preview_url ? (
                    <TouchableOpacity style={s.viewLink} onPress={() => setPreviewUrl(doc.preview_url)}>
                      <Ionicons name="eye-outline" size={16} color={colors.accent} />
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: fontWeight.semibold }}>View</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}

              {/* Reason for rejection */}
              <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>Decision</Text>
              <TextInput
                style={s.reasonInput}
                placeholder="Reason for rejection (required if rejecting)..."
                placeholderTextColor={colors.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
              />

              {/* Action buttons */}
              <View style={s.actions}>
                <TouchableOpacity
                  style={[s.rejectBtn, actioning === "reject" && { opacity: 0.5 }]}
                  onPress={() => doAction(detail.kyc.id, "reject")}
                  disabled={actioning !== ""}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: fontWeight.semibold }}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.approveBtn, actioning === "approve" && { opacity: 0.5 }]}
                  onPress={() => doAction(detail.kyc.id, "approve")}
                  disabled={actioning !== ""}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: fontWeight.semibold }}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={previewUrl !== ""} transparent animationType="fade" onRequestClose={() => setPreviewUrl("")}>
        <TouchableOpacity style={s.imgModalBg} activeOpacity={1} onPress={() => setPreviewUrl("")}>
          <TouchableOpacity style={s.imgClose} onPress={() => setPreviewUrl("")}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: previewUrl }} style={s.imgPreview} />
        </TouchableOpacity>
      </Modal>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function Info({ label, value, last }: any) {
  return (
    <View style={[is.row, !last && is.rowBorder]}>
      <Text style={is.label}>{label}</Text>
      <Text style={is.value}>{value || "—"}</Text>
    </View>
  );
}
const is = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: fontSize.sm, color: colors.textSecondary },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
});

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },

  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.cardBorder },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillT: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, textTransform: "capitalize" },
  pillTA: { color: "#fff" },

  table: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden" },
  tableHead: { flexDirection: "row", padding: spacing.md, backgroundColor: colors.input, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  th: { fontSize: 11, fontWeight: fontWeight.semibold, color: colors.textMuted, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  name: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  code: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  st: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "capitalize" },
  risk: { fontSize: fontSize.xs, color: colors.textSecondary },
  date: { fontSize: fontSize.xs, color: colors.textMuted },
  reviewBtn: { backgroundColor: colors.accentBg, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 12, alignItems: "center" },
  reviewBtnT: { color: colors.accent, fontSize: 11, fontWeight: fontWeight.semibold },

  // Modal
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 600, maxHeight: "85%", backgroundColor: colors.card, borderRadius: radius.xl, overflow: "hidden" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, flex: 1 },
  modalBody: { padding: spacing.lg },

  userInfo: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },

  docRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  docName: { flex: 1, fontSize: fontSize.sm, color: colors.text, textTransform: "capitalize" },
  docStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  viewLink: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.accent },

  reasonInput: { backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.inputBorder, padding: 14, fontSize: fontSize.sm, color: colors.text, minHeight: 60, textAlignVertical: "top", marginTop: spacing.sm },

  actions: { flexDirection: "row", gap: 12, marginTop: spacing.lg },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: radius.md, paddingVertical: 14, borderWidth: 2, borderColor: colors.danger },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: radius.md, paddingVertical: 14, backgroundColor: colors.accent },

  // Image preview
  imgModalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  imgClose: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  imgPreview: { width: "90%", height: "70%", resizeMode: "contain", borderRadius: radius.lg },
});
