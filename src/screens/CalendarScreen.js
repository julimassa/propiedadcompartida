import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { getRequestsByProperty } from "../services/requestService";

function expandRange(fromDate, toDate) {
  // fromDate/toDate vienen como "YYYY-MM-DD"
  const dates = [];
  const start = new Date(fromDate + "T00:00:00");
  const end = new Date(toDate + "T00:00:00");

  let current = new Date(start);
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function CalendarScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRequestsByProperty(propertyId);
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const { approved, pending } = useMemo(() => {
    const approved = requests.filter((r) => r.status === "APPROVED");
    const pending = requests.filter((r) => r.status === "PENDING");
    return { approved, pending };
  }, [requests]);

  const markedDates = useMemo(() => {
    const marks = {};

    // 1) Marcar APPROVED como "ocupado"
    for (const r of approved) {
      const days = expandRange(r.fromDate, r.toDate);
      for (const day of days) {
        marks[day] = {
          selected: true,
          selectedColor: "#1f2937", // oscuro
          selectedTextColor: "#ffffff",
        };
      }
    }

    // 2) Marcar PENDING como "pendiente" (solo si ese día no está ocupado)
    for (const r of pending) {
      const days = expandRange(r.fromDate, r.toDate);
      for (const day of days) {
        if (marks[day]) continue; // si ya está ocupado, no lo pisan
        marks[day] = {
          marked: true,
          dotColor: "#f59e0b", // naranja
        };
      }
    }

    return marks;
  }, [approved, pending]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Calendario</Text>

      <View style={{ borderWidth: 1, borderRadius: 12, overflow: "hidden" }}>
        <Calendar markedDates={markedDates} />
      </View>

      {/* Leyenda */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>Leyenda</Text>
        <Text>⬛ Ocupado (APROBADO)</Text>
        <Text>• Pendiente (SOLICITADO)</Text>
      </View>

      {/* Botón para ver/crear solicitudes */}
      <Pressable
        onPress={() => navigation.navigate("RequestsList", { propertyId })}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>VER SOLICITUDES</Text>
      </Pressable>

      {/* Listado rápido abajo */}
      <View style={{ flex: 1, gap: 10 }}>
        <Text style={{ fontWeight: "800" }}>Reservas aprobadas</Text>

        {loading ? (
          <Text>Cargando…</Text>
        ) : approved.length === 0 ? (
          <Text style={{ opacity: 0.7 }}>No hay aprobadas todavía.</Text>
        ) : (
          <FlatList
            data={approved}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "800" }}>
                  {item.fromDate} → {item.toDate}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
