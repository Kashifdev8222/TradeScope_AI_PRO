import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Image } from "react-native";
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
      if (res.ok) setDetail(await res.json());
    } catch {}
  };

  const doAction = async (kycId: string, action: "approve" | "reject") => {
    setActioning(kycId);
    try {
      await fetch(`${API}/admin/kyc/${kycId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || `${action}d by admin` }),
      });
      setDetail(null); setReason(""); fetchKycs();
    } catch {} finally { setActioning(""); }
  };

  return (
    <ScreenContainer max={1400} scroll>
      <Text style={s.title}>KYC Review</Text>

      {/* Filter pills */}
      <FlatList horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.lg }}
        data={[null, "pending", "approved", "rejected"]} keyExtractor={f => f ?? "pending"}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.pill, filter === item && s.pillActive]} onPress={() => setFilter(item)}>
            <Text style={[s.pillT, filter === item && s.pillTA]}>{item === null ? "Pending" : item}</Text>
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
              <Text style={[s.status, { flex: 1, color: k.status === "approved" ? colors.success : k.status === "rejected" ? colors.danger : colors.warning }]}>
                {k.status}
              </Text>
              <Text style={[s.risk, { flex: 1 }]}>{k.risk_level}</Text>
              <Text style={[s.date, { flex: 1 }]}>{k.submitted_at ? new Date(k.submitted_at).toLocaleDateString() : "—"}</Text>
              <TouchableOpacity style={[s.viewBtn, { flex: 0.8 }]} onPress={() => viewDetail(k.id)}>
                <Text style={s.viewBtnT}>Review</Text>
              </TouchableOpacity>
            </View>
          ))}
          {kycs.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", padding: 40 }}>No KYC profiles</Text>}
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>KYC Detail — {detail?.kyc?.user_profiles?.full_name}</Text>
              <TouchableOpacity onPress={() => { setDetail(null); setReason(""); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {detail?.documents?.map((doc: any) => (
              <View key={doc.id} style={s.docRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.accent} />
                <Text style={{ flex: 1, color: colors.text, fontSize: fontSize.sm }}>{doc.document_type}</Text>
                <TouchableOpacity style={s.previewBtn} onPress={() => setPreviewUrl(doc.preview_url || "")}>
                  <Ionicons name="eye-outline" size={16} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontSize: 12 }}>View</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Reason input */}
            <View style={{ padding: spacing.md }}>
              <TextInputComponent value={reason} onChange={setReason} placeholder="Reason (required for reject)..." />
            </View>

            <View style={s.actionRow}>
              <TouchableOpacity style={s.rejectBtn} onPress={() => doAction(detail.kyc.id, "reject")} disabled={actioning !== ""}>
                <Text style={{ color: colors.danger, fontWeight: fontWeight.semibold }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.approveBtn} onPress={() => doAction(detail.kyc.id, "approve")} disabled={actioning !== ""}>
                <Text style={{ color: "#fff", fontWeight: fontWeight.semibold }}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Document Preview */}
          {previewUrl !== "" && (
            <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewUrl("")}>
              <TouchableOpacity style={s.imgModalBg} activeOpacity={1} onPress={() => setPreviewUrl("")}>
                <Image source={{ uri: previewUrl }} style={{ width: "90%", height: "70%", resizeMode: "contain", borderRadius: radius.lg }} />
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </Modal>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function TextInputComponent({ value, onChange, placeholder }: any) {
  return (
    <View style={s.inpW}>
      <Text style={s.inp} onPress={() => {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = placeholder;
        input.value = value;
        input.style.cssText = "width:100%;padding:12px;border:none;background:transparent;font-size:14px;color:#111827;outline:none";
        input.onchange = (e: any) => onChange(e.target.value);
        const el = document.getElementById("reason-input");
        if (el) { el.innerHTML = ""; el.appendChild(input); input.focus(); }
      }}>
        {value || placeholder}
      </Text>
    </View>
  );
}

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
  status: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: "capitalize" },
  risk: { fontSize: fontSize.xs, color: colors.textSecondary },
  date: { fontSize: fontSize.xs, color: colors.textMuted },
  viewBtn: { backgroundColor: colors.accentBg, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 12, alignItems: "center" },
  viewBtnT: { color: colors.accent, fontSize: 11, fontWeight: fontWeight.semibold },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.xl, maxHeight: "80%", overflow: "hidden" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, flex: 1 },

  docRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  previewBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.accent },

  actionRow: { flexDirection: "row", gap: 12, padding: spacing.lg },
  rejectBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", borderWidth: 2, borderColor: colors.danger },
  approveBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", backgroundColor: colors.success },

  inpW: { backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.inputBorder, padding: 14 },
  inp: { fontSize: fontSize.sm, color: colors.textMuted },
  imgModalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
});
