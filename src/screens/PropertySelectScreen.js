import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Button,
  Pressable,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { logout } from "../services/authService";
import { getMyProperties, removeMyProperty } from "../services/propertyService";

export default function PropertySelectScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // id de la propiedad que se está eliminando

  const loadProperties = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getMyProperties();

      // Ordenar: más nuevas primero (si existe createdAt)
      const sorted = [...data].sort(
        (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
      );

      setProperties(sorted);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties])
  );

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      Alert.alert("No se pudo cerrar sesión", e.message);
    }
  }

  function confirmRemoveProperty(propertyId) {
    Alert.alert(
      "Eliminar propiedad",
      "¿Querés quitar esta propiedad de tu lista? (No borra la propiedad para otros usuarios)",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(propertyId);
              await removeMyProperty(propertyId);
              await loadProperties();
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando propiedades...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Mis propiedades
      </Text>

      {properties.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ fontSize: 16, opacity: 0.7 }}>
            Todavía no tenés propiedades cargadas.
          </Text>

          <Pressable
            onPress={() => navigation.navigate("PropertyHome")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontWeight: "700" }}>CREAR MI PRIMERA PROPIEDAD</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={() => loadProperties(true)}
          renderItem={({ item: prop }) => {
            const img = prop?.fotoFrenteUrl;
            const hasValidImg =
              typeof img === "string" &&
              (img.startsWith("https://") || img.startsWith("http://"));

            return (
              <Pressable
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                }}
                onPress={() =>
                  navigation.navigate("PropertyHome", { propertyId: prop.id })
                }
              >
                {hasValidImg ? (
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: "100%",
                      height: 140,
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                    resizeMode="cover"
                  />
                ) : null}

                <Text style={{ fontWeight: "700" }}>{prop.tipo}</Text>

                <Text>
                  {prop.calle} {prop.numero}
                  {prop.piso ? ` Piso ${prop.piso}` : ""}
                  {prop.unidad ? ` ${prop.unidad}` : ""}
                </Text>

                <Text>{prop.localidad}</Text>

                {/* Botón ELIMINAR (solo quita de tu lista) */}
                <Pressable
                  onPress={() => confirmRemoveProperty(prop.id)}
                  disabled={deletingId === prop.id}
                  style={{
                    marginTop: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "red",
                    alignSelf: "flex-start",
                    opacity: deletingId === prop.id ? 0.6 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {deletingId === prop.id ? <ActivityIndicator /> : null}
                  <Text style={{ color: "red", fontWeight: "700" }}>
                    {deletingId === prop.id ? "ELIMINANDO..." : "ELIMINAR"}
                  </Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}

      <Button
        title="Crear nueva propiedad"
        onPress={() => navigation.navigate("PropertyHome")}
      />

      <Pressable
        onPress={handleLogout}
        style={{
          marginTop: 20,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "red",
          alignSelf: "center",
        }}
      >
        <Text style={{ color: "red", fontWeight: "700" }}>CERRAR SESIÓN</Text>
      </Pressable>
    </View>
  );
}

