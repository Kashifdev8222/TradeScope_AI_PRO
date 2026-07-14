import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminApi, AdminUser } from "../../src/shared/api";
import ScreenContainer from "../../src/shared/components/ScreenContainer";
import { colors, spacing, radius, fontSize, fontWeight } from "../../src/shared/theme";

const STYLES: Record<string, { bg: string; fg: string }> = {
  active: { bg: colors.successBg, fg: colors.success },
  pending_verification: { bg: colors.warningBg, fg: colors.warning },
  restricted: { bg: "#FFF7ED", fg: "#C2410C" },
  suspended: { bg: colors.dangerBg, fg: colors.danger },
  closed: { bg: colors.bg, fg: colors.textMuted },
};

export default function UserDirectory() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);

  const fetch = async (p = 1, s: string | null = null, q = "") => {
    setLoading(true);
    try {
      const params: any = { page: p, page_size: 20 };
      if (s) params.status = s;
      if (q) params.search = q;
      const r = await adminApi.listUsers(params);
      setUsers(r.users); setTotal(r.total);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(1, filter, search); }, [filter]);

  return (
    <ScreenContainer max={960}>
      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color={colors.textMuted} />
        <TextInput style={s.searchInput} placeholder="Search by name or code..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={() => fetch(1, filter, search)} returnKeyType="search" />
      </View>

      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: spacing.md }}
        data={[null, "active", "suspended", "restricted"]}
        keyExtractor={(f) => f ?? "all"}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.pill, filter === item && s.pillActive]} onPress={() => setFilter(item)}>
            <Text style={[s.pillText, filter === item && s.pillTextActive]}>{item ?? "All"}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={s.count}>{total} users</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={users} keyExtractor={(u) => u.id}
          renderItem={({ item }) => {
            const st = STYLES[item.status] || STYLES.closed;
            return (
              <TouchableOpacity style={s.row} onPress={() => router.push(`/admin/users/${item.id}`)}>
                <View style={s.avatar}>
                  <Text style={s.avatarT}>{(item.full_name || "?")[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.full_name}</Text>
                  <Text style={s.code}>{item.client_code} · {item.country || "—"}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: st.bg }]}>
                  <Text style={[s.badgeT, { color: st.fg }]}>{item.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No users found.</Text>}
        />
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.bgDark, borderRadius: radius.lg,
    paddingHorizontal: 16, borderWidth: 1, borderColor: "#1A2433",
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: fontSize.sm, color: colors.textLight },

  pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.bgDark, marginRight: 8, borderWidth: 1, borderColor: "#1A2433" },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { color: colors.textLightSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, textTransform: "capitalize" },
  pillTextActive: { color: "#fff" },

  count: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md },

  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.bgDark, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: 8,
    borderWidth: 1, borderColor: "#1A2433",
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(30,56,82,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  avatarT: { fontSize: 15, fontWeight: fontWeight.bold, color: colors.accentLight },
  name: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textLight },
  code: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeT: { fontSize: 11, fontWeight: fontWeight.semibold },
});
