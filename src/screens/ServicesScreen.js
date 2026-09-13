import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROLES } from "../constants/roles";
import {
  getPropertyServices,
  updatePropertyServices,
  getMyRoleInProperty,
  createServiceComment,
  getServiceComments,
} from "../services/propertyService";

function ServiceRow({ label, enabled, onToggle, disabled }) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        onToggle(!enabled);
      }}
      style={{
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ fontWeight: "700" }}>{label}</Text>
      <Text style={{ fontWeight: "800" }}>{enabled ? "✅" : "—"}</Text>
    </Pressable>
  );
}

function Field({ placeholder, value, onChangeText, editable, multiline = false }) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline={multiline}
      style={[
        inputStyle,
        {
          opacity: editable ? 1 : 0.6,
          backgroundColor: editable ? "transparent" : "#f3f4f6",
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? "top" : "auto",
        },
      ]}
    />
  );
}

// ✅ AFUERA del componente (no se remonta en cada render)
function CommonFields({ service, isAdmin, onChange }) {
  return (
    <View style={{ gap: 10 }}>
      <Field
        placeholder="Empresa"
        value={service.company}
        onChangeText={(t) => onChange("company", t)}
        editable={isAdmin}
      />
      <Field
        placeholder="Teléfono de emergencia"
        value={service.emergencyPhone}
        onChangeText={(t) => onChange("emergencyPhone", t)}
        editable={isAdmin}
      />
      <Field
        placeholder="Número de cliente"
        value={service.customerNumber}
        onChangeText={(t) => onChange("customerNumber", t)}
        editable={isAdmin}
      />
      <Field
        placeholder="Notas / comentarios del servicio (admin)"
        value={service.notes}
        onChangeText={(t) => onChange("notes", t)}
        editable={isAdmin}
        multiline
      />
    </View>
  );
}

const makeBaseServices = () => ({
  electricity: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },
  gas: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },
  water: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },
  heating: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },
  ac: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },
  cableTv: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "" },

  wifi: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "", ssid: "", password: "" },
  alarm: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "", code: "" },

  gardener: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "", name: "", phone: "", frequency: "" },
  cleaning: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "", name: "", phone: "" },
  security: { enabled: false, company: "", emergencyPhone: "", customerNumber: "", notes: "", name: "", phone: "" },
});

const STORAGE_KEYS = {
  SERVICES_BY_PROPERTY: (propertyId) => `@pinamar/services_v1/${propertyId}`,
};

function mergeServices(base, saved) {
  if (!saved || typeof saved !== "object") return base;

  const merged = { ...base };

  // merge por cada servicio base
  for (const key of Object.keys(base)) {
    merged[key] = { ...base[key], ...(saved[key] || {}) };
  }

  // preserva keys nuevas guardadas
  for (const key of Object.keys(saved)) {
    if (!merged[key]) merged[key] = saved[key];
  }

  return merged;
}

async function loadServicesCache(propertyId) {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SERVICES_BY_PROPERTY(propertyId));
  return raw ? JSON.parse(raw) : null;
}

async function saveServicesCache(propertyId, services) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.SERVICES_BY_PROPERTY(propertyId),
    JSON.stringify(services)
  );
}

export default function ServicesScreen({ route, navigation }) {
  const propertyId = route?.params?.propertyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accessError, setAccessError] = useState(false);
  const [role, setRole] = useState(null);
  const isAdmin = useMemo(() => role === ROLES.ADMIN, [role]);

  const [services, setServices] = useState(makeBaseServices());

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const load = useCallback(async (isActive) => {
    try {
      setLoading(true);

      setRole(null);
      setAccessError(false);
      setServices(makeBaseServices());
      setComments([]);
      setComment("");
      if (!propertyId) return;
      const myRole = await getMyRoleInProperty(propertyId);
      if (!isActive()) return;
      setRole(myRole);
      if (myRole === null) return;

      // Leer caché y datos solo después de comprobar la membresía.
      const cachedServices = await loadServicesCache(propertyId);
      if (!isActive()) return;
      if (cachedServices) setServices((prev) => mergeServices(prev, cachedServices));

      // ✅ 3) Backend
      const data = await getPropertyServices(propertyId);
      if (!isActive()) return;
      if (data) {
        setServices((prev) => {
          const merged = mergeServices(prev, data);
          // actualiza cache con lo último del backend
          saveServicesCache(propertyId, merged).catch(() => {});
          return merged;
        });
      }

      // ✅ 4) Comentarios
      const comm = await getServiceComments(propertyId);
      if (!isActive()) return;
      setComments(comm);
    } catch (e) {
      if (isActive()) {
        setRole(null);
        setAccessError(true);
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => { active = false; };
    }, [load])
  );

  function setEnabled(key, val) {
    setServices((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: val },
    }));
  }

  function setServiceField(key, field, value) {
    setServices((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  async function handleSave() {
    if (loading || accessError || role === null) return;
    if (!isAdmin) {
      Alert.alert(
        "Solo lectura",
        "Como participante no podés editar servicios. Podés dejar un comentario abajo."
      );
      return;
    }

    try {
      setSaving(true);

      // 🔹 Guarda en backend
      await updatePropertyServices(propertyId, services);

      // 🔹 Guarda cache local
      await saveServicesCache(propertyId, services);

      Alert.alert("Listo ✅", "Servicios guardados.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendComment() {
    if (loading || accessError || role === null) return;
    try {
      if (!comment.trim()) {
        Alert.alert("Falta comentario", "Escribí una observación.");
        return;
      }
      await createServiceComment(propertyId, comment);
      setComment("");
      const comm = await getServiceComments(propertyId);
      setComments(comm);
      Alert.alert("Enviado ✅", "Tu comentario se guardó.");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando servicios...</Text>
      </View>
    );
  }

  if (accessError || role === null) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
        <Text>{!propertyId
          ? "Falta identificar la propiedad."
          : accessError
          ? "No pudimos comprobar tu acceso o cargar los servicios. Volvé a intentarlo."
          : "No tenés acceso a esta propiedad."}</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("PropertySelect")}
          style={{ padding: 14, alignItems: "center", borderWidth: 1, borderRadius: 10 }}>
          <Text>Volver a mis propiedades</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Servicios</Text>

      {!isAdmin ? (
        <Text style={{ opacity: 0.7 }}>
          Estás como participante: podés ver los servicios y dejar comentarios.
        </Text>
      ) : null}

      {/* Básicos */}
      <ServiceRow
        label="Luz"
        enabled={services.electricity.enabled}
        onToggle={(v) => setEnabled("electricity", v)}
        disabled={!isAdmin}
      />
      {services.electricity.enabled ? (
        <CommonFields
          service={services.electricity}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("electricity", field, value)}
        />
      ) : null}

      <ServiceRow
        label="Gas"
        enabled={services.gas.enabled}
        onToggle={(v) => setEnabled("gas", v)}
        disabled={!isAdmin}
      />
      {services.gas.enabled ? (
        <CommonFields
          service={services.gas}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("gas", field, value)}
        />
      ) : null}

      <ServiceRow
        label="Agua corriente"
        enabled={services.water.enabled}
        onToggle={(v) => setEnabled("water", v)}
        disabled={!isAdmin}
      />
      {services.water.enabled ? (
        <CommonFields
          service={services.water}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("water", field, value)}
        />
      ) : null}

      <ServiceRow
        label="Calefacción"
        enabled={services.heating.enabled}
        onToggle={(v) => setEnabled("heating", v)}
        disabled={!isAdmin}
      />
      {services.heating.enabled ? (
        <CommonFields
          service={services.heating}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("heating", field, value)}
        />
      ) : null}

      <ServiceRow
        label="Aire acondicionado"
        enabled={services.ac.enabled}
        onToggle={(v) => setEnabled("ac", v)}
        disabled={!isAdmin}
      />
      {services.ac.enabled ? (
        <CommonFields
          service={services.ac}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("ac", field, value)}
        />
      ) : null}

      <ServiceRow
        label="TV por cable"
        enabled={services.cableTv.enabled}
        onToggle={(v) => setEnabled("cableTv", v)}
        disabled={!isAdmin}
      />
      {services.cableTv.enabled ? (
        <CommonFields
          service={services.cableTv}
          isAdmin={isAdmin}
          onChange={(field, value) => setServiceField("cableTv", field, value)}
        />
      ) : null}

      {/* WiFi */}
      <Text style={{ fontWeight: "800", marginTop: 10 }}>WiFi</Text>
      <ServiceRow
        label="WiFi disponible"
        enabled={services.wifi.enabled}
        onToggle={(v) => setEnabled("wifi", v)}
        disabled={!isAdmin}
      />
      {services.wifi.enabled ? (
        <View style={{ gap: 10 }}>
          <CommonFields
            service={services.wifi}
            isAdmin={isAdmin}
            onChange={(field, value) => setServiceField("wifi", field, value)}
          />
          <Field
            placeholder="Nombre de red (SSID)"
            value={services.wifi.ssid}
            onChangeText={(t) => setServiceField("wifi", "ssid", t)}
            editable={isAdmin}
          />
          <Field
            placeholder="Contraseña WiFi"
            value={services.wifi.password}
            onChangeText={(t) => setServiceField("wifi", "password", t)}
            editable={isAdmin}
          />
        </View>
      ) : null}

      {/* Alarma */}
      <Text style={{ fontWeight: "800", marginTop: 10 }}>Alarma</Text>
      <ServiceRow
        label="Alarma"
        enabled={services.alarm.enabled}
        onToggle={(v) => setEnabled("alarm", v)}
        disabled={!isAdmin}
      />
      {services.alarm.enabled ? (
        <View style={{ gap: 10 }}>
          <CommonFields
            service={services.alarm}
            isAdmin={isAdmin}
            onChange={(field, value) => setServiceField("alarm", field, value)}
          />
          <Field
            placeholder="Código / clave de alarma"
            value={services.alarm.code}
            onChangeText={(t) => setServiceField("alarm", "code", t)}
            editable={isAdmin}
          />
        </View>
      ) : null}

      {/* Contactos */}
      <Text style={{ fontWeight: "800", marginTop: 10 }}>Contactos</Text>

      <ServiceRow
        label="Jardinero"
        enabled={services.gardener.enabled}
        onToggle={(v) => setEnabled("gardener", v)}
        disabled={!isAdmin}
      />
      {services.gardener.enabled ? (
        <View style={{ gap: 10 }}>
          <CommonFields
            service={services.gardener}
            isAdmin={isAdmin}
            onChange={(field, value) => setServiceField("gardener", field, value)}
          />
          <Field
            placeholder="Nombre"
            value={services.gardener.name}
            onChangeText={(t) => setServiceField("gardener", "name", t)}
            editable={isAdmin}
          />
          <Field
            placeholder="Teléfono"
            value={services.gardener.phone}
            onChangeText={(t) => setServiceField("gardener", "phone", t)}
            editable={isAdmin}
          />
          <Field
            placeholder="Frecuencia (ej: 1 vez por semana)"
            value={services.gardener.frequency}
            onChangeText={(t) => setServiceField("gardener", "frequency", t)}
            editable={isAdmin}
          />
        </View>
      ) : null}

      <ServiceRow
        label="Limpieza"
        enabled={services.cleaning.enabled}
        onToggle={(v) => setEnabled("cleaning", v)}
        disabled={!isAdmin}
      />
      {services.cleaning.enabled ? (
        <View style={{ gap: 10 }}>
          <CommonFields
            service={services.cleaning}
            isAdmin={isAdmin}
            onChange={(field, value) => setServiceField("cleaning", field, value)}
          />
          <Field
            placeholder="Nombre"
            value={services.cleaning.name}
            onChangeText={(t) => setServiceField("cleaning", "name", t)}
            editable={isAdmin}
          />
          <Field
            placeholder="Teléfono"
            value={services.cleaning.phone}
            onChangeText={(t) => setServiceField("cleaning", "phone", t)}
            editable={isAdmin}
          />
        </View>
      ) : null}

      <ServiceRow
        label="Seguridad"
        enabled={services.security.enabled}
        onToggle={(v) => setEnabled("security", v)}
        disabled={!isAdmin}
      />
      {services.security.enabled ? (
        <View style={{ gap: 10 }}>
          <CommonFields
            service={services.security}
            isAdmin={isAdmin}
            onChange={(field, value) => setServiceField("security", field, value)}
          />
          <Field
            placeholder="Nombre"
            value={services.security.name}
            onChangeText={(t) => setServiceField("security", "name", t)}
            editable={isAdmin}
          />
          <Field
            placeholder="Teléfono"
            value={services.security.phone}
            onChangeText={(t) => setServiceField("security", "phone", t)}
            editable={isAdmin}
          />
        </View>
      ) : null}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{
          marginTop: 10,
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          alignItems: "center",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {saving ? "GUARDANDO..." : "GUARDAR SERVICIOS"}
        </Text>
      </Pressable>

      {/* Comentarios */}
      <Text style={{ fontWeight: "900", marginTop: 18 }}>Comentarios / Observaciones</Text>

      <TextInput
        placeholder="Escribí una observación para los administradores…"
        value={comment}
        onChangeText={setComment}
        style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
        multiline
      />

      <Pressable
        onPress={handleSendComment}
        style={{ padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "800" }}>ENVIAR COMENTARIO</Text>
      </Pressable>

      {isAdmin ? (
        <View style={{ gap: 10, marginTop: 10 }}>
          {comments.length === 0 ? (
            <Text style={{ opacity: 0.7 }}>Todavía no hay comentarios.</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={{ borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 }}>
                <Text style={{ fontWeight: "800" }}>{c.authorEmail || c.createdBy}</Text>
                <Text>{c.message}</Text>
                <Text style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(c.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderRadius: 10,
  padding: 12,
};
