import React, { useEffect, useState } from "react";
import { createProperty, getPropertyById, updateProperty } from "../services/propertyService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

export default function PropertyHomeScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [tipo, setTipo] = useState("CASA");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [piso, setPiso] = useState("");
  const [unidad, setUnidad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [provincia, setProvincia] = useState("");
  const [pais, setPais] = useState("");
  const [entreCalles, setEntreCalles] = useState("");

  // puede ser file:// o https://
  const [fotoFrenteUri, setFotoFrenteUri] = useState("");

  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    async function load() {
      if (!propertyId) return; // modo crear

      setLoading(true);
      const data = await getPropertyById(propertyId);
      setProperty(data);
      setLoading(false);

      if (data) {
        setTipo(data.tipo ?? "CASA");
        setCalle(data.calle ?? "");
        setNumero(data.numero ?? "");
        setPiso(data.piso ?? "");
        setUnidad(data.unidad ?? "");
        setBarrio(data.barrio ?? "");
        setLocalidad(data.localidad ?? "");
        setCodigoPostal(data.codigoPostal ?? "");
        setProvincia(data.provincia ?? "");
        setPais(data.pais ?? "");
        setEntreCalles(data.entreCalles ?? "");

        setFotoFrenteUri(data.fotoFrenteUrl ?? data.fotoFrenteUri ?? "");
      }
    }

    load();
  }, [propertyId]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setFotoFrenteUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    Keyboard.dismiss();

    try {
      if (!calle.trim() || !numero.trim() || !localidad.trim()) {
        Alert.alert("Faltan datos", "Completá al menos Calle, Número y Localidad.");
        return;
      }

      // subir imagen si es local
      let fotoFrenteUrl = "";

      if (fotoFrenteUri) {
        if (fotoFrenteUri.startsWith("file://")) {
          fotoFrenteUrl = await uploadImageToCloudinary(fotoFrenteUri);
        } else if (
          fotoFrenteUri.startsWith("http://") ||
          fotoFrenteUri.startsWith("https://")
        ) {
          fotoFrenteUrl = fotoFrenteUri;
        }
      }

      const propertyData = {
        tipo,
        calle: calle.trim(),
        numero: numero.trim(),
        piso: piso.trim(),
        unidad: unidad.trim(),
        barrio: barrio.trim(),
        localidad: localidad.trim(),
        codigoPostal: codigoPostal.trim(),
        provincia: provincia.trim(),
        pais: pais.trim(),
        entreCalles: entreCalles.trim(),
        fotoFrenteUrl: fotoFrenteUrl,
      };

      if (propertyId) {
        await updateProperty(propertyId, propertyData);

        Alert.alert("Listo ✅", "Cambios guardados.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      await createProperty(propertyData);

      Alert.alert("Listo ✅", "Propiedad creada.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando propiedad...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: "700" }}>
            {propertyId ? "Propiedad" : "Nueva propiedad"}
          </Text>

          {fotoFrenteUri ? (
            <Image
              source={{ uri: fotoFrenteUri }}
              style={{ width: "100%", height: 200, borderRadius: 10, marginBottom: 12 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ opacity: 0.6, marginBottom: 12 }}>Sin foto cargada</Text>
          )}

          <Text style={{ fontWeight: "600" }}>Tipo de propiedad</Text>
          <View style={{ borderWidth: 1, borderRadius: 10, overflow: "hidden" }}>
            <Picker selectedValue={tipo} onValueChange={setTipo}>
              <Picker.Item label="Casa" value="CASA" />
              <Picker.Item label="Departamento" value="DEPARTAMENTO" />
              <Picker.Item label="Local" value="LOCAL" />
              <Picker.Item label="Galpón" value="GALPON" />
              <Picker.Item label="Campo" value="CAMPO" />
              <Picker.Item label="Otro" value="OTRO" />
            </Picker>
          </View>

          <TextInput placeholder="Calle" value={calle} onChangeText={setCalle} style={inputStyle} />
          <TextInput
            placeholder="Número"
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
            style={inputStyle}
          />
          <TextInput
            placeholder="Piso"
            value={piso}
            onChangeText={setPiso}
            keyboardType="numeric"
            style={inputStyle}
          />

          <TextInput placeholder="Unidad" value={unidad} onChangeText={setUnidad} style={inputStyle} />

          <TextInput
            placeholder="Entre qué calles se encuentra"
            value={entreCalles}
            onChangeText={setEntreCalles}
            style={inputStyle}
          />

          <TextInput placeholder="Barrio" value={barrio} onChangeText={setBarrio} style={inputStyle} />
          <TextInput placeholder="Localidad" value={localidad} onChangeText={setLocalidad} style={inputStyle} />
          <TextInput
            placeholder="Código Postal"
            value={codigoPostal}
            onChangeText={setCodigoPostal}
            style={inputStyle}
          />
          <TextInput placeholder="Provincia" value={provincia} onChangeText={setProvincia} style={inputStyle} />
          <TextInput placeholder="País" value={pais} onChangeText={setPais} style={inputStyle} />

          <Pressable
            onPress={pickImage}
            style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "600" }}>
              {fotoFrenteUri ? "Cambiar foto del frente" : "Subir foto del frente"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>
              {propertyId ? "GUARDAR CAMBIOS" : "GUARDAR PROPIEDAD"}
            </Text>
          </Pressable>

          {/* ✅ Estos botones solo tienen sentido si ya existe la propiedad (propertyId) */}
          {propertyId ? (
            <>
              <Pressable
                onPress={() => navigation.navigate("RequestsList", { propertyId })}
                style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>VER SOLICITUDES</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Calendar", { propertyId })}
                style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>VER CALENDARIO</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("ExpensesList", { propertyId })}
                style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>VER GASTOS</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("Services", { propertyId })}
                style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>VER SERVICIOS</Text>
              </Pressable>


            </>
          ) : (
            <Text style={{ opacity: 0.7 }}>
              Guardá la propiedad primero para ver solicitudes y calendario.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderRadius: 10,
  padding: 12,
};
