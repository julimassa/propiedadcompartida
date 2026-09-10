import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { createRequest } from "../services/requestService";
import DateField from "../components/DateField";

export default function RequestCreateScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState("");     // YYYY-MM-DD
  const [saving, setSaving] = useState(false);

  function handleChangeFromDate(newFrom) {
    setFromDate(newFrom);

    // ✅ Usamos setter funcional para evitar “estado viejo”
    setToDate((prevTo) => {
      // si no había Hasta o quedó antes que Desde, lo ajustamos
      if (!prevTo || prevTo < newFrom) return newFrom;
      return prevTo;
    });
  }

  async function handleSubmit() {
    try {
      if (!fromDate || !toDate) {
        Alert.alert("Faltan fechas", "Elegí una fecha DESDE y una HASTA.");
        return;
      }

      if (fromDate > toDate) {
        Alert.alert("Fechas inválidas", "La fecha DESDE no puede ser mayor que HASTA.");
        return;
      }

      setSaving(true);

      await createRequest({
        propertyId,
        fromDate,
        toDate,
      });

      Alert.alert("Listo ✅", "Solicitud enviada (pendiente).", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Solicitar fechas</Text>

      <DateField label="Desde" valueISO={fromDate} onChangeISO={handleChangeFromDate} />
      <DateField label="Hasta" valueISO={toDate} onChangeISO={setToDate} />

      <Pressable
        onPress={handleSubmit}
        disabled={saving}
        style={{
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          alignItems: "center",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {saving ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
        </Text>
      </Pressable>
    </View>
  );
}
