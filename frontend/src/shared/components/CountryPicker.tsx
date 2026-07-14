import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";

const ALL = [
  { name: "Afghanistan", code: "AF", dial: "+93" },{ name: "Albania", code: "AL", dial: "+355" },{ name: "Algeria", code: "DZ", dial: "+213" },
  { name: "Argentina", code: "AR", dial: "+54" },{ name: "Australia", code: "AU", dial: "+61" },{ name: "Austria", code: "AT", dial: "+43" },
  { name: "Bahrain", code: "BH", dial: "+973" },{ name: "Bangladesh", code: "BD", dial: "+880" },{ name: "Belgium", code: "BE", dial: "+32" },
  { name: "Brazil", code: "BR", dial: "+55" },{ name: "Canada", code: "CA", dial: "+1" },{ name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },{ name: "Colombia", code: "CO", dial: "+57" },{ name: "Denmark", code: "DK", dial: "+45" },
  { name: "Egypt", code: "EG", dial: "+20" },{ name: "Finland", code: "FI", dial: "+358" },{ name: "France", code: "FR", dial: "+33" },
  { name: "Germany", code: "DE", dial: "+49" },{ name: "Ghana", code: "GH", dial: "+233" },{ name: "Greece", code: "GR", dial: "+30" },
  { name: "Hong Kong", code: "HK", dial: "+852" },{ name: "Hungary", code: "HU", dial: "+36" },{ name: "India", code: "IN", dial: "+91" },
  { name: "Indonesia", code: "ID", dial: "+62" },{ name: "Iran", code: "IR", dial: "+98" },{ name: "Iraq", code: "IQ", dial: "+964" },
  { name: "Ireland", code: "IE", dial: "+353" },{ name: "Israel", code: "IL", dial: "+972" },{ name: "Italy", code: "IT", dial: "+39" },
  { name: "Japan", code: "JP", dial: "+81" },{ name: "Jordan", code: "JO", dial: "+962" },{ name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kuwait", code: "KW", dial: "+965" },{ name: "Lebanon", code: "LB", dial: "+961" },{ name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Mexico", code: "MX", dial: "+52" },{ name: "Morocco", code: "MA", dial: "+212" },{ name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },{ name: "New Zealand", code: "NZ", dial: "+64" },{ name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norway", code: "NO", dial: "+47" },{ name: "Oman", code: "OM", dial: "+968" },{ name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Peru", code: "PE", dial: "+51" },{ name: "Philippines", code: "PH", dial: "+63" },{ name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },{ name: "Qatar", code: "QA", dial: "+974" },{ name: "Romania", code: "RO", dial: "+40" },
  { name: "Russia", code: "RU", dial: "+7" },{ name: "Saudi Arabia", code: "SA", dial: "+966" },{ name: "Singapore", code: "SG", dial: "+65" },
  { name: "South Africa", code: "ZA", dial: "+27" },{ name: "South Korea", code: "KR", dial: "+82" },{ name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },{ name: "Sweden", code: "SE", dial: "+46" },{ name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Taiwan", code: "TW", dial: "+886" },{ name: "Thailand", code: "TH", dial: "+66" },{ name: "Turkey", code: "TR", dial: "+90" },
  { name: "UAE", code: "AE", dial: "+971" },{ name: "Ukraine", code: "UA", dial: "+380" },{ name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },{ name: "Vietnam", code: "VN", dial: "+84" },{ name: "Zimbabwe", code: "ZW", dial: "+263" },
];

interface Props { value: string; onChange: (c: { name: string; code: string; dial: string }) => void; }

export default function CountryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = ALL.find(c => c.code === value) || ALL[0];

  const filtered = search.trim() === "" ? ALL : ALL.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={s.wrap}>
      <TouchableOpacity style={s.trigger} onPress={() => { setOpen(!open); if (!open) setSearch(""); }}>
        <Text style={s.triggerText}>{selected.dial}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={12} color={colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View style={s.drop}>
          <View style={s.searchBox}>
            <Ionicons name="search" size={14} color={colors.textMuted} />
            <TextInput style={s.searchInput} placeholder="Search country..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} autoFocus />
            {search !== "" && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={16} color={colors.textMuted} /></TouchableOpacity>}
          </View>
          <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
            {filtered.map((c) => (
              <TouchableOpacity key={c.code} style={[s.item, selected.code === c.code && s.itemSel]} onPress={() => { onChange(c); setOpen(false); }}>
                <Text style={s.itemName}>{c.name}</Text>
                <Text style={s.itemDial}>{c.dial}</Text>
                {selected.code === c.code && <Ionicons name="checkmark" size={16} color={colors.accent} />}
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", padding: 16 }}>No results</Text>}
          </ScrollView>
        </View>
      )}

      {/* Tap-outside backdrop */}
      {open && <Pressable style={s.backdrop} onPress={() => setOpen(false)} />}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "relative", zIndex: 60 },
  trigger: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.input, borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 14, minWidth: 85, borderWidth: 1, borderColor: colors.inputBorder },
  triggerText: { fontSize: fontSize.md, color: colors.text, fontWeight: "500" },

  backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 59 },

  drop: {
    position: "absolute", top: 50, left: 0,
    width: 290,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder,
    zIndex: 61, elevation: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20,
  },

  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.input, borderRadius: radius.md, margin: 8, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: colors.inputBorder },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemSel: { backgroundColor: colors.accentBg },
  itemName: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  itemDial: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "500" },
});
