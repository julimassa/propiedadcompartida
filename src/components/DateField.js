import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

function isoToDate(iso) {
  if (!iso) return null;
  // iso "YYYY-MM-DD"
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dateToIso(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ✅ Formato: "21 enero 2026"
export function formatDateLongES(iso) {
  const dateObj = isoToDate(iso);
  if (!dateObj) return "Elegir fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

export default function DateField({ label, valueISO, onChangeISO }) {
  const [open, setOpen] = useState(false);

  const dateValue = useMemo(() => {
    return isoToDate(valueISO) ?? new Date();
  }, [valueISO]);

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ fontWeight: "600" }}>{label}</Text> : null}

      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <Text style={{ textTransform: "capitalize" }}>
          {formatDateLongES(valueISO)}
        </Text>
      </Pressable>

      {open ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            // Android: si cancelan, selectedDate viene undefined
            if (Platform.OS !== "ios") setOpen(false);
            if (!selectedDate) return;

            const iso = dateToIso(selectedDate);
            onChangeISO(iso);

            // iOS: cerramos al elegir (si querés dejarlo abierto, sacá esta línea)
            if (Platform.OS === "ios") setOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}
